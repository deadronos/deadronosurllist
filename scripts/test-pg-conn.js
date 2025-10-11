import pkg from "pg";
const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No DATABASE_URL set in environment");
  process.exit(1);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

(async () => {
  try {
    await client.connect();
    console.log("PG: connected successfully");
    const res = await client.query("SELECT 1 as ok");
    console.log("PG: query result:", res.rows);
  } catch (err) {
    console.error("PG: connection error:");
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
})();
