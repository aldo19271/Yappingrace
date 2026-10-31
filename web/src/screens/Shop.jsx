import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins } from 'lucide-react';
import { useApp } from '../store.jsx';
import { api } from '../lib/api.js';
import Avatar from '../components/Avatar.jsx';
import { Button, Screen, TopBar, itemVariants, listVariants } from '../components/ui.jsx';

export default function Shop() {
  const { state, actions } = useApp();
  const user = state.user;
  const [skins, setSkins] = useState(null);
  const [pending, setPending] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .shop()
      .then((r) => {
        if (!alive) return;
        setSkins(r.skins);
        actions.setUser(r.user);
      })
      .catch((e) => alive && setErr(e.message));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (id, fn) => {
    setPending(id);
    setErr('');
    try {
      const r = await fn();
      actions.setUser(r.user);
      if (r.token) actions.refreshIdentity(r.token);
    } catch (e) {
      setErr(e.message);
      if (e.data && e.data.user) actions.setUser(e.data.user);
    } finally {
      setPending('');
    }
  };

  if (!user) return null;

  return (
    <Screen>
      <TopBar
        title="Shop"
        onBack={() => actions.go('menu')}
        right={
          <div className="coins">
            <Coins size={18} strokeWidth={2.5} />
            <motion.span key={user.coins} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
              {user.coins}
            </motion.span>
          </div>
        }
      />
      {err ? <p className="error">{err}</p> : null}
      {!skins && !err ? <p className="empty">Memuat...</p> : null}

      <motion.div className="grid" variants={listVariants} initial="initial" animate="animate">
        {(skins || []).map((s) => {
          const owned = s.price === 0 || user.owned.includes(s.id);
          const equipped = user.skin === s.id;
          const afford = user.coins >= s.price;
          return (
            <motion.div key={s.id} variants={itemVariants} className={`skin ${equipped ? 'equipped' : ''}`} whileHover={{ y: -4 }}>
              <div className="skin-view">
                <Avatar skin={s.id} size={92} />
              </div>
              <strong>{s.name}</strong>
              {owned ? (
                equipped ? (
                  <span className="badge">
                    <Check size={14} strokeWidth={3} /> Dipakai
                  </span>
                ) : (
                  <Button variant="ghost" className="sm" loading={pending === s.id} onClick={() => run(s.id, () => api.equip(s.id))}>
                    Pakai
                  </Button>
                )
              ) : (
                <Button
                  className="sm"
                  loading={pending === s.id}
                  disabled={!afford}
                  onClick={() => run(s.id, () => api.buy(s.id))}
                >
                  <Coins size={15} strokeWidth={2.5} /> {s.price}
                </Button>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </Screen>
  );
}
