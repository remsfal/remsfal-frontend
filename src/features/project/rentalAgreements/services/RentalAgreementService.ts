import { apiClient, type ApiComponents } from '@/services/ApiClient';
import { type UnitType } from '@/features/project/rentableUnits/services/PropertyService';

export type RentalAgreementJson = ApiComponents['schemas']['RentalAgreementJson'];
export type RentalAgreementListJson = ApiComponents['schemas']['RentalAgreementListJson'];
export type RentalAgreementItemJson = ApiComponents['schemas']['RentalAgreementItemJson'];
export type TenantJson = ApiComponents['schemas']['TenantJson'];
export type RentalAgreementKeysJson = ApiComponents['schemas']['RentalAgreementKeysJson'];

/**
 * Service for managing rental agreements in the manager/property owner context.
 * For tenant context, use TenancyService instead.
 */
export default class RentalAgreementService {
  /**
   * Get all rental agreements for a project, optionally filtered to a single rental unit.
   * `rentalUnitId` is only evaluated by the backend when `rentalUnitType` is also set.
   */
  async getRentalAgreements(
    projectId: string,
    filter?: { rentalUnitId?: string; rentalUnitType?: UnitType },
  ): Promise<RentalAgreementItemJson[]> {
    const result = await apiClient.get('/api/v1/projects/{projectId}/rental-agreements', {
      pathParams: { projectId },
      params: {
        ...(filter?.rentalUnitId ? { rentalUnitId: filter.rentalUnitId } : {}),
        ...(filter?.rentalUnitType ? { rentalUnitType: filter.rentalUnitType } : {}),
      },
    });
    return result.rentalAgreements || [];
  }

  /**
   * Get a single rental agreement by ID
   */
  async getRentalAgreement(projectId: string, agreementId: string): Promise<RentalAgreementJson> {
    return apiClient.get('/api/v1/projects/{projectId}/rental-agreements/{agreementId}',
      {pathParams: { projectId, agreementId },});
  }

  /**
   * Create a new rental agreement
   */
  async createRentalAgreement(projectId: string, agreement: RentalAgreementJson): Promise<void> {
    await apiClient.post(
      '/api/v1/projects/{projectId}/rental-agreements',
      agreement,
      { pathParams: { projectId } }
    );
  }

  /**
   * Update an existing rental agreement
   */
  async updateRentalAgreement(
    projectId: string,
    agreementId: string,
    agreement: RentalAgreementJson
  ): Promise<void> {
    await apiClient.patch(
      '/api/v1/projects/{projectId}/rental-agreements/{agreementId}',
      agreement,
      { pathParams: { projectId, agreementId } }
    );
  }

  /**
   * Delete a rental agreement
   */
  async deleteRentalAgreement(projectId: string, agreementId: string): Promise<void> {
    await apiClient.delete('/api/v1/projects/{projectId}/rental-agreements/{agreementId}',
      {pathParams: { projectId, agreementId },});
  }

  /**
   * Add a tenant to an existing rental agreement
   */
  async addTenant(projectId: string, agreementId: string, tenant: TenantJson): Promise<TenantJson> {
    return apiClient.post(
      '/api/v1/projects/{projectId}/rental-agreements/{agreementId}/tenants',
      tenant,
      { pathParams: { projectId, agreementId } }
    ) as Promise<TenantJson>;
  }

  /**
   * Remove a tenant from an existing rental agreement
   */
  async removeTenant(projectId: string, agreementId: string, tenantId: string): Promise<void> {
    await apiClient.delete(
      '/api/v1/projects/{projectId}/rental-agreements/{agreementId}/tenants/{tenantId}',
      {
        pathParams: {
          projectId, agreementId, tenantId
        }
      }
    );
  }

  /**
   * Extract all tenants from rental agreements
   */
  extractTenants(agreements: RentalAgreementJson[]): TenantJson[] {
    return agreements.flatMap(agreement => agreement.tenants ?? []);
  }
}

export const rentalAgreementService = new RentalAgreementService();
