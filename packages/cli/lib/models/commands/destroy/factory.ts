import colors = require('colors/safe');
import { rm } from 'shelljs';
import { Destroy } from '../destroy';
import { FactoryInstance } from '../../instances/factory';

export class DestroyFactory extends Destroy {
  public instance: FactoryInstance;
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
    }
  }
}
