import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogIn, UserPlus, User } from 'lucide-react';
import { useApp } from '../store.jsx';
import { Button, Field, Screen, itemVariants, listVariants } from '../components/ui.jsx';

export default function Landing() {
  const { actions } = useApp();
  const [mode, setMode] = useState(null); // null | 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await actions.login(username.trim(), password);
      else await actions.register(username.trim(), password);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Screen className="center">
      <motion.div className="landing" variants={listVariants} initial="initial" animate="animate">
        <motion.div className="logo" variants={itemVariants}>
          <motion.span
            className="logo-mark"
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Y
          </motion.span>
          <h1>
            Yapping<span>Race</span>
          </h1>
        </motion.div>
        <motion.p className="tagline" variants={itemVariants}>
          Adu ketik tim lawan tim. Ketik lebih cepat, jatuhkan lawan.
        </motion.p>

        <AnimatePresence mode="wait" initial={false}>
          {mode === null ? (
            <motion.div
              key="choose"
              className="stack"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.18 }}
            >
              <Button icon={LogIn} onClick={() => setMode('login')}>
                Masuk
              </Button>
              <Button variant="ghost" icon={UserPlus} onClick={() => setMode('register')}>
                Buat akun
              </Button>
              <Button variant="quiet" icon={User} onClick={actions.playAsGuest}>
                Main sebagai guest
              </Button>
              <p className="note center-text">
                Login bersifat opsional. Tanpa login kamu jadi guest: tidak dapat koin, tidak masuk leaderboard, dan
                hanya memakai skin default.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="stack"
              onSubmit={submit}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.18 }}
            >
              <Field
                label="Username"
                value={username}
                maxLength={16}
                autoFocus
                onChange={(e) => setUsername(e.target.value)}
                hint={mode === 'register' ? '3-16 karakter: huruf, angka, underscore' : undefined}
              />
              <Field
                label="Password"
                type="password"
                value={password}
                maxLength={72}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                onChange={(e) => setPassword(e.target.value)}
                hint={mode === 'register' ? 'Minimal 6 karakter' : undefined}
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    className="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <Button type="submit" loading={loading} disabled={!username || !password}>
                {mode === 'login' ? 'Masuk' : 'Daftar'}
              </Button>
              <Button
                variant="quiet"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
              >
                {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
              </Button>
              <Button
                variant="quiet"
                onClick={() => {
                  setMode(null);
                  setError('');
                }}
              >
                Kembali
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </Screen>
  );
}
