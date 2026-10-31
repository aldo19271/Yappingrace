import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, Crosshair, Crown, LogOut } from 'lucide-react';
import { useApp } from '../store.jsx';
import { api } from '../lib/api.js';
import Avatar from '../components/Avatar.jsx';
import { Button, HpBar } from '../components/ui.jsx';

function PlayerCard({ p, g, enemy, isTarget, onPick }) {
  const hit = g.lastHit && g.lastHit.to === p.id ? g.lastHit : null;
  const Tag = enemy && p.alive ? motion.button : motion.div;
  return (
    <Tag
      type={enemy && p.alive ? 'button' : undefined}
      layout
      className={`pcard ${enemy ? 'enemy' : 'ally'} ${isTarget ? 'target' : ''} ${p.alive ? '' : 'dead'} ${p.id === g.youId ? 'you' : ''}`}
      onClick={enemy && p.alive ? () => onPick(p.id) : undefined}
      whileTap={enemy && p.alive ? { scale: 0.94 } : undefined}
    >
      <div className="pcard-avatar">
        <Avatar skin={p.skin} size={54} dead={!p.alive} hits={p.hits} />
        <AnimatePresence>
          {hit ? (
            <motion.span
              key={hit.seq}
              className="float-dmg"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -34, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              -{hit.dmg}
            </motion.span>
          ) : null}
        </AnimatePresence>
        {isTarget ? (
          <motion.span
            className="crosshair"
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          >
            <Crosshair size={18} strokeWidth={2.5} />
          </motion.span>
        ) : null}
      </div>
      <span className="pcard-name">{p.id === g.youId ? 'Kamu' : p.name}</span>
      <HpBar hp={p.hp} max={g.maxHp} tone={enemy ? 'enemy' : 'ally'} />
      <small className="pcard-hp">{p.left ? 'keluar' : p.hp}</small>
    </Tag>
  );
}

