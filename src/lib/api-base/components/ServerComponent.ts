export interface ServerComponent {
  init(): Promise<void>;
  dispose(): Promise<void>;
}
