import Table from 'cli-table3';
import { Command } from 'commander';

import db from './database';

const program = new Command();

program.option('-i, --instance <name>', 'scope to the given instance');

program.parse(process.argv);

const table = new Table({
  head: ['Name', 'Instance', 'Created At'],
});

let conditions = {};
if (program.instance) {
  conditions = { instance: program.instance };
}

db.get('backups')
  .filter(conditions)
  .value()
  .forEach((b) => {
    const date = new Date(b.createdAt).toJSON();
    table.push([b.filename, b.instance, date]);
  });

console.log(table.toString());