function Result({ g, onBack, user }) {
  const r = g.result;
  const me = r.players.find((p) => p.id === g.youId);
  const myTeam = me ? me.team : 0;
  const won = r.winnerTeam !== null && r.winnerTeam === myTeam;
  const rows = (team) => r.players.filter((p) => p.team === team);
  return (
    <motion.div className="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="result-card"
        initial={{ y: 40, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <h2 className={won ? 'win' : 'lose'}>{r.winnerTeam === null ? 'Seri' : won ? 'Tim kamu menang' : 'Tim kamu kalah'}</h2>
        {[myTeam, myTeam === 1 ? 2 : 1].map((team) => (
          <div className="result-team" key={team}>
            <h4>
              {team === myTeam ? 'Tim kamu' : 'Tim lawan'}
              {r.winnerTeam === team ? ' - menang' : ''}
            </h4>
            {rows(team).map((p, i) => (
              <motion.div
                key={p.id}
                className="result-row"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                <Avatar skin={p.skin} size={34} bob={false} plate={false} />
                <span className="result-name">
                  {p.id === g.youId ? 'Kamu' : p.name}
                  {p.left ? <small> (keluar)</small> : null}
                </span>
                {p.isMvp ? (
                  <span className="badge">
                    <Crown size={13} strokeWidth={2.5} /> MVP
                  </span>
                ) : null}
                <span className="result-words">{p.words} kata</span>
                {p.coins > 0 ? (
                  <span className="result-coins">
                    <Coins size={14} strokeWidth={2.5} /> +{p.coins}
                  </span>
                ) : null}
              </motion.div>
            ))}
          </div>
        ))}
        {!user ? <p className="note center-text">Guest tidak mendapat koin dan tidak masuk leaderboard.</p> : null}
        <Button onClick={onBack}>Kembali ke room</Button>
      </motion.div>
    </motion.div>
  );
}

export default function Game() {
  const { state, actions } = useApp();
  const g = state.game;
  const inputRef = useRef(null);
  const idxRef = useRef(0);
  const [typed, setTyped] = useState('');
  const [flash, setFlash] = useState(0);

  // sinkron index dari server / state
  useEffect(() => {
    if (g) idxRef.current = g.idx;
  }, [g && g.idx, state.startSeq]); // eslint-disable-line react-hooks/exhaustive-deps

  // beri tahu server bahwa halaman game sudah siap
  useEffect(() => {
    if (g && g.phase === 'loading') actions.ready();
  }, [state.startSeq]); // eslint-disable-line react-hooks/exhaustive-deps

  // fokus ke kolom ketik saat mulai
  useEffect(() => {
    if (g && g.phase === 'playing' && inputRef.current) inputRef.current.focus();
  }, [g && g.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // segarkan koin setelah hasil dicatat server
  const ended = !!(g && g.result);
  useEffect(() => {
    if (!ended || !state.user) return undefined;
    const t = setTimeout(() => {
      api
        .me()
        .then((r) => actions.setUser(r.user))
        .catch(() => {});
    }, 2200);
    return () => clearTimeout(t);
  }, [ended]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!g) return null;
  const me = g.players[g.youId];
  const myTeam = me ? me.team : 1;
  const allies = g.order.map((id) => g.players[id]).filter((p) => p.team === myTeam);
  const enemies = g.order.map((id) => g.players[id]).filter((p) => p.team !== myTeam);

  const alive = !!(me && me.alive);
  const playing = g.phase === 'playing' && alive;
  const word = g.words[g.idx];
  const upcoming = g.words.slice(g.idx + 1, g.idx + 5);
  const bad = typed.length > 0 && word && !word.startsWith(typed);

  const submit = (value) => {
    const idx = idxRef.current;
    if (idx >= g.words.length) return;
    if (value === g.words[idx]) actions.sendWord(idx, value);
    else {
      actions.sendSkip(idx);
      setFlash((n) => n + 1);
    }
    idxRef.current = idx + 1;
    actions.nextWord();
  };

  const onChange = (e) => {
    if (!playing) return;
    const raw = e.target.value.toLowerCase().replace(/[^a-z ]/g, '');
    if (raw.includes(' ')) {
      const w = raw.split(' ')[0];
      setTyped('');
      if (w.length > 0) submit(w);
      return;
    }
    setTyped(raw);
  };

  const leave = () => actions.leaveRoom();

  return (
    <main className="screen game" onClick={() => inputRef.current && playing && inputRef.current.focus()}>
      <div className="game-top">
        <span className="chip">Tim lawan</span>
        <button type="button" className="link" onClick={leave}>
          <LogOut size={15} strokeWidth={2.5} /> Keluar
        </button>
      </div>

      <div className="team-row">
        {enemies.map((p) => (
          <PlayerCard
            key={p.id}
            p={p}
            g={g}
            enemy
            isTarget={g.targetId === p.id}
            onPick={(id) => playing && actions.setTarget(id)}
          />
        ))}
      </div>

      <div className="arena">
        <AnimatePresence mode="wait">
          {g.phase === 'loading' ? (
            <motion.p key="load" className="arena-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Menyiapkan kata dari Gemini...
            </motion.p>
          ) : g.phase === 'countdown' ? (
            <motion.div
              key={`cd-${g.countdown}`}
              className="countdown"
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              {g.countdown || ''}
            </motion.div>
          ) : !alive && g.phase !== 'ended' ? (
            <motion.p key="dead" className="arena-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Kamu sudah jatuh. Tonton pertandingan sampai selesai.
            </motion.p>
          ) : word === undefined || g.waiting ? (
            <motion.p key="wait" className="arena-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Kata habis. Menunggu kata baru (5 detik)...
            </motion.p>
          ) : (
            <motion.div key="words" className="words" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div
                key={`${g.idx}-${flash}`}
                className={`word-current ${bad ? 'bad' : ''}`}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.12 }}
              >
                {word.split('').map((ch, i) => (
                  <span key={i} className={i < typed.length ? (typed[i] === ch ? 'ok' : 'err') : ''}>
                    {ch}
                  </span>
                ))}
              </motion.div>
              <div className="word-next">
                {upcoming.map((w, i) => (
                  <span key={`${g.idx}-${i}`}>{w}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="team-row">
        {allies.map((p) => (
          <PlayerCard key={p.id} p={p} g={g} enemy={false} isTarget={false} />
        ))}
      </div>
      <div className="game-top">
        <span className="chip">Tim kamu</span>
      </div>

      <motion.div className={`typebox ${bad ? 'bad' : ''}`} animate={bad ? { x: [0, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.18 }}>
        <input
          ref={inputRef}
          value={typed}
          onChange={onChange}
          disabled={!playing}
          placeholder={playing ? 'ketik kata lalu spasi' : ''}
          inputMode="text"
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Ketik kata"
        />
      </motion.div>

      {g.result ? <Result g={g} user={state.user} onBack={actions.backToRoom} /> : null}
    </main>
  );
}
