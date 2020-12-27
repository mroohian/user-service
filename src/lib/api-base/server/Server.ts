import { injectable, inject, multiInject } from 'inversify';
import * as Hapi from '@hapi/hapi';
import { Boom } from '@hapi/boom';

import { TYPES } from '..';
import { INTERNAL_TYPES } from '../di/INTERNAL_TYPES';
import { ApiError, ApiResponse, HttpStatusCodes } from '../rest';
import { ProjectConfig } from '../config';
import { Route } from '../routes';
import { ServerComponent } from '../components';

@injectable()
export class Server {
  private readonly routes: Route[];
  private readonly serverComponents: ServerComponent[];
  private readonly server: Hapi.Server;

  public constructor(
    @inject(TYPES.ProjectConfig) projectConfig: ProjectConfig,
    @multiInject(INTERNAL_TYPES.Route) routes: Route[],
    @multiInject(INTERNAL_TYPES.ServerComponent) serverComponents: ServerComponent[],
  ) {
    this.routes = routes;
    this.serverComponents = serverComponents;

    this.server = Hapi.server({
      port: projectConfig.config.port,
      host: '::0',
    });

    this.setupOnPreResponse();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isApiResponse(response: any): response is ApiResponse<unknown> {
    return typeof response == 'object' && 'success' in response && 'status' in response;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isBoom(response: any): response is Boom {
    return response instanceof Boom && response.isBoom;
  }

  private setupOnPreResponse(): void {
    this.server.ext('onPreResponse', (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const response = request.response;

      if (this.isBoom(response)) {
        let statusCode: number;
        let message: string;
        let headers: Record<string, string> = {};

        if (response instanceof ApiError) {
          statusCode = response.statusCode;
          message = response.message;
          if (response?.config?.headers) {
            headers = response.config.headers;
          }
        } else {
          statusCode = response.output.statusCode;
          message = response.message ? response.toString() : response.output.payload.message;
        }

        const errorResponse: ApiResponse = {
          success: false,
          status: HttpStatusCodes.get(statusCode),
          messages: [message],
        };

        const output = h.response(errorResponse).code(statusCode);

        Object.entries(headers).forEach(([name, value]) => output.header(name, value));

        return output;
      }

      if (this.isApiResponse(response.source)) {
        response.code(response.source.status.code);
      }

      return h.continue;
    });
  }

  private async startServer(): Promise<void> {
    process.on('unhandledRejection', (err) => {
      console.log(err);
      process.exit(1);
    });

    process.on('SIGTERM', async () => {
      console.info('SIGTERM signal received.');
      await this.stopServer();
    });

    process.on('SIGINT', async () => {
      console.info('SIGINT signal received.');
      await this.stopServer();
    });

    await this.server.start();
    console.log('Server running on %s', this.server.info.uri);
  }

  private async stopServer(): Promise<void> {
    console.log('Stopping server...');

    try {
      await this.server.stop();

      for (const serverComponent of this.serverComponents) {
        await serverComponent.dispose();
      }

      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  private async registerRouteAsPlugin(route: Route): Promise<void> {
    const { name, prefix } = route;
    const routeName = `${name}-route`;

    if (routeName in this.server.registrations) {
      throw new Error(`Route '${name}' is registered more than once.`);
    }

    const config = /^\/.+/.test(prefix)
      ? {
          routes: {
            prefix: prefix,
          },
        }
      : undefined;

    await this.server.register(
      {
        name: routeName,
        version: 'dynamic',
        register: route.setup.bind(route),
      },
      config,
    );
  }

  public async run(): Promise<void> {
    for (const serverComponent of this.serverComponents) {
      await serverComponent.init();
    }

    for (const route of this.routes) {
      await this.registerRouteAsPlugin(route);
    }

    await this.startServer();
  }
}
