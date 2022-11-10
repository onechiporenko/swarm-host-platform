import {
  Factory,
  field,
  hasMany,
  hasOne,
  sequenceItem,
} from '../../lib/factory';

export class CommonFactory extends Factory {
  static factoryName = 'f';

  @field()
  first = 'static';

  @field({
    defaultValue: 'default value for fourth',
  })
  fourth = 'fourth';

  @hasMany('anotherFactory', 'attr2') many;
  @hasMany('test', null, { reflexive: true, depth: 2 }) manyTests;
  @hasOne('anotherFactory', 'attr1') one;

  @hasOne('test', null, { reflexive: true, depth: 2 }) oneTest;

  @sequenceItem(1, (prevItems) => prevItems.reduce((a, b) => a + b, 0))
  sequenceItem;

  @field()
  seventh = 1;

  @field({
    allowedValues: [1, 2, 3],
    preferredType: 'number',
  })
  sixth = 1;

  @field()
  get fifth(): string {
    return `fifth ${this.id}`;
  }

  @field()
  get r1(): number {
    return this.rand as number;
  }

  @field()
  get r2(): number {
    return this.rand as number;
  }

  @field()
  get rand(): number {
    return Math.random();
  }

  @field()
  get second(): string {
    return `dynamic ${this.id}`;
  }

  @field()
  get third(): string {
    return `third is ${this.second}`;
  }
}
