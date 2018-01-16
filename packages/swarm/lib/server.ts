import bodyParser = require('body-parser');
import colors = require('colors/safe');
import * as express from 'express';
import * as http from 'http';
import {Factory, Lair} from 'lair-db/dist';
import winston = require('winston');
import {printRoutesMap} from './express';
import Route from './route';

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

  public expressApp: express.Application;
  public namespace = '';
  public port = 54321;
  public verbose = true;
  public delay = 0;

  public get server(): http.Server {
    return this.internalServer;
  }

  private expressRouter: express.Router;
  private lair: Lair;
  private createRecordsQueue: Array<[string, number]> = [];
  private middlewaresQueue: express.RequestHandler[] = [];
  private internalServer: http.Server;

  private constructor() {
    this.expressApp = express();
    this.expressRouter = express.Router();
    this.lair = Lair.getLair();
  }

  public addRoute(route: Route) {
    this.expressRouter[route.method](
      route.path,
      (req, res, next) =>
        route.handler.call(this.expressRouter, req, res, next, this.lair));
  }

  public addRoutes(routes: Route[]) {
    routes.map(route => this.addRoute(route));
  }

  public addFactory(factory: Factory, name: string) {
    this.lair.registerFactory(factory, name);
  }

  public addFactories(factories: Array<[Factory, string]>) {
    factories.map(args => this.addFactory.apply(this, args));
  }

  public createRecords(factoryName: string, count: number) {
    this.createRecordsQueue.push([factoryName, count]);
  }

  public addMiddleware(clb: express.RequestHandler) {
    this.middlewaresQueue.push(clb);
  }

  public addMiddlewares(clbs: express.RequestHandler[]) {
    clbs.map(clb => this.addMiddleware(clb));
  }

  public startServer(clb?: () => any) {
    this.lair.verbose = this.verbose;
    this.fillLair();
    this.useMiddlewares();
    this.expressApp.use(this.namespace, this.expressRouter);
    this.printRoutesMap();
    this.internalServer = this.expressApp.listen(this.port, () => clb ? clb() : null);
  }

  public stopServer(clb?: () => any) {
    this.internalServer.close(() => clb ? clb() : null);
  }

  private fillLair() {
    this.createRecordsQueue.map(crArgs => this.lair.createRecords.apply(this.lair, crArgs));
    this.createRecordsQueue = [];
  }

  private useMiddlewares() {
    const app = this.expressApp;
    app.use(bodyParser.json());
    app.use((req, res, next) => {
      if (this.verbose) {
        winston.log('info', colors.green(`${req.method} ${req.url}`));
      }
      next();
    });
    this.middlewaresQueue.map(clb => app.use(clb));
    this.middlewaresQueue = [];
    app.use((req, res, next) => {
      if (this.delay) {
        setTimeout(next, this.delay);
      } else {
        next();
      }
    });
  }

  private printRoutesMap() {
    if (this.verbose) {
      winston.info('Defined route-handlers');
      this.expressApp._router.stack.forEach(printRoutesMap.bind(null, []));
    }
  }
}
