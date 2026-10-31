import { motion } from 'framer-motion';
import { Coins, DoorOpen, LogOut, PlusSquare, ShoppingBag, Trophy, Lock } from 'lucide-react';
import { useApp } from '../store.jsx';
import Avatar from '../components/Avatar.jsx';
import { Screen, itemVariants, listVariants } from '../components/ui.jsx';

function Tile({ icon: Icon, title, sub, onClick, locked, accent }) {
  return (
    <motion.button
      type="button"
      variants={itemVariants}
      className={`tile ${accent ? 'accent' : ''} ${locked ? 'locked' : ''}`}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="tile-icon">{locked ? <Lock size={22} strokeWidth={2.5} /> : <Icon size={24} strokeWidth={2.5} />}</span>
      <span className="tile-text">
        <strong>{title}</strong>
        <small>{sub}</small>
      </span>
    </motion.button>
  );
}

export default function Menu() {
  const { state, actions } = useApp();
  const { user, me, conn } = state;
  const name = user ? user.name : me ? me.name : 'menghubungkan...';
  const skin = user ? user.skin : 'stickman_hitam';

  const needLogin = (screen) =>
    user ? actions.go(screen) : actions.toast('Login dulu untuk membuka ini. Guest tidak bisa.');

  return (
    <Screen>
      <motion.header className="profile" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <Avatar skin={skin} size={52} />
        <div className="profile-text">
          <strong>{name}</strong>
          <small className={`conn ${conn}`}>
            <i /> {conn === 'online' ? 'Terhubung' : conn === 'connecting' ? 'Menyalakan server...' : 'Terputus, mencoba lagi...'}
          </small>
        </div>
        {user ? (
          <div className="coins">
            <Coins size={18} strokeWidth={2.5} /> {user.coins}
          </div>
        ) : null}
      </motion.header>

      <motion.div className="tiles" variants={listVariants} initial="initial" animate="animate">
        <Tile icon={PlusSquare} accent title="Create Room" sub="Buat room baru" onClick={() => actions.go('create')} />
        <Tile icon={DoorOpen} title="Join Room" sub="Masuk ke room yang ada" onClick={() => actions.go('join')} />
        <Tile icon={ShoppingBag} title="Shop" sub="Beli skin dengan koin" locked={!user} onClick={() => needLogin('shop')} />
        <Tile icon={Trophy} title="Leaderboard" sub="Top 25 win dan koin" locked={!user} onClick={() => needLogin('leaderboard')} />
      </motion.div>

      <motion.div className="foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        {conn !== 'online' ? (
          <p className="note">
            Server game gratis bisa butuh beberapa detik untuk menyala. Tunggu sampai status berubah menjadi Terhubung.
          </p>
        ) : null}
        <button type="button" className="link" onClick={actions.logout}>
          <LogOut size={16} strokeWidth={2.5} /> {user ? 'Keluar akun' : 'Kembali ke awal'}
        </button>
      </motion.div>
    </Screen>
  );
}
