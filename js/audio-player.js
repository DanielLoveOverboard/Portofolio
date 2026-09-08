// ==============================================================================
// TIMELESS PORTFOLIO — YOUTUBE VINYL AUDIO PLAYER
// Author: Muh. Fachri Akbar
// ==============================================================================

import { AUDIO_PLAYLIST, AUDIO_SETTINGS, extractYouTubeId } from './config.js';

let ytPlayer = null;
let isPlayerReady = false;
let currentTrackIndex = 0;
let isPlaying = false;
let hasVinylIntroRun = false;

// Muat YouTube IFrame API secara asinkron
function loadYouTubeApi() {
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
    return;
  }

  if (!document.getElementById('youtube-iframe-api-script')) {
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}

// Callback otomatis ketika YouTube API siap
window.onYouTubeIframeAPIReady = function() {
  const currentTrack = AUDIO_PLAYLIST[currentTrackIndex] || AUDIO_PLAYLIST[0];
  const videoId = extractYouTubeId(currentTrack?.youtubeId || 'jfKfPfyJRdk');

  ytPlayer = new window.YT.Player('yt-player-mount', {
    height: '1',
    width: '1',
    videoId: videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      origin: window.location.origin
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerReady(event) {
  isPlayerReady = true;
  if (ytPlayer && ytPlayer.setVolume) {
    ytPlayer.setVolume(AUDIO_SETTINGS.defaultVolume || 60);
  }
  updateDockInfo();
}

function onPlayerStateChange(event) {
  // 1 = Playing, 2 = Paused, 0 = Ended
  if (event.data === window.YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayStateUI(true);
  } else if (event.data === window.YT.PlayerState.PAUSED) {
    isPlaying = false;
    updatePlayStateUI(false);
  } else if (event.data === window.YT.PlayerState.ENDED) {
    if (AUDIO_SETTINGS.autoLoop) {
      nextTrack();
    } else {
      isPlaying = false;
      updatePlayStateUI(false);
    }
  }
}

// Perbarui teks status pada dock minimalis
function updateDockInfo() {
  const track = AUDIO_PLAYLIST[currentTrackIndex] || { title: 'Track', artist: '' };
  const titleEl = document.getElementById('audio-dock-title');
  if (titleEl) {
    titleEl.textContent = track.title || 'Music Track';
    titleEl.title = `${track.title} - ${track.artist}`;
  }
}

function updatePlayStateUI(playing) {
  const dockToggleBtn = document.getElementById('audio-dock-toggle');
  const dockDiscMini = document.getElementById('audio-dock-disc-icon');
  const vinylDisc = document.getElementById('vinyl-disc');

  if (dockToggleBtn) {
    dockToggleBtn.innerHTML = playing ? '❚❚ PAUSE' : '▷ PLAY';
    dockToggleBtn.setAttribute('aria-label', playing ? 'Hentikan Audio' : 'Putar Audio');
  }

  if (dockDiscMini) {
    dockDiscMini.classList.toggle('spinning', playing);
  }

  if (vinylDisc) {
    vinylDisc.classList.toggle('spinning', playing);
  }
}

// Mulai pengalaman piringan musik saat pengunjung klik tombol/piringan
export function startVinylExperience() {
  if (hasVinylIntroRun) return;
  hasVinylIntroRun = true;

  const vinylIntro = document.getElementById('vinyl-intro-container');
  const vinylDisc = document.getElementById('vinyl-disc');
  const introStatus = document.getElementById('vinyl-intro-status');
  const dock = document.getElementById('timeless-audio-dock');

  // Mulai putar audio YouTube
  if (ytPlayer && ytPlayer.playVideo) {
    ytPlayer.playVideo();
  }

  // Mulai animasi putaran piringan
  if (vinylDisc) {
    vinylDisc.classList.add('spinning');
  }

  if (introStatus) {
    const track = AUDIO_PLAYLIST[currentTrackIndex] || { title: 'Lagu Pengiring' };
    introStatus.textContent = `MEMUTAR // ${track.title.toUpperCase()} ♫`;
  }

  // Simpan status sesi agar piringan besar hanya bermain sekali per sesi
  try {
    sessionStorage.setItem('vinyl_intro_played', 'true');
  } catch (e) {}

  // Setelah berputar sejenak, piringan meluncur turun ke bawah layar dan menghilang
  setTimeout(() => {
    if (vinylIntro) {
      vinylIntro.classList.add('slide-down-exit');
    }
    // Munculkan audio dock minimalis di pojok
    if (dock) {
      dock.classList.add('visible');
    }
  }, AUDIO_SETTINGS.spinDurationMs || 3600);
}

// Toggle Play/Pause dari dock minimalis
export function toggleAudio() {
  if (!ytPlayer || !isPlayerReady) return;

  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
}

// Pindah ke lagu berikutnya
export function nextTrack() {
  if (!ytPlayer || !isPlayerReady) return;

  currentTrackIndex = (currentTrackIndex + 1) % AUDIO_PLAYLIST.length;
  const nextItem = AUDIO_PLAYLIST[currentTrackIndex];
  const videoId = extractYouTubeId(nextItem.youtubeId);

  if (ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(videoId);
  }
  updateDockInfo();
}

// Lewati intro jika pengunjung menutup piringan tanpa memutar
export function dismissVinylIntro() {
  const vinylIntro = document.getElementById('vinyl-intro-container');
  const dock = document.getElementById('timeless-audio-dock');

  try {
    sessionStorage.setItem('vinyl_intro_played', 'true');
  } catch (e) {}

  if (vinylIntro) {
    vinylIntro.classList.add('slide-down-exit');
  }
  if (dock) {
    dock.classList.add('visible');
  }
}

// Inisialisasi controller piringan audio
export function initAudioPlayer() {
  loadYouTubeApi();

  const vinylIntro = document.getElementById('vinyl-intro-container');
  const dock = document.getElementById('timeless-audio-dock');
  const startBtn = document.getElementById('vinyl-start-btn');
  const vinylDisc = document.getElementById('vinyl-disc');
  const dismissBtn = document.getElementById('vinyl-dismiss-btn');
  const dockToggleBtn = document.getElementById('audio-dock-toggle');
  const dockNextBtn = document.getElementById('audio-dock-next');

  // Periksa apakah intro sudah pernah dijalankan pada sesi ini
  const alreadyPlayed = (function() {
    try {
      return sessionStorage.getItem('vinyl_intro_played') === 'true';
    } catch (e) {
      return false;
    }
  })();

  if (alreadyPlayed) {
    if (vinylIntro) vinylIntro.style.display = 'none';
    if (dock) dock.classList.add('visible');
  } else {
    if (vinylIntro) vinylIntro.style.display = 'flex';
  }

  // Event Listeners
  if (startBtn) startBtn.addEventListener('click', startVinylExperience);
  if (vinylDisc) vinylDisc.addEventListener('click', startVinylExperience);
  if (dismissBtn) dismissBtn.addEventListener('click', dismissVinylIntro);
  if (dockToggleBtn) dockToggleBtn.addEventListener('click', toggleAudio);
  if (dockNextBtn) dockNextBtn.addEventListener('click', nextTrack);

  updateDockInfo();
}

// Export global untuk fallback
if (typeof window !== 'undefined') {
  window.startVinylExperience = startVinylExperience;
  window.toggleAudio = toggleAudio;
  window.nextTrack = nextTrack;
  window.dismissVinylIntro = dismissVinylIntro;
}
