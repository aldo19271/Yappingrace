import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { useApp } from '../store.jsx';
import { Button, Field, PasswordField } from './ui.jsx';

/** Lupa password: Gmail -> kirim kode -> isi kode + (opsional) username / password baru. */
export default function ForgotForm({ onBack }) {
  const { actions } = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [wait, setWait] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const r = await api.forgotSend(email.trim());
      setSent(true);
      setWait(r.wait || 60);
      actions.toast('Kode dikirim ke Gmail kamu.');
    } catch (err) {
      setError(err.message);
      if (err.data && err.data.wait) {
        setSent(true);
        setWait(err.data.wait);
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!sent) return sendCode();
    setError('');
    setLoading(true);
    try {
      const r = await api.forgotReset({ email: email.trim(), code: code.trim(), username: username.trim(), password });
      const parts = [];
      if (r.usernameChanged) parts.push('username');
      if (r.passwordChanged) parts.push('password');
      actions.toast(parts.length ? `Berhasil ganti ${parts.join(' dan ')}. Silakan masuk.` : 'Kode benar. Tidak ada yang diganti.');
      onBack();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <motion.form
      className="stack"
      onSubmit={submit}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    >
      <Field
        label="Gmail"
        type="email"
        inputMode="email"
        value={email}
        maxLength={64}
        autoFocus
        autoComplete="email"
        disabled={sent}
        onChange={(e) => setEmail(e.target.value)}
        hint={sent ? undefined : 'Masukkan Gmail yang kamu pakai saat daftar'}
      />
      <AnimatePresence>
        {sent ? (
          <motion.div
            className="stack"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Field
              label="Kode dari Gmail"
              inputMode="numeric"
              value={code}
              maxLength={6}
              autoComplete="one-time-code"
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              hint="6 angka, berlaku 10 menit"
            />
            <Field
              label="Username baru"
              value={username}
              maxLength={16}
              onChange={(e) => setUsername(e.target.value)}
              hint="Kosongkan kalau username tidak diganti"
            />
            <PasswordField
              label="Password baru"
              value={password}
              maxLength={72}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              hint="Kosongkan kalau password tidak diganti"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.p
            className="error"
            initial={{ opacity: 0, height: 0, x: 0 }}
            animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -5, 5, 0] }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {sent ? (
        <>
          <Button type="submit" loading={loading} disabled={code.length !== 6}>
            Simpan
          </Button>
          <Button variant="quiet" disabled={wait > 0} onClick={sendCode}>
            {wait > 0 ? `Kirim ulang kode (${wait})` : 'Kirim ulang kode'}
          </Button>
        </>
      ) : (
        <Button type="submit" loading={loading} disabled={!email}>
          Kirim kode ke Gmail
        </Button>
      )}
      <Button variant="quiet" onClick={onBack}>
        Kembali
      </Button>
    </motion.form>
  );
}
