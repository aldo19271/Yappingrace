import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { useApp } from '../store.jsx';
import { api } from '../lib/api.js';
import { CountUp } from '../components/fx.jsx';
import { Screen, Tabs, TopBar, itemVariants, listVariants } from '../components/ui.jsx';

export default function Leaderboard() {
  const { state, actions } = useApp();
  const [tab, setTab] = useState('wins');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .leaderboard()
      .then((r) => alive && setData(r))
      .catch((e) => alive && setErr(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const rows = data ? data[tab === 'wins' ? 'wins' : 'coins'] : [];
  const max = rows.reduce((m, r) => Math.max(m, r.value), 1);
  const meName = state.user ? state.user.name : '';

  return (
    <Screen>
      <TopBar title="Leaderboard" onBack={() => actions.go('menu')} />
      <Tabs
        id="lb"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'wins', label: 'Top Win' },
          { id: 'coins', label: 'Top Koin' },
        ]}
      />
      {err ? <p className="error">{err}</p> : null}
      {!data && !err ? (
        <p className="empty">
          <span className="spin big" />
        </p>
      ) : null}
      {data && rows.length === 0 ? <p className="empty">Belum ada data. Menangkan pertandingan pertamamu.</p> : null}

      <motion.ol className="board" key={tab} variants={listVariants} initial="initial" animate="animate">
        {rows.map((r, i) => (
          <motion.li
            key={`${r.name}-${i}`}
            variants={itemVariants}
            whileHover={{ x: 6 }}
            className={`board-row ${i < 3 ? `top top-${i + 1}` : ''} ${r.name === meName ? 'me' : ''}`}
          >
            <motion.span
              className="board-bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: r.value / max }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
            />
            <span className="rank">{i + 1}</span>
            <span className="board-name">
              {r.name}
              {i === 0 ? (
                <motion.span
                  className="crown"
                  animate={{ rotate: [-10, 10, -10], y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Crown size={16} strokeWidth={2.5} />
                </motion.span>
              ) : null}
            </span>
            <span className="board-val">
              <CountUp value={r.value} />
            </span>
          </motion.li>
        ))}
      </motion.ol>
    </Screen>
  );
}
