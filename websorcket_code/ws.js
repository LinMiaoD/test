// 单例 WebSocket 服务：心跳 + 指数退避重连
class WSService {
  static _inst;
  static get i() { return this._inst || (this._inst = new WSService()); }

  ws = null;
  url = '';
  hb = null;         // heartbeat timer
  rt = null;         // reconnect timer
  retry = 0;
  maxRetry = 10;

  connect(url) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.url = url;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.retry = 0;
      this.startHeartbeat();
      console.debug('[WS] open');
    };

    this.ws.onmessage = (ev) => {
      // 全局事件总线分发（见 main.js 里的 Vue.prototype.$bus）
      if (window.__WS_BUS__) {
        let data = ev.data;
        try { data = JSON.parse(ev.data); } catch (e) {}
        window.__WS_BUS__.$emit('ws:message', data);
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.scheduleReconnect();
      console.debug('[WS] close');
    };

    this.ws.onerror = () => {
      // 交给 onclose 来统一重连逻辑
      this.ws && this.ws.close();
      console.debug('[WS] error');
    };
  }

  send(data) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    const tick = () => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
      this.hb = setTimeout(tick, 25000); // 25s，避开很多 30s 空闲断开
    };
    this.hb = setTimeout(tick, 25000);
  }
  stopHeartbeat() {
    if (this.hb) clearTimeout(this.hb);
    this.hb = null;
  }

  scheduleReconnect() {
    if (this.rt) return;
    const delay = Math.min(30000, 1000 * Math.pow(2, this.retry++)); // 指数退避 ≤ 30s
    if (this.retry > this.maxRetry) return; // 需要无限重试可去掉这一行
    this.rt = setTimeout(() => {
      this.rt = null;
      this.connect(this.url);
    }, delay);
  }
}

export default WSService.i;
