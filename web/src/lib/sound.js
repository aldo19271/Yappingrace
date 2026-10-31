import { useEffect, useState } from 'react';
import { SOUNDS } from '../../config/sounds.js';

const KEY = 'yr_sound';
const listeners = new Set();
let enabled = readPref();

// Web Audio: file didecode sekali ke memori sehingga bunyi langsung tanpa jeda.
let ctx = null;
const buffers = {}; // name -> AudioBuffer
const failed = {}; // name -> true jika file tidak ada / gagal didecode
const fallback = {}; // name -> <audio>, dipakai hanya jika Web Audio belum siap

function readPref() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function isSoundOn() {
  return enabled;
}

export function setSoundOn(on) {
  enabled = !!on;
  try {
    localStorage.setItem(KEY, enabled ? 'on' : 'off');
  } catch {
    /* penyimpanan diblokir */
  }
  listeners.forEach((fn) => fn(enabled));
}

/** Hook: [suaraNyala, setSuara] */
export function useSound() {
  const [on, setOn] = useState(enabled);
  useEffect(() => {
    listeners.add(setOn);
    return () => listeners.delete(setOn);
  }, []);
  return [on, setSoundOn];
}

function getCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC({ latencyHint: 'interactive' });
  } catch {
    ctx = null;
  }
  return ctx;
}

function unlock() {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    try {
      const p = c.resume();
      if (p && p.catch) p.catch(() => {});
    } catch {
      /* abaikan */
    }
  }
}

async function load(name) {
  const cfg = SOUNDS[name];
  const c = getCtx();
  if (!cfg || !cfg.src || !c || buffers[name] || failed[name]) return;
  try {
    const res = await fetch(cfg.src);
    if (!res.ok) throw new Error('tidak ada');
    const data = await res.arrayBuffer();
    buffers[name] = await new Promise((ok, err) => c.decodeAudioData(data, ok, err));
  } catch {
    failed[name] = true; // file belum ada: diam saja
  }
}

function playFallback(name) {
  const cfg = SOUNDS[name];
  try {
    if (!fallback[name]) {
      const a = new Audio(cfg.src);
      a.preload = 'auto';
      a.addEventListener('error', () => {
        failed[name] = true;
      });
      fallback[name] = a;
    }
    const clip = fallback[name].cloneNode();
    clip.volume = Math.min(1, Math.max(0, cfg.volume ?? 1));
    const p = clip.play();
    if (p && p.catch) p.catch(() => {});
  } catch {
    /* abaikan */
  }
}

/** Putar efek suara. name: 'click' | 'attack' | 'win' | 'lose' */
export function playSound(name) {
  if (!enabled) return;
  const cfg = SOUNDS[name];
  if (!cfg || !cfg.src || failed[name]) return;
  const c = ctx;
  const buf = buffers[name];
  if (c && buf) {
    try {
      if (c.state === 'suspended') unlock();
      const src = c.createBufferSource();
      src.buffer = buf;
      const gain = c.createGain();
      gain.gain.value = Math.min(1, Math.max(0, cfg.volume ?? 1));
      src.connect(gain);
      gain.connect(c.destination);
      src.start(0);
    } catch {
      /* abaikan */
    }
    return;
  }
  playFallback(name); // belum selesai dimuat
}

/**
 * Suara klik untuk semua tombol di UI (kecuali di dalam layar game) + getar ringan di HP.
 * Dipicu saat jari MENYENTUH layar (pointerdown), bukan saat dilepas, supaya terasa instan.
 * Dipanggil sekali di main.jsx.
 */
export function initUiSounds() {
  getCtx();
  Object.keys(SOUNDS).forEach(load);

  const isUiButton = (target) => {
    const el = target && target.closest ? target.closest('button, a[href], [role="tab"], [role="switch"]') : null;
    if (!el || el.disabled || el.closest('.game')) return false;
    return true;
  };

  const feedback = () => {
    playSound('click');
    try {
      if (enabled && navigator.vibrate) navigator.vibrate(8);
    } catch {
      /* tidak didukung */
    }
  };

  document.addEventListener(
    'pointerdown',
    (e) => {
      unlock();
      if (isUiButton(e.target)) feedback();
    },
    true,
  );
  // buka kunci audio juga di perangkat yang butuh sentuhan lepas / klik
  document.addEventListener('touchend', unlock, true);
  document.addEventListener(
    'click',
    (e) => {
      unlock();
      // klik dari keyboard (Enter/Spasi) tidak melalui pointerdown
      if (e.detail === 0 && isUiButton(e.target)) feedback();
    },
    true,
  );
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) unlock();
  });
}
