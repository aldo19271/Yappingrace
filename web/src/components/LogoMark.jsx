import { useState } from 'react';
import { LOGO_SRC } from '../../config/brand.js';

/** Logo dari file (config/brand.js). Jika file tidak ada, tampil huruf Y. */
export default function LogoMark() {
  const [failed, setFailed] = useState(false);
  if (!LOGO_SRC || failed) return <span className="logo-fallback">Y</span>;
  return <img src={LOGO_SRC} alt="Logo" draggable="false" onError={() => setFailed(true)} />;
}
