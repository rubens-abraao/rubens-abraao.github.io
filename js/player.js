// ---------------------------------------------------------------------------
// Player da playlist (YouTube IFrame API) no card "O que estou ouvindo".
// Tenta tocar ao abrir o site; se o navegador bloquear o autoplay com som,
// começa no primeiro clique/tecla do visitante em qualquer lugar da página.
// ---------------------------------------------------------------------------
(() => {
  const listId = new URL(PLAYLIST_URL).searchParams.get("list");
  if (!listId) return;

  const $ = (id) => document.getElementById(id);
  const titleEl = $("player-title");
  const artistEl = $("player-artist");
  const bar = $("player-bar");
  const fill = $("player-fill");
  const timeEl = $("player-time");
  const toggleBtn = $("player-toggle");
  const muteBtn = $("player-mute");
  const hint = $("player-hint");
  const card = document.getElementById("music");

  let player = null;
  let ready = false;
  let playing = false;
  let userPaused = false;
  let waitingGesture = false;

  const fmt = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  function updateLabels() {
    toggleBtn.setAttribute("aria-label", t(playing ? "player.pause" : "player.play"));
    toggleBtn.querySelector("img").src = `assets/icons/${playing ? "pause" : "play"}.svg`;
    const muted = ready && player.isMuted();
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.setAttribute("aria-label", t("player.mute"));
    muteBtn.querySelector("img").src = `assets/icons/${muted ? "volume-off" : "extra"}.svg`;
  }

  function updateTrack() {
    const data = player.getVideoData?.();
    if (!data || !data.title) return;
    titleEl.textContent = data.title;
    const artist = (data.author || "").replace(/\s*-\s*Topic$/i, "");
    artistEl.textContent = artist;
    artistEl.hidden = !artist;
  }

  function tick() {
    if (!ready) return;
    const cur = player.getCurrentTime() || 0;
    const dur = player.getDuration() || 0;
    const pct = dur ? (cur / dur) * 100 : 0;
    fill.style.right = `${100 - pct}%`;
    bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    bar.setAttribute("aria-valuetext", `${fmt(cur)} / ${fmt(dur)}`);
    timeEl.textContent = fmt(cur);
  }

  // Autoplay bloqueado: toca no primeiro gesto do visitante
  function armGesture() {
    if (waitingGesture || playing || userPaused) return;
    waitingGesture = true;
    hint.hidden = false;
    const start = (e) => {
      if (e.target.closest?.("[data-player]")) return; // os próprios controles cuidam disso
      disarm();
      if (!userPaused) player.playVideo();
    };
    const disarm = () => {
      waitingGesture = false;
      hint.hidden = true;
      document.removeEventListener("pointerdown", start, true);
      document.removeEventListener("keydown", start, true);
    };
    armGesture.disarm = disarm;
    document.addEventListener("pointerdown", start, true);
    document.addEventListener("keydown", start, true);
  }

  function onStateChange(e) {
    const S = YT.PlayerState;
    playing = e.data === S.PLAYING;
    card.classList.toggle("is-playing", playing);
    if (playing) {
      armGesture.disarm?.();
      player.getIframe().classList.add("is-loaded");
    }
    if (e.data === S.PLAYING || e.data === S.CUED || e.data === S.BUFFERING) updateTrack();
    updateLabels();
  }

  function onReady() {
    ready = true;
    player.setVolume(60);
    player.playVideo();
    updateTrack();
    updateLabels();
    setInterval(tick, 500);
    // Se em ~1,5 s não começou a tocar, o navegador bloqueou o autoplay
    setTimeout(() => { if (!playing) armGesture(); }, 1500);
  }

  // Vídeo que não permite incorporação: pula para o próximo
  function onError() {
    if (ready) player.nextVideo();
  }

  // Controles
  document.querySelectorAll("[data-player]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!ready) return;
      switch (btn.dataset.player) {
        case "toggle":
          if (playing) { userPaused = true; player.pauseVideo(); }
          else { userPaused = false; armGesture.disarm?.(); player.playVideo(); }
          break;
        case "prev":
          player.getCurrentTime() > 3 ? player.seekTo(0, true) : player.previousVideo();
          break;
        case "next":
          player.nextVideo();
          break;
        case "mute":
          player.isMuted() ? player.unMute() : player.mute();
          setTimeout(updateLabels, 50);
          break;
      }
    });
  });

  function seekTo(ratio) {
    const dur = player.getDuration();
    if (dur) player.seekTo(Math.min(Math.max(ratio, 0), 1) * dur, true);
    setTimeout(tick, 50);
  }

  bar.addEventListener("click", (e) => {
    if (!ready) return;
    const r = bar.getBoundingClientRect();
    seekTo((e.clientX - r.left) / r.width);
  });
  bar.addEventListener("keydown", (e) => {
    if (!ready || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    e.preventDefault();
    const dur = player.getDuration();
    if (dur) seekTo((player.getCurrentTime() + (e.key === "ArrowRight" ? 5 : -5)) / dur);
  });

  // Atualiza rótulos quando o idioma muda
  window.onLangChange = updateLabels;

  // Carrega a API do YouTube
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("yt-player", {
      width: "300",
      height: "169",
      playerVars: {
        listType: "playlist",
        list: listId,
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        loop: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: location.origin,
      },
      events: { onReady, onStateChange, onError },
    });
  };

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
})();
