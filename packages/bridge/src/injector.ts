import { exec } from "node:child_process";
import os from "node:os";

export class InputInjector {
  private platform: string;

  constructor() {
    this.platform = os.platform();
  }

  public getPlatform(): string {
    return this.platform;
  }

  /**
   * Injeta tecla no sistema operacional ativo
   */
  public async sendKey(key: string): Promise<boolean> {
    if (this.platform === "win32") {
      // Converte teclas comuns para sintaxe SendKeys do Windows
      const keyMap: Record<string, string> = {
        ArrowRight: "{RIGHT}",
        ArrowLeft: "{LEFT}",
        ArrowUp: "{UP}",
        ArrowDown: "{DOWN}",
        Enter: "{ENTER}",
        Space: " ",
        PageDown: "{PGDN}",
        PageUp: "{PGUP}",
        Escape: "{ESC}",
        Backspace: "{BKSP}",
        Tab: "{TAB}",
      };

      const sendKeyFormat = keyMap[key] ?? key;
      const cmd = `powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${sendKeyFormat}')"`;

      return new Promise((resolve) => {
        exec(cmd, (err) => {
          if (err) {
            console.error("Falha ao injetar tecla no Windows:", err.message);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    }

    if (this.platform === "linux") {
      return new Promise((resolve) => {
        exec(`xdotool key ${key}`, (err) => {
          resolve(!err);
        });
      });
    }

    if (this.platform === "darwin") {
      const script = `osascript -e 'tell application "System Events" to key code ${key}'`;
      return new Promise((resolve) => {
        exec(script, (err) => {
          resolve(!err);
        });
      });
    }

    console.warn(`Plataforma ${this.platform} não possui suporte nativo direto de injeção de teclas.`);
    return false;
  }
}
