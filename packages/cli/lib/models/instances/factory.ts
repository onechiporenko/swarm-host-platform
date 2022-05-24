import path = require('path');
import { Instance } from '../instance';

export class Factory extends Instance {
  public setup(): void {
    this.type = 'factories';
  }

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
}
