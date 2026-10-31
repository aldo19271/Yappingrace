import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, Lock, Users } from 'lucide-react';
import { useApp } from '../store.jsx';
import { Button, Field, Modal, PasswordField, Screen, TopBar, itemVariants, listVariants } from '../components/ui.jsx';

export default function JoinRoom() {
  const { state, actions } = useApp();
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const prompt = state.passwordPrompt;

  const join = (room) => {
    if (room.status !== 'lobby') return actions.toast('Game di room ini sedang berjalan.');
    if (room.players >= room.max) return actions.toast('Room sudah penuh.');
    if (room.isPrivate) {
      setPw('');
      actions.joinRoom(room.code, '');
      return;
    }
    actions.joinRoom(room.code, '');
  };

  return (
    <Screen>
      <TopBar title="Join Room" onBack={() => actions.go('menu')} />
      <Button variant="ghost" icon={Hash} onClick={() => setCodeOpen(true)}>
        Join Room Dengan Kode
      </Button>

      <motion.div className="list" variants={listVariants} initial="initial" animate="animate" key="list">
        <AnimatePresence initial={false}>
          {state.rooms.map((r) => {
            const closed = r.status !== 'lobby';
            const full = r.players >= r.max;
            return (
              <motion.button
                key={r.code}
                type="button"
                layout
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`room-item ${closed || full ? 'disabled' : ''}`}
                onClick={() => join(r)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="room-main">
                  <strong>{r.name}</strong>
                  <small>
                    Kode {r.code}
                    {closed ? ' - sedang bermain' : full ? ' - penuh' : ''}
                  </small>
                </span>
                {r.isPrivate ? <Lock size={16} strokeWidth={2.5} className="dim" /> : null}
                <span className="count">
                  <Users size={15} strokeWidth={2.5} /> {r.players}/{r.max}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {state.rooms.length === 0 ? (
          <motion.p className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Belum ada room. Buat room sendiri atau tunggu pemain lain.
          </motion.p>
        ) : null}
      </motion.div>

      <Modal open={codeOpen} onClose={() => setCodeOpen(false)} title="Masukkan kode room">
        <Field
          label="Kode"
          value={code}
          maxLength={8}
          autoFocus
          placeholder="ABCDE"
          style={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <Button
          loading={state.busy}
          disabled={code.trim().length < 4}
          onClick={() => {
            actions.joinRoom(code, '');
            setCodeOpen(false);
          }}
        >
          Join
        </Button>
      </Modal>

      <Modal open={!!prompt} onClose={actions.dismissPrompt} title="Room ini pakai password">
        <PasswordField
          label="Password"
          value={pw}
          autoFocus
          maxLength={20}
          autoComplete="off"
          onChange={(e) => setPw(e.target.value)}
        />
        {prompt && prompt.error ? <p className="error">{prompt.error}</p> : null}
        <Button
          loading={state.busy}
          disabled={!pw}
          onClick={() => {
            actions.joinRoom(prompt.code, pw);
          }}
        >
          Masuk
        </Button>
      </Modal>
    </Screen>
  );
}
