"""
Atualiza data/publications.json a partir do ORCID e do OpenAlex.

Roda semanalmente pelo GitHub Actions (.github/workflows/update-publications.yml)
e também pode ser executado à mão:

    python scripts/fetch_publications.py

Ajustes manuais (esconder, corrigir ou adicionar trabalhos) ficam em
data/publications-overrides.json e são reaplicados a cada execução.
Só usa a biblioteca padrão do Python.
"""

import json
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ORCID_ID = "0000-0003-3385-5913"

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "data" / "publications.json"
OVERRIDES = ROOT / "data" / "publications-overrides.json"

# Tipos que nunca entram no site
EXCLUDED_TYPES = {"peer-review", "paratext", "erratum", "retraction"}

# Seções do site, na ordem em que aparecem
GROUPS = ("journals", "conferences", "preprints", "datasets")

DATASET_TYPES = {"dataset", "data-set", "database"}
PREPRINT_TYPES = {"preprint", "posted-content", "working-paper"}
# Repositórios abertos: um "artigo" publicado neles é um pre-print
REPOSITORY_HINTS = ("zenodo", "arxiv", "ssrn", "osf", "researchgate", "preprints.org", "figshare", "techrxiv")
REPOSITORY_DOI_PREFIXES = ("10.5281/", "10.48550/", "10.2139/", "10.31219/", "10.6084/", "10.36227/")

CONFERENCE_TYPES = {
    "conference-paper", "conference-abstract", "conference-poster", "conference-output",
    "proceedings-article", "proceedings",
}
CONFERENCE_VENUE_HINTS = (
    "proceedings", "anais", "simpósio", "simposio", "symposium", "conference", "congress",
    "congresso", "workshop", "communications in computer and information science",
    "lecture notes",
)


