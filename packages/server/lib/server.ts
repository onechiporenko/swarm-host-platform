import bodyParser = require('body-parser');
import colors = require('colors/safe');
import express = require('express');
import {
  Response,
  Request,
  RequestHandler,
  Router,
  Application,
} from 'express';
import read = require('fs-readdir-recursive');
import * as http from 'http';
import { Factory, Lair } from '@swarm-host/lair';
import nPath = require('path');
import winston = require('winston');
import { printRoutesMap } from './express';
import Route from './route';
import { assert } from './utils';

function isRoute(v: any): v is Route {
  let proto = v['__proto__'];
  while (proto) {
    if (proto === Route) {
      return true;
    }
    proto = proto['__proto__'];
  }
  return false;
}

function isFactory(v: any): v is Factory {
  let proto = v['__proto__'];
  while (proto) {
    if (proto === Factory) {
      return true;
    }
    proto = proto['__proto__'];
  }
  return false;
}

const getCrudOptionsFromRequest = (req: Request) => {
  const {
    query: { depth, ignoreRelated, handleNotAttrs },
  } = req;
  let _ignoreRelated;
  if (Array.isArray(ignoreRelated)) {
    _ignoreRelated = ignoreRelated;
  } else {
    if (typeof ignoreRelated === 'string') {
      _ignoreRelated = [ignoreRelated];
    } else {
      if (typeof ignoreRelated === 'boolean') {
        _ignoreRelated = ignoreRelated;
      } else {
        _ignoreRelated = false;
      }
    }
  }
  return {
    depth: depth ? Number(depth) : Infinity,
    handleNotAttrs: !!handleNotAttrs,
    ignoreRelated: _ignoreRelated,
  };
};

function getAll(req: Request, res: Response): Response {
  const { factoryName } = req.params;
  return res.json(
    Lair.getLair().getAll(factoryName, getCrudOptionsFromRequest(req))
  );
}

function getOne(req: Request, res: Response): Response {
  const { factoryName, id } = req.params;
  const record = Lair.getLair().getOne(
    factoryName,
    id,
    getCrudOptionsFromRequest(req)
  );
  if (!record) {
    return res.status(404).json();
  }
  return res.json(record);
}

function updateOne(req: Request, res: Response): Response {
  const { factoryName, id } = req.params;
  const lair = Lair.getLair();
  if (!lair.getOne(factoryName, id, { ignoreRelated: true })) {
    return res.status(404).json();
  }
  return res.json(
    lair.updateOne(factoryName, id, req.body, getCrudOptionsFromRequest(req))
  );
}

function deleteOne(req: Request, res: Response): Response {
  const { factoryName, id } = req.params;
  const lair = Lair.getLair();
  if (!lair.getOne(factoryName, id, { ignoreRelated: true })) {
    return res.status(404).json();
  }
  lair.deleteOne(factoryName, id);
  return res.json({});
}

function createOne(req: Request, res: Response): Response {
  const { factoryName } = req.params;
  return res.json(
    Lair.getLair().createOne(
      factoryName,
      req.body,
      getCrudOptionsFromRequest(req)
    )
  );
}

export default class Server {
  private static instance: Server;

  public delay = 0;
  public expressApp: Application;
  public lairNamespace = '/lair';
  public namespace = '';
  public port = 54321;
  public verbose = true;

  private createRecordsQueue: [string, number][] = [];
  private readonly expressLairRouter: Router;
  private readonly expressRouter: Router;
  private internalServer: http.Server;
  private readonly lair: Lair;
  private logger: winston.Logger;
  private middlewaresQueue: RequestHandler[] = [];

  private constructor() {
    this.expressApp = express();
    this.expressRouter = Router();
    this.expressLairRouter = Router();
    this.lair = Lair.getLair();
    this.logger = winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
  }

  public get server(): http.Server {
    return this.internalServer;
  }

  public static cleanServer(): void {
    Lair.cleanLair();
    Server.instance = new Server();
  }

