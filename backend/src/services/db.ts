import { createClient, type Client, type InValue, type Row } from '@libsql/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// index.ts loads dotenv after this module is imported; load here so env is available
// both at first query and if this file is used from another entry point.
dotenv.config();

const LOCAL_DB_URL = 'file:./database.sqlite';

let client: Client | null = null;

const isFileUrl = (url: string): boolean =>
  url.startsWith('file:') || url === ':memory:';

const ensureLocalDbDirectory = (url: string): void => {
  if (!url.startsWith('file:')) {
    return;
  }

  const rawPath = url.slice('file:'.length);
  const filePath = path.resolve(process.cwd(), rawPath);
  const dbDir = path.dirname(filePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
};

const createDbClient = (): Client => {
  const url = process.env.TURSO_DATABASE_URL?.trim() || LOCAL_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  try {
    if (isFileUrl(url)) {
      ensureLocalDbDirectory(url);
      console.log(`Connected to local SQLite database at: ${url}`);
      return createClient({ url });
    }

    if (!authToken) {
      throw new Error(
        'TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL points to a remote Turso database.'
      );
    }

    console.log(`Connected to Turso database at: ${url}`);
    return createClient({ url, authToken });
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    throw err;
  }
};

const getClient = (): Client => {
  if (!client) {
    client = createDbClient();
  }
  return client;
};

const rowToPlainObject = (row: Row): Record<string, unknown> => {
  const obj: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    // libSQL Row is array-like; skip numeric indexes so callers get named fields.
    if (!/^\d+$/.test(key)) {
      obj[key] = row[key];
    }
  }
  return obj;
};

const execute = async (sql: string, params: any[] = []) => {
  try {
    return await getClient().execute({
      sql,
      args: params as InValue[],
    });
  } catch (err) {
    console.error('Database query failed:', err);
    throw err;
  }
};

export const run = async (
  sql: string,
  params: any[] = []
): Promise<{ lastID: number; changes: number }> => {
  const result = await execute(sql, params);
  return {
    lastID: Number(result.lastInsertRowid ?? 0),
    changes: result.rowsAffected,
  };
};

export const get = async (sql: string, params: any[] = []): Promise<any> => {
  const result = await execute(sql, params);
  const row = result.rows[0];
  return row ? rowToPlainObject(row) : undefined;
};

export const all = async (sql: string, params: any[] = []): Promise<any[]> => {
  const result = await execute(sql, params);
  return result.rows.map(rowToPlainObject);
};

export const initDb = async (): Promise<void> => {
  console.log('Initializing database tables...');

  // Enable foreign key constraints
  await run('PRAGMA foreign_keys = ON;');

  // 1. Users Table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('candidate', 'recruiter')),
      is_verified INTEGER DEFAULT 0,
      otp TEXT,
      otp_expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrations for existing databases


  // 2. Resumes Table
  await run(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      parsed_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 3. Assessments Table
  await run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resume_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      test_title TEXT NOT NULL,
      job_role TEXT NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      questions TEXT NOT NULL,
      answers TEXT NOT NULL,
      evaluation TEXT NOT NULL,
      taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 4. Jobs Table
  await run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      recruiter_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      skills TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialization complete.');
};
