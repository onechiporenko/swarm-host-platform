import chai = require('chai');
import chaiHttp = require('chai-http');
chai.use(chaiHttp);
const {expect} = chai;
import {Factory, Lair} from 'lair-db/dist';
import Route from '../lib/route';
import Server from '../lib/server';

const modelA = Factory.create({
  attrs: {
    name: Factory.field({
      value: 'test',
      defaultValue: 'test',
    }),
  },
});

const modelB = Factory.create({
  attrs: {
    name: Factory.field({
      value: 'test',
      defaultValue: 'test',
    }),
  },
});

describe('#Server', () => {

  beforeEach(() => {
    this.lair = Lair.getLair();
  });

  afterEach(() => {
    Server.cleanServer();
  });

  describe('#getServer', () => {
    it('should return Server-instance', () => {
      expect(Server.getServer()).to.be.instanceof(Server);
    });
    it('should not create new instance if old-one exists', () => {
      const server = Server.getServer();
      const server2 = Server.getServer();
      expect(server).to.be.equal(server2);
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

  describe('#addFactory', () => {
    it('should register factory in the Lair', () => {
      expect(this.lair.getDevInfo()).to.be.eql({});
      Server.getServer().addFactory(modelA, 'a');
      expect(this.lair.getDevInfo()).to.have.property('a').that.is.an('object');
    });
  });

  describe('#addFactories', () => {
    it('should register factories in the Lair', () => {
      expect(this.lair.getDevInfo()).to.be.eql({});
      Server.getServer().addFactories([[modelA, 'a'], [modelB, 'b']]);
      expect(this.lair.getDevInfo()).to.have.property('a').that.is.an('object');
      expect(this.lair.getDevInfo()).to.have.property('b').that.is.an('object');
    });
  });

  describe('#addFactoriesFromDir', () => {
    it('should register factories in the Lair', () => {
      expect(this.lair.getDevInfo()).to.be.eql({});
      Server.getServer().addFactoriesFromDir(`${__dirname}/../tests-data/test-factories`);
      const devInfo = this.lair.getDevInfo();
      expect(devInfo).to.have.property('unit').that.is.an('object');
      expect(devInfo).to.have.property('squad').that.is.an('object');
      expect(devInfo).to.have.property('dir').that.is.an('object');
    });
  });
});

describe('#Server integration', () => {

  beforeEach(() => {
    this.lair = Lair.getLair();
    this.server = Server.getServer();
    this.server.port = 12345;
    this.server.namespace = '/api/v2';
    this.server.verbose = false;
  });

  afterEach(done => {
    this.server.stopServer(() => {
      Server.cleanServer();
      done();
    });
  });

  describe('#addRoute', () => {
    it('should add route', done => {
      this.server.addRoute(Route.createRoute('get', '/some-path'));
      this.server.startServer(() => chai.request(this.server.server)
        .get('/api/v2/some-path')
        .end((err, res) => {
          expect(res).to.have.property('status', 200);
          done();
        }));
    });
  });

  describe('#addRoutes', () => {
    beforeEach(() => {
      this.server.addRoutes([
        Route.createRoute('get', '/some-path'),
        Route.createRoute('get', '/some-another-path'),
      ]);
    });

    it('should add first route', done => {
      this.server.addRoute(Route.createRoute('get', '/some-path'));
      this.server.startServer(() => chai.request(this.server.server)
        .get('/api/v2/some-path')
        .end((err, res) => {
          expect(res).to.have.property('status', 200);
          done();
        }));
    });

    it('should add second route', done => {
      this.server.addRoute(Route.createRoute('get', '/some-another-path'));
      this.server.startServer(() => chai.request(this.server.server)
        .get('/api/v2/some-path')
        .end((err, res) => {
          expect(res).to.have.property('status', 200);
          done();
        }));
    });
  });

  describe('#addRoutesFromDir', () => {

    beforeEach(() => {
      this.server.addRoutesFromDir(`${__dirname}/../tests-data/test-routes`);
    });

    it('should add a first route', done => {
      this.server.startServer(() => chai.request(this.server.server)
        .get('/api/v2/path')
        .end((err, res) => {
          expect(res).to.have.property('status', 200);
          done();
        }));
    });

    it('should add a second route', done => {
      this.server.startServer(() => chai.request(this.server.server)
        .get('/api/v2/path/subpath')
        .end((err, res) => {
          expect(res).to.have.property('status', 200);
          done();
        }));
    });

    it('should add a second route', done => {
      this.server.startServer(() => chai.request(this.server.server)
        .get('/reset-namespace')
        .end((err, res) => {
          expect(res).to.have.property('status', 200);
          done();
        }));
    });
  });

  describe('#createRecords', () => {
    beforeEach(() => {
      this.server.addFactory(modelA, 'a');
      this.server.addFactory(modelA, 'b');
      this.server.createRecords('a', 2);
      this.server.createRecords('b', 3);
      this.server.addRoutes([Route.get('/a', 'a'), Route.get('/b', 'b')]);
    });

    it('should create records for `modelA` in the Lair on server start', done => {
      this.server.startServer(() => chai.request(this.server.server)
        .get('/api/v2/a')
        .end((err, res) => {
          expect(res).to.have.property('status', 200);
          expect(res).to.have.property('body').that.is.an('array').and.have.property('length', 2);
          done();
        }));
    });

    it('should create records for `modelB` in the Lair on server start', done => {
      this.server.startServer(() => chai.request(this.server.server)
        .get('/api/v2/b')
        .end((err, res) => {
          expect(res).to.have.property('status', 200);
          expect(res).to.have.property('body').that.is.an('array').and.have.property('length', 3);
          done();
        }));
    });
  });

  describe('#addMiddleware', () => {
    it('should add middleware', done => {
      this.server.addFactory(modelA, 'a');
      this.server.createRecords('a', 2);
      this.server.addMiddleware((req, res, next) => {
        next();
        done();
      });
      this.server.addRoute(Route.get('/a', 'a'));
      this.server.startServer(() => chai.request(this.server.server).get('/api/v2/a').end(() => ({})));
    });
  });

  describe('#addMiddlewares', () => {
    it('should add middlewares', done => {
      this.server.addFactory(modelA, 'a');
      this.server.createRecords('a', 2);
      this.server.addMiddlewares([(req, res, next) => {
        next();
        done();
      }]);
      this.server.addRoute(Route.get('/a', 'a'));
      this.server.startServer(() => chai.request(this.server.server).get('/api/v2/a').end(() => ({})));
    });
  });

  describe('#lair meta', () => {

    describe('/lair/meta', () => {
      it('should return Lair meta info', done => {
        this.server.addFactory(modelA, 'a');
        this.server.addFactory(modelA, 'b');
        this.server.createRecords('a', 2);
        this.server.createRecords('b', 3);
        this.server.startServer(() => chai.request(this.server.server)
          .get('/lair/meta')
          .end((err, res) => {
            expect(res.body).to.be.eql({
              a: {
                count: 2,
                id: 3,
                meta: {
                  name: {
                    allowedValues: [],
                    defaultValue: 'test',
                    type: 1,
                    value: 'test',
                  },
                },
              },
              b: {
                count: 3,
                id: 4,
                meta: {
                  name: {
                    allowedValues: [],
                    defaultValue: 'test',
                    type: 1,
                    value: 'test',
                  },
                },
              },
            });
            done();
          }));
      });
    });

    describe('/lair/factories', () => {

      beforeEach(() => {
        this.server.addFactory(modelA, 'a');
        this.server.createRecords('a', 2);
      });

      describe('get all', () => {
        it('should return all records of a given factory', done => {
          this.server.startServer(() => chai.request(this.server.server)
            .get('/lair/factories/a')
            .end((err, res) => {
              expect(res.body).to.be.eql([
                {id: '1', name: 'test'},
                {id: '2', name: 'test'},
              ]);
              done();
            }));
        });
      });

      describe('get one', () => {
        it('should return single record of a given factory', done => {
          this.server.startServer(() => chai.request(this.server.server)
            .get('/lair/factories/a/1')
            .end((err, res) => {
              expect(res.body).to.be.eql({id: '1', name: 'test'});
              done();
            }));
        });
      });

      describe('update one', () => {
        it('should update single record of a given factory (using `put`)', done => {
          this.server.startServer(() => chai.request(this.server.server)
            .put('/lair/factories/a/1')
            .send({name: 'new name'})
            .end((err, res) => {
              expect(res.body).to.be.eql({id: '1', name: 'new name'});
              done();
            }));
        });

        it('should update single record of a given factory (using `patch`)', done => {
          this.server.startServer(() => chai.request(this.server.server)
            .patch('/lair/factories/a/1')
            .send({name: 'new name'})
            .end((err, res) => {
              expect(res.body).to.be.eql({id: '1', name: 'new name'});
              done();
            }));
        });
      });

      describe('delete one', () => {
        it('should delete single record of a given factory', done => {
          this.server.startServer(() => chai.request(this.server.server)
            .del('/lair/factories/a/1')
            .end((err, res) => {
              expect(Lair.getLair().getAll('a')).to.be.eql([{id: '2', name: 'test'}]);
              done();
            }));
        });
      });

      describe('create one', () => {
        it('should create record of a given factory', done => {
          this.server.startServer(() => chai.request(this.server.server)
            .post('/lair/factories/a')
            .send({name: 'new record'})
            .end((err, res) => {
              expect(Lair.getLair().getOne('a', '3')).to.be.eql({id: '3', name: 'new record'});
              done();
            }));
        });
      });

    });

  });

});
