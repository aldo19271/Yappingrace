// Koneksi WebSocket ke server game (Cloudflare Worker).
// Dua koneksi: "lobby" (identitas + daftar room) dan "room" (game).
const WS_BASE = (import.meta.env.VITE_WS_URL || 'ws://localhost:8787').replace(/\/$/, '');

const FATAL_ROOM_ERRORS = ['not_found', 'password_required', 'password_wrong', 'full', 'in_game', 'auth'];

export class Net {
  constructor(emit) {
    this.emit = emit;
    this.lobby = null;
    this.lobbyGen = 0;
    this.lobbyTries = 0;
    this.lobbyTimer = null;
    this.token = null;
    this.ticket = null;

    this.room = null;
    this.roomGen = 0;
    this.roomCode = null;
    this.roomPassword = '';
    this.roomTicket = null;
    this.roomJoined = false;
    this.roomTries = 0;
    this.roomTimer = null;

    this.pingTimer = setInterval(() => {
      for (const ws of [this.lobby, this.room]) {
        try {
          if (ws && ws.readyState === 1) ws.send('ping');
        } catch {
          /* abaikan */
        }
      }
    }, 20000);
  }

  destroy() {
    clearInterval(this.pingTimer);
    clearTimeout(this.lobbyTimer);
    clearTimeout(this.roomTimer);
    this.lobbyGen++;
    this.roomGen++;
    this.closeSocket(this.lobby);
    this.closeSocket(this.room);
  }

  closeSocket(ws) {
    if (!ws) return;
    ws.onclose = null;
    ws.onerror = null;
    ws.onmessage = null;
    try {
      ws.close();
    } catch {
      /* abaikan */
    }
  }

  // ------------------------------------------------------------ lobby
  connectLobby(token) {
    this.token = token || null;
    this.lobbyGen++;
    clearTimeout(this.lobbyTimer);
    this.closeSocket(this.lobby);
    this.lobby = null;
    this.lobbyTries = 0;
    this.openLobby(this.lobbyGen);
  }

  openLobby(gen) {
    this.emit({ type: 'lobby_status', status: 'connecting' });
    const url = `${WS_BASE}/lobby${this.token ? `?token=${encodeURIComponent(this.token)}` : ''}`;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      return this.retryLobby(gen);
    }
    this.lobby = ws;
    ws.onmessage = (e) => {
      if (gen !== this.lobbyGen || e.data === 'pong') return;
      let m;
      try {
        m = JSON.parse(e.data);
      } catch {
        return;
      }
      if (m.type === 'hello') {
        this.ticket = m.ticket;
        this.lobbyTries = 0;
        this.emit({ type: 'lobby_status', status: 'online' });
      }
      this.emit({ type: 'lobby_msg', msg: m });
    };
    ws.onclose = () => {
      if (gen !== this.lobbyGen) return;
      this.emit({ type: 'lobby_status', status: 'offline' });
      this.retryLobby(gen);
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch {
        /* abaikan */
      }
    };
  }

  retryLobby(gen) {
    if (gen !== this.lobbyGen) return;
    const delay = Math.min(1000 * 2 ** this.lobbyTries, 10000);
    this.lobbyTries++;
    clearTimeout(this.lobbyTimer);
    this.lobbyTimer = setTimeout(() => {
      if (gen === this.lobbyGen) this.openLobby(gen);
    }, delay);
  }

  isOnline() {
    return !!(this.lobby && this.lobby.readyState === 1 && this.ticket);
  }

  sendLobby(obj) {
    if (this.lobby && this.lobby.readyState === 1) this.lobby.send(JSON.stringify(obj));
  }

  createRoom(settings) {
    this.sendLobby({ type: 'create_room', settings });
  }

  // ------------------------------------------------------------ room
  joinRoom(code, password = '') {
    this.leaveSocketOnly();
    this.roomCode = String(code).trim().toUpperCase();
    this.roomPassword = password;
    this.roomTicket = this.ticket;
    this.roomTries = 0;
    this.roomJoined = false;
    this.roomGen++;
    this.openRoom(this.roomGen);
  }

  openRoom(gen) {
    if (!this.roomTicket) {
      this.roomCode = null;
      this.emit({
        type: 'room_msg',
        msg: { type: 'error', code: 'no_ticket', message: 'Belum terhubung ke server.' },
      });
      return;
    }
    let ws;
    try {
      ws = new WebSocket(`${WS_BASE}/room/${this.roomCode}?ticket=${encodeURIComponent(this.roomTicket)}`);
    } catch {
      return this.retryRoom(gen);
    }
    this.room = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', password: this.roomPassword }));
    };
    ws.onmessage = (e) => {
      if (gen !== this.roomGen || e.data === 'pong') return;
      let m;
      try {
        m = JSON.parse(e.data);
      } catch {
        return;
      }
      if (m.type === 'joined') {
        this.roomJoined = true;
        this.roomTries = 0;
      }
      if (m.type === 'error' && FATAL_ROOM_ERRORS.includes(m.code)) {
        this.roomCode = null; // jangan sambung ulang
      }
      this.emit({ type: 'room_msg', msg: m });
    };
    ws.onclose = () => {
      if (gen !== this.roomGen || !this.roomCode) return;
      this.retryRoom(gen);
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch {
        /* abaikan */
      }
    };
  }

  retryRoom(gen) {
    if (gen !== this.roomGen || !this.roomCode) return;
    if (this.roomTries >= 8) {
      this.roomCode = null;
      this.emit({ type: 'room_lost' });
      return;
    }
    const delay = Math.min(800 * (this.roomTries + 1), 4000);
    this.roomTries++;
    clearTimeout(this.roomTimer);
    this.roomTimer = setTimeout(() => {
      if (gen === this.roomGen && this.roomCode) this.openRoom(gen);
    }, delay);
  }

  sendRoom(obj) {
    if (this.room && this.room.readyState === 1) this.room.send(JSON.stringify(obj));
  }

  leaveSocketOnly() {
    clearTimeout(this.roomTimer);
    this.roomGen++;
    this.closeSocket(this.room);
    this.room = null;
  }

  leaveRoom() {
    this.sendRoom({ type: 'leave' });
    this.roomCode = null;
    this.roomJoined = false;
    clearTimeout(this.roomTimer);
    this.roomGen++;
    const ws = this.room;
    this.room = null;
    // beri waktu pesan 'leave' terkirim sebelum soket ditutup
    setTimeout(() => this.closeSocket(ws), 300);
  }
}
