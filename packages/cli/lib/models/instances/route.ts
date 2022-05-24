import path = require('path');
import { Instance } from '../instance';

export class Route extends Instance {
  public schemasPath: string;
  public schemasFullPath: string;

  public setup(): void {
    this.type = 'routes';
  }

  public parsePath(pathToNewInstance: string): void {
    super.parsePath(pathToNewInstance);
    this.testsPath = path.join(
      process.cwd(),
      'tests/integration/',
      this.type,
      this.dir
    );
    this.schemasPath = path.join(process.cwd(), 'schemas', this.dir);
    this.testFullPath = path.join(this.testsPath, this.fileName);
    this.schemasFullPath = path.join(this.schemasPath, this.fileName);
  }
}
