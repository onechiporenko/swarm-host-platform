import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Store from '@ember-data/store';
import { next, later } from '@ember/runloop';
import { resolve } from 'rsvp';
import Model from '@ember-data/model';
import TableColumns from '@swarm-host/ui/services/table-columns';
import EmberBootstrap5Theme from 'ember-models-table/services/emt-themes/ember-bootstrap-v5';

export default class IndexController extends Controller {
  @service()
  declare tableColumns: TableColumns;

  @service('emt-themes/ember-bootstrap-v5')
  declare themeInstance: EmberBootstrap5Theme;

  @service()
  declare store: Store;

  queryParams = ['factory'];

  @tracked
  isLoading = true;

  @tracked
  factory = '';

  get columns() {
    const columns = this.tableColumns[this.factory].slice();
    columns.push({
      title: 'Edit',
      component: 'edit-row',
      editable: false,
    });
    columns.push({
      title: 'Delete',
      component: 'delete-row',
      editable: false,
    });
    return columns;
  }

  @action
  onAddRow() {
    this.store.createRecord(this.factory);
    next(() => {
      (
        document
          .querySelectorAll('.table-nav .btn-group button')
          .item(3) as HTMLButtonElement
      ).click();
      later(() => {
        const lastRowCells = document.querySelectorAll(
          'table tbody tr:last-child td'
        );
        (
          lastRowCells[lastRowCells.length - 2]?.querySelector(
            'button'
          ) as HTMLButtonElement
        ).click();
        window.scrollTo({
          top: (
            document.querySelector('table tbody tr:last-child') as HTMLElement
          )?.offsetTop,
          behavior: 'smooth',
        });
      }, 200);
    });
  }

  @action
  onSaveRow(payload: { record: Model }) {
    return payload.record.save();
  }

  @action
  onCancelRow(payload: { record: Model }) {
    payload.record.rollbackAttributes();
    return true;
  }

  @action
  onDeleteRow(record: Model) {
    if (confirm('Are you sure?')) {
      // old school, bro
      return record.destroyRecord();
    }
    return resolve();
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    index: IndexController;
  }
}
