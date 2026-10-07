const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const pgBinDir = 'C:\\Program Files\\PostgreSQL\\18\\bin';
const dataDir = path.resolve(__dirname, '..', 'db_data');
const logFile = path.resolve(__dirname, '..', 'db_data', 'server.log');
const port = 5433;

function getBin(name) {
  const full = path.join(pgBinDir, `${name}.exe`);
  if (fs.existsSync(full)) return `"${full}"`;
  return name;
}

async function main() {
  console.log('[DB] Preparing local PostgreSQL instance on port', port, '...');

  if (!fs.existsSync(dataDir)) {
    console.log('[DB] Initializing new database cluster in', dataDir);
    execSync(`${getBin('initdb')} -D "${dataDir}" -U postgres -A trust -E UTF8`, {
      stdio: 'inherit',
    });
  }

  // Check if server is already running
  try {
    execSync(`${getBin('pg_isready')} -h localhost -p ${port}`, { stdio: 'ignore' });
    console.log('[DB] PostgreSQL server is already running on port', port);
  } catch {
    console.log('[DB] Starting PostgreSQL server on port', port, '...');
    execSync(`${getBin('pg_ctl')} -D "${dataDir}" -l "${logFile}" -o "-p ${port}" start`, {
      stdio: 'inherit',
    });
  }

  // Ensure routex database exists
  try {
    execSync(`${getBin('createdb')} -h localhost -p ${port} -U postgres routex`, {
      stdio: 'ignore',
    });
    console.log('[DB] Database "routex" created successfully.');
  } catch {
    // Database already exists
    console.log('[DB] Database "routex" is ready.');
  }
}

main().catch((err) => {
  console.error('[DB] Failed to start local database:', err.message);
  process.exit(1);
});
