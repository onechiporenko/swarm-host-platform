import bodyParser = require('body-parser');
import colors = require('colors/safe');
import * as express from 'express';
import {Factory, Lair} from 'lair-db/dist';
import winston = require('winston');
import Route from './route';
import {printRoutesMap} from './utils';

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

  public namespace = '/dlm/api';
  public port = 54321;
  public verbose = true;
  public delay = 0;

  private expressApp: express.Application;
  private expressRouter: express.Router;
  private lair: Lair;
  private createRecordsQueue: Array<[string, number]> = [];

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

  public startServer() {
    this.lair.verbose = this.verbose;
    this.createRecordsQueue.map(crArgs => this.lair.createRecords.apply(this.lair, crArgs));
    const app = this.expressApp;
    app.use(bodyParser.json());
    app.use((req, res, next) => {
      if (this.verbose) {
        winston.log('info', colors.green(`${req.method} ${req.url}`));
      }
      next();
    });
    app.use((req, res, next) => {
      if (this.delay) {
        setTimeout(next, this.delay);
      } else {
        next();
      }
    });
    app.use(this.namespace, this.expressRouter);
    this.printRoutesMap();
    app.listen(this.port);
  }

  private printRoutesMap() {
    if (this.verbose) {
      winston.info('Defined route-handlers');
      this.expressApp._router.stack.forEach(printRoutesMap.bind(null, []));
    }
  }
}
