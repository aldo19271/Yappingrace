import { motion } from 'framer-motion';
import { ArrowUpRight, Camera, Code, Link as LinkIcon, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../store.jsx';
import LogoMark from '../components/LogoMark.jsx';
import { Typewriter, useRipple } from '../components/fx.jsx';
import { Screen, Switch, TopBar, itemVariants, listVariants } from '../components/ui.jsx';
import { useSound } from '../lib/sound.js';
import { ABOUT } from '../../config/about.js';

const ICONS = { camera: Camera, code: Code, link: LinkIcon };

function LinkCard({ item, i }) {
  const [down, ripples] = useRipple();
  const Icon = ICONS[item.icon] || LinkIcon;
  return (
    <motion.a
      variants={{
        initial: { opacity: 0, x: i % 2 ? 60 : -60 },
        animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 320, damping: 24 } },
      }}
      className="about-link"
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerDown={down}
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
    >
      {ripples}
      <motion.span className="about-link-icon" variants={{ hover: { rotate: [0, -14, 14, 0], scale: 1.15 } }} transition={{ duration: 0.45 }}>
        <Icon size={22} strokeWidth={2.5} />
      </motion.span>
      <span className="about-link-text">
        <strong>{item.label}</strong>
        {item.sub ? <small>{item.sub}</small> : null}
      </span>
      <motion.span className="about-link-go" variants={{ hover: { x: 5, y: -5 } }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        <ArrowUpRight size={22} strokeWidth={3} />
      </motion.span>
    </motion.a>
  );
}

export default function About() {
  const { actions } = useApp();
  const [soundOn, setSoundOn] = useSound();

  return (
    <Screen>
      <TopBar title="About" onBack={() => actions.go('menu')} />

      <motion.div className="about-hero" variants={listVariants} initial="initial" animate="animate">
        <motion.div
          className="about-logo logo-mark"
          variants={itemVariants}
          animate={{ y: [0, -8, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ rotate: 360, scale: 1.2 }}
        >
          <LogoMark />
        </motion.div>
        <motion.h2 variants={itemVariants} className="about-name">
          {ABOUT.name}
        </motion.h2>
        <motion.p variants={itemVariants} className="about-tag">
          <Typewriter text={ABOUT.tagline} delay={500} />
        </motion.p>
      </motion.div>

      <motion.div className="about-links" variants={listVariants} initial="initial" animate="animate">
        {ABOUT.links.map((l, i) => (
          <LinkCard key={l.id} item={l} i={i} />
        ))}
      </motion.div>

      <motion.div
        className="about-sound"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          key={soundOn ? 'on' : 'off'}
          initial={{ scale: 0.4, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 14 }}
          style={{ display: 'grid' }}
        >
          {soundOn ? <Volume2 size={22} strokeWidth={2.5} /> : <VolumeX size={22} strokeWidth={2.5} />}
        </motion.span>
        <span className="about-sound-text">
          <strong>Suara</strong>
          <small>{soundOn ? 'Efek suara menyala' : 'Efek suara mati'}</small>
        </span>
        <Switch checked={soundOn} onChange={setSoundOn} label="Efek suara" />
      </motion.div>

      <motion.p
        className="version"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Versi {ABOUT.version}
      </motion.p>
    </Screen>
  );
}
