import { PresetScenario } from '../types/setu';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'scenario-incident-rollback',
    category: 'INFRASTRUCTURE',
    title: 'GCP Production Incident: Cloud Run Rollback & DB Health Gate',
    description: 'High 500 error spike detected on auth-gateway-prod following deploy v2.4.1. Roll back to stable v2.4.0, verify PostgreSQL replica lag, and broadcast status to Slack #incident-response.',
    prompt: 'Production authentication is throwing errors. If the latest deployment is responsible, safely restore the last healthy version.',
    sourceType: 'preset',
    sampleDocumentName: 'pagerduty-incident-p1-89302.json',
    sampleDocumentContent: `{
  "incident_id": "INC-89302",
  "severity": "P1-CRITICAL",
  "service": "auth-gateway-prod",
  "current_revision": "auth-gateway-prod-00042-xyz",
  "error_rate": "14.2%",
  "trigger": "HTTP 500 Spike post-deploy v2.4.1",
  "affected_users": 18450,
  "cluster_region": "us-central1"
}`,
    highlight: 'Dual-gate verification: Asserts DB health before rollback, blocks irreversible traffic reroute without simulated latency check.'
  },
  {
    id: 'scenario-procurement-po',
    category: 'FINANCE',
    title: 'Enterprise Procurement: Multi-Cloud Egress PO Verification',
    description: 'Finance department purchase order for $42,500 cloud interconnect bandwidth. Must satisfy quarterly spend policy (<$50,000 threshold), require VP sign-off, and emit dry-run webhook.',
    prompt: 'Review and approve Purchase Order PO-8849 from Cloudflare for $42,500 dedicated interconnect egress. Verify available Q3 Cloud Ops budget remaining is above $60,000. Require dual VP authorization since amount exceeds $25,000 threshold. Emit webhook to NetSuite ERP upon approval.',
    sourceType: 'document',
    sampleDocumentName: 'PO-8849-Vendor-Invoice-Cloudflare.pdf',
    sampleDocumentContent: `PURCHASE ORDER: PO-8849
VENDOR: Cloudflare Inc.
ITEM: 100Gbps Direct Interconnect Dedicated Egress (Q3/Q4)
AMOUNT: $42,500.00 USD
BILLING CODE: ENG-INFRA-OPS-402
PAYMENT TERMS: Net 30
REQUESTOR: Sarah Chen (Principal SRE)`,
    highlight: 'Compliance & Policy gate: Flags financial threshold conflict (> $25k), halts automatic execution until VP signature is provided.'
  },
  {
    id: 'scenario-calendar-conflict',
    category: 'WORKPLACE',
    title: 'Executive Calendar Rebalance: Multi-Party Emergency Meeting',
    description: 'CTO schedule clash between Q3 Board Strategy Briefing and an urgent Tier-1 customer outage sync. Safely shift conflicting 1:1s, send Google Calendar updates, and confirm room availability.',
    prompt: 'CTO has an emergency Tier-1 customer outage sync requested by Enterprise Sales for tomorrow at 2:00 PM. She currently has an internal Engineering Lead 1:1 and Product Roadmap Review scheduled at that time. Reschedule the internal meetings to Thursday 11:00 AM, send calendar notifications to attendees, and verify no double-bookings occur.',
    sourceType: 'text',
    highlight: 'Uncertainty handling: Detects conflicting attendee timezone preference, asks clarifying confirmation before dispatching calendar invites.'
  },
  {
    id: 'scenario-security-revocation',
    category: 'SECURITY',
    title: 'Zero-Trust Revocation: Contractor IAM & Database Token Quarantine',
    description: 'Immediate credential revocation for compromised contractor account. Invalidate GCP OAuth tokens, revoke Cloud SQL service account access, and create a tamper-evident audit receipt.',
    prompt: 'Security incident SEC-409: Contractor account contractor-dev@setu-partner.io reported compromised in external credential leak. Immediately revoke all active GCP IAM tokens, expire active session keys, revoke Cloud SQL read privileges, and preserve cryptographic evidence audit proof.',
    sourceType: 'preset',
    sampleDocumentName: 'soc2-security-alert-sec409.json',
    sampleDocumentContent: `{
  "alert": "Compromised Credentials Detected",
  "threat_intel_source": "HaveIBeenPwned Enterprise Feed",
  "user": "contractor-dev@setu-partner.io",
  "risk_score": 98,
  "assigned_roles": ["roles/cloudsql.client", "roles/storage.objectViewer"],
  "recommended_action": "Immediate Quarantine & Revocation"
}`,
    highlight: 'Irreversible action with tamper-evident proof: Revokes access across GCP & Cloud SQL with non-repudiable audit signature.'
  }
];
