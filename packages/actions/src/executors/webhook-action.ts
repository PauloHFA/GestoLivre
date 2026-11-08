import { ActionContext, ActionExecutor } from "../types";

export class WebhookAction implements ActionExecutor {
  public async execute(payload: Record<string, unknown>, context: ActionContext): Promise<boolean> {
    const url = typeof payload.url === "string" ? payload.url : "";
    if (!url) return false;

    try {
      const method = (payload.method as string) ?? "POST";
      const body = payload.body ?? {
        event: "gestolivre_gesture",
        gesture: context.gestureName,
        confidence: context.confidence,
        timestamp: context.timestamp,
      };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "GET" ? JSON.stringify(body) : undefined,
      });
      return true;
    } catch (err) {
      console.error("Falha ao disparar webhook:", err);
      return false;
    }
  }
}
