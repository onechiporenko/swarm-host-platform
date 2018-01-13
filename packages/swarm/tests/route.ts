import {expect} from 'chai';
import Route from '../lib/route';

describe('#Route', () => {
  describe('#createRoute', () => {
    it('should throw an Error for unknown request-type', () => {
      expect(() => Route.createRoute('fake-method', '', () => 1)).to.throw('"fake-method" is unknown method. It must be one of the ');
    });
  });
});
