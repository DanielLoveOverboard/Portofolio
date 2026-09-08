// ==============================================================================
// TIMELESS PORTFOLIO — YOUTUBE VINYL AUDIO PLAYER
// Author: Muh. Fachri Akbar
// ==============================================================================

import { AUDIO_PLAYLIST, AUDIO_SETTINGS, extractYouTubeId, extractYoutubeId } from './config.js';

let ytPlayer = null;
let isPlayerReady = false;
let currentTrackIndex = 0;
let isPlaying = false;
let hasVinylIntroRun = false;
let pendingPlay = false;

// Fallback helper ekstraksi yang aman dari perbedaan kapitalisasi
const safeExtractYouTubeId = typeof extractYouTubeId === 'function'
  ? extractYouTubeId
  : (typeof extractYoutubeId === 'function' ? extractYoutubeId : (s) => {
      if (!s) return '';
      const trimmed = String(s).trim();
      const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? match[1] : trimmed;
    });

// Ambil playlist yang aman dari kondisi undefined
function getPlaylist() {
  if (typeof AUDIO_PLAYLIST !== 'undefined' && Array.isArray(AUDIO_PLAYLIST) && AUDIO_PLAYLIST.length > 0) {
    return AUDIO_PLAYLIST;
  }
  if (typeof window !== 'undefined' && Array.isArray(window.AUDIO_PLAYLIST) && window.AUDIO_PLAYLIST.length > 0) {
    return window.AUDIO_PLAYLIST;
  }
  return [
    {
      title: 'The Strokes - Someday',
      artist: 'Fachri Favorite',
      youtubeId: 'knU9gRUWCno'
    }
  ];
}

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
  const playlist = getPlaylist();
  const currentTrack = playlist[currentTrackIndex] || playlist[0];
  const videoId = safeExtractYouTubeId(currentTrack?.youtubeId || 'knU9gRUWCno');

  const originOption = (window.location.protocol.startsWith('http'))
    ? { origin: window.location.origin }
    : {};

  ytPlayer = new window.YT.Player('yt-player-mount', {
    height: '200',
    width: '200',
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
      playsinline: 1,
      ...originOption
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
};

function onPlayerReady(event) {
  isPlayerReady = true;
  try {
    if (ytPlayer && ytPlayer.setVolume) {
      const vol = (typeof AUDIO_SETTINGS !== 'undefined' && AUDIO_SETTINGS?.defaultVolume) || 60;
      ytPlayer.setVolume(vol);
    }
  } catch (e) {
    console.warn('Volume set error:', e);
  }

  updateDockInfo();

  // Jika pengunjung sudah menekan tombol putar sebelum iframe YouTube siap, mainkan sekarang!
  if (pendingPlay && ytPlayer && ytPlayer.playVideo) {
    ytPlayer.playVideo();
  }
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
    const loop = (typeof AUDIO_SETTINGS !== 'undefined' && AUDIO_SETTINGS?.autoLoop !== undefined)
      ? AUDIO_SETTINGS.autoLoop
      : true;

    if (loop) {
      nextTrack();
    } else {
      isPlaying = false;
      updatePlayStateUI(false);
    }
  }
}

function onPlayerError(event) {
  console.warn('YouTube Player Event/Error code:', event.data);
  // Kode 101/150: Video dibatasi embedding oleh label, coba otomatis putar trek berikutnya
  if (event.data === 101 || event.data === 150) {
    console.info('Trek memiliki pembatasan embed pihak ketiga, mencoba trek berikutnya...');
    setTimeout(() => {
      nextTrack();
    }, 1200);
  }
}

// Perbarui teks status pada dock minimalis
function updateDockInfo() {
  const playlist = getPlaylist();
  const track = playlist[currentTrackIndex] || playlist[0] || { title: 'The Strokes - Someday', artist: '' };
  const titleEl = document.getElementById('audio-dock-title');
  if (titleEl) {
    titleEl.textContent = track.title || 'The Strokes - Someday';
    titleEl.title = `${track.title} - ${track.artist || ''}`;
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

  pendingPlay = true;

  // Mulai putar audio YouTube jika player sudah siap
  if (isPlayerReady && ytPlayer && ytPlayer.playVideo) {
    ytPlayer.playVideo();
  }

  // Mulai animasi putaran piringan
  if (vinylDisc) {
    vinylDisc.classList.add('spinning');
  }

  if (introStatus) {
    const playlist = getPlaylist();
    const track = playlist[currentTrackIndex] || { title: 'Lagu Pengiring' };
    introStatus.textContent = `MEMUTAR // ${track.title.toUpperCase()} ♫`;
  }

  // Simpan status sesi agar piringan besar hanya bermain sekali per sesi
  try {
    sessionStorage.setItem('vinyl_intro_played', 'true');
  } catch (e) {}

  const spinDuration = (typeof AUDIO_SETTINGS !== 'undefined' && AUDIO_SETTINGS?.spinDurationMs) || 3600;

  // Setelah berputar sejenak, piringan meluncur turun ke bawah layar dan menghilang
  setTimeout(() => {
    if (vinylIntro) {
      vinylIntro.classList.add('slide-down-exit');
    }
    // Munculkan audio dock minimalis di pojok
    if (dock) {
      dock.classList.add('visible');
    }
  }, spinDuration);
}

// Toggle Play/Pause dari dock minimalis
export function toggleAudio() {
  if (!ytPlayer) return;
  if (!isPlayerReady) {
    pendingPlay = true;
    return;
  }

  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
}

// Pindah ke lagu berikutnya
export function nextTrack() {
  const playlist = getPlaylist();
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  const nextItem = playlist[currentTrackIndex];
  const videoId = safeExtractYouTubeId(nextItem.youtubeId);

  if (ytPlayer && ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(videoId);
    isPlaying = true;
    updatePlayStateUI(true);
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
