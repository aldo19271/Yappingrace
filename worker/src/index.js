import { Lobby } from './lobby.js';
import { Room } from './room.js';

export { Lobby, Room };

function originAllowed(request, env) {
  const list = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return true; // belum diatur: izinkan semua
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  return list.some((rule) => {
    if (rule === origin) return true;
    // dukung wildcard sederhana: https://*.vercel.app
    if (rule.includes('*')) {
      const re = new RegExp('^' + rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^.]+') + '$');
      return re.test(origin);
    }
    return false;
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response('YappingRace WS OK', { headers: { 'content-type': 'text/plain' } });
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 426 });
    }
    if (!originAllowed(request, env)) {
      return new Response('Origin tidak diizinkan', { status: 403 });
    }

    if (url.pathname === '/lobby') {
      const stub = env.LOBBY.get(env.LOBBY.idFromName('main'));
      return stub.fetch(request);
    }

    const m = url.pathname.match(/^\/room\/([A-Za-z0-9]{4,8})$/);
    if (m) {
      const code = m[1].toUpperCase();
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      return stub.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
