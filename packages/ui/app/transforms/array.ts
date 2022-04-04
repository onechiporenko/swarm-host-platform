import Transform from '@ember-data/serializer/transform';

class ArrayTransform extends Transform {
  deserialize(serialized: any) {
    return JSON.stringify(serialized, null, 2);
  }

  serialize(deserialized: any) {
    return JSON.parse(deserialized);
  }
}

declare module 'ember-data/types/registries/transform' {
  export default interface TransformRegistry {
    array: ArrayTransform;
  }
}

export default ArrayTransform;
