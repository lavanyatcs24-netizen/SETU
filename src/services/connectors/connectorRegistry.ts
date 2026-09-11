import { IConnector, ConnectorExecutionResult } from './baseConnector';
import { GoogleCloudConnector } from './googleCloudConnector';
import { GoogleWorkspaceConnector } from './googleWorkspaceConnector';
import { DatabaseConnector } from './databaseConnector';
import { WebhookConnector } from './webhookConnector';
import { ActionNode } from '../../types/setu';

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: IConnector[] = [];
  private credentials: Record<string, string> = {};

  private constructor() {
    this.connectors = [
      new GoogleCloudConnector(),
      new GoogleWorkspaceConnector(),
      new DatabaseConnector(),
      new WebhookConnector(),
    ];
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  public setCredential(key: string, value: string): void {
    this.credentials[key] = value;
    // Update live configured flags
    if (key === 'GEMINI_API_KEY' || key === 'VITE_GEMINI_API_KEY') {
      // GenAI configured
    }
    if (key === 'GCP_PROJECT_ID' || key === 'GOOGLE_CLOUD_TOKEN') {
      const gcp = this.connectors.find(c => c instanceof GoogleCloudConnector);
      if (gcp) gcp.isLiveConfigured = Boolean(value);
    }
    if (key === 'GOOGLE_WORKSPACE_TOKEN') {
      const gw = this.connectors.find(c => c instanceof GoogleWorkspaceConnector);
      if (gw) gw.isLiveConfigured = Boolean(value);
    }
  }

  public getCredentials(): Record<string, string> {
    return { ...this.credentials };
  }

  public getConnectorForAction(actionType: string): IConnector | undefined {
    return this.connectors.find(c => c.canHandle(actionType));
  }

  public getAllConnectors(): IConnector[] {
    return this.connectors;
  }

  public async simulateAction(action: ActionNode): Promise<ConnectorExecutionResult> {
    const connector = this.getConnectorForAction(action.actionType);
    if (!connector) {
      throw new Error(`No connector registered for action type: ${action.actionType}`);
    }
    return connector.simulate(action);
  }

  public async executeAction(action: ActionNode): Promise<ConnectorExecutionResult> {
    const connector = this.getConnectorForAction(action.actionType);
    if (!connector) {
      throw new Error(`No connector registered for action type: ${action.actionType}`);
    }
    return connector.execute(action, this.credentials);
  }
}

export const connectorRegistry = ConnectorRegistry.getInstance();
