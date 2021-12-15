import server from './server';

server.addRoutesFromDir(`${__dirname}/routes`).then(() => {
  server.addFactoriesFromDir(`${__dirname}/factories`).then(() => {
    server.startServer();
  });
});
