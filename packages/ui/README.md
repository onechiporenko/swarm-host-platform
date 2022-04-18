# UI

Default UI for `@swarm-host/server` that allows to do CRUD-operations.

## Install

```shell
git clone git@github.com:onechiporenko/swarm-host-platform.git
```

## Usage

Start your server:

```shell
cd you-server-dir
yarn run start
```

> It's a default command if your server was created via `@swarm-host/cli`.

Start this UI:

```shell
cd swarm-host-platform/packages/ui
yarn run start
```

Open browser and go to `http://localhost:4200`.

## Settings

By default, this UI uses host `http://localhost:54321` for API requests. Feel free to change it in the `app/adapters/application.ts` if your server uses another host or port.
