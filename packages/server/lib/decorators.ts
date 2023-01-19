import { NextFunction, Request, Response } from 'express';
import { Lair } from '@swarm-host/lair';
import { assert } from './utils';

export function instanceExists(
  factoryName: string | string[],
  reqParamName: string,
  errorHandler: (
    req: Request,
    res: Response,
    next: NextFunction,
    lair: Lair
  ) => void
) {
  assert(
    'Factory name must be not empty string or array',
    factoryName.length !== 0
  );
  assert('Request param name must not empty', !!reqParamName);
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    const originalMethod = descriptor.value;
    descriptor.value = function (
      req: Request,
      res: Response,
      next: NextFunction,
      lair: Lair
    ): any {
      assert(
        `Request parameter with name "${reqParamName}" does not exist`,
        !!req.params[reqParamName]
      );
      const factoryNames = Array.isArray(factoryName)
        ? [...factoryName]
        : [factoryName];
      const entityId = req.params[reqParamName];
      let entityExists = false;
      let fName = factoryNames.pop();
      while (fName) {
        const entity = lair.getOne(fName, entityId, {
          ignoreRelated: true,
        });
        if (entity) {
          entityExists = true;
          break;
        }
        fName = factoryNames.pop();
      }
      if (!entityExists) {
        return errorHandler(req, res, next, lair);
      }
      return originalMethod.call(this, req, res, next, lair);
    };
    return descriptor;
  };
}
