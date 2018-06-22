import { Instance } from './instance';
export class Command {
  public instance: Instance;
  public execute() {
    throw new Error('Implement me!');
  }
}
