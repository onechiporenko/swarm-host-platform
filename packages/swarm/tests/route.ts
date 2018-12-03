import * as express from 'express';
import {expect} from 'chai';
import {Factory, Lair} from 'lair-db/dist';
import Route from '../lib/route';

const model = Factory.create({
  attrs: {
    name: Factory.field({
      defaultValue: 'test',
      value: 'test',
    }),
  },
});

describe('#Route', () => {

  beforeEach(() => {
    this.lair = Lair.getLair();
    this.lair.registerFactory(model, 'model');
  });

  afterEach(() => {
    Lair.cleanLair();
  });

  describe('#createRoute', () => {
    it('should create a handler for GET-request by default', () => {
      expect(Route.createRoute().method).to.be.equal('get');
    });
    it('should create a handler for path `/` by default', () => {
      expect(Route.createRoute('get').path).to.be.equal('/');
    });
    it('should throw an Error for unknown request-type', () => {
      expect(() => Route.createRoute('fake-method', '', () => 1)).to.throw('"fake-method" is unknown method. It must be one of the known methods');
    });
    it('default handler should call `res.json` with `{}`', done => {
      const route = Route.createRoute('get', '/');
      route.handler(
        {} as express.Request,
        {
          json(data: object): void {
            expect(data).to.be.eql({});
            done();
          },
        } as express.Response,
        {} as express.NextFunction,
        this.lair,
      );
    });
  });

  describe('#get', () => {

    beforeEach(() => {
      this.lair.createOne('model', {});
    });

    describe('no dynamic parts', () => {
      it('should create handler for `get`-request', () => {
        const route = Route.get('/some-path', 'model', {});
        expect(route.path).to.be.equal('/some-path');
        expect(route.method).to.be.equal('get');
      });

      it('default handler should return all records', done => {
        const route = Route.get('/some', 'model', {}, (req, res, data) => {
          expect(data).to.be.eql([{
            id: '1',
            name: 'test',
          }]);
          done();
        });
        route.handler(
          {params: {}} as express.Request,
          {} as express.Response,
          {} as express.NextFunction,
          this.lair,
        );
      });
    });

    describe('single dynamic part', () => {
      it('default handler should return single record', done => {
        const route = Route.get('/some', 'model', {}, (req, res, data) => {
          expect(data).to.be.eql({
            id: '1',
            name: 'test',
          });
          done();
        });
        route.handler(
          {params: {id: '1'}} as express.Request,
          {} as express.Response,
          {} as express.NextFunction,
          this.lair,
        );
      });

      it('default `next` should return `json` with data provided by handler', () => {
        const route = Route.get('/some', 'model', {});
        expect(route.handler(
          {params: {id: '1'}} as express.Request,
          {
            json(d: any): any {
              return d;
            },
          } as express.Response,
          {} as express.NextFunction,
          this.lair,
        )).to.be.eql({id: '1', name: 'test'});
      });
    });

    describe('multiple dynamic parts', () => {
      it('default handler should return single record', done => {
        const route = Route.get('/some/:id/part/:id2', 'model', {}, (req, res, data) => {
          expect(data).to.be.eql([{
            id: '1',
            name: 'test',
          }]);
          done();
        });
        route.handler(
          {params: {id: '1', id2: '2'}} as express.Request,
          {} as express.Response,
          {} as express.NextFunction,
          this.lair,
        );
      });
    });
  });

  describe('#post', () => {
    it('should create handler for `post`-request', () => {
      const route = Route.post('/some-path', 'model', {}, () => ({}));
      expect(route.path).to.be.equal('/some-path');
      expect(route.method).to.be.equal('post');
    });

    it('default handler should create one record', done => {
      expect(this.lair.getAll('model')).to.be.empty;
      const route = Route.post('/some-path', 'model', {}, (req, res, data) => {
        expect(data).to.be.eql({
          id: '1',
          name: 'artanis',
        });
        done();
      });
      route.handler(
        {body: {name: 'artanis'}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      );
    });
  });

  describe('#put', () => {
    it('should create handler for `put`-request', () => {
      const route = Route.put('/some-path', 'model', {}, () => ({}));
      expect(route.path).to.be.equal('/some-path');
      expect(route.method).to.be.equal('put');
    });

    it('default handler should throw an error if `id` is not provided', () => {
      const route = Route.put('/some-path/:id', 'model', {}, () => ({}));
      expect(() => route.handler(
        {params: {}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      )).to.throw('identifier is not provided');
    });

    it('default handler should throw an error if more than one `id` is provided', () => {
      const route = Route.put('/some-path/:id', 'model', {}, () => ({}));
      expect(() => route.handler(
        {params: {id: '1', id2: '2'}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      )).to.throw('identifier is not provided');
    });

    it('default handler should update record by its `id`', done => {
      this.lair.createOne('model', {name: 'artanis'});
      expect(this.lair.getOne('model', '1')).to.be.eql({id: '1', name: 'artanis'});
      const route = Route.put('/some-path/:id', 'model', {}, () => {
        expect(this.lair.getOne('model', '1')).to.be.eql({id: '1', name: 'alarak'});
        done();
      });
      route.handler(
        {params: {id: '1'}, body: {name: 'alarak'}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      );
    });
  });

  describe('#patch', () => {
    it('should create handler for `patch`-request', () => {
      const route = Route.patch('/some-path', 'model', {}, () => ({}));
      expect(route.path).to.be.equal('/some-path');
      expect(route.method).to.be.equal('patch');
    });

    it('default handler should throw an error if `id` is not provided', () => {
      const route = Route.patch('/some-path/:id', 'model', {}, () => ({}));
      expect(() => route.handler(
        {params: {}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      )).to.throw('identifier is not provided');
    });

    it('default handler should throw an error if more than one `id` is provided', () => {
      const route = Route.patch('/some-path/:id', 'model', {}, () => ({}));
      expect(() => route.handler(
        {params: {id: '1', id2: '2'}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      )).to.throw('identifier is not provided');
    });

    it('default handler should update record by its `id`', done => {
      this.lair.createOne('model', {name: 'artanis'});
      expect(this.lair.getOne('model', '1')).to.be.eql({id: '1', name: 'artanis'});
      const route = Route.patch('/some-path/:id', 'model', {}, () => {
        expect(this.lair.getOne('model', '1')).to.be.eql({id: '1', name: 'alarak'});
        done();
      });
      route.handler(
        {params: {id: '1'}, body: {name: 'alarak'}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      );
    });
  });

  describe('#delete', () => {
    it('should create handler for `delete`-request', () => {
      const route = Route.delete('/some-path/:id', 'model', () => ({}));
      expect(route.path).to.be.equal('/some-path/:id');
      expect(route.method).to.be.equal('delete');
    });

    it('default handler should throw an error if `id` is not provided', () => {
      const route = Route.delete('/some-path/:id', 'model', () => ({}));
      expect(() => route.handler(
        {params: {}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      )).to.throw('identifier is not provided');
    });

    it('default handler should throw an error if more than one `id` is provided', () => {
      const route = Route.delete('/some-path/:id', 'model', () => ({}));
      expect(() => route.handler(
        {params: {id: '1', id2: '2'}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      )).to.throw('identifier is not provided');
    });

    it('default handler should delete record by its `id`', done => {
      this.lair.createOne('model', {name: 'artanis'});
      expect(this.lair.getOne('model', '1')).to.be.eql({id: '1', name: 'artanis'});
      const route = Route.delete('/some-path/:id', 'model', () => {
        expect(this.lair.getAll('model')).to.be.empty;
        done();
      });
      route.handler(
        {params: {id: '1'}} as express.Request,
        {} as express.Response,
        {} as express.NextFunction,
        this.lair,
      );
    });
  });

});
