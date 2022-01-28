import server from './app/server';
import { PORT, PREFIX } from './tests/consts';

export async function mochaGlobalSetup(): Promise<void> {
  server.port = PORT;
  server.namespace = PREFIX;
  return new Promise((resolve) => {
    server.startServer(() => resolve());
  });
}

export async function mochaGlobalTeardown(): Promise<void> {
  return new Promise((resolve) => {
    server.stopServer(() => resolve());
  });
}
