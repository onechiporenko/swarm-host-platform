# swarm-host

[![CI](https://github.com/onechiporenko/swarm/actions/workflows/nodejs.yml/badge.svg)](https://github.com/onechiporenko/swarm/actions/workflows/nodejs.yml)
[![npm version](https://badge.fury.io/js/swarm-host.svg)](https://badge.fury.io/js/swarm-host)
[![npm version](https://img.shields.io/npm/dm/swarm-host.svg)](https://npmjs.com/package/swarm-host)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a308984984ff4f9a826a5b34be2cc46a)](https://www.codacy.com/app/cv_github/swarm)
[![Coverage Status](https://coveralls.io/repos/github/onechiporenko/swarm/badge.svg?branch=master)](https://coveralls.io/github/onechiporenko/swarm?branch=master)

Swarm-host is a server for SPA test-modes which is based on [express.js](http://expressjs.com) and uses [lair-db](https://github.com/onechiporenko/lair) as a data-storage.

## Install

```bash
npm i swarm-host --save
```

## Usage

### Create and start server

```typescript
import compression = require('compression');
import { Server } from '@swarm-host/server';

// server itself
const server = Server.getServer();
// API prefix
server.namespace = '/api/v1';
// server port
server.port = 12345;
// Lair and Swarm-Host will tell a lot about what's going on with them
server.verbose = true;
// delay for each response (ms)
server.delay = 200;

server.startServer();
```

Server will listen port `12345` and use api-prefix `/api/v1` for all requests. Each response will be sent with 200ms delay. [body-parser](https://github.com/expressjs/body-parser)-json is used by default.

Server without any routes is useless. It's time to add them.

### Routing

Every Route is an instance of the class `Route`. It may be created by calling static method `createRoute`:

```typescript
import { Route } from '@swarm-host/server';
Route.createRoute('get', '/all-users', (req, res, next, lair) => {
  // ...
});
```

Method `createRoute` takes three parameters:

* request type - `get`, `post` or any other
* url - path to handle
* handler

`handler` is a function and takes four parameters:

* `req` - express.js Request
* `res` - express.js Response
* `next` - express.js `next`-function
* `lair` - [lair-db](https://github.com/onechiporenko/lair) instance


As an usual express-handler Route's `handler` must do something like:

```typescript
res.json({...});
res.status(404).json({});
```

Route may be added to server by calling `addRoute`:

```typescript
import { Server, Route } from '@swarm-host/server';
const server = Server.getServer();
server.addRoute(Route.createRoute(/*...*/)); 
```

### Add some data

[Lair-db](https://github.com/onechiporenko/lair) is used like a data-storage in the Swarm-host. It has two methods to work with Lair-db. First one is a `addFactory`. It does the same as a `lair.registerFactory` and takes two parameters - factory-instance and factory-name:

```typescript
import { Server, Factory } from '@swarm-host/server';

const server = Server.getServer();
server.addFactory(Factory.create({/* ... */}), 'factory-name');
```

Second method is a `createRecords`. It's just a wrapper for `lair.createRecords`. It takes two parameters - factory name and records count to create:

```typescript
import { Server, Factory } from '@swarm-host/server';

const server = Server.getServer();
server.createRecords('factory-name', 10);
```

Method `createRecords` may be called only **before** server starts!

### Predefined route-handlers

Class `Route` has a few methods that creates routes with predefined handlers.

#### `get`

Predefined route `get` is used to get one record or all records of the given type.

**Multiple records:**

```typescript
import { Route } from '@swarm-host/server';
Route.get('/all-users', 'user', {depth: 1, ignoreRelated: ['subject']});
```

It's equal to:

```typescript
import { Route } from '@swarm-host/server';
Route.createRoute('get', '/all-users', (req, res, next, lair) => {
  const data = lair.getAll('user', {
    depth: 1, 
    ignoreRelated: ['subject']
  });
  res.json(data);
});
```

**Single record:**

```typescript
import { Route } from '@swarm-host/server';
Route.get('/all-users/:id', 'user', {depth: 1, ignoreRelated: ['subject']});
```

It's equal to:

```typescript
import { Route } from '@swarm-host/server';
Route.createRoute('get', '/all-users', (req, res, next, lair) => {
  const data = lair.getOne('user', req.params.id, {
    depth: 1, 
    ignoreRelated: ['subject']
  });
  res.json(data);
});
```

_Only routes with a single dynamic part are supported for `Route.get` used to get a single record._

#### `post`

Predefined route `post` is used to create a record of the given type.

```typescript
import { Route } from '@swarm-host/server';
Route.post('/all-users', 'user', {depth: 1});
```

It's equal to:

```typescript
import { Route } from '@swarm-host/server';
Route.createRoute('post', '/all-users', (req, res, next, lair) => {
  const data = lair.createOne('user', req.body, {depth: 1});
  res.json(data);
});
```

#### `put`, `patch`

Both predefined routes can be used to update a record of the given type by its `id`.

```typescript
import { Route } from '@swarm-host/server';
Route.patch('/all-users/:id', 'user', {depth: 1});
```

It's equal to:

```typescript
import { Route } from '@swarm-host/server';
Route.createRoute('patch', '/all-users/:id', (req, res, next, lair) => {
  const data = lair.updateOne('user', req.params.id, req.body, {depth: 1});
  res.json(data);
});
```

#### `delete`

Predefined route `delete` is used to delete a single record of the given type by its `id`.

```typescript
import { Route } from '@swarm-host/server';
Route.delete('/all-users', 'user');
```

It's equal to:

```typescript
import { Route } from '@swarm-host/server';
Route.createRoute('delete', '/all-users/:id', (req, res, next, lair) => {
  lair.deleteOne('user', req.params.id);
  res.json({});
});
```

#### Extra handler for predefined routes

Each predefined route takes extra parameter. It's a function used to serialize result of the proper Lair's method. This function takes 4 parameters:

* `req` - express.js Request
* `res` - express.js Response
* `data` - result of Lair's method execution
* `lair` - Lair instance
 
By default next function is used as extra-handler:


```typescript
function handler(req, res, data, lair) {
  res.json(data);
}
```

Both Routes bellow are doing the same:

```typescript
import { Route } from '@swarm-host/server';
Route.get('/all-users', 'user', {depth: 1});
```

```typescript
import { Route } from '@swarm-host/server';
Route.get('/all-users', 'user', {depth: 1}, (req, res, data, lair) => {
  res.json(data);
});
```

Such extra-handlers are useful to serialize data before sending them in the Response.

### Complex example

```typescript
import { Server, Factory, Route, field } from '@swarm-host/server';
import { name, random } from 'faker'; // npm i faker --save
const server = Server.getServer();
server.namespace = '/api/v1';
server.port = 12345;
server.verbose = true;
server.delay = 200;

class UserFactory extends Factory{
  
  static factoryName = 'user';
  
  @field()
  get name() {
    return name.firstName();
  }

  @field()
  get age() {
    return random.number({min: 1, max: 99});
  }
}
server.addFactory(new UserFactory());

const UsersRoute = Route.createRoute('get', '/all-users', (req, res, next, lair) => {
  const users = lair.getAll('user');
  res.json({
    data: users
  });
});
server.addRoute(UsersRoute);

server.startServer();
```
