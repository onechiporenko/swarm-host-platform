import { Instance } from './instance';
export class Command {
  public instance: Instance;
  public execute(): void {
    throw new Error('Implement me!');
  }
}
