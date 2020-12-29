import { injectable, inject } from 'inversify';
import mongoose, { ConnectOptions, Mongoose } from 'mongoose';

import { TYPES } from './TYPES';

@injectable()
export class Database {
  private readonly connectionString: string;
  private readonly connectOptions: mongoose.ConnectOptions;
  private _mongoose?: Mongoose;

  public constructor(
    @inject(TYPES.ConnectionString) connectionString: string,
    @inject(TYPES.ConnectOptions) connectOptions?: ConnectOptions,
  ) {
    this.connectionString = connectionString;
    this.connectOptions = connectOptions ?? {};
  }

  public get mongoose(): Mongoose | undefined {
    return this._mongoose;
  }

  public get isConnected(): boolean {
    return this._mongoose?.connection.readyState === 1;
  }

  public async init(): Promise<void> {
    const connectOptions: ConnectOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,

      ...this.connectOptions,
    };

    this._mongoose = await mongoose.connect(this.connectionString, connectOptions);

    this._mongoose.connection.on('error', () => {
      console.error.bind(console, 'MongoDB Connection error');
    });

    console.log('init db. connected:', this.isConnected);
  }

  public async dispose(): Promise<void> {
    if (this._mongoose) {
      this._mongoose.modelNames().forEach((modelName) => {
        this._mongoose?.deleteModel(modelName);
      });

      await this._mongoose.disconnect();
    }

    console.log('cleaned up db. connected:', this.isConnected);
  }
}
