import { ActionContext, ActionExecutor } from "./types";
import { SpeechAction } from "./executors/speech-action";
import { KeyboardAction } from "./executors/keyboard-action";
import { DOMAction } from "./executors/dom-action";
import { WebhookAction } from "./executors/webhook-action";

export * from "./types";
export * from "./executors/speech-action";
export * from "./executors/keyboard-action";
export * from "./executors/dom-action";
export * from "./executors/webhook-action";

export class ActionDispatcher {
  private executors: Map<string, ActionExecutor> = new Map();

  constructor() {
    this.register("speech", new SpeechAction());
    this.register("key", new KeyboardAction());
    this.register("dom", new DOMAction());
    this.register("webhook", new WebhookAction());
  }

  public register(type: string, executor: ActionExecutor): void {
    this.executors.set(type, executor);
  }

  public async dispatch(
    type: string,
    payload: Record<string, unknown>,
    context: ActionContext
  ): Promise<boolean> {
    const executor = this.executors.get(type);
    if (!executor) {
      console.warn(`Executor para a ação '${type}' não encontrado.`);
      return false;
    }
    return await executor.execute(payload, context);
  }
}
