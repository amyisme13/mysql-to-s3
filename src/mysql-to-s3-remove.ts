import inquirer from 'inquirer';

import db from './database';

(async () => {
  const { name } = await inquirer.prompt([
    {
      name: 'name',
      message: "What's the name of the instance you want to remove?",
    },
  ]);

  db.get('instances').remove({ name }).write();
  console.log('Instance successfully removed');
})();
