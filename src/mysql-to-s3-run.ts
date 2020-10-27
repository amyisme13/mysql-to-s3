import Table from 'cli-table3';
import { Command } from 'commander';
import { format } from 'date-fns';
import { Telegram } from 'telegraf';

import db from './database';
import { Backup } from './database/schema';
import { mysqldumpToS3 } from './helpers';

const program = new Command();

program
  .option('-b, --bucket <bucket name>', 's3 bucket name')
  .option('--bot-token <token>', 'telegram bot token')
  .option('--chat-id <id>', 'telegram chat id');

program.parse(process.argv);

type BackupWithStatus = Backup & { status: boolean };

(async () => {
  const instances = db.get('instances').value();

  // Create the backups
  const createdBackups: BackupWithStatus[] = [];
  for (const instance of instances) {
    const date = new Date();
    const dateString = format(date, 'yyyy-MM-dd-HH-mm');
    const backupName = `mts-${instance.name}-${dateString}.sql.gz`;

    const backup = {
      filename: backupName,
      instance: instance.name,
      createdAt: date.getTime(),
    };

    let status = false;
    try {
      await mysqldumpToS3(instance, program.bucket);

      // store the created backup
      db.get('backups').push(backup).write();

      // update instance lastBackupAt
      db.get('instances')
        .find({ name: instance.name })
        .assign({ lastBackupAt: date.getTime() })
        .write();

      status = true;
    } catch (err) {
      console.error(err);
    }

    createdBackups.push({ ...backup, status });
  }

  db.set('lastRunAt', Date.now()).write();

  // display the result
  const head = ['Name', 'Instance', 'Created At', 'Status'];
  const createdTable = new Table({ head });
  createdBackups.forEach((s) =>
    createdTable.push([
      s.filename,
      s.instance,
      s.createdAt,
      s.status ? '✔️' : '❌',
    ])
  );

  console.log('Created Snapshots');
  console.log(createdTable.toString());

  // display for telegram
  if (program.botToken && program.chatId) {
    const bot = new Telegram(program.botToken);
    const text = ["Today's Backup Result"];

    text.push('', 'Created:');
    createdBackups.forEach((s) => {
      text.push(`${s.status ? '✔️' : '❌'} ${s.filename}`);
    });

    bot.sendMessage(program.chatId, text.join('\n'));
  }
})();
