import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import Store from '@ember-data/store';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import IndexController from '@swarm-host/ui/controllers';
import Model from '@ember-data/model';
import Transition from '@ember/routing/-private/transition';

export interface IndexRouteParams {
  factory: string;
}

export default class IndexRoute extends Route<any, IndexRouteParams> {
  @service() declare store: Store;

  declare controller: IndexController;

  queryParams = {
    factory: {
      refreshModel: true,
    },
  };

  beforeModel() {
    let factory = (this.paramsFor('index') as any).factory;
    if (!factory) {
      factory = (getOwner(this) as any).lookup('route:application').moveTo;
      this.transitionTo({ queryParams: { factory } });
    }
  }

  model(params: IndexRouteParams) {
    return this.store.findAll(params.factory, { reload: true });
  }

  setupController(
    controller: IndexController,
    model: Model,
    transition: Transition
  ) {
    super.setupController(controller, model, transition);
    controller.isLoading = false;
  }

  @action
  willTransition() {
    this.controller.isLoading = true; // eslint-disable-line ember/no-controller-access-in-routes
  }
}
