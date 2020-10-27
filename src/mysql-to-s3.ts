#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0')
  .description('Run mysqldump and store it into s3')
  .command('add', 'Add a mysql instance to be backed up')
  .command('remove', 'Remove added mysql instance')
  .command('instances', 'List instances that are backed up')
  .command('list', 'List backup that have been created');
// .command('run', 'Create backup of instances that should be backed up')
// .command('cron', 'Run but with cron');

program.parse(process.argv);
