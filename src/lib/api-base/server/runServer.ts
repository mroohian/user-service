import { Container } from 'inversify';

import { LibContainer } from '../di/LibContainer';
import { INTERNAL_TYPES } from '../di/INTERNAL_TYPES';
import { Server } from './Server';

export const runServer = (): void => {
  const container = LibContainer.get<Container>(INTERNAL_TYPES.ServiceContainer);

  const server = container.resolve(Server);
  server.run();
};
