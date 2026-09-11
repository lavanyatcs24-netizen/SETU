import { ActionNode } from '../../types/setu';
import { sha256 } from '../../utils/crypto';

export interface ConnectorExecutionResult {
  success: boolean;
  connectorMode: 'SIMULATED_DRY_RUN' | 'AUTHENTICATED_LIVE';
  proofHash: string;
  externalResourceId?: string;
  diffBefore: Record<string, any>;
  diffAfter: Record<string, any>;
  executionLatencyMs: number;
  message: string;
  disclaimer: string;
  livePayload?: any;
}

export interface IConnector {
  serviceName: string;
  isLiveConfigured: boolean;
  canHandle(actionType: string): boolean;
  simulate(action: ActionNode): Promise<ConnectorExecutionResult>;
  execute(action: ActionNode, credentials?: Record<string, string>): Promise<ConnectorExecutionResult>;
}

export abstract class BaseConnector implements IConnector {
  abstract serviceName: string;
  isLiveConfigured: boolean = false;

  abstract canHandle(actionType: string): boolean;
  abstract simulate(action: ActionNode): Promise<ConnectorExecutionResult>;
  abstract execute(action: ActionNode, credentials?: Record<string, string>): Promise<ConnectorExecutionResult>;

  protected async generateProof(action: ActionNode, mode: string, details: any): Promise<string> {
    const payload = JSON.stringify({
      actionId: action.id,
      service: this.serviceName,
      mode,
      timestamp: new Date().toISOString(),
      details,
    });
    return sha256(payload);
  }
}
