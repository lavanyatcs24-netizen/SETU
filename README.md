# सेतु SETU — Human Intent → Verified Action

> **Autonomous Enterprise Action Verification & Execution Engine**  
> *Built for PromptWars × TechVerse Hackathon*

---

## 🎯 What is SETU?

In Sanskrit and Hindi, **SETU (सेतु)** means **"Bridge"**.

AI agents frequently hallucinate actions, fail to check operational invariants, lack verifiable audit trails, or execute destructive API calls with uncontrolled blast radiuses. 

**SETU bridges the gap between raw, unstructured Human Intent and cryptographically Verified Action:**
1. **Multimodal Intent Ingestion**: Ingests intent via natural language, live streaming voice with real-time audio waveform visualizers, and operational context documents (incident alerts, purchase orders, security advisories).
2. **Gemini Reasoning & Situation Modeling**: Decomposes high-level intent into verified sub-goals, maps target system entities, identifies operational blast radius (Isolated, Team, Cross-System, Global Production), and calculates real-time risk scores (0–100).
3. **Evidence & Verification Engine**: Enforces concrete pre-checks, runtime invariants, and post-execution assertions before any mutation occurs.
4. **Uncertainty & Ambiguity Resolution**: Detects underspecified operational paths and presents structured clarification choices that dynamically rebalance the execution graph.
5. **Policy & Conflict Gates**: Flags irreversible actions, SOX spend thresholds, and resource collisions, requiring explicit Dual-Key human sign-off.
6. **Interactive DAG Action Graph**: Visualizes topological execution dependencies, pre-flight dry-run simulation diffs, and automated rollback safety plans.
7. **Modular Connector Layer**: Pluggable architecture for Google Cloud Platform (Cloud Run, IAM), Google Workspace (Calendar, Gmail), Cloud SQL, and Webhooks.
8. **No Fake Claims Principle (Rule #7)**: Strictly distinguishes between verified dry-run sandbox simulations and authenticated live API mutations.
9. **Tamper-Evident Immutable Audit Trail**: Every event and state diff is anchored into a SHA-256 chained cryptographic ledger with 1-click on-chain integrity verification.

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### Run Locally

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Run Fullstack Dev Server (Node API + Vite UI concurrently)
npm run dev
```

- **Frontend Mission Control**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:3001](http://localhost:3001)

---

## 📦 Preset Demonstration Scenarios

SETU ships with 4 operational scenarios ready to test out-of-the-box:

1. **GCP Production Incident Rollback**:
   - *Trigger*: 14.2% HTTP 500 error spike on `auth-gateway-prod` post-deploy v2.4.1.
   - *Gates*: Validates PostgreSQL replica lag (<150ms invariant), dry-run simulates revision traffic reroute, enforces Dual-Key signoff for irreversible production traffic change, and alerts Slack.
2. **Enterprise Procurement PO Approval**:
   - *Trigger*: Purchase Order PO-8849 ($42,500 Cloudflare Interconnect).
   - *Gates*: Ingests PDF/JSON PO, checks NetSuite budget surplus, blocks execution on SOX single-operator threshold violation ($25,000 policy gate), and unlocks only on VP signature.
3. **Executive Calendar Rebalance**:
   - *Trigger*: CTO emergency Tier-1 customer sync collision at tomorrow 2:00 PM.
   - *Gates*: Scans Free/Busy calendar invariants, identifies mutually open alternate slot, shifts internal 1:1, and generates Google Meet links.
4. **Zero-Trust Security Revocation**:
   - *Trigger*: Compromised contractor account credentials detected in threat feed.
   - *Gates*: Rapid identity quarantine across GCP IAM and Cloud SQL connection termination with non-repudiable SHA-256 evidence chain.

---

## 🛠️ Architecture Overview

```
SETU Core
├── server/
│   └── index.ts                 # Express API server (Reasoning, Simulation, Execution, Audit)
└── src/
    ├── types/setu.ts            # Domain schemas (Multimodal, SituationModel, ActionDAG, Audit)
    ├── services/
    │   ├── geminiReasoningEngine.ts # Gemini 2.5 Flash structured API + local deterministic fallback
    │   ├── auditService.ts      # Cryptographically chained SHA-256 immutable audit ledger
    │   └── connectors/          # Pluggable Google Cloud, Workspace, DB, and Webhook connectors
    │       ├── baseConnector.ts
    │       ├── connectorRegistry.ts
    │       ├── googleCloudConnector.ts
    │       ├── googleWorkspaceConnector.ts
    │       ├── databaseConnector.ts
    │       └── webhookConnector.ts
    ├── components/              # Premium cyberpunk / mission-control interface
    │   ├── Header.tsx           # Telemetry, preset pills, status indicators
    │   ├── MultimodalInput.tsx  # Natural language, voice recorder + waveform canvas, document dropzone
    │   ├── SituationPanel.tsx   # Risk score gauges, blast radius, target systems, invariants
    │   ├── AmbiguityAndConflicts.tsx # Dynamic ambiguity resolution & policy gate overrides
    │   ├── ActionGraphDAG.tsx   # Visual DAG execution graph with dry-run triggers
    │   ├── NodeInspectorModal.tsx # Deep inspection drawer, simulation diffs, rollback plans
    │   ├── AuditTrailViewer.tsx # Tamper-evident ledger with live SHA-256 integrity validation
    │   └── SettingsModal.tsx    # Live Gemini & Google credentials configuration
    └── data/
        └── presetScenarios.ts   # Hackathon preset demonstration blueprints
```

---

## 🔒 Cryptographic Audit Verification

Every action executed in SETU produces a tamper-evident audit record:
$$\text{Hash}_n = \text{SHA256}(\text{BlockId} \parallel \text{Timestamp} \parallel \text{Actor} \parallel \text{EventType} \parallel \text{EvidenceHash} \parallel \text{Hash}_{n-1})$$

Click the **"Audit Chain"** badge in the navigation bar and click **"Verify Cryptographic Integrity"** to execute a full Web Crypto SHA-256 chain re-computation from Genesis through the latest block.
