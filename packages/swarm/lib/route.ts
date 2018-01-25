import * as express from 'express';
import {Lair} from 'lair-db/dist';
import {CRUDOptions} from 'lair-db/dist/lair';
import methods = require('methods');
import {assert} from './utils';

function defaultNext(req: express.Request, res: express.Response, data: any) {
  return res.json(data);
}

function defaultHandler(req: express.Request, res: express.Response, next: express.NextFunction, lair: Lair) {
  return res.json({});
}

export type Handler = (req: express.Request, res: express.Response, next: express.NextFunction, lair: Lair) => any;
export type CustomNext = (req: express.Request, res: express.Response, data: any, lair: Lair) => any;

export default class Route {
  public static createRoute(method = 'get', path = '/', handler: Handler = defaultHandler): Route {
    const route = new Route();
    route.handler = handler;
    route.method = method;
    assert(`"${method}" is unknown method. It must be one of the known methods`, methods.indexOf(method) !== -1);
    route.path = path;
    return route;
  }

  public static get(path: string, modelName: string, lairOptions: CRUDOptions = {}, customNext: CustomNext = defaultNext): Route {
    const handler = (req, res, next, lair) => {
      const parameters = Object.keys(req.params);
      const id = parameters.length === 1 ? req.params[parameters[0]] : undefined;
      const result = id ? lair.getOne(modelName, id, lairOptions) : lair.getAll(modelName, lairOptions);
      return customNext(req, res, result, lair);
    };
    return Route.createRoute('get', path, handler);
  }

  public static post(path: string, modelName: string, lairOptions: CRUDOptions = {}, customNext: CustomNext = defaultNext): Route {
    return Route.createRoute('post', path, (req, res, next, lair) => {
      const result = lair.createOne(modelName, req.body, lairOptions);
      return customNext(req, res, result, lair);
    });
  }

  public static put(path: string, modelName: string, lairOptions: CRUDOptions = {}, customNext: CustomNext = defaultNext): Route {
    return Route.createRoute('put', path, (req, res, next, lair) => {
      const parameters = Object.keys(req.params);
      const id = parameters.length === 1 ? req.params[parameters[0]] : undefined;
      assert('identifier is not provided', !!id);
      const result = lair.updateOne(modelName, id, req.body, lairOptions);
      return customNext(req, res, result, lair);
    });
  }

  public static patch(path: string, modelName: string, lairOptions: CRUDOptions = {}, customNext: CustomNext = defaultNext): Route {
    return Route.createRoute('patch', path, (req, res, next, lair) => {
      const parameters = Object.keys(req.params);
      const id = parameters.length === 1 ? req.params[parameters[0]] : undefined;
      assert('identifier is not provided', !!id);
      const result = lair.updateOne(modelName, id, req.body, lairOptions);
      return customNext(req, res, result, lair);
    });
  }

  public static delete(path: string, modelName: string, customNext: CustomNext = defaultNext): Route {
    const handler = (req, res, next, lair) => {
      const parameters = Object.keys(req.params);
      const id = parameters.length === 1 ? req.params[parameters[0]] : undefined;
      assert('identifier is not provided', !!id);
      const result = lair.deleteOne(modelName, id);
      return customNext(req, res, result, lair);
    };
    return Route.createRoute('delete', path, handler);
  }

  public handler: Handler;
  public method;
  public path;
}