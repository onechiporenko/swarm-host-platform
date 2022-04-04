import JSONAPISerializer from '@ember-data/serializer/json-api';
import Store from '@ember-data/store';
import Model from '@ember-data/model';

export default class Application extends JSONAPISerializer {
  keyForAttribute(key: string) {
    return key;
  }
  keyForRelationship(key: string) {
    return key;
  }
  getRelationships(primaryModelClass: Model) {
    const r: any[] = [];
    primaryModelClass.eachRelationship((_key: any, descriptor: any) =>
      r.push(descriptor)
    );
    return r;
  }

  getAttributes(primaryModelClass: any) {
    const r: any[] = [];
    primaryModelClass.eachAttribute((_key: any, descriptor: any) =>
      r.push(descriptor)
    );
    return r;
  }

  normalizeArrayResponse(
    store: Store,
    primaryModelClass: Model,
    payload: any,
    id: string | number,
    requestType: string
  ) {
    const rel = this.getRelationships(primaryModelClass);
    const relsMap: any = {};
    rel.map((r) => (relsMap[r.key] = r.type));
    const attrs = this.getAttributes(primaryModelClass);
    const relationshipNames = rel.map((r) => r.key);
    const attributeNames = attrs.map((a) => a.name);
    const newPayload = {
      data: payload.map((item: any) => {
        const attributes = attributeNames.reduce(
          (attrs: any, attrName: string) => {
            attrs[attrName] = item[attrName];
            return attrs;
          },
          {} as any
        );
        const relationships: any = {};
        Object.keys(item).forEach((name) => {
          if (relationshipNames.includes(name)) {
            const d = item[name];
            if (d) {
              relationships[name] = {
                data: Array.isArray(d)
                  ? d.map((id: any) => ({
                      type: relsMap[name],
                      id,
                    }))
                  : { type: relsMap[name], id: d },
              };
            }
          }
        });
        return {
          id: item.id,
          type: (primaryModelClass as any).modelName,
          attributes,
          relationships,
        };
      }),
    };
    return super.normalizeArrayResponse(
      store,
      primaryModelClass,
      newPayload,
      id,
      requestType
    );
  }

  normalizeSingleResponse(
    store: Store,
    primaryModelClass: Model,
    payload: any,
    id: string | number,
    requestType: string
  ) {
    if (requestType === 'deleteRecord') {
      return { meta: {} };
    }
    const rel = this.getRelationships(primaryModelClass);
    const relsMap: any = {};
    rel.map((r) => (relsMap[r.key] = r.type));
    const attrs = this.getAttributes(primaryModelClass);
    const relationshipNames = rel.map((r) => r.key);
    const attributeNames = attrs.map((a) => a.name);
    const attributes = attributeNames.reduce((attrs: any, attrName: string) => {
      attrs[attrName] = payload[attrName];
      return attrs;
    }, {} as any);
    const relationships: any = {};
    Object.keys(payload).forEach((name) => {
      if (relationshipNames.includes(name)) {
        const d = payload[name];
        if (d) {
          relationships[name] = {
            data: Array.isArray(d)
              ? d.map((_d) => ({
                  type: relsMap[name],
                  id: _d,
                }))
              : { type: relsMap[name], id: d },
          };
        }
      }
    });
    const newPayload = {
      data: {
        id: payload.id,
        type: (primaryModelClass as any).modelName,
        attributes,
        relationships,
      },
    };
    return super.normalizeSingleResponse(
      store,
      primaryModelClass,
      newPayload,
      id,
      requestType
    );
  }

  serialize(snapshot: any, options: any) {
    const payload: any = super.serialize(snapshot, options);
    const json: any = {
      ...payload.data.attributes,
      id: payload.data.id,
    };
    if (payload.data.relationships) {
      Object.keys(payload.data.relationships).forEach((k) => {
        json[k] = Array.isArray(payload.data.relationships[k].data)
          ? payload.data.relationships[k].data.map((d: any) => d.id)
          : payload.data.relationships[k].data.id;
      });
    }
    return json;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    application: Application;
  }
}
