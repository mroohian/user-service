import './lib/api-base/polyfill';
import config from 'config';
import * as apiBase from './lib/api-base';
import * as apiMongoose from './lib/api-mongoose';

import { DefaultRoute } from './routes/DefaultRoute';
import { ApiV1Route } from './routes/v1/ApiV1Route';
import { UserV1Route } from './routes/v1/UserV1Route';
import { ConnectOptions } from 'mongoose';

apiBase.server.setupServer((context) => {
  // Components

  context.registerServerComponent(apiMongoose.Database);

  // Routes
  context.registerRoute(DefaultRoute);
  context.registerRoute(ApiV1Route);
  context.registerRoute(UserV1Route);

  // Misc.
  const connectionString = config.get<string>('dbConfig.connectionString') ?? 'mongodb://localhost/reza-web';
  context.container.bind<string>(apiMongoose.TYPES.ConnectionString).toConstantValue(connectionString);

  const connectOptions: apiMongoose.ConnectOptions = {};
  context.container.bind<ConnectOptions>(apiMongoose.TYPES.ConnectOptions).toConstantValue(connectOptions);
});

apiBase.server.runServer();
