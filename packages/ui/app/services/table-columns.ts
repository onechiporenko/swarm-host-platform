import { tracked } from '@glimmer/tracking';
import Service from '@ember/service';

export default class TableColumns extends Service {
  @tracked
  factoryNames: string[] = [];

  [key: string]: any;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'table-columns': TableColumns;
  }
}
