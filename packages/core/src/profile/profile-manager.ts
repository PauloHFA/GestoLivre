import { openDB, IDBPDatabase } from "idb";
import { GestureProfile } from "../types";

const DB_NAME = "GestoLivreDB";
const DB_VERSION = 1;
const STORE_PROFILES = "profiles";

export class ProfileManager {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  constructor() {
    if (typeof window !== "undefined" && "indexedDB" in window) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_PROFILES)) {
            db.createObjectStore(STORE_PROFILES, { keyPath: "id" });
          }
        },
      });
    }
  }

  public createDefaultProfile(name = "Perfil Padrão"): GestureProfile {
    return {
      version: "1.0.0",
      id: "profile_" + Math.random().toString(36).substring(2, 9),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeSources: ["face", "hand"],
      gestures: [],
      samples: [],
      actions: [],
    };
  }

  public async saveProfile(profile: GestureProfile): Promise<void> {
    profile.updatedAt = new Date().toISOString();
    if (this.dbPromise) {
      const db = await this.dbPromise;
      await db.put(STORE_PROFILES, profile);
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(`gestolivre_profile_${profile.id}`, JSON.stringify(profile));
    }
  }

  public async getProfile(id: string): Promise<GestureProfile | null> {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      const res = await db.get(STORE_PROFILES, id);
      return res ?? null;
    } else if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(`gestolivre_profile_${id}`);
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  }

  public async getAllProfiles(): Promise<GestureProfile[]> {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      return await db.getAll(STORE_PROFILES);
    } else if (typeof localStorage !== "undefined") {
      const list: GestureProfile[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("gestolivre_profile_")) {
          const raw = localStorage.getItem(k);
          if (raw) list.push(JSON.parse(raw));
        }
      }
      return list;
    }
    return [];
  }

  public exportProfileJson(profile: GestureProfile): string {
    return JSON.stringify(profile, null, 2);
  }

  public importProfileJson(jsonContent: string): GestureProfile {
    const parsed = JSON.parse(jsonContent);

    // Validação básica de esquema
    if (!parsed.version || !parsed.name || !Array.isArray(parsed.gestures)) {
      throw new Error("Arquivo de perfil inválido. Formato incompatível com GestoLivre.");
    }

    // Migração de versões anteriores se necessário
    if (parsed.version !== "1.0.0") {
      parsed.version = "1.0.0";
    }

    return parsed as GestureProfile;
  }

  public async clearAllData(): Promise<void> {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      const tx = db.transaction(STORE_PROFILES, "readwrite");
      await tx.objectStore(STORE_PROFILES).clear();
      await tx.done;
    }

    if (typeof localStorage !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("gestolivre_")) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k);
      }
    }
  }
}
