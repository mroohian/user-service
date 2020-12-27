import { injectable } from 'inversify';
import Hapi from '@hapi/hapi';
import * as apiBase from '../lib/api-base';

@injectable()
export class DefaultRoute implements apiBase.routes.Route {
  public readonly name = 'default';
  public readonly prefix = '/';

  public setup(server: Hapi.Server): void {
    server.route({
      method: 'GET',
      path: '/',
      handler: (_request, h) => {
        return h.redirect('/api/v1');
      },
    });
  }
}
