import { ActionContext, ActionExecutor } from "../types";

export class KeyboardAction implements ActionExecutor {
  public async execute(payload: Record<string, unknown>, _context: ActionContext): Promise<boolean> {
    const key = typeof payload.key === "string" ? payload.key : "";
    if (!key || typeof window === "undefined") return false;

    const eventInit: KeyboardEventInit = {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
      altKey: !!payload.altKey,
      ctrlKey: !!payload.ctrlKey,
      shiftKey: !!payload.shiftKey,
      metaKey: !!payload.metaKey,
    };

    const downEvent = new KeyboardEvent("keydown", eventInit);
    const upEvent = new KeyboardEvent("keyup", eventInit);

    const target = document.activeElement || document.body;
    target.dispatchEvent(downEvent);
    setTimeout(() => {
      target.dispatchEvent(upEvent);
    }, 50);

    return true;
  }
}
