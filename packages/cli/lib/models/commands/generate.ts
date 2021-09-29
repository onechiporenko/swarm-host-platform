import * as inquirer from 'inquirer';
import { Command } from '../command';
import { test } from 'shelljs';

const question = {
  choices: ['n', 'y'],
  message: 'File already exists. Override it?',
  name: 'confirmOverride',
  type: 'confirm',
};

export class Generate extends Command {
  public execute(): void {
    if (test('-e', this.instance.fullPath)) {
      inquirer
        .prompt([question])
        .then((answer) => {
          if (answer.confirmOverride) {
            this.writeFile();
          }
        })
        .catch(() => {
          /* void */
        });
    } else {
      this.writeFile();
    }
  }

  public writeFile(): void {
    throw new Error('Implement me');
  }
}
