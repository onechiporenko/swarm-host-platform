import server from './app/server';
import serverSetup from './server-setup';
import { PORT } from './tests/consts';

export async function mochaGlobalSetup(): Promise<void> {
  server.port = PORT;
  await server.addRoutesFromDir(`${__dirname}/app/routes`);
  await server.addFactoriesFromDir(`${__dirname}/app/factories`);
  serverSetup(server);
  return new Promise((resolve) => {
    server.startServer(() => {
      resolve();
    });
  });
}

export async function mochaGlobalTeardown(): Promise<void> {
  return new Promise((resolve) => {
    server.stopServer(() => resolve());
  });
}
