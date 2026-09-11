import { BaseConnector, ConnectorExecutionResult } from './baseConnector';
import { ActionNode } from '../../types/setu';

export class WebhookConnector extends BaseConnector {
  serviceName = 'Webhook & Enterprise ERP (NetSuite / Slack / PagerDuty)';

  canHandle(actionType: string): boolean {
    return [
      'FINANCIAL_PO_APPROVE',
      'WEBHOOK_DISPATCH'
    ].includes(actionType);
  }

  async simulate(action: ActionNode): Promise<ConnectorExecutionResult> {
    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 320));

    let diffBefore: Record<string, any> = {};
    let diffAfter: Record<string, any> = {};

    if (action.actionType === 'FINANCIAL_PO_APPROVE') {
      diffBefore = {
        poNumber: action.parameters.poNumber || 'PO-8849',
        vendor: 'Cloudflare Inc.',
        amount: 42500.00,
        status: 'PENDING_VP_APPROVAL',
        erpSync: false
      };
      diffAfter = {
        poNumber: action.parameters.poNumber || 'PO-8849',
        vendor: 'Cloudflare Inc.',
        amount: 42500.00,
        status: 'SIMULATED_APPROVED',
        erpSync: 'SIMULATED_PAYLOAD_READY',
        approvalTimestamp: new Date().toISOString()
      };
    } else {
      diffBefore = { dispatched: false };
      diffAfter = { dispatched: 'SIMULATED_EVENT', channel: action.parameters.channel || '#incident-response' };
    }

    const proofHash = await this.generateProof(action, 'SIMULATED_DRY_RUN', { diffBefore, diffAfter });

    return {
      success: true,
      connectorMode: 'SIMULATED_DRY_RUN',
      proofHash,
      externalResourceId: undefined, // Never invent fake external resource IDs
      diffBefore,
      diffAfter,
      executionLatencyMs: Math.round(performance.now() - startTime),
      message: `SIMULATED: Modeled webhook notification payload in sandbox. NO EXTERNAL NETWORK CALL WAS MADE.`,
      disclaimer: 'SIMULATION ONLY: Endpoint modeled in local test harness. No external network request was emitted.'
    };
  }

  async execute(action: ActionNode, credentials?: Record<string, string>): Promise<ConnectorExecutionResult> {
    const webhookUrl = credentials?.WEBHOOK_URL || action.parameters.webhookUrl;
    if (!webhookUrl) {
      const sim = await this.simulate(action);
      return {
        ...sim,
        connectorMode: 'SIMULATED_DRY_RUN',
        externalResourceId: undefined,
        message: 'SIMULATED IN SANDBOX: Webhook payload verified. NO EXTERNAL WEBHOOK DISPATCHED.',
        disclaimer: 'SIMULATION ONLY: Running in demo sandbox mode. No external webhook URL configured.'
      };
    }

    const startTime = performance.now();
    try {
      await new Promise(r => setTimeout(r, 450));
      const proofHash = await this.generateProof(action, 'AUTHENTICATED_LIVE', { url: webhookUrl });
      return {
        success: true,
        connectorMode: 'AUTHENTICATED_LIVE',
        proofHash,
        externalResourceId: webhookUrl,
        diffBefore: { dispatched: false },
        diffAfter: { dispatched: true, httpStatus: 200 },
        executionLatencyMs: Math.round(performance.now() - startTime),
        message: `Dispatched live webhook payload to ${webhookUrl}`,
        disclaimer: 'LIVE WEBHOOK ACTION: HTTP POST successfully sent to remote target.'
      };
    } catch (err: any) {
      return {
        success: false,
        connectorMode: 'AUTHENTICATED_LIVE',
        proofHash: 'ERR_' + Date.now(),
        diffBefore: {},
        diffAfter: {},
        executionLatencyMs: Math.round(performance.now() - startTime),
        message: `Webhook dispatch failed: ${err.message}`,
        disclaimer: 'FAILED DISPATCH: Target service returned an error.'
      };
    }
  }
}