def get_json(url, headers=None):
    req = urllib.request.Request(url, headers={"User-Agent": "portfolio-publications/1.0", **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def norm_title(title):
    text = unicodedata.normalize("NFKD", title or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", text.lower())[:80]


def norm_doi(doi):
    if not doi:
        return None
    doi = doi.strip().lower()
    return re.sub(r"^(https?://)?(dx\.)?doi\.org/", "", doi) or None


def clean(text):
    return re.sub(r"\s+", " ", text or "").strip()


# Eventos da SBC OpenLib (DOI 10.5753/<evento>.<ano>) sem nome de fonte no OpenAlex
SOL_EVENTS = {"sbseg": "SBSeg", "sbseg_estendido": "SBSeg (Anais Estendidos)", "semish": "SEMISH", "sbes": "SBES", "sbqs": "SBQS", "reic": "REIC"}


def venue_from_doi(doi):
    m = re.match(r"10\.5753/([a-z_]+)\.\d{4}", doi or "")
    return SOL_EVENTS.get(m.group(1), m.group(1).upper()) if m else ""


def short_venue(venue):
    # "Zenodo (CERN European Organization for Nuclear Research)" -> "Zenodo"
    return re.sub(r"\s*\([^)]*\)\s*$", "", venue or "").strip()


def orcid_note(put_code):
    """Evento/local do trabalho, lido do BibTeX do registro completo no ORCID."""
    work = get_json(f"https://pub.orcid.org/v3.0/{ORCID_ID}/work/{put_code}", {"Accept": "application/json"})
    citation = ((work.get("citation") or {}).get("citation-value")) or ""
    m = re.search(r"note\s*=\s*\{([^}]*)\}", citation)
    return clean(m.group(1)) if m else ""


def fetch_orcid():
    data = get_json(f"https://pub.orcid.org/v3.0/{ORCID_ID}/works", {"Accept": "application/json"})
    works = []
    for group in data.get("group", []):
        s = group["work-summary"][0]
        ids = (s.get("external-ids") or {}).get("external-id") or []
        doi = next((i.get("external-id-value") for i in ids if i.get("external-id-type") == "doi"), None)
        url = (s.get("url") or {}).get("value") if s.get("url") else None
        year = ((s.get("publication-date") or {}).get("year") or {}).get("value")
        venue = clean((s.get("journal-title") or {}).get("value") if s.get("journal-title") else "")
        if not venue and not doi:
            venue = orcid_note(s["put-code"])
        works.append({
            "title": clean(s["title"]["title"]["value"]),
            "year": int(year) if year else None,
            "venue": venue,
            "type": s.get("type") or "",
            "doi": norm_doi(doi),
            "url": url,
        })
    return works


OPENALEX_FIELDS = "title,publication_year,type,type_crossref,primary_location,doi"


def openalex_work(w):
    loc = w.get("primary_location") or {}
    source = loc.get("source") or {}
    return {
        "title": clean(w.get("title")),
        "year": w.get("publication_year"),
        "venue": clean(source.get("display_name")),
        "type": w.get("type_crossref") or w.get("type") or "",
        "type_alt": w.get("type") or "",
        "doi": norm_doi(w.get("doi")),
        "url": loc.get("landing_page_url"),
    }


def fetch_openalex(filter_expr):
    works, cursor = [], "*"
    while cursor:
        params = urllib.parse.urlencode({
            "filter": filter_expr,
            "per-page": 100,
            "cursor": cursor,
            "select": OPENALEX_FIELDS,
        })
        data = get_json(f"https://api.openalex.org/works?{params}")
        works += [openalex_work(w) for w in data["results"]]
        cursor = data["meta"].get("next_cursor")
    return works


def fetch_openalex_dois(dois):
    works = []
    for doi in dois:
        doi = norm_doi(doi)
        try:
            data = get_json(f"https://api.openalex.org/works/doi:{urllib.parse.quote(doi)}?select={OPENALEX_FIELDS}")
            works.append(openalex_work(data))
        except Exception as exc:
            print(f"DOI não encontrado no OpenAlex: {doi} ({exc})", file=sys.stderr)
    return works


def merge(*sources):
    """Junta as fontes, removendo duplicados por DOI ou título."""
    merged = []
    for source in sources:
        for work in source:
            if not work["title"]:
                continue
            key_doi, key_title = work["doi"], norm_title(work["title"])
            match = next((m for m in merged if (key_doi and m["doi"] == key_doi) or m["_key"] == key_title), None)
            if match:
                for field in ("year", "venue", "doi", "url"):
                    if not match.get(field) and work.get(field):
                        match[field] = work[field]
                match["_types"].update({work["type"], work.get("type_alt", "")})
            else:
                merged.append({**work, "_key": key_title, "_types": {work["type"], work.get("type_alt", "")}})
    return merged


def classify(work):
    types = {t for t in work["_types"] if t}
    venue = (work.get("venue") or "").lower()
    doi = work.get("doi") or ""
    if types & DATASET_TYPES:
        return "datasets"
    if types & PREPRINT_TYPES or any(h in venue for h in REPOSITORY_HINTS) or doi.startswith(REPOSITORY_DOI_PREFIXES):
        return "preprints"
    if types & CONFERENCE_TYPES or any(h in venue for h in CONFERENCE_VENUE_HINTS):
        return "conferences"
    return "journals"


def load_overrides():
    if not OVERRIDES.exists():
        return {"hide": [], "edit": {}, "add": [], "dois": [], "openalex_author_ids": []}
    return json.loads(OVERRIDES.read_text(encoding="utf-8"))


def main():
    overrides = load_overrides()
    try:
        orcid = fetch_orcid()
        openalex = fetch_openalex(f"author.orcid:{ORCID_ID}")
        # Perfis do OpenAlex em que seu nome aparece sem o ORCID vinculado
        for author_id in overrides.get("openalex_author_ids", []):
            openalex += fetch_openalex(f"author.id:{author_id}")
        # Trabalhos específicos, buscados pelo DOI (metadados oficiais)
        openalex += fetch_openalex_dois(overrides.get("dois", []))
    except Exception as exc:  # rede fora do ar: mantém o arquivo atual
        print(f"Erro ao buscar publicações: {exc}", file=sys.stderr)
        sys.exit(1)

    hidden = {norm_title(h) for h in overrides.get("hide", [])} | {norm_doi(h) for h in overrides.get("hide", [])}
    edits = {norm_title(k): v for k, v in overrides.get("edit", {}).items()}

    added = [
        {"title": clean(a["title"]), "year": a.get("year"), "venue": clean(a.get("venue")),
         "type": a.get("type", ""), "doi": norm_doi(a.get("doi")), "url": a.get("url")}
        for a in overrides.get("add", [])
    ]
    works = merge(openalex, orcid, added)

    result = {g: [] for g in GROUPS}
    for w in works:
        if w["_types"] & EXCLUDED_TYPES and not (w["_types"] - EXCLUDED_TYPES - {""}):
            continue
        if w["_key"] in hidden or (w["doi"] and w["doi"] in hidden):
            continue
        edit = edits.get(w["_key"], {})
        group = edit.get("group") or classify(w)
        url = edit.get("url") or (f"https://doi.org/{w['doi']}" if w["doi"] else w.get("url"))
        venue = short_venue(w["venue"]) or venue_from_doi(w["doi"])
        result[group].append({
            "year": edit.get("year", w["year"]),
            "venue": edit.get("venue", venue),
            "title": edit.get("title", w["title"]),
            "url": url or "",
        })

    for items in result.values():
        items.sort(key=lambda p: (-(p["year"] or 0), p["title"].lower()))

    new = {"source": f"ORCID {ORCID_ID} + OpenAlex", **result}
    old = json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.exists() else {}
    old.pop("updated", None)
    if old == new:
        print("Nenhuma mudança nas publicações.")
        return

    new["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(new, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(v) for v in result.values())
    print(f"publications.json atualizado: {total} trabalhos "
          "(" + ", ".join(f"{g}: {len(result[g])}" for g in GROUPS) + ").")


if __name__ == "__main__":
    main()
