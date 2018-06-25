import inquirer = require('inquirer');
import shell = require('shelljs');
import {Command} from '../command';

const fileExists = (path: string): boolean => {
  return shell.cat(path).code === 0;
};

const inquirerConfirmOverride = (): Promise<any> => {
  return inquirer.createPromptModule()({
    choices: ['n', 'y'],
    message: 'File already exists. Override it?',
    name: 'confirmOverride',
    type: 'confirm'
  });
};

export class Generate extends Command {

  public execute() {
    if (fileExists(this.instance.fullPath)) {
      inquirerConfirmOverride().then(({confirmOverride}) => {
        if (confirmOverride) {
          this.writeFile();
        }
      });
    } else {
      this.writeFile();
    }
  }

  public writeFile() {
    throw new Error('Implement me');
  }
}
