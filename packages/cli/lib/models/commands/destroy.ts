import colors = require('colors/safe');
import shell = require('shelljs');
import { Command } from '../command';

export class Destroy extends Command {
  public execute() {
    shell.rm('-rf', this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is deleted');
  }
}
