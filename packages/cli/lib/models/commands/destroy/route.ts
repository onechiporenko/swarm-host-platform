import colors = require('colors/safe');
import { rm } from 'shelljs';
import { Destroy } from '../destroy';
import { Route } from '../../instances/route';

export class DestroyRoute extends Destroy {
  public instance: Route;
  public execute(): void {
    if (!this.instance.options['skip-source']) {
      rm('-rf', this.instance.fullPath);
      console.log(colors.yellow(this.instance.relativePath), 'is deleted');
    }
    if (!this.instance.options['skip-test']) {
      rm('-rf', this.instance.testFullPath);
      console.log(
        'Test for',
        colors.yellow(this.instance.relativePath),
        'is deleted'
      );
      rm('-rf', this.instance.schemasFullPath);
      console.log(
        'Schema for',
        colors.yellow(this.instance.relativePath),
        'is deleted'
      );
    }
  }
}
