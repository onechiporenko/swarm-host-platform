import chai = require('chai');
import chaiHttp = require('chai-http');
import { Factory, Lair, field } from '@swarm-host/lair';
import Route from '../lib/route';
import Server from '../lib/server';

chai.use(chaiHttp);
const { expect } = chai;

let lair;
let server;

class ModelA extends Factory {
  static factoryName = 'a';
  @field({
    defaultValue: 'test',
  })
  name = 'test';
}

class ModelB extends Factory {
  static factoryName = 'b';
  @field({
    defaultValue: 'test',
  })
  name = 'test';
}

describe('#Server', () => {
  beforeEach(() => {
    lair = Lair.getLair();
  });

  afterEach(() => {
    Server.cleanServer();
  });

  describe('#getServer', () => {
    it('should return Server-instance', () => {
      expect(Server.getServer()).to.be.instanceof(Server);
    });
    it('should not create new instance if old-one exists', () => {
      const server1 = Server.getServer();
      const server2 = Server.getServer();
      expect(server1).to.be.equal(server2);
    });
  });

  describe('#port', () => {
    it('should have default value', () => {
      expect(Server.getServer().port).to.be.equal(54321);
    });
  });

  describe('#namespace', () => {
    it('should have default value', () => {
      expect(Server.getServer().namespace).to.be.equal('');
    });
  });

  describe('#verbose', () => {
    it('should have default value', () => {
      expect(Server.getServer().verbose).to.be.equal(true);
    });
  });

  describe('#delay', () => {
    it('should have default value', () => {
      expect(Server.getServer().delay).to.be.equal(0);
    });
  });

  describe('#lairNamespace', () => {
    it('should have default value', () => {
      expect(Server.getServer().lairNamespace).to.be.equal('/lair');
    });
  });

  describe('#addRoute', () => {
    it('should throw an error if "path" is not provided', () => {
      class RouteWithoutPath extends Route {}
      expect(() => Server.getServer().addRoute(RouteWithoutPath)).to.throw(
        '"path" is not defined for route "RouteWithoutPath"'
      );
    });
  });

  describe('#addFactory', () => {
    it('should register factory in the Lair', () => {
      expect(lair.getDevInfo()).to.be.eql({});
      Server.getServer().addFactory(ModelA);
      expect(lair.getDevInfo()).to.have.property('a').that.is.an('object');
    });
  });

  describe('#addFactories', () => {
    it('should register factories in the Lair', () => {
      expect(lair.getDevInfo()).to.be.eql({});
      Server.getServer().addFactories([ModelA, ModelB]);
      expect(lair.getDevInfo()).to.have.property('a').that.is.an('object');
      expect(lair.getDevInfo()).to.have.property('b').that.is.an('object');
    });
  });

  describe('#addFactoriesFromDir', () => {
    it('should register factories in the Lair', (done) => {
      expect(lair.getDevInfo()).to.be.eql({});
      Server.getServer()
        .addFactoriesFromDir(`${__dirname}/../tests-data/test-factories`)
        .then(() => {
          const devInfo = lair.getDevInfo();
          expect(devInfo).to.have.property('unit').that.is.an('object');
          expect(devInfo).to.have.property('squad').that.is.an('object');
          expect(devInfo).to.have.property('dir').that.is.an('object');
          done();
        });
    });
  });
});

