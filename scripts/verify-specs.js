#!/usr/bin/env node

/**
 * Script de Verificação SDD (Spec-Driven Development)
 * Garante que todos os requisitos "Must" do GestoLivre possuam arquivos de teste implementados no repositório.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const specReadme = path.join(rootDir, "spec", "README.md");

console.log("🔍 Verificando cobertura de requisitos SDD (Spec-Driven Development)...");

if (!fs.existsSync(specReadme)) {
  console.error("❌ Arquivo spec/README.md não encontrado!");
  process.exit(1);
}

const content = fs.readFileSync(specReadme, "utf-8");
const lines = content.split("\n");

let checkedMustCount = 0;
let errors = 0;

for (const line of lines) {
  if (line.includes("| **RF-") || line.includes("| **CA-")) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length >= 5) {
      const id = parts[1];
      const testFileMatch = parts[4]?.match(/`([^`]+)`/);

      if (testFileMatch) {
        const testRelPath = testFileMatch[1];
        const fullTestPath = path.join(rootDir, testRelPath);

        checkedMustCount++;
        if (fs.existsSync(fullTestPath)) {
          console.log(`  ✅ [${id}] -> ${testRelPath} (OK)`);
        } else {
          console.error(`  ❌ [${id}] Requisito sem arquivo de teste correspondente: ${testRelPath}`);
          errors++;
        }
      }
    }
  }
}

console.log(`\n📊 Total de especificações auditadas: ${checkedMustCount}`);

if (errors > 0) {
  console.error(`\n❌ Falha na verificação SDD: ${errors} requisito(s) sem teste automatizado.`);
  process.exit(1);
}

console.log("✨ Sucesso! Todos os requisitos analisados possuem testes automatizados vinculados.\n");
process.exit(0);
