import inquirer from 'inquirer';

import db from './database';

(async () => {
  const answers = await inquirer.prompt([
    {
      name: 'host',
      message: "What's the host?",
    },
    {
      type: 'number',
      name: 'port',
      message: "What's the port?",
    },
    {
      name: 'username',
      message: "What's the username?",
    },
    {
      name: 'password',
      message: "What's the password?",
    },
    {
      name: 'name',
      message: 'What do you want to name it?',
    },
  ]);

  const exists = db.get('instances').find({ name: answers.name }).value();
  if (exists) {
    console.log(`Instance with the name '${answers.name}' already exists`);
    return;
  }

  db.get('instances').push(answers).write();
  console.log('Instance successfully added');
})();