describe('#Server integration', () => {
  beforeEach(() => {
    lair = Lair.getLair();
    server = Server.getServer();
    server.port = 12345;
    server.namespace = '/api/v2';
    server.verbose = false;
  });

  afterEach((done) => {
    server.stopServer(() => {
      Server.cleanServer();
      done();
    });
  });

  describe('#addRoute', () => {
    it('should add route', (done) => {
      server.addRoute(Route.createRoute('get', '/some-path'));
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/some-path')
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          })
      );
    });

    it('should add route-class', (done) => {
      class RouteClass extends Route {
        method = 'get';
        path = '/some-path';
        handler = (req, res) => res.json({});
      }
      server.addRoute(RouteClass);
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/some-path')
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          })
      );
    });

    it('should add route-class with decorators', (done) => {
      function d() {
        return function (
          target: any,
          propertyKey: string,
          descriptor: PropertyDescriptor
        ) {
          done();
        };
      }

      class RouteClass extends Route {
        method = 'get';
        path = '/some-path';

        @d()
        handler(req, res) {
          res.json({});
        }
      }
      server.addRoute(RouteClass);
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/some-path')
          .end((err, res) => {
            expect(res).to.have.status(200);
          })
      );
    });
  });

  describe('#addRoutes', () => {
    beforeEach(() => {
      server.addRoutes([
        Route.createRoute('get', '/some-path'),
        Route.createRoute('get', '/some-another-path'),
      ]);
    });

    it('should add first route', (done) => {
      server.addRoute(Route.createRoute('get', '/some-path'));
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/some-path')
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          })
      );
    });

    it('should add second route', (done) => {
      server.addRoute(Route.createRoute('get', '/some-another-path'));
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/some-path')
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          })
      );
    });
  });

  describe('#addRoutesFromDir', () => {
    beforeEach((done) => {
      server
        .addRoutesFromDir(`${__dirname}/../tests-data/test-routes`)
        .then(() => done());
    });

    it('should add a first route', (done) => {
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/path')
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          })
      );
    });

    it('should add a second route', (done) => {
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/path/subpath')
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          })
      );
    });

    it('should add a third route', (done) => {
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/reset-namespace')
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          })
      );
    });
  });

  describe('#createRecords', () => {
    beforeEach(() => {
      server.addFactory(ModelA);
      server.addFactory(ModelB);
      server.createRecords('a', 2);
      server.createRecords('b', 3);
      server.addRoutes([Route.get('/a', 'a'), Route.get('/b', 'b')]);
    });

    it('should create records for `modelA` in the Lair on server start', (done) => {
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/a')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res)
              .to.have.property('body')
              .that.is.an('array')
              .and.have.property('length', 2);
            done();
          })
      );
    });

    it('should create records for `modelB` in the Lair on server start', (done) => {
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/b')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res)
              .to.have.property('body')
              .that.is.an('array')
              .and.have.property('length', 3);
            done();
          })
      );
    });
  });

  describe('#addMiddleware', () => {
    it('should add middleware', (done) => {
      server.addFactory(ModelA);
      server.createRecords('a', 2);
      server.addMiddleware((req, res, next) => {
        next();
        done();
      });
      server.addRoute(Route.get('/a', 'a'));
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/a')
          .end(() => ({}))
      );
    });
  });

  describe('#addMiddlewares', () => {
    it('should add middlewares', (done) => {
      server.addFactory(ModelA);
      server.createRecords('a', 2);
      server.addMiddlewares([
        (req, res, next) => {
          next();
          done();
        },
      ]);
      server.addRoute(Route.get('/a', 'a'));
      server.startServer(() =>
        chai
          .request(server.server)
          .get('/api/v2/a')
          .end(() => ({}))
      );
    });
  });

  describe('#lair meta', () => {
    describe('/lair/meta', () => {
      it('should return Lair meta info', (done) => {
        server.addFactory(ModelA);
        server.addFactory(ModelB);
        server.createRecords('a', 2);
        server.createRecords('b', 3);
        server.startServer(() =>
          chai
            .request(server.server)
            .get('/lair/meta')
            .end((err, res) => {
              expect(res.body).to.be.eql({
                a: {
                  count: 2,
                  id: 3,
                  meta: {
                    id: {
                      type: 1,
                    },
                    name: {
                      defaultValue: 'test',
                      type: 1,
                    },
                  },
                },
                b: {
                  count: 3,
                  id: 4,
                  meta: {
                    id: {
                      type: 1,
                    },
                    name: {
                      defaultValue: 'test',
                      type: 1,
                    },
                  },
                },
              });
              done();
            })
        );
      });
    });

    describe('/lair/factories', () => {
      beforeEach(() => {
        server.addFactory(ModelA);
        server.createRecords('a', 2);
      });

      describe('get all', () => {
        it('should return all records of a given factory', (done) => {
          server.startServer(() =>
            chai
              .request(server.server)
              .get('/lair/factories/a')
              .end((err, res) => {
                expect(res.body).to.be.eql([
                  { id: '1', name: 'test' },
                  { id: '2', name: 'test' },
                ]);
                done();
              })
          );
        });
      });

      describe('get one', () => {
        it('should return single record of a given factory', (done) => {
          server.startServer(() =>
            chai
              .request(server.server)
              .get('/lair/factories/a/1')
              .end((err, res) => {
                expect(res.body).to.be.eql({ id: '1', name: 'test' });
                done();
              })
          );
        });
      });

      describe('update one', () => {
        it('should update single record of a given factory (using `put`)', (done) => {
          server.startServer(() =>
            chai
              .request(server.server)
              .put('/lair/factories/a/1')
              .send({ name: 'new name' })
              .end((err, res) => {
                expect(res.body).to.be.eql({ id: '1', name: 'new name' });
                done();
              })
          );
        });

        it('should update single record of a given factory (using `patch`)', (done) => {
          server.startServer(() =>
            chai
              .request(server.server)
              .patch('/lair/factories/a/1')
              .send({ name: 'new name' })
              .end((err, res) => {
                expect(res.body).to.be.eql({ id: '1', name: 'new name' });
                done();
              })
          );
        });
      });

      describe('delete one', () => {
        it('should delete single record of a given factory', (done) => {
          server.startServer(() =>
            chai
              .request(server.server)
              .del('/lair/factories/a/1')
              .end((err, res) => {
                expect(Lair.getLair().getAll('a')).to.be.eql([
                  { id: '2', name: 'test' },
                ]);
                done();
              })
          );
        });
      });

      describe('create one', () => {
        it('should create record of a given factory', (done) => {
          server.startServer(() =>
            chai
              .request(server.server)
              .post('/lair/factories/a')
              .send({ name: 'new record' })
              .end((err, res) => {
                expect(Lair.getLair().getOne('a', '3')).to.be.eql({
                  id: '3',
                  name: 'new record',
                });
                done();
              })
          );
        });
      });
    });
  });

  describe('#lair meta routes', () => {
    describe('#readOne', () => {
      beforeEach((done) => {
        server.addFactory(ModelA);
        server.createRecords('a', 2);
        server.startServer(done);
      });

      it('should return existing record', (done) => {
        chai
          .request(server.server)
          .get('/lair/factories/a/1')
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.have.property('body').eql({ id: '1', name: 'test' });
            done();
          });
      });

      it('should return 404 for not existing record', (done) => {
        chai
          .request(server.server)
          .get('/lair/factories/a/not-existing-record-id')
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    describe('#readMany', () => {
      beforeEach((done) => {
        server.addFactory(ModelA);
        server.createRecords('a', 2);
        server.startServer(done);
      });

      it('should return existing records', (done) => {
        chai
          .request(server.server)
          .get('/lair/factories/a')
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res)
              .to.have.property('body')
              .eql([
                { id: '1', name: 'test' },
                { id: '2', name: 'test' },
              ]);
            done();
          });
      });
    });

    describe('#delete', () => {
      beforeEach((done) => {
        server.addFactory(ModelA);
        server.createRecords('a', 2);
        server.startServer(done);
      });

      it('should delete existing record', (done) => {
        chai
          .request(server.server)
          .del('/lair/factories/a/1')
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            done();
          });
      });

      it('should return 404 for not existing record', (done) => {
        chai
          .request(server.server)
          .del('/lair/factories/a/not-existing-record-id')
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    describe('#update', () => {
      beforeEach((done) => {
        server.addFactory(ModelA);
        server.createRecords('a', 2);
        server.startServer(done);
      });

      it('should update existing record', (done) => {
        chai
          .request(server.server)
          .put('/lair/factories/a/1')
          .send({ name: 'a' })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.have.property('body').eql({ id: '1', name: 'a' });
            done();
          });
      });

      it('should return 404 for not existing record', (done) => {
        chai
          .request(server.server)
          .put('/lair/factories/a/not-existing-record-id')
          .send({ name: 'a' })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            done();
          });
      });
    });

    describe('#create', () => {
      beforeEach((done) => {
        server.addFactory(ModelA);
        server.createRecords('a', 2);
        server.startServer(done);
      });

      it('should create record', (done) => {
        chai
          .request(server.server)
          .post('/lair/factories/a')
          .send({ name: 'a' })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.have.property('body').eql({ id: '3', name: 'a' });
            done();
          });
      });
    });
  });
});
