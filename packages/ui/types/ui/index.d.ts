import EmberBootstrap5Theme from 'ember-models-table/services/emt-themes/ember-bootstrap-v5';

declare module '@ember/service' {
  interface Registry {
    'emt-themes/ember-bootstrap-v5': EmberBootstrap5Theme;
  }
}
