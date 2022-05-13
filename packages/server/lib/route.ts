import { Request, Response, NextFunction } from 'express';
import { Lair, CRUDOptions } from '@swarm-host/lair';
import methods = require('methods');
import { assert } from './utils';

function defaultNext(
  req: Request,
  res: Response,
  data: Record<string, unknown>[] | Record<string, unknown> | any
): Response {
  return res.json(data);
}

export function defaultHandler(
  req: Request,
  res: Response,
  next: NextFunction,
  lair: Lair
): Response {
  return res.json({});
}

export type Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
  lair: Lair
) => any;
export type CustomNext = (
  req: Request,
  res: Response,
  data: Record<string, unknown>[] | Record<string, unknown> | any,
  lair: Lair
) => any;

export default class Route {
  public static createRoute(
    method = 'get',
    path = '/',
    handler: Handler = defaultHandler
  ): Route {
    const route = new Route();
    route.oldHandler = handler;
    route.method = method;
    assert(
      `"${method}" is unknown method. It must be one of the known methods`,
      methods.indexOf(method) !== -1
    );
    route.path = path;
    return route;
  }

  public static get(
    path: string,
    modelName: string,
    lairOptions: CRUDOptions = {},
    customNext: CustomNext = defaultNext
  ): Route {
    const handler = (
      req: Request,
      res: Response,
      next: NextFunction,
      lair: Lair
    ) => {
      const parameters = Object.keys(req.params);
      const id =
        parameters.length === 1 ? req.params[parameters[0]] : undefined;
      const result = id
        ? lair.getOne(modelName, id, lairOptions)
        : lair.getAll(modelName, lairOptions);
      return customNext(req, res, result, lair);
    };
    return Route.createRoute('get', path, handler);
  }

  public static post(
    path: string,
    modelName: string,
    lairOptions: CRUDOptions = {},
    customNext: CustomNext = defaultNext
  ): Route {
    return Route.createRoute(
      'post',
      path,
      (req: Request, res: Response, next: NextFunction, lair: Lair) => {
        const result = lair.createOne(modelName, req.body, lairOptions);
        return customNext(req, res, result, lair);
      }
    );
  }

  public static put(
    path: string,
    modelName: string,
    lairOptions: CRUDOptions = {},
    customNext: CustomNext = defaultNext
  ): Route {
    return Route.createRoute(
      'put',
      path,
      (req: Request, res: Response, next: NextFunction, lair: Lair) => {
        const parameters = Object.keys(req.params);
        const id =
          parameters.length === 1 ? req.params[parameters[0]] : undefined;
        assert('identifier is not provided', !!id);
        const result = lair.updateOne(modelName, id, req.body, lairOptions);
        return customNext(req, res, result, lair);
      }
    );
  }

  public static patch(
    path: string,
    modelName: string,
    lairOptions: CRUDOptions = {},
    customNext: CustomNext = defaultNext
  ): Route {
    return Route.createRoute(
      'patch',
      path,
      (req: Request, res: Response, next: NextFunction, lair: Lair) => {
        const parameters = Object.keys(req.params);
        const id =
          parameters.length === 1 ? req.params[parameters[0]] : undefined;
        assert('identifier is not provided', !!id);
        const result = lair.updateOne(modelName, id, req.body, lairOptions);
        return customNext(req, res, result, lair);
      }
    );
  }

  public static delete(
    path: string,
    modelName: string,
    customNext: CustomNext = defaultNext
  ): Route {
    const handler = (
      req: Request,
      res: Response,
      next: NextFunction,
      lair: Lair
    ) => {
      const parameters = Object.keys(req.params);
      const id =
        parameters.length === 1 ? req.params[parameters[0]] : undefined;
      assert('identifier is not provided', !!id);
      lair.deleteOne(modelName, id);
      return customNext(req, res, null, lair);
    };
    return Route.createRoute('delete', path, handler);
  }

  public oldHandler: Handler;
  public method: string;
  /**
   * Used to override `server.namespace` for current Route
   */
  public namespace: string = null;
  public path: string;

  public defaultHandler(req, res, next, lair) {
    return defaultHandler(req, res, next, lair);
  }
}
