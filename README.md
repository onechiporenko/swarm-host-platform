# Swarm Host Platform

[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fonechiporenko%2Fswarm-host-platform%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/onechiporenko/swarm-host-platform/master)
[![CI](https://github.com/onechiporenko/swarm-host-platform/actions/workflows/nodejs.yml/badge.svg)](https://github.com/onechiporenko/swarm-host-platform/actions/workflows/nodejs.yml)

## About

Monorepo for fake-server, its DB and CLI to work with it.

## Usage

Install CLI:

```bash
npm i -g @swarm-host/cli
```

Init a new project:

```bash
mkdir my-new-fake-server
cd my-new-fake-server
swarm-host init
```

Create some factories and routes:

```bash
swarm-host g route users
swarm-host g route user
```

Start your server:

```bash
npm run start
```

Check your server `http://localhost:54321`.

## More information:

* [CLI](https://github.com/onechiporenko/swarm-host-platform/tree/master/packages/cli)
* [Lair](https://github.com/onechiporenko/swarm-host-platform/tree/master/packages/lair)
* [Server](https://github.com/onechiporenko/swarm-host-platform/tree/master/packages/server)
