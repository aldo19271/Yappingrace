import { useEffect, useState } from 'react';
import { SOUNDS } from '../../config/sounds.js';

const KEY = 'yr_sound';
const listeners = new Set();
const base = {};
let enabled = readPref();

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

function prepare(name) {
  const cfg = SOUNDS[name];
  if (!cfg || !cfg.src) return null;
  if (!base[name]) {
    try {
      const a = new Audio(cfg.src);
      a.preload = 'auto';
      a.addEventListener('error', () => {
        a.__bad = true; // file belum ada: diam saja
      });
      base[name] = a;
    } catch {
      return null;
    }
  }
  return base[name];
}

/** Putar efek suara. name: 'click' | 'attack' | 'win' | 'lose' */
export function playSound(name) {
  if (!enabled) return;
  try {
    const a = prepare(name);
    if (!a || a.__bad) return;
    const clip = a.cloneNode();
    clip.volume = Math.min(1, Math.max(0, SOUNDS[name].volume ?? 1));
    const p = clip.play();
    if (p && p.catch) p.catch(() => {});
  } catch {
    /* abaikan */
  }
}

/**
 * Suara klik untuk semua tombol di UI (kecuali di dalam layar game),
 * ditambah getar ringan di HP. Dipanggil sekali di main.jsx.
 */
export function initUiSounds() {
  Object.keys(SOUNDS).forEach(prepare); // muat lebih awal
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target && e.target.closest ? e.target.closest('button, a[href], [role="tab"], [role="switch"]') : null;
      if (!el || el.disabled || el.closest('.game')) return;
      playSound('click');
      try {
        if (enabled && navigator.vibrate) navigator.vibrate(8);
      } catch {
        /* tidak didukung */
      }
    },
    true,
  );
}
