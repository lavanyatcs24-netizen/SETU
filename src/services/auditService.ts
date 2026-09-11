import { AuditEntry } from '../types/setu';
import { sha256, verifyAuditChain } from '../utils/crypto';

const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export class AuditService {
  private static instance: AuditService;
  private entries: AuditEntry[] = [];
  private listeners: Array<(entries: AuditEntry[]) => void> = [];

  private constructor() {
    this.initializeGenesis();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  private async initializeGenesis() {
    const timestamp = new Date(Date.now() - 3600000).toISOString();
    const evidenceHash = await sha256('SETU_GENESIS_ROOT_INITIALIZATION');
    const genesis: AuditEntry = {
      id: 'audit-block-0',
      timestamp,
      actorId: 'system-root',
      actorName: 'SETU Kernel',
      eventType: 'INTENT_INGESTED',
      details: 'Genesis cryptographic anchor established. Cryptographic chain of custody initialized.',
      evidenceHash,
      previousHash: GENESIS_PREV_HASH,
      isIntegrityVerified: true
    };
    this.entries = [genesis];
    this.notify();
  }

  public getEntries(): AuditEntry[] {
    return [...this.entries];
  }

  public subscribe(fn: (entries: AuditEntry[]) => void): () => void {
    this.listeners.push(fn);
    fn(this.getEntries());
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    const data = this.getEntries();
    this.listeners.forEach(fn => fn(data));
  }

  public async recordEvent(params: {
    actorId: string;
    actorName: string;
    eventType: AuditEntry['eventType'];
    details: string;
    nodeId?: string;
    rawPayload?: any;
  }): Promise<AuditEntry> {
    const lastEntry = this.entries[this.entries.length - 1];
    const previousHash = lastEntry 
      ? await sha256(`${lastEntry.id}:${lastEntry.timestamp}:${lastEntry.actorId}:${lastEntry.eventType}:${lastEntry.evidenceHash}:${lastEntry.previousHash}`)
      : GENESIS_PREV_HASH;

    const evidencePayload = JSON.stringify(params.rawPayload || { text: params.details, time: Date.now() });
    const evidenceHash = await sha256(evidencePayload);

    const newEntry: AuditEntry = {
      id: `audit-block-${this.entries.length}`,
      timestamp: new Date().toISOString(),
      actorId: params.actorId,
      actorName: params.actorName,
      eventType: params.eventType,
      details: params.details,
      nodeId: params.nodeId,
      evidenceHash,
      previousHash,
      isIntegrityVerified: true
    };

    this.entries.push(newEntry);
    this.notify();
    return newEntry;
  }

  public async verifyFullChain(): Promise<{ isValid: boolean; brokenIndex?: number; count: number }> {
    const result = await verifyAuditChain(this.entries);
    const isValid = result.isValid;
    this.entries = this.entries.map(e => ({ ...e, isIntegrityVerified: isValid }));
    this.notify();
    return {
      isValid,
      brokenIndex: result.brokenAtIndex,
      count: this.entries.length
    };
  }

  public exportJson(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  public clearLogs(): void {
    this.initializeGenesis();
  }
}

export const auditService = AuditService.getInstance();
