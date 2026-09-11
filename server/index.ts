import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GeminiReasoningEngine } from '../src/services/geminiReasoningEngine';
import { connectorRegistry } from '../src/services/connectors/connectorRegistry';
import { auditService } from '../src/services/auditService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'SETU Kernel',
    tagline: 'Human Intent -> Verified Action',
    timestamp: new Date().toISOString(),
    connectorsAvailable: connectorRegistry.getAllConnectors().map(c => c.serviceName)
  });
});

// Gemini Reasoning & Situation Modeling endpoint
app.post('/api/intent/analyze', async (req, res) => {
  try {
    const { payload, apiKey } = req.body;
    if (!payload || !payload.rawText) {
      return res.status(400).json({ error: 'Payload with rawText is required.' });
    }

    const reasoning = await GeminiReasoningEngine.getInstance().analyzeIntent(payload, apiKey);

    // Record audit event
    await auditService.recordEvent({
      actorId: 'usr-operator',
      actorName: 'Operator',
      eventType: 'INTENT_INGESTED',
      details: `Ingested intent [${payload.source}]: "${payload.rawText.substring(0, 80)}"`,
      rawPayload: payload
    });

    await auditService.recordEvent({
      actorId: 'gemini-engine',
      actorName: 'Gemini 2.5 Flash',
      eventType: 'REASONING_COMPLETED',
      details: `Reasoning finalized with confidence score: ${reasoning.confidenceScore}%. Action graph synthesized with ${reasoning.actionGraph.nodes.length} nodes.`,
      rawPayload: reasoning.situation
    });

    res.json(reasoning);
  } catch (error: any) {
    console.error('Intent analysis error:', error);
    res.status(500).json({ error: error.message || 'Internal reasoning error' });
  }
});

// Action Dry-run Simulation endpoint
app.post('/api/actions/simulate', async (req, res) => {
  try {
    const { action } = req.body;
    if (!action) return res.status(400).json({ error: 'Action node required.' });

    const result = await connectorRegistry.simulateAction(action);

    await auditService.recordEvent({
      actorId: 'sim-engine',
      actorName: 'SETU Simulation Sandbox',
      eventType: 'SIMULATION_EXECUTED',
      nodeId: action.id,
      details: `Dry-run simulated for "${action.title}". Proof Hash: ${result.proofHash.substring(0, 16)}...`,
      rawPayload: result
    });

    res.json(result);
  } catch (error: any) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Action Execution endpoint
app.post('/api/actions/execute', async (req, res) => {
  try {
    const { action } = req.body;
    if (!action) return res.status(400).json({ error: 'Action node required.' });

    const result = await connectorRegistry.executeAction(action);

    await auditService.recordEvent({
      actorId: 'usr-signoff',
      actorName: 'Verified Operator',
      eventType: 'ACTION_EXECUTED',
      nodeId: action.id,
      details: `Action executed [${result.connectorMode}]: "${action.title}". Status: ${result.success ? 'SUCCESS' : 'FAILED'}`,
      rawPayload: result
    });

    res.json(result);
  } catch (error: any) {
    console.error('Execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Audit trail endpoints
app.get('/api/audit/logs', (req, res) => {
  res.json(auditService.getEntries());
});

app.post('/api/audit/verify', async (req, res) => {
  const check = await auditService.verifyFullChain();
  res.json(check);
});

app.listen(PORT, () => {
  console.log(`[SETU] Backend Server running on http://localhost:${PORT}`);
});
