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
import { Factory, Lair } from 'lair-db';
import nPath = require('path');
import winston = require('winston');
import { printRoutesMap } from './express';
import Route from './route';

function getAll(req: Request, res: Response): Response {
  const { factoryName } = req.params;
  return res.json(Lair.getLair().getAll(factoryName, { depth: 1 }));
}

function getOne(req: Request, res: Response): Response {
  const { factoryName, id } = req.params;
  return res.json(Lair.getLair().getOne(factoryName, id, { depth: 1 }));
}

function updateOne(req: Request, res: Response): Response {
  const { factoryName, id } = req.params;
  return res.json(
    Lair.getLair().updateOne(factoryName, id, req.body, { depth: 1 })
  );
}

function deleteOne(req: Request, res: Response): Response {
  const { factoryName, id } = req.params;
  Lair.getLair().deleteOne(factoryName, id);
  return res.json({});
}

function createOne(req: Request, res: Response): Response {
  const { factoryName } = req.params;
  return res.json(
    Lair.getLair().createOne(factoryName, req.body, { depth: 1 })
  );
}

export default class Server {
  public static getServer(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
    }
    return Server.instance;
  }

  public static cleanServer(): void {
    Lair.cleanLair();
    Server.instance = new Server();
  }

  private static instance: Server;

  public expressApp: Application;
  public namespace = '';
  public port = 54321;
  public verbose = true;
  public delay = 0;
  public lairNamespace = '/lair';

  public get server(): http.Server {
    return this.internalServer;
  }

  private readonly expressRouter: Router;
  private readonly expressLairRouter: Router;
  private readonly lair: Lair;
  private logger: winston.Logger;
  private createRecordsQueue: [string, number][] = [];
  private middlewaresQueue: RequestHandler[] = [];
  private internalServer: http.Server;

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

  public addRoute(route: Route): void {
    let source;
    let path;
    if (route.namespace === null) {
      source = this.expressRouter;
      path = route.path;
    } else {
      source = this.expressApp;
      path = nPath.join(route.namespace, route.path).replace(/\\/g, '/'); // quick fix for windows
    }
    source[route.method](path, (req, res, next) =>
      route.handler.call(this.expressRouter, req, res, next, this.lair)
    );
  }

  public addRoutes(routes: Route[]): void {
    routes.map((route) => this.addRoute(route));
  }

  public addRoutesFromDir(path: string): void {
    read(path).forEach((routePath) => this.add('route', path, routePath));
  }

  public addFactory(factory: Factory, name?: string): void {
    this.lair.registerFactory(factory, name);
  }

  public addFactories(factories: [Factory, string][]): void {
    factories.map((args) => this.addFactory(...args));
  }

  public addFactoriesFromDir(path: string): void {
    read(path).forEach((factoryPath) => this.add('factory', path, factoryPath));
  }

  public createRecords(factoryName: string, count: number): void {
    this.createRecordsQueue.push([factoryName, count]);
  }

  public addMiddleware(clb: RequestHandler): void {
    this.middlewaresQueue.push(clb);
  }

  public addMiddlewares(clbs: RequestHandler[]): void {
    clbs.map((clb) => this.addMiddleware(clb));
  }

  public startServer(clb?: () => void): void {
    this.lair.verbose = this.verbose;
    this.fillLair();
    this.useMiddlewares();
    this.addLairMetaRoutes();
    this.addAppRoutes();
    this.printRoutesMap();
    this.internalServer = this.expressApp.listen(this.port, () =>
      clb ? clb() : null
    );
  }

  public stopServer(clb?: () => void): void {
    this.internalServer.close(() => (clb ? clb() : null));
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

  private addAppRoutes(): void {
    this.expressApp.use(this.namespace, this.expressRouter);
  }

  private fillLair(): void {
    this.createRecordsQueue.map((crArgs) => this.lair.createRecords(...crArgs));
    this.createRecordsQueue = [];
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

  private printRoutesMap(): void {
    if (this.verbose) {
      this.logger.info({ level: 'info', message: 'Defined route-handlers' });
      this.expressApp._router.stack.forEach(printRoutesMap.bind(null, []));
    }
  }

  private add(type: string, parent: string, path: string): void {
    if (
      (path.match(/\.ts$/) !== null || path.match(/\.js$/) !== null) &&
      path.match(/\.d\.ts$/) === null
    ) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const instance = require(`${parent}/${path}`).default;
      if (instance) {
        if (type === 'route' && instance instanceof Route) {
          this.addRoute(instance);
        }
        if (type === 'factory' && instance instanceof Factory) {
          this.addFactory(instance);
        }
      }
    }
  }
}
