import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';

// Kumpulan efek gerak. Semua flat (tanpa glow/gradien), warna oranye-hitam.

const LETTERS = 'abcdefghiklmnoprstuwy'.split('');

/** Latar: huruf melayang naik pelan + bentuk geometri berputar. */
export function Backdrop({ calm = false }) {
  const items = useMemo(
    () =>
      Array.from({ length: calm ? 8 : 20 }, (_, i) => ({
        ch: LETTERS[(i * 7) % LETTERS.length],
        left: (i * 53) % 100,
        size: 18 + ((i * 13) % 34),
        dur: 13 + ((i * 5) % 13),
        delay: -((i * 3.7) % 22),
        drift: ((i * 17) % 60) - 30,
        outline: i % 3 === 0,
      })),
    [calm],
  );
  return (
    <div className="backdrop-fx" aria-hidden="true">
      <span className="shape ring r1" />
      <span className="shape ring r2" />
      <span className="shape square s1" />
      <span className="shape square s2" />
      <span className="shape plus p1">+</span>
      <span className="shape plus p2">+</span>
      {items.map((it, i) => (
        <span
          key={i}
          className={`float-letter ${it.outline ? 'outline' : ''}`}
          style={{
            left: `${it.left}%`,
            fontSize: it.size,
            animationDuration: `${it.dur}s`,
            animationDelay: `${it.delay}s`,
            '--drift': `${it.drift}px`,
          }}
        >
          {it.ch}
        </span>
      ))}
    </div>
  );
}

/** Efek riak saat disentuh. Pakai: const [down, ripples] = useRipple(); onPointerDown={down} lalu {ripples}. */
export function useRipple() {
  const [list, setList] = useState([]);
  const down = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Math.random();
    const size = Math.max(r.width, r.height) * 2.2;
    setList((l) => [...l.slice(-2), { id, x: e.clientX - r.left, y: e.clientY - r.top, size }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 650);
  };
  const nodes = list.map((r) => (
    <span key={r.id} className="ripple" style={{ left: r.x, top: r.y, width: r.size, height: r.size }} />
  ));
  return [down, nodes];
}

/** Ledakan kotak kecil. Tampil saat `fire` bernilai (angka/timestamp) dan berubah. */
export function Burst({ fire, count = 10, radius = 48, color = 'var(--orange)' }) {
  if (!fire) return null;
  return (
    <span className="burst" key={fire} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 2) * 0.3;
        const d = radius * (0.7 + (i % 3) * 0.25);
        return (
          <motion.i
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, scale: 0.3, rotate: 200 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{ background: i % 4 === 0 ? '#f3f3f3' : color }}
          />
        );
      })}
    </span>
  );
}

/** Angka yang berhitung naik/turun. */
export function CountUp({ value, duration = 0.9 }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const ctl = animate(prev.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
    });
    prev.current = value;
    return () => ctl.stop();
  }, [value, duration]);
  return <>{shown}</>;
}

/** Teks yang diketik huruf demi huruf dengan kursor berkedip. */
export function Typewriter({ text, speed = 34, delay = 500 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let i = 0;
    let t;
    const start = setTimeout(function tick() {
      i += 1;
      setN(i);
      if (i < text.length) t = setTimeout(tick, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearTimeout(t);
    };
  }, [text, speed, delay]);
  return (
    <span>
      {text.slice(0, n)}
      <span className="caret" />
    </span>
  );
}

/** Tiga titik yang memantul (untuk "menunggu..."). */
export function Dots() {
  return (
    <span className="dots" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/** Kertas hias jatuh (kotak flat) saat menang. */
export function Confetti({ count = 40 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        dur: 2.4 + Math.random() * 2,
        size: 6 + Math.random() * 8,
        rot: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
        color: ['#ff6a00', '#ff8a33', '#f3f3f3', '#ffb067'][Math.floor(Math.random() * 4)],
      })),
    [count],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {items.map((c, i) => (
        <i
          key={i}
          style={{
            left: `${c.left}%`,
            width: c.size,
            height: c.size * 0.6,
            background: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.dur}s`,
            '--rot': `${c.rot}deg`,
            '--drift': `${c.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/** Pita kata yang berjalan terus. */
export function Marquee({ words }) {
  const row = (k) => (
    <span className="marquee-row" key={k}>
      {words.map((w, i) => (
        <span key={`${k}-${i}`}>
          {w}
          <b>/</b>
        </span>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}
