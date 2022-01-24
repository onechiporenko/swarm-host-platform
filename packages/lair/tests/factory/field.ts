import { Factory, field } from '../../lib/factory';
import { expect } from 'chai';

describe('Factory', () => {
  describe('#field', () => {
    it('should throw an error if defaultValue is a function', () => {
      expect(() => {
        class FactoryWithDefaultValueAssertion extends Factory {
          static factoryName = 'factory-with-default-value-assertion';
          @field({
            defaultValue() {
              return true;
            }
          })
          invalidField;
        }
      }).to.throw('"defaultValue" can\'t be a function');
    });
  });
});
