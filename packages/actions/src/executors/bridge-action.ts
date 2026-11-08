import { ActionContext, ActionExecutor } from "../types";

export interface BridgeActionConfig {
  url?: string;
}

export class BridgeAction implements ActionExecutor {
  private url: string;
  private ws: any = null;
  private isConnecting: boolean = false;

  constructor(config: BridgeActionConfig = {}) {
    this.url = config.url ?? "ws://localhost:8765";
  }

  public isConnected(): boolean {
    const wsGlobal = typeof window !== "undefined" ? (window as any).WebSocket : (globalThis as any).WebSocket;
    return this.ws !== null && wsGlobal && this.ws.readyState === wsGlobal.OPEN;
  }

  public connect(): Promise<boolean> {
    const wsGlobal = typeof window !== "undefined" ? (window as any).WebSocket : (globalThis as any).WebSocket;
    if (typeof wsGlobal === "undefined") {
      return Promise.resolve(false);
    }
    if (this.isConnected()) {
      return Promise.resolve(true);
    }
    if (this.isConnecting) {
      return Promise.resolve(false);
    }

    this.isConnecting = true;
    return new Promise((resolve) => {
      try {
        const socket = new wsGlobal(this.url);
        socket.onopen = () => {
          this.ws = socket;
          this.isConnecting = false;
          resolve(true);
        };
        socket.onerror = () => {
          this.isConnecting = false;
          resolve(false);
        };
        socket.onclose = () => {
          this.ws = null;
          this.isConnecting = false;
        };
      } catch {
        this.isConnecting = false;
        resolve(false);
      }
    });
  }

  public async execute(payload: Record<string, unknown>, _context: ActionContext): Promise<boolean> {
    const key = typeof payload.key === "string" ? payload.key : undefined;
    if (!key) {
      return false;
    }

    if (!this.isConnected()) {
      const connected = await this.connect();
      if (!connected || !this.ws) {
        return false;
      }
    }

    try {
      this.ws.send(JSON.stringify({ type: "key", key }));
      return true;
    } catch {
      return false;
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
