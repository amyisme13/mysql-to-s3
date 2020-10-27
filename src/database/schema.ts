export type Instance = {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  lastBackupAt: number;
};

export type Backup = {
  filename: string;
  instance: string;
  createdAt: number;
};

export type Schema = {
  instances: Instance[];
  backups: Backup[];
  lastRunAt?: number;
};
