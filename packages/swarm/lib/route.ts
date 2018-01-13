import * as express from 'express';
import {Lair} from 'lair-db/dist';
import {CRUDOptions} from 'lair-db/dist/lair';
import methods = require('methods');
import {assert} from './utils';

function defaultNext(req: express.Request, res: express.Response, data: any) {
  return res.json(data);
}

export type Handler = (req: express.Request, res: express.Response, next: express.NextFunction, lair: Lair) => any;
export type CustomNext = (req: express.Request, res: express.Response, data: any, lair: Lair) => any;

export default class Route {
  public static createRoute(method = 'get', path = '', handler: Handler): Route {
    const route = new Route();
    route.handler = handler;
    route.method = method;
    assert(`"${method}" is unknown method. It must be one of the [${methods.join(',')}]`, methods.indexOf(method) !== -1);
    route.path = path;
    return route;
  }

  public static get(path: string, modelName: string, lairOptions: CRUDOptions = {}, customNext: CustomNext): Route {
    const realNext = customNext ? customNext : defaultNext;
    return Route.createRoute('get', path, (req, res, next, lair) => {
      const parameters = Object.keys(req.params);
      const id = parameters.length === 1 ? req.params[parameters[0]] : undefined;
      const result = id ? lair.getOne(modelName, id, lairOptions) : lair.getAll(modelName, lairOptions);
      return realNext(req, res, result, lair);
    });
  }

  public static post(path: string, modelName: string, lairOptions: CRUDOptions = {}, customNext: CustomNext): Route {
    const realNext = customNext ? customNext : defaultNext;
    return Route.createRoute('post', path, (req, res, next, lair) => {
      const result = lair.createOne(modelName, req.body, lairOptions);
      return realNext(req, res, result, lair);
    });
  }

  public static put(path: string, modelName: string, lairOptions: CRUDOptions = {}, customNext: CustomNext): Route {
    const realNext = customNext ? customNext : defaultNext;
    return Route.createRoute('get', path, (req, res, next, lair) => {
      const parameters = Object.keys(req.params);
      const id = parameters.length === 1 ? req.params[parameters[0]] : undefined;
      assert('identifier is not provided', !!id);
      const result = lair.updateOne(modelName, id, req.body, lairOptions);
      return realNext(req, res, result, lair);
    });
  }

  public static patch(path: string, modelName: string, lairOptions: CRUDOptions = {}, customNext: CustomNext): Route {
    return Route.put(path, modelName, lairOptions, customNext);
  }

  public static delete(path: string, modelName: string, customNext: CustomNext): Route {
    const realNext = customNext ? customNext : defaultNext;
    return Route.createRoute('del', path, (req, res, next, lair) => {
      const parameters = Object.keys(req.params);
      const id = parameters.length === 1 ? req.params[parameters[0]] : undefined;
      assert('identifier is not provided', !!id);
      const result = lair.deleteOne(modelName, id);
      return realNext(req, res, result, lair);
    });
  }

  public handler: Handler;
  public method = 'get';
  public path = '/';
}
