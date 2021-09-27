import inquirer = require('inquirer');
import { Command } from '../command';
import { test } from 'shelljs';

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
    if (test('-e', this.instance.fullPath)) {
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
