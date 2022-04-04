import { action } from '@ember/object';
import Component from '@glimmer/component';

interface AttrCellEditArgs {
  column: any;
  record: any;
  themeInstance: any;
}

export default class AttrCellEdit extends Component<AttrCellEditArgs> {
  get attrMeta() {
    return this.args.column?.originalDefinition.attrMeta || {};
  }

  get useCheckbox() {
    return this.attrMeta.preferredType === 'boolean';
  }

  get useDropdown() {
    return !!this.attrMeta.allowedValues;
  }

  get useTextarea() {
    return ['object', 'array'].includes(this.attrMeta.preferredType);
  }

  protected getNewFilterValueFromEvent(e: Event | string): string {
    return typeof e === 'object' ? (<HTMLInputElement>e.target).value : e;
  }

  @action
  updateCellValue(e: Event | string) {
    const newValue = this.getNewFilterValueFromEvent(e);
    this.args.record[this.args.column.propertyName] = newValue;
  }
}
