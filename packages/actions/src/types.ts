export type ActionTrigger = "gesturestart" | "gesturehold" | "gestureend";

export interface ActionContext {
  gestureName: string;
  confidence: number;
  timestamp: number;
}

export interface ActionExecutor {
  execute(payload: Record<string, unknown>, context: ActionContext): Promise<boolean>;
}
