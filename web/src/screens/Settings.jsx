import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../store.jsx';
import { Screen, Switch, TopBar } from '../components/ui.jsx';
import { useSound } from '../lib/sound.js';

export default function SettingsScreen() {
  const { actions } = useApp();
  const [soundOn, setSoundOn] = useSound();
  return (
    <Screen>
      <TopBar title="Pengaturan" onBack={() => actions.go('menu')} />
      <motion.div
        className="setting-row"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          key={soundOn ? 'on' : 'off'}
          className="setting-icon"
          initial={{ scale: 0.4, rotate: -35 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 14 }}
        >
          {soundOn ? <Volume2 size={22} strokeWidth={2.5} /> : <VolumeX size={22} strokeWidth={2.5} />}
        </motion.span>
        <span className="setting-text">
          <strong>Suara</strong>
          <small>{soundOn ? 'Efek suara menyala' : 'Efek suara mati'}</small>
        </span>
        <Switch checked={soundOn} onChange={setSoundOn} label="Efek suara" />
      </motion.div>
    </Screen>
  );
}
