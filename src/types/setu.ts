// ==========================================
// SETU (Bridge): Human Intent → Verified Action
// Core Domain Types & Scalable Schema
// ==========================================

export type IntentSource = 'text' | 'voice' | 'document' | 'preset';

export interface MultimodalPayload {
  source: IntentSource;
  rawText: string;
  audioBlobUrl?: string;
  audioDurationSeconds?: number;
  documentFile?: {
    name: string;
    size: number;
    mimeType: string;
    previewUrl?: string;
    extractedText?: string;
  };
  contextTags: string[];
}

export interface Actor {
  id: string;
  name: string;
  role: string;
  authorizationLevel: 'VIEWER' | 'OPERATOR' | 'ADMIN' | 'DUAL_KEY';
  avatar?: string;
}

export interface SystemEntity {
  id: string;
  name: string;
  type: 'service' | 'database' | 'queue' | 'calendar' | 'email' | 'budget' | 'iam_role' | 'emergency_dispatch' | 'shelter_mgmt' | 'medical_triage' | 'evacuation_corridor';
  status: 'healthy' | 'degraded' | 'locked' | 'unreachable';
  environment: 'production' | 'staging' | 'sandbox';
  currentVersion?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SituationModel {
  id: string;
  timestamp: string;
  summary: string;
  actors: Actor[];
  targetSystems: SystemEntity[];
  activeConstraints: Constraint[];
  operationalRiskScore: number; // 0 - 100
  blastRadius: 'ISOLATED' | 'TEAM' | 'CROSS_SYSTEM' | 'GLOBAL_PRODUCTION';
  environmentalState: Record<string, any>;
}

export interface Constraint {
  id: string;
  title: string;
  description: string;
  severity: 'POLICY' | 'CRITICAL' | 'COMPLIANCE' | 'TEMPORAL';
  isViolated: boolean;
  violationReason?: string;
}

export interface VerificationCheck {
  id: string;
  name: string;
  type: 'PRE_CHECK' | 'INVARIANT' | 'POST_CHECK' | 'SIMULATION_PROOF';
  status: 'PENDING' | 'PASS' | 'FAIL' | 'SKIPPED';
  assertion: string;
  evidenceHash?: string;
  latencyMs?: number;
  resultDetails?: string;
}

export interface AmbiguityAlert {
  id: string;
  field: string;
  question: string;
  clarificationOptions: {
    id: string;
    label: string;
    impactDescription: string;
    isRecommended?: boolean;
  }[];
  selectedOptionId?: string;
  resolved: boolean;
}

export interface ConflictItem {
  id: string;
  severity: 'WARNING' | 'CRITICAL_BLOCKER';
  title: string;
  description: string;
  conflictingEntities: string[];
  remediationSuggestion: string;
  requiresDualSignoff: boolean;
  isOverridden: boolean;
}

export type ActionType = 
  | 'GOOGLE_CLOUD_DEPLOY'
  | 'GOOGLE_CLOUD_ROLLBACK'
  | 'GOOGLE_WORKSPACE_CALENDAR'
  | 'GOOGLE_WORKSPACE_GMAIL'
  | 'DATABASE_SNAPSHOT'
  | 'DATABASE_MIGRATION'
  | 'IAM_CREDENTIAL_REVOKE'
  | 'FINANCIAL_PO_APPROVE'
  | 'WEBHOOK_DISPATCH'
  | 'EMERGENCY_DISPATCH_ALERT'
  | 'ROUTE_ACCESSIBILITY_VERIFY'
  | 'RESOURCE_ALLOCATION'
  | 'CIVIL_SAFETY_BROADCAST';

export type ActionStatus = 
  | 'PENDING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'CONFLICT_BLOCKED'
  | 'WAITING_HUMAN_SIGN_OFF'
  | 'SIMULATED'
  | 'EXECUTING'
  | 'SUCCESS'
  | 'FAILED'
  | 'ROLLED_BACK';

export interface ActionNode {
  id: string;
  title: string;
  actionType: ActionType;
  description: string;
  targetService: string;
  status: ActionStatus;
  isIrreversible: boolean;
  requiresDualSignoff: boolean;
  dependencies: string[]; // IDs of preceding nodes
  parameters: Record<string, any>;
  verificationChecks: VerificationCheck[];
  rollbackAction?: {
    title: string;
    procedure: string;
    automated: boolean;
  };
  simulationResult?: {
    diffBefore: Record<string, any>;
    diffAfter: Record<string, any>;
    simulatedLatencyMs: number;
    passedInvariants: boolean;
  };
  executionReceipt?: {
    executedAt: string;
    connectorMode: 'SIMULATED_DRY_RUN' | 'AUTHENTICATED_LIVE';
    proofHash: string;
    externalResourceId?: string;
    liveServiceResponse?: any;
    disclaimer: string;
  };
}

export interface ActionGraph {
  id: string;
  intentId: string;
  nodes: ActionNode[];
  createdAt: string;
  overallState: 'PLANNING' | 'VERIFIED' | 'CONFLICT' | 'EXECUTING' | 'COMPLETED';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  eventType: 
    | 'INTENT_INGESTED' 
    | 'REASONING_COMPLETED' 
    | 'VERIFICATION_PASSED' 
    | 'VERIFICATION_FAILED' 
    | 'CONFLICT_DETECTED' 
    | 'HUMAN_APPROVAL_GRANTED' 
    | 'SIMULATION_EXECUTED' 
    | 'ACTION_EXECUTED' 
    | 'ROLLBACK_TRIGGERED';
  nodeId?: string;
  details: string;
  evidenceHash: string;
  previousHash: string;
  isIntegrityVerified?: boolean;
}

export interface GeminiReasoningOutput {
  intentSummary: string;
  decomposedGoals: string[];
  confidenceScore: number; // 0 - 100
  reasoningChain: string[];
  situation: SituationModel;
  actionGraph: ActionGraph;
  ambiguities: AmbiguityAlert[];
  conflicts: ConflictItem[];
}

export interface PresetScenario {
  id: string;
  category: 'EMERGENCY_RESPONSE' | 'INFRASTRUCTURE' | 'FINANCE' | 'WORKPLACE' | 'SECURITY';
  title: string;
  description: string;
  prompt: string;
  sourceType: IntentSource;
  sampleDocumentName?: string;
  sampleDocumentContent?: string;
  highlight: string;
}
