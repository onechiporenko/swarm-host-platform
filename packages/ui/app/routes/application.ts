import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import TableColumns from '@swarm-host/ui/services/table-columns';
import { all } from 'rsvp';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import fetch from 'fetch';
import Store from '@ember-data/store';

export default class Application extends Route {
  @service() declare tableColumns: TableColumns;
  @service() declare router: any;
  @service() declare store: Store;

  moveTo = '';

  beforeModel() {
    const appInstance = getOwner(this) as any;
    this.tableColumns.factoryNames = [];
    const applicationAdapter = appInstance.lookup('adapter:application');
    const host = applicationAdapter.host;
    const namespace = applicationAdapter.namespace;
    const url = `${host}/${namespace}/meta`;
    return fetch(url).then((response: any) => {
      return response.json().then((lairDevInfo: any) => {
        Object.keys(lairDevInfo).forEach((modelName, index) => {
          if (!index) {
            this.moveTo = modelName;
          }
          const attrs = {} as any;
          this.tableColumns.factoryNames.push(modelName);
          this.tableColumns[modelName] = [
            {
              propertyName: 'id',
              title: 'id',
              editable: false,
              component: 'table-cell',
            },
          ];
          const meta = lairDevInfo[modelName].meta;
          Object.keys(meta).forEach((attrName) => {
            if (attrName === 'id') {
              return;
            }
            const attrMeta = meta[attrName];
            const column = {
              title: attrName,
              propertyName: attrName,
              component: 'table-cell',
            } as any;
            if (attrMeta.type !== 2 && attrMeta.type !== 3) {
              // not belongsTo and not hasMany
              const type = attrMeta.preferredType || 'string';
              const attrArgs = [];
              if (
                ['string', 'boolean', 'number', 'array', 'object'].includes(
                  type
                )
              ) {
                attrArgs.push(type);
                if (attrMeta.defaultValue) {
                  attrArgs.push({ defaultValue: attrMeta.defaultValue });
                }
              }
              attrs[attrName] = attr(...attrArgs);
              column.componentForEdit = 'attr-cell-edit';
              if (attrMeta.allowedValues) {
                column.filterWithSelect = true;
              }
            }
            if (attrMeta.type === 2) {
              const opts: any = { inverse: null };
              if (modelName === attrMeta.factoryName) {
                opts.reflexive = true;
              }
              attrs[attrName] = belongsTo(attrMeta.factoryName, opts);
              column.componentForEdit = 'belongs-to-cell-edit';
              column.disableFiltering = true;
              column.disableSorting = true;
            }
            if (attrMeta.type === 3) {
              const opts: any = { inverse: null };
              if (modelName === attrMeta.factoryName) {
                opts.reflexive = true;
              }
              attrs[attrName] = hasMany(attrMeta.factoryName, opts);
              column.componentForEdit = 'has-many-cell-edit';
              column.disableFiltering = true;
              column.disableSorting = true;
            }
            column.attrMeta = attrMeta;
            this.tableColumns[modelName].pushObject(column);
          });
          appInstance.register(`model:${modelName}`, Model.extend(attrs));
        });
      });
    });
  }

  model() {
    return all(
      this.tableColumns.factoryNames.map((factoryName: string) =>
        this.store.findAll(factoryName)
      )
    );
  }
}
