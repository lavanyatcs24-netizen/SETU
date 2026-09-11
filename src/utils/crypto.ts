// Cryptographic utilities for Tamper-Evident Audit Trails & Proof Hashes

/**
 * Computes a SHA-256 hexadecimal string using Web Crypto API in browser or Node
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback lightweight hash generator if subtle crypto is unavailable
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16).padStart(16, '0') + Date.now().toString(16);
}

/**
 * Validates the cryptographic integrity of a chained audit trail
 */
export async function verifyAuditChain(entries: Array<{
  id: string;
  timestamp: string;
  actorId: string;
  eventType: string;
  evidenceHash: string;
  previousHash: string;
}>): Promise<{ isValid: boolean; brokenAtIndex?: number }> {
  for (let i = 0; i < entries.length; i++) {
    const current = entries[i];
    if (i === 0) {
      if (current.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return { isValid: false, brokenAtIndex: 0 };
      }
    } else {
      const prev = entries[i - 1];
      const expectedPrevHash = await sha256(
        `${prev.id}:${prev.timestamp}:${prev.actorId}:${prev.eventType}:${prev.evidenceHash}:${prev.previousHash}`
      );
      if (current.previousHash !== expectedPrevHash) {
        return { isValid: false, brokenAtIndex: i };
      }
    }
  }
  return { isValid: true };
}
