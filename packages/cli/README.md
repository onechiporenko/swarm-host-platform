# Swarm-Host-CLI

[![Build Status](https://travis-ci.org/onechiporenko/swarm-host-cli.svg?branch=master)](https://travis-ci.org/onechiporenko/swarm-host-cli)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/09abde586a6a4f24b859a5e4b3f57472)](https://www.codacy.com/app/cv_github/swarm-host-cli?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=onechiporenko/swarm-host-cli&amp;utm_campaign=Badge_Grade)
[![npm version](https://badge.fury.io/js/swarm-host-cli.svg)](https://badge.fury.io/js/swarm-host-cli)

CLI for [Swarm-Host](https://github.com/onechiporenko/swarm)

## Install:

```bash
npm i -g swarm-host-cli
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
import {Route} from 'swarm-host';

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
import {Route} from 'swarm-host';

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
import {Route} from 'swarm-host';

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
import {Factory} from 'swarm-host';

export default Factory.create({
  name: 'unit',
  attrs: {
  }
});
```

### Create a new Factory with attributes:

```bash
swarm-host g factory my/unit name:string squad:has-one:squad objectives:has-many:objective
```

File `factories/my/unit.ts` will be created. Its content:

```typescript
// factories/my/unit.ts
import {Factory} from 'swarm-host';

export default Factory.create({
  name: 'unit',
  attrs: {
    name: Factory.field({
      value() {
        return '';
      },
      preferredType: 'string'
    }),
    age: Factory.field({
      value() {
        return 0;
      },
      preferredType: 'number'
    }),
    objectives: Factory.hasMany('objective', null),
    squad: Factory.hasOne('squad', null),
  }
});
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