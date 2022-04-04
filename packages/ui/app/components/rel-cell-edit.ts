import Store from '@ember-data/store';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

interface RelCellEditArgs {
  column: any;
  record: any;
}

export default class RelCellEdit extends Component<RelCellEditArgs> {
  @service declare store: Store;

  get options() {
    const modelName = this.args.column?.originalDefinition.attrMeta.factoryName;
    return modelName ? this.store.peekAll(modelName) : [];
  }

  @action
  updateCellValue(e: Event | string) {
    this.args.record[this.args.column.propertyName] = e;
  }
}
