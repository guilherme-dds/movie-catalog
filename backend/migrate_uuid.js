import mariadb from "mariadb";
import "dotenv/config";

const pool = mariadb.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
});

async function main() {
  const conn = await pool.getConnection();
  console.log("Migrating MySQL database columns to UUID and adding role...");

  // 1. Drop FK constraints
  const dropFks = [
    "ALTER TABLE RefreshToken DROP FOREIGN KEY RefreshToken_usuarioId_fkey",
    "ALTER TABLE Favorito DROP FOREIGN KEY Favorito_usuarioId_fkey",
    "ALTER TABLE Comentario DROP FOREIGN KEY Comentario_usuarioId_fkey",
  ];
  for (const sql of dropFks) {
    try {
      await conn.query(sql);
      console.log("Dropped FK:", sql);
    } catch (e) {
      console.log("FK drop warning:", e.message);
    }
  }

  // 2. Clear tables to remove obsolete Int foreign keys
  await conn.query("DELETE FROM RefreshToken");
  await conn.query("DELETE FROM Favorito");
  await conn.query("DELETE FROM Comentario");
  await conn.query("DELETE FROM Usuario");

  // 3. Alter Usuario.id to VARCHAR(36) and add role column
  try {
    await conn.query("ALTER TABLE Usuario MODIFY COLUMN id VARCHAR(36) NOT NULL");
    console.log("Modified Usuario.id to VARCHAR(36)");
  } catch (e) {
    console.log("Usuario.id modify error:", e.message);
  }

  try {
    await conn.query("ALTER TABLE Usuario ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'");
    console.log("Added role column to Usuario");
  } catch (e) {
    console.log("Usuario role add warning:", e.message);
  }

  // 4. Alter usuarioId columns to VARCHAR(36)
  await conn.query("ALTER TABLE RefreshToken MODIFY COLUMN usuarioId VARCHAR(36) NOT NULL");
  await conn.query("ALTER TABLE Favorito MODIFY COLUMN usuarioId VARCHAR(36) NOT NULL");
  await conn.query("ALTER TABLE Comentario MODIFY COLUMN usuarioId VARCHAR(36) NOT NULL");
  console.log("Modified usuarioId columns to VARCHAR(36)");

  // 5. Re-add foreign key constraints
  const addFks = [
    "ALTER TABLE RefreshToken ADD CONSTRAINT RefreshToken_usuarioId_fkey FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE ON UPDATE CASCADE",
    "ALTER TABLE Favorito ADD CONSTRAINT Favorito_usuarioId_fkey FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE ON UPDATE CASCADE",
    "ALTER TABLE Comentario ADD CONSTRAINT Comentario_usuarioId_fkey FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE ON UPDATE CASCADE",
  ];
  for (const sql of addFks) {
    try {
      await conn.query(sql);
      console.log("Added FK:", sql);
    } catch (e) {
      console.log("FK add error:", e.message);
    }
  }

  console.log("Database migration complete!");
  conn.release();
  await pool.end();
}

main().catch(console.error);
