# Portfólio — Rubens Abraão

Site estático (HTML + CSS + JS, sem build) baseado no layout do Figma.

## Estrutura

```
index.html        página única
css/style.css     estilos (tokens de cor no topo, em :root)
js/data.js        CONTEÚDO em PT/EN: textos, experiências, áreas de pesquisa e artigos
js/main.js        idioma, menu, abas, modais (artigos/experiência) e carrossel
data/publications.json            artigos (gerado automaticamente — não edite à mão)
data/publications-overrides.json  ajustes manuais nos artigos (esconder, corrigir, adicionar)
scripts/fetch_publications.py     busca os artigos no ORCID + OpenAlex
js/player.js      player da playlist do YouTube Music (troque a playlist em PLAYLIST_URL no data.js)
assets/img/       fotos, capas e logos
assets/icons/     ícones e ilustrações SVG
```

## Idiomas (PT / EN)

O botão PT/EN fica no topo. O idioma é escolhido pelo navegador na primeira visita,
fica salvo, e também pode ser forçado pelo link: `?lang=pt` ou `?lang=en`.
Para mudar qualquer texto, edite `js/data.js` (sempre nas duas línguas).

## Artigos e publicações (automático)

Toda segunda-feira o GitHub Actions (`.github/workflows/update-publications.yml`)
busca seus trabalhos no **ORCID** e no **OpenAlex**, atualiza `data/publications.json`
e faz commit se houver algo novo — o site é republicado sozinho.
No site, os trabalhos aparecem em 4 seções (Periódicos, Artigos de conferência e
trabalhos completos, Pre-prints e Dados de pesquisa), agrupados por ano e com o
título exato da publicação.

- Rodar na hora: aba **Actions → Atualizar publicações → Run workflow**.
- Rodar localmente: `python scripts/fetch_publications.py`.
- Para um artigo aparecer, ele precisa estar no ORCID (recomendado: ative a
  importação automática do Crossref no ORCID) ou ter sido indexado pelo OpenAlex.
- Trabalho seu que não está ligado ao seu ORCID: coloque o DOI em `dois`
  (em `data/publications-overrides.json`) ou, melhor, vincule-o ao ORCID.
- Esconder, corrigir título/evento/link ou adicionar trabalhos que ainda não estão
  nas bases: edite `data/publications-overrides.json`.

## Rodar localmente

```bash
python -m http.server 5500
```

Depois abra http://localhost:5500.

## Publicar no GitHub Pages

Repositório: https://github.com/rubens-abraao/rubens-abraao
Site: https://rubens-abraao.github.io/rubens-abraao/

1. No GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
2. A cada `git push` na `main`, o site é republicado em 1–2 minutos.
3. Para a atualização automática de artigos poder fazer commit:
   **Settings → Actions → General → Workflow permissions → Read and write permissions**.

## O que ainda é placeholder

- Bio do hero
- Descrições das experiências no pop-up (`EXPERIENCES` em `js/data.js`)

- Links: redes sociais do rodapé (Twitter, Facebook, Instagram) e "Política de privacidade"
- "{Quem emitiu}" na experiência acadêmica
