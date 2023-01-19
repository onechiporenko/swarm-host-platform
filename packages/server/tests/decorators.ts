import { expect } from 'chai';
import Route from '../lib/route';
import { Factory, instanceExists, Lair } from '../lib';
import { NextFunction, Request, Response } from 'express';

let lair;
describe('Decorators', () => {
  beforeEach(() => {
    lair = Lair.getLair();
  });

  afterEach(() => {
    Lair.cleanLair();
  });

  describe('#instanceExists', () => {
    it('should throw an error if factory name is empty string', () => {
      expect(() => {
        class FactoryNameEmptyStringTestRoute extends Route {
          @instanceExists('', 'someName', () => {
            /* noop */
          })
          defaultHandler(req, res, next, lair) {
            return super.defaultHandler(req, res, next, lair);
          }
        }
      }).to.throw('Factory name must be not empty string or array');
    });

    it('should throw an error if factory name is empty array', () => {
      expect(() => {
        class FactoryNameEmptyArrayTestRoute extends Route {
          @instanceExists([], 'someName', () => {
            /* noop */
          })
          defaultHandler(req, res, next, lair) {
            return super.defaultHandler(req, res, next, lair);
          }
        }
      }).to.throw('Factory name must be not empty string or array');
    });

    it('should throw an error if request param name is empty', () => {
      expect(() => {
        class RequestParamNameEmptyStringRoute extends Route {
          @instanceExists('test', '', () => {
            /* noop */
          })
          defaultHandler(req, res, next, lair) {
            return super.defaultHandler(req, res, next, lair);
          }
        }
      }).to.throw('Request param name must not empty');
    });

    it('should throw an error if request parameter does not exist', () => {
      class RequestParamNotExistsRoute extends Route {
        @instanceExists('some-factory-name', 'NOT_EXISTING', () => {
          /* noop */
        })
        defaultHandler(req, res, next, lair) {
          return super.defaultHandler(req, res, next, lair);
        }
      }

      expect(() => {
        new RequestParamNotExistsRoute().defaultHandler(
          { params: {} } as Request,
          {} as Response,
          (() => {
            /* noop */
          }) as NextFunction,
          {} as Lair
        );
      }).to.throw('Request parameter with name "NOT_EXISTING" does not exist');
    });

    it('should call default handler if needed instance exists (string)', (done) => {
      lair.registerFactory(
        class TestNameFactory extends Factory {
          static factoryName = 'test-name';
        }
      );
      lair.createRecords('test-name', 1);
      class NeededInstanceExistsStringRoute extends Route {
        @instanceExists('test-name', 'testNameId', () => {
          /* noop */
        })
        defaultHandler(req, res, next, lair) {
          done();
          return super.defaultHandler(req, res, next, lair);
        }
      }
      new NeededInstanceExistsStringRoute().defaultHandler(
        {
          params: {
            testNameId: '1',
          },
        } as unknown as Request,
        {} as Response,
        (() => {
          /* noop */
        }) as NextFunction,
        lair
      );
    });

    it('should call default handler if needed instance exists (array)', (done) => {
      lair.registerFactory(
        class TestName1Factory extends Factory {
          static factoryName = 'test-name-1';
        }
      );
      lair.createRecords('test-name-1', 1);
      lair.registerFactory(
        class TestName2Factory extends Factory {
          static factoryName = 'test-name-2';
        }
      );
      lair.createRecords('test-name-2', 2);
      lair.registerFactory(
        class TestName3Factory extends Factory {
          static factoryName = 'test-name-3';
        }
      );
      lair.createRecords('test-name-3', 3);
      class NeededInstanceExistsStringRoute extends Route {
        @instanceExists(
          ['test-name-1', 'test-name-2', 'test-name-3'],
          'testNameId',
          () => {
            /* noop */
          }
        )
        defaultHandler(req, res, next, lair) {
          done();
          return super.defaultHandler(req, res, next, lair);
        }
      }
      new NeededInstanceExistsStringRoute().defaultHandler(
        {
          params: {
            testNameId: '3',
          },
        } as unknown as Request,
        {} as Response,
        (() => {
          /* noop */
        }) as NextFunction,
        lair
      );
    });

    it('should call error-handler if needed instance does not exist (string)', (done) => {
      lair.registerFactory(
        class TestNameNotExistFactory extends Factory {
          static factoryName = 'test-name';
        }
      );
      lair.createRecords('test-name', 1);
      class NeededInstanceExistsStringRoute extends Route {
        @instanceExists('test-name', 'testNameId', () => {
          done();
        })
        defaultHandler(req, res, next, lair) {
          return super.defaultHandler(req, res, next, lair);
        }
      }
      new NeededInstanceExistsStringRoute().defaultHandler(
        {
          params: {
            testNameId: '100500',
          },
        } as unknown as Request,
        {} as Response,
        (() => {
          /* noop */
        }) as NextFunction,
        lair
      );
    });

    it('should call error-handler if needed instance does not exist (array)', (done) => {
      lair.registerFactory(
        class TestNameNotExistFactory extends Factory {
          static factoryName = 'test-name';
        }
      );
      lair.createRecords('test-name', 2);
      lair.registerFactory(
        class TestNameNotExistFactory extends Factory {
          static factoryName = 'test-name-2';
        }
      );
      lair.createRecords('test-name-2', 1);
      class NeededInstanceExistsArrayRoute extends Route {
        @instanceExists(['test-name-2', 'test-name'], 'testNameId', () => {
          done();
        })
        defaultHandler(req, res, next, lair) {
          return super.defaultHandler(req, res, next, lair);
        }
      }
      new NeededInstanceExistsArrayRoute().defaultHandler(
        {
          params: {
            testNameId: '100500',
          },
        } as unknown as Request,
        {} as Response,
        (() => {
          /* noop */
        }) as NextFunction,
        lair
      );
    });
  });
});
