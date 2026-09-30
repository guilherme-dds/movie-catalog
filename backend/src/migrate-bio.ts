import prisma from "./utils/prisma.js";

async function main() {
  try {
    await prisma.$executeRawUnsafe("ALTER TABLE Usuario ADD COLUMN bio TEXT;");
    console.log("SUCCESS: Coluna 'bio' adicionada com sucesso à tabela Usuario!");
  } catch (err: any) {
    if (err.message && err.message.includes("Duplicate column name")) {
      console.log("INFO: Coluna 'bio' já existe no banco de dados.");
    } else {
      console.error("ERRO ao alterar tabela:", err.message || err);
    }
  } finally {
    process.exit(0);
  }
}

main();
