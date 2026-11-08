export type BridgeActionType = "key" | "click" | "text" | "ping";

export interface BridgeMessage {
  type: BridgeActionType;
  key?: string;
  modifiers?: string[];
  x?: number;
  y?: number;
  text?: string;
}

export interface BridgeStatus {
  port: number;
  connectedClients: number;
  platform: string;
}
