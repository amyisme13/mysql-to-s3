import Table from 'cli-table3';

import db from './database';

const table = new Table({
  head: ['Name', 'Host', 'Port', 'Username', 'Password'],
});

db.get('instances')
  .value()
  .forEach((i) => {
    table.push([i.name, i.host, i.port, i.username, i.password]);
  });

console.log(table.toString());
