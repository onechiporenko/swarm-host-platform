import { Instance } from '../instance';
export class Factory extends Instance {
  public setup(): void {
    this.type = 'factories';
  }
}
