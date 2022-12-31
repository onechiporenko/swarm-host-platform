import { expect } from 'chai';
import { Factory, MetaAttrType, field } from '../../lib/factory';
import { Lair } from '../../lib/lair';

let lair;

class AFactory extends Factory {
  static factoryName = 'a';
  @field()
  a = 'a';
}

class BFactory extends Factory {
  static factoryName = 'b';
  @field()
  b = 'b';
}

describe('Lair', () => {
  beforeEach(() => {
    lair = Lair.getLair();
  });
  afterEach(() => {
    Lair.cleanLair();
  });

  describe('#getRecordsCountForFactories', () => {
    beforeEach(() => {
      lair.registerFactory(AFactory);
      lair.registerFactory(BFactory);
      lair.createRecords('a', 5);
    });

    it('should return empty object if factory names are not provided', () => {
      expect(lair.getRecordsCountForFactories()).to.be.eql({});
    });

    it('should throw an error if needed factory does not exist', () => {
      expect(() => lair.getRecordsCountForFactories('c')).to.throw(
        '"c"-type doesn\'t exist in the database'
      );
    });

    it('should throw an error if needed factory does not exist (2)', () => {
      expect(() => lair.getRecordsCountForFactories('a', 'd')).to.throw(
        '"d"-type doesn\'t exist in the database'
      );
    });

    it('should return object with needed factory', () => {
      expect(lair.getRecordsCountForFactories('a')).to.be.eql({
        a: 5,
      });
    });

    it('should return object with needed factories', () => {
      expect(lair.getRecordsCountForFactories('a', 'b')).to.be.eql({
        a: 5,
        b: 0,
      });
    });

    it('should return object with needed factories (2)', () => {
      lair.createRecords('b', 10);
      expect(lair.getRecordsCountForFactories('a', 'b')).to.be.eql({
        a: 5,
        b: 10,
      });
    });
  });
});
