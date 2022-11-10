import * as path from 'path';
import * as inquirer from 'inquirer';
import { exec, test } from 'shelljs';
import colors = require('colors/safe');
import { Command } from '../command';
import { assert } from '../../assert';

export const confirmOverrideQuestion = {
  choices: ['n', 'y'],
  message: 'Some files are already exist. Override them?',
  name: 'confirmOverride',
  type: 'confirm',
};

export abstract class Generate extends Command {
  protected linterPath = path.join(process.cwd(), './node_modules/.bin/eslint');

  public execute(): void {
    if (this.someFilesAlreadyExist()) {
      inquirer
        .prompt([confirmOverrideQuestion])
        .then((answer) => {
          if (answer.confirmOverride) {
            this.writeFiles();
            this.lintFiles();
          }
        })
        .catch(() => {
          /* void */
        });
    } else {
      this.writeFiles();
      this.lintFiles();
    }
  }

  public lintFile(filePath: string) {
    exec(`${this.linterPath} ${filePath} --fix`, { silent: true });
  }

  public lintFiles() {
    assert(
      'Linter is missing',
      this.linterInstalled() || this.instance.options['skip-lint']
    );
    if (this.instance.options['skip-lint']) {
      console.log(colors.yellow('Linting is skipped'));
      return;
    }
    if (!this.instance.options['skip-source']) {
      this.lintFile(this.instance.fullPath);
    }
    if (!this.instance.options['skip-test']) {
      this.lintFile(this.instance.testFullPath);
    }
  }

  public someFilesAlreadyExist(): boolean {
    return (
      (test('-e', this.instance.fullPath) &&
        !this.instance.options['skip-source']) ||
      (test('-e', this.instance.testFullPath) &&
        !this.instance.options['skip-test'])
    );
  }

  public writeFiles() {
    this.writeSourceFile();
    this.writeTestFile();
  }

  protected linterInstalled() {
    return test('-f', this.linterPath);
  }

  public abstract writeSourceFile(): void;
  public abstract writeTestFile(): void;
}
