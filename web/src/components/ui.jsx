import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Minus, Plus } from 'lucide-react';
import { useApp } from '../store.jsx';

const spring = { type: 'spring', stiffness: 500, damping: 30 };

// ---------------------------------------------------------------- layout & transisi halaman
const pageVariants = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
};

export function Screen({ children, className = '' }) {
  return (
    <motion.main
      className={`screen ${className}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
    >
      {children}
    </motion.main>
  );
}

export const listVariants = { animate: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } };
export const itemVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 32 } },
};

// ---------------------------------------------------------------- tombol
export function Button({ variant = 'primary', icon: Icon, loading = false, children, className = '', disabled, ...rest }) {
  const off = disabled || loading;
  return (
    <motion.button
      type="button"
      whileHover={off ? undefined : { y: -2 }}
      whileTap={off ? undefined : { scale: 0.96 }}
      transition={spring}
      className={`btn btn-${variant} ${className}`}
      disabled={off}
      {...rest}
    >
      {loading ? <span className="spin" /> : Icon ? <Icon size={18} strokeWidth={2.5} /> : null}
      {children}
    </motion.button>
  );
}

export function IconButton({ icon: Icon, label, onClick, className = '', ...rest }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      className={`icon-btn ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={spring}
      {...rest}
    >
      <Icon size={20} strokeWidth={2.5} />
    </motion.button>
  );
}

export function TopBar({ title, onBack, right }) {
  return (
    <motion.header className="topbar" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
      {onBack ? <IconButton icon={ArrowLeft} label="Kembali" onClick={onBack} /> : <span className="topbar-gap" />}
      <h2>{title}</h2>
      <div className="topbar-right">{right}</div>
    </motion.header>
  );
}

// ---------------------------------------------------------------- kontrol form
export function Field({ label, hint, className = '', ...input }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      <input autoComplete="off" autoCapitalize="none" spellCheck={false} {...input} />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export function PasswordField({ label, hint, className = '', ...input }) {
  const [show, setShow] = useState(false);
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        <input autoComplete="off" autoCapitalize="none" spellCheck={false} {...input} type={show ? 'text' : 'password'} />
        <button
          type="button"
          className="eye"
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          aria-pressed={show}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShow((v) => !v)}
        >
          {show ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
        </button>
      </span>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <motion.span className="knob" animate={{ x: checked ? 22 : 0 }} transition={spring} />
    </button>
  );
}

export function Stepper({ value, min, max, step = 1, onChange }) {
  const set = (v) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <div className="stepper">
      <motion.button
        type="button"
        className="icon-btn sm"
        aria-label="Kurangi"
        whileTap={{ scale: 0.85 }}
        onClick={() => set(value - step)}
        disabled={value <= min}
      >
        <Minus size={16} strokeWidth={3} />
      </motion.button>
      <div className="stepper-val">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <motion.button
        type="button"
        className="icon-btn sm"
        aria-label="Tambah"
        whileTap={{ scale: 0.85 }}
        onClick={() => set(value + step)}
        disabled={value >= max}
      >
        <Plus size={16} strokeWidth={3} />
      </motion.button>
    </div>
  );
}

export function Tabs({ tabs, value, onChange, id }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={`tab ${value === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {value === t.id && <motion.span layoutId={`tab-${id}`} className="tab-bg" transition={spring} />}
          <span className="tab-text">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- modal & toast
export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="sheet"
            initial={{ y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 70, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title ? <h3>{title}</h3> : null}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast() {
  const { state } = useApp();
  const [shown, setShown] = useState(null);
  useEffect(() => {
    if (!state.toast) return undefined;
    setShown(state.toast);
    const t = setTimeout(() => setShown(null), 2800);
    return () => clearTimeout(t);
  }, [state.toast]);
  return (
    <div className="toast-wrap" aria-live="polite">
      <AnimatePresence>
        {shown && (
          <motion.div
            key={shown.id}
            className="toast"
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            {shown.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------- bar darah
export function HpBar({ hp, max, tone = 'ally' }) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  return (
    <div className="hp">
      <motion.div
        className={`hp-fill ${tone}`}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      />
    </div>
  );
}
