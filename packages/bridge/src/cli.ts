#!/usr/bin/env node

import { BridgeServer } from "./server";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8765;
const server = new BridgeServer({ port });

console.log(`\n🌉 Iniciando GestoLivre Bridge na porta ${port}...`);

server
  .start()
  .then(() => {
    console.log(`✅ Bridge ativo em ws://localhost:${port}`);
    console.log(`Conecte o GestoLivre Studio para injetar teclas no Sistema Operacional.\n`);
  })
  .catch((err) => {
    console.error("❌ Erro ao iniciar Bridge:", err);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  console.log("\nEncerrando Bridge...");
  await server.stop();
  process.exit(0);
});
