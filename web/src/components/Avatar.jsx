import { motion } from 'framer-motion';
import { findSkin } from '../../config/skins.js';

const INK = '#111111';
const ORANGE = '#ff6a00';

function Figure({ look }) {
  const body = (
    <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
      <circle cx="32" cy="20" r="10" />
      <path d="M32 30V54M32 38L19 49M32 38L45 49M32 54L22 75M32 54L42 75" />
    </g>
  );
  let extra = null;
  let custom = null;

  if (look === 'penyihir') {
    extra = (
      <g>
        <path d="M20 15L33 -9L44 15Z" fill="#5b3fd1" />
        <rect x="16" y="13" width="32" height="5" rx="2.5" fill="#5b3fd1" />
        <path d="M51 36V78" stroke="#8a5a2b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="51" cy="33" r="4.5" fill={ORANGE} />
      </g>
    );
  } else if (look === 'ksatria') {
    extra = (
      <g>
        <path d="M21 21a11 11 0 0 1 22 0v4H21z" fill="#9aa3ad" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 9c6-6 13-2 11 5" stroke={ORANGE} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path
          d="M8 42h16v10c0 6-4 9-8 10.5C12 61 8 58 8 52z"
          fill="#9aa3ad"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    );
  } else if (look === 'ninja') {
    extra = (
      <g>
        <circle cx="32" cy="20" r="10.5" fill={INK} />
        <rect x="21.5" y="17" width="21" height="5" rx="1" fill={ORANGE} />
        <path d="M42 19l12 4-11 3z" fill={ORANGE} />
      </g>
    );
  } else if (look === 'robot') {
    custom = (
      <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 6V1" fill="none" />
        <circle cx="32" cy="-1" r="2.8" fill={ORANGE} />
        <rect x="21" y="6" width="22" height="18" rx="4" fill={ORANGE} />
        <circle cx="27" cy="15" r="2.2" fill={INK} stroke="none" />
        <circle cx="37" cy="15" r="2.2" fill={INK} stroke="none" />
        <rect x="24" y="28" width="16" height="24" rx="3" fill={ORANGE} />
        <path d="M24 33L12 46M40 33L52 46M28 52L24 75M36 52L40 75" fill="none" />
      </g>
    );
  } else if (look === 'astronot') {
    custom = (
      <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 34L12 47M40 34L52 47M28 56L24 75M36 56L40 75" fill="none" strokeWidth="5" />
        <rect x="21" y="30" width="22" height="27" rx="8" fill="#ffffff" />
        <rect x="27" y="38" width="10" height="6" rx="1.5" fill={ORANGE} stroke="none" />
        <circle cx="32" cy="19" r="12" fill="#ffffff" />
        <ellipse cx="32" cy="19" rx="8" ry="6.5" fill="#1c1c1c" stroke="none" />
      </g>
    );
  }

  return (
    <svg viewBox="0 -12 64 94" width="100%" height="100%" role="img" aria-hidden="true">
      {custom || (
        <>
          {body}
          {extra}
        </>
      )}
    </svg>
  );
}

/**
 * Karakter pemain. `hits` dinaikkan setiap terkena serangan agar karakter bergetar.
 * Skin dengan field `image` di config memakai gambar sendiri.
 */
export default function Avatar({ skin, size = 56, dead = false, hits = 0, bob = true, plate = true }) {
  const s = findSkin(skin);
  return (
    <motion.div
      className={`avatar ${plate ? 'plate' : ''} ${dead ? 'dead' : ''}`}
      style={{ width: size, height: size }}
      animate={dead ? { rotate: -14, y: 3 } : bob ? { y: [0, -2.5, 0] } : { y: 0 }}
      transition={dead ? { type: 'spring', stiffness: 300, damping: 20 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        key={hits}
        className="avatar-inner"
        initial={false}
        animate={hits ? { x: [0, -6, 6, -4, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.32 }}
      >
        {s.image ? <img src={s.image} alt="" draggable="false" /> : <Figure look={s.look} />}
      </motion.div>
    </motion.div>
  );
}
