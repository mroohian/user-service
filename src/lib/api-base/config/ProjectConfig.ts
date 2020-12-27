export interface ProjectConfig {
  name: string;
  version: string;
  config: {
    port: number;
  };
}

export const getProjectConfig = (): ProjectConfig => {
  return {
    name: process.env.npm_package_name,
    version: process.env.npm_package_version,
    config: {
      port: parseInt(process.env.npm_package_config_port ?? '80', 10),
    },
  } as ProjectConfig;
};
