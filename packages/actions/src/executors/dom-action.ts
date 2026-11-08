import { ActionContext, ActionExecutor } from "../types";

export class DOMAction implements ActionExecutor {
  public async execute(payload: Record<string, unknown>, _context: ActionContext): Promise<boolean> {
    const selector = typeof payload.selector === "string" ? payload.selector : "";
    if (!selector || typeof document === "undefined") return false;

    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
      el.click();
      return true;
    }
    return false;
  }
}
