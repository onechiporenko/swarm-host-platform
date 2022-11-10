import path = require('path');
import { Instance } from '../instance';

export class FactoryInstance extends Instance {
  public parsePath(pathToNewInstance: string): void {
    super.parsePath(pathToNewInstance);
    this.testsPath = path.join(
      process.cwd(),
      'tests/unit/',
      this.type,
      this.dir
    );
    this.testFullPath = path.join(this.testsPath, this.fileName);
  }

  public setup(): void {
    this.type = 'factories';
  }
}
