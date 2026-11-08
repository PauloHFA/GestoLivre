import { WebSocketServer, WebSocket } from "ws";
import { InputInjector } from "./injector";
import { BridgeMessage, BridgeStatus } from "./types";

export interface BridgeServerOptions {
  port?: number;
  injector?: InputInjector;
}

export class BridgeServer {
  private port: number;
  private wss: WebSocketServer | null = null;
  private injector: InputInjector;
  private clients: Set<WebSocket> = new Set();

  constructor(options: BridgeServerOptions = {}) {
    this.port = options.port ?? 8765;
    this.injector = options.injector ?? new InputInjector();
  }

  public getStatus(): BridgeStatus {
    return {
      port: this.port,
      connectedClients: this.clients.size,
      platform: this.injector.getPlatform(),
    };
  }

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port: this.port });

        this.wss.on("listening", () => {
          resolve(this.port);
        });

        this.wss.on("error", (err) => {
          reject(err);
        });

        this.wss.on("connection", (ws) => {
          this.clients.add(ws);

          ws.on("message", async (data) => {
            try {
              const msg = JSON.parse(data.toString()) as BridgeMessage;
              await this.handleMessage(msg, ws);
            } catch (err) {
              console.error("Mensagem inválida recebida no Bridge:", err);
            }
          });

          ws.on("close", () => {
            this.clients.delete(ws);
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async handleMessage(msg: BridgeMessage, ws: WebSocket): Promise<void> {
    if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "pong", status: this.getStatus() }));
      return;
    }

    if (msg.type === "key" && msg.key) {
      const success = await this.injector.sendKey(msg.key);
      ws.send(JSON.stringify({ type: "ack", key: msg.key, success }));
    }
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      for (const client of this.clients) {
        client.close();
      }
      this.clients.clear();

      if (this.wss) {
        this.wss.close(() => {
          this.wss = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
