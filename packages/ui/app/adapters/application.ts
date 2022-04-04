import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class Application extends JSONAPIAdapter {
  host = 'http://localhost:54321';
  namespace = 'lair';
  headers = {
    'Content-Type': 'application/json',
  };
  pathForType(modelName: any): string {
    return `factories/${modelName}`;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    application: Application;
  }
}
