import { createHash, randomUUID } from 'crypto';

export type AuditActionType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_PROCESSED'
  | 'HAZMAT_COMPLIANCE_CHECK'
  | 'EPOD_VERIFIED'
  | 'USER_ROLE_CHANGED'
  | 'INVENTORY_ALLOCATED';

export interface AuditRecord {
  id: string;
  action: AuditActionType;
  entity: string;
  entityId: string | number;
  actorId: string | number;
  actorRole: string;
  payload: Record<string, any>;
  timestamp: string;
  previousHash: string;
  hash: string;
}

export class EnterpriseAuditTrailManager {
  private static instance: EnterpriseAuditTrailManager;
  private auditChain: AuditRecord[] = [];
  private readonly GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  private constructor() {}

  public static getInstance(): EnterpriseAuditTrailManager {
    if (!EnterpriseAuditTrailManager.instance) {
      EnterpriseAuditTrailManager.instance = new EnterpriseAuditTrailManager();
    }
    return EnterpriseAuditTrailManager.instance;
  }

  private calculateHash(
    action: string,
    entity: string,
    entityId: string | number,
    actorId: string | number,
    actorRole: string,
    payload: Record<string, any>,
    timestamp: string,
    previousHash: string,
  ): string {
    const rawData = `${action}|${entity}|${entityId}|${actorId}|${actorRole}|${JSON.stringify(payload)}|${timestamp}|${previousHash}`;
    return createHash('sha256').update(rawData).digest('hex');
  }

  public recordEvent(params: {
    action: AuditActionType;
    entity: string;
    entityId: string | number;
    actorId: string | number;
    actorRole: string;
    payload?: Record<string, any>;
  }): AuditRecord {
    const previousHash =
      this.auditChain.length > 0
        ? this.auditChain[this.auditChain.length - 1].hash
        : this.GENESIS_HASH;

    const timestamp = new Date().toISOString();
    const payload = params.payload || {};

    const hash = this.calculateHash(
      params.action,
      params.entity,
      params.entityId,
      params.actorId,
      params.actorRole,
      payload,
      timestamp,
      previousHash,
    );

    const record: AuditRecord = {
      id: randomUUID(),
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      actorId: params.actorId,
      actorRole: params.actorRole,
      payload,
      timestamp,
      previousHash,
      hash,
    };

    this.auditChain.push(record);
    return record;
  }

  public getAuditTrail(entity?: string, entityId?: string | number): AuditRecord[] {
    if (!entity) {
      return [...this.auditChain];
    }
    return this.auditChain.filter(
      (rec) => rec.entity === entity && (!entityId || String(rec.entityId) === String(entityId)),
    );
  }

  public verifyChainIntegrity(): { isValid: boolean; corruptedAtIndex?: number } {
    for (let i = 0; i < this.auditChain.length; i++) {
      const current = this.auditChain[i];
      const previousHash = i === 0 ? this.GENESIS_HASH : this.auditChain[i - 1].hash;

      if (current.previousHash !== previousHash) {
        return { isValid: false, corruptedAtIndex: i };
      }

      const recalculatedHash = this.calculateHash(
        current.action,
        current.entity,
        current.entityId,
        current.actorId,
        current.actorRole,
        current.payload,
        current.timestamp,
        current.previousHash,
      );

      if (current.hash !== recalculatedHash) {
        return { isValid: false, corruptedAtIndex: i };
      }
    }
    return { isValid: true };
  }

  public clearAuditTrail(): void {
    this.auditChain = [];
  }
}
