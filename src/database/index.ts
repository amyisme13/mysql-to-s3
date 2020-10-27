import fs from 'fs-extra';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import os from 'os';
import path from 'path';

import { Schema } from './schema';

const dbFile = path.join(os.homedir(), '.mysql-to-s3/db.json');
fs.ensureFileSync(dbFile);

const adapter = new FileSync<Schema>(dbFile);
const db = low(adapter);

db.defaults({ instances: [], backups: [] }).write();

export default db;
