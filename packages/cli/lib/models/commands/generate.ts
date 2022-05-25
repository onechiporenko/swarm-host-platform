import * as inquirer from 'inquirer';
import { Command } from '../command';
import { test } from 'shelljs';

export const confirmOverrideQuestion = {
  choices: ['n', 'y'],
  message: 'Some files are already exist. Override them?',
  name: 'confirmOverride',
  type: 'confirm',
};

export abstract class Generate extends Command {
  public someFilesAlreadyExist(): boolean {
    return (
      (test('-e', this.instance.fullPath) &&
        !this.instance.options['skip-source']) ||
      (test('-e', this.instance.testFullPath) &&
        !this.instance.options['skip-test'])
    );
  }

  public execute(): void {
    if (this.someFilesAlreadyExist()) {
      inquirer
        .prompt([confirmOverrideQuestion])
        .then((answer) => {
          if (answer.confirmOverride) {
            this.writeFiles();
          }
        })
        .catch(() => {
          /* void */
        });
    } else {
      this.writeFiles();
    }
  }

  public writeFiles() {
    this.writeSourceFile();
    this.writeTestFile();
  }

  public abstract writeSourceFile(): void;
  public abstract writeTestFile(): void;
}
