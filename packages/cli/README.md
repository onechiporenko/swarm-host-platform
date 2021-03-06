# Swarm-Host-CLI

[![npm version](https://badge.fury.io/js/@swarm-host%2Fcli.svg)](https://badge.fury.io/js/@swarm-host%2Fcli)
[![CI](https://github.com/onechiporenko/swarm-host-platform/actions/workflows/nodejs.yml/badge.svg)](https://github.com/onechiporenko/swarm-host-platform/actions/workflows/nodejs.yml)

## Install:

```bash
npm i -g @swarm-host/cli
```

## Usage:

### Create a new project (works in the empty dir):

```bash
swarm-host init
```

### Create a new Route:

```bash
swarm-host g route units
```

File `routes/units.ts` will be created. Its content:

```typescript
// routes/units.ts
import { Route } from '@swarm-host/server';

export default Route.createRoute('get', 'units', (req, res, next, lair) => {
  res.json({});
});
```

### Create a new Route with options:

```bash
swarm-host g route units/new --url=api/v1/units --method=post
```

File `routes/units/new.ts` will be created. Its content:

```typescript
// routes/units/new.ts
import { Route } from '@swarm-host/server';

export default Route.createRoute('post', 'api/v1/units', (req, res, next, lair) => {
  res.json({});
});
```

### Create a new Route with dynamic parts:

```bash
swarm-host g route units/unit/objectives/objective --url=units/:unit_id/objectives/:objective_id
```

File `routes/units/unit/objectives/objective.ts` will be created. Its content:

```typescript
//routes/units/unit/objectives/objective.ts
import { Route } from '@swarm-host/server';

export default Route.createRoute('get', '/units/:unit_id/objectives/:objective_id', ({params: {unit_id, objective_id}}, res, next, lair) => {
  res.json({});
});

```

### Create a new Factory:

```bash
swarm-host g factory my/unit
```

File `factories/my/unit.ts` will be created. Its content:

```typescript
// factories/my/unit.ts
import { Factory } from '@swarm-host/server';

export default class UnitFactory extends Factory {
  static factoryName = 'unit';
};
```

### Create a new Factory with attributes:

```bash
swarm-host g factory my/unit name:string squad:has-one:squad:units objectives:has-many:objective
```

File `factories/my/unit.ts` will be created. Its content:

```typescript
// factories/my/unit.ts
import { Factory, field, hasOne, hasMany } from '@swarm-host/server';

export default class UnitFactory extends Factory {
  static factoryName = 'unit';

  @field()
  get name() {
    return '';
  }

  @field()
  get age() {
    return 0;
  }
  
  @hasMany('objective', null) objectives;
  @hasOne('squad', 'units') squad;
}
```

### Destroy existing Factory

```bash
swarm-host d factory units
```

File `factories/units.ts` will be deleted.

### Destroy existing Route

```bash
swarm-host d route units
```

File `routes/units.ts` will be deleted.
