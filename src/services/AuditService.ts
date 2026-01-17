// services/AuditService.ts
export class AuditService {
  async create(data: any): Promise<void> {
    try {
      console.log('📝 Audit log created:', {
        action: data.action,
        entityId: data.entityId,
        service: data.service,
        timestamp: data.timestamp
      });
      // Este servicio solo loguea, el AuditService real guardará en MongoDB
    } catch (error: any) {
      console.error('❌ Error creating audit log:', error.message);
      throw error;
    }
  }
}
