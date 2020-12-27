import Hapi from '@hapi/hapi';

export interface Route {
  readonly prefix: string;
  readonly name: string;
  setup(server: Hapi.Server): void;
}