  public static getServer(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
    }
    return Server.instance;
  }

  public addFactories(factories: (Factory | typeof Factory)[]): void {
    factories.map((factory) => this.addFactory(factory));
  }

  public async addFactoriesFromDir(path: string): Promise<any> {
    return Promise.all(
      read(path).map((factoryPath) => this.add('factory', path, factoryPath))
    );
  }

  public addFactory(factory: Factory | typeof Factory): void {
    this.lair.registerFactory(factory);
  }

  public addMiddleware(clb: RequestHandler): void {
    this.middlewaresQueue.push(clb);
  }

  public addMiddlewares(clbs: RequestHandler[]): void {
    clbs.map((clb) => this.addMiddleware(clb));
  }

  public addRoute(routeInstanceOrClass: Route | typeof Route): void {
    let source;
    let path;
    const route =
      routeInstanceOrClass instanceof Route
        ? routeInstanceOrClass
        : new routeInstanceOrClass();
    if (route.namespace === null) {
      source = this.expressRouter;
      path = route.path;
    } else {
      source = this.expressApp;
      path = nPath.join(route.namespace, route.path).replace(/\\/g, '/'); // quick fix for windows
    }
    assert(
      `"path" is not defined for route "${route.constructor.name}"`,
      !!path
    );
    source[route.method](path, (req, res, next) =>
      route.oldHandler
        ? route.oldHandler.call(route, req, res, next, this.lair)
        : route.defaultHandler(req, res, next, this.lair)
    );
  }

  public addRoutes(routes: Route[]): void {
    routes.map((route) => this.addRoute(route));
  }

  public async addRoutesFromDir(path: string): Promise<any> {
    return Promise.all(
      read(path).map((routePath) => this.add('route', path, routePath))
    );
  }

  public createRecords(factoryName: string, count: number): void {
    this.createRecordsQueue.push([factoryName, count]);
  }

  public startServer(clb?: () => void): void {
    this.lair.verbose = this.verbose;
    this.fillLair();
    this.useMiddlewares();
    this.addLairMetaRoutes();
    this.addAppRoutes();
    this.printRoutesMap();
    this.internalServer = this.expressApp.listen(this.port, clb);
  }

  public stopServer(clb?: () => void): any {
    return this.internalServer.close(clb);
  }

  private async add(type: string, parent: string, path: string): Promise<any> {
    if (
      (path.match(/\.ts$/) !== null || path.match(/\.js$/) !== null) &&
      path.match(/\.d\.ts$/) === null
    ) {
      return import(`${parent}/${path}`).then(
        ({ default: classOrInstance }) => {
          if (classOrInstance) {
            if (
              type === 'route' &&
              (isRoute(classOrInstance) || classOrInstance instanceof Route)
            ) {
              this.addRoute(classOrInstance);
            }
            if (
              type === 'factory' &&
              (isFactory(classOrInstance) || classOrInstance instanceof Factory)
            ) {
              this.addFactory(classOrInstance);
            }
          } else {
            this.logger.info({
              level: 'info',
              message: `"${parent}/${path}" doesn't have default import`,
            });
          }
        }
      );
    }
  }

  private addAppRoutes(): void {
    this.expressApp.use(this.namespace, this.expressRouter);
  }

  private addLairMetaRoutes(): void {
    this.expressLairRouter.get('/meta', (req, res) =>
      res.json(this.lair.getDevInfo())
    );
    const path = `/factories/:factoryName`;
    const singlePath = `${path}/:id`;
    this.expressLairRouter.get(path, getAll);
    this.expressLairRouter.get(singlePath, getOne);
    this.expressLairRouter.delete(singlePath, deleteOne);
    this.expressLairRouter.patch(singlePath, updateOne);
    this.expressLairRouter.put(singlePath, updateOne);
    this.expressLairRouter.post(path, createOne);
    this.expressApp.use(this.lairNamespace, this.expressLairRouter);
  }

  private fillLair(): void {
    this.createRecordsQueue.map((crArgs) => this.lair.createRecords(...crArgs));
    this.createRecordsQueue = [];
  }

  private printRoutesMap(): void {
    if (this.verbose) {
      this.logger.info({ level: 'info', message: 'Defined route-handlers' });
      this.expressApp._router.stack.forEach(printRoutesMap.bind(null, []));
    }
  }

  private useMiddlewares(): void {
    const app = this.expressApp;
    app.use(bodyParser.json());
    app.use((req, res, next) => {
      if (this.verbose) {
        this.logger.info({
          level: 'info',
          message: colors.green(`${req.method} ${req.url}`),
        });
      }
      next();
    });
    this.middlewaresQueue.map((clb) => app.use(clb));
    this.middlewaresQueue = [];
    app.use((req, res, next) => {
      if (this.delay) {
        setTimeout(next, this.delay);
      } else {
        next();
      }
    });
  }
}
