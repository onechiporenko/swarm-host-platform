import { typeOf } from '@ember/utils';
import Transform from '@ember-data/serializer/transform';

class ObjectTransform extends Transform {
  deserialize(serialized: any) {
    return typeOf(serialized) === 'undefined'
      ? serialized
      : JSON.stringify(serialized, null, 2);
  }

  serialize(deserialized: any) {
    return typeOf(deserialized) === 'undefined'
      ? deserialized
      : JSON.parse(deserialized);
  }
}

declare module 'ember-data/types/registries/transform' {
  export default interface TransformRegistry {
    object: ObjectTransform;
  }
}

export default ObjectTransform;
