export interface SystemConfig {
  readonly environment: string;
  readonly defaultCurrency: string;
  readonly vatRate: number;
  readonly maxOrderQuantity: number;
}

export class SystemConfigurationManager {
  private static instance: SystemConfigurationManager;
  private readonly config: SystemConfig;

  private constructor() {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      defaultCurrency: 'USD',
      vatRate: 0.05,
      maxOrderQuantity: 100000,
    };
  }

  public static getInstance(): SystemConfigurationManager {
    if (!SystemConfigurationManager.instance) {
      SystemConfigurationManager.instance = new SystemConfigurationManager();
    }
    return SystemConfigurationManager.instance;
  }

  public getConfig(): SystemConfig {
    return this.config;
  }
}
