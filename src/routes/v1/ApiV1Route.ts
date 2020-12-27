import { injectable, inject } from 'inversify';
import Hapi from '@hapi/hapi';
import * as apiBase from '../../lib/api-base';
import { Database } from '../../lib/api-mongoose';

@injectable()
export class ApiV1Route implements apiBase.routes.Route {
  public readonly name = 'apiV1';
  public readonly prefix = '/api/v1';

  private readonly database: Database;
  private readonly projectConfig: apiBase.config.ProjectConfig;

  public constructor(
    database: Database,
    @inject(apiBase.TYPES.ProjectConfig) projectConfig: apiBase.config.ProjectConfig,
  ) {
    this.database = database;
    this.projectConfig = projectConfig;
  }

  public setup(server: Hapi.Server): void {
    server.route({
      method: 'GET',
      path: '/',
      handler: () => {
        const response: apiBase.rest.ApiResponse<unknown> = {
          success: true,
          value: {
            name: this.projectConfig.name,
            version: this.projectConfig.version,
          },
          status: apiBase.rest.HttpStatusCodes.get(200),
        };

        return response;
      },
    });

    server.route({
      method: 'GET',
      path: '/healthcheck',
      handler: () => {
        // check the status of service. e.g. DB is connected
        const success = this.database.isConnected;

        const response: apiBase.rest.ApiResponse = {
          success,
          status: apiBase.rest.HttpStatusCodes.get(success ? 200 : 503),
        };

        return response;
      },
    });
  }
}
