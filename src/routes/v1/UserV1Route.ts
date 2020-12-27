import { injectable } from 'inversify';
import { Server } from '@hapi/hapi';
import * as apiBase from '../../lib/api-base';
// import { Database } from '../../lib/api-mongoose';

@injectable()
export class UserV1Route implements apiBase.routes.Route {
  public readonly name = 'userV1';
  public readonly prefix = '/api/v1/user';

  /* private database: Database;

  public constructor(database: Database) {
    this.database = database;
  } */

  public setup(server: Server): void {
    server.route({
      path: '/',
      method: 'GET',
      handler: () => {
        const response: apiBase.rest.ApiResponse<unknown> = {
          success: true,
          value: {
            TODO: 'data',
          },
          status: apiBase.rest.HttpStatusCodes.get(200),
        };

        return response;
      },
    });
  }
}
