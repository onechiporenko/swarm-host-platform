import { expect } from 'chai';
import { Factory, field, sequenceItem } from '../../lib/factory';
import { Lair } from '../../lib/lair';

let lair;

class FactoryWithCustomId extends Factory {
  static factoryName = 'a';

  @sequenceItem(1, (prevValues) => prevValues.length + 1)
  index;

  allowCustomIds = true;

  @field()
  get id() {
    return `custom_${this.index}`;
  }
}

describe('Factory', () => {
  beforeEach(() => {
    lair = Lair.getLair();
  });
  afterEach(() => {
    Lair.cleanLair();
  });

  describe('#id', () => {
    beforeEach(() => {
      lair.registerFactory(FactoryWithCustomId);
    });
    it('should allow id to have a getter', () => {
      lair.createRecords('a', 3);
      expect(lair.getOne('a', 'custom_1')).to.have.property('index', 1);
      expect(lair.getOne('a', 'custom_2')).to.have.property('index', 2);
      expect(lair.getOne('a', 'custom_3')).to.have.property('index', 3);
    });
  });
});
