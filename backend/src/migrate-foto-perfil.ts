import prisma from "./utils/prisma.js";

async function main() {
  try {
    await prisma.$executeRawUnsafe("ALTER TABLE Usuario ADD COLUMN fotoPerfil TEXT;");
    console.log("SUCCESS: Coluna 'fotoPerfil' adicionada com sucesso à tabela Usuario!");
  } catch (err: any) {
    if (err.message && (err.message.includes("Duplicate column name") || err.message.includes("exists"))) {
      console.log("INFO: Coluna 'fotoPerfil' já existe no banco de dados.");
    } else {
      console.error("ERRO ao alterar tabela:", err.message || err);
    }
  } finally {
    process.exit(0);
  }
}

main();
