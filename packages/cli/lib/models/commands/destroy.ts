import colors = require('colors/safe');
import { rm } from 'shelljs';
import { Command } from '../command';

export class Destroy extends Command {
  public execute(): void {
    rm('-rf', this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is deleted');
  }
}
