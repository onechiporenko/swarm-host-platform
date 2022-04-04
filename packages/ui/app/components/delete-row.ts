import Component from '@glimmer/component';
import { action } from '@ember/object';

interface DeleteRowArgs {
  deleteRowAction: (record: any) => any;
  record: any;
}

export default class DeleteRow extends Component<DeleteRowArgs> {
  @action
  onClick() {
    this.args.deleteRowAction(this.args.record);
  }
}
