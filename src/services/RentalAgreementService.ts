import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type RentalAgreement = ApiComponents['schemas']['RentalAgreementJson'];
export type RentalAgreementList = ApiComponents['schemas']['RentalAgreementListJson'];
export type TenantItem = ApiComponents['schemas']['TenantJson'];

/**
 * Service for managing rental agreements in the manager/property owner context.
 * For tenant context, use TenancyService instead.
 */
export default class RentalAgreementService {
  /**
   * Fetch all rental agreements for a project
   */
  async fetchRentalAgreements(projectId: string): Promise<RentalAgreement[]> {
    const result = await apiClient.get('/api/v1/projects/{projectId}/rental-agreements', {
      pathParams: { projectId },
    });
    return result.rentalAgreements || [];
  }

  /**
   * Load a single rental agreement by ID
   */
  async loadRentalAgreement(projectId: string, agreementId: string): Promise<RentalAgreement> {
    return apiClient.get('/api/v1/projects/{projectId}/rental-agreements/{agreementId}', {
      pathParams: { projectId, agreementId },
    });
  }

  /**
   * Create a new rental agreement
   */
  async createRentalAgreement(projectId: string, agreement: RentalAgreement): Promise<void> {
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
    agreement: RentalAgreement
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
    await apiClient.delete('/api/v1/projects/{projectId}/rental-agreements/{agreementId}', {
      pathParams: { projectId, agreementId },
    });
  }

  /**
   * Extract all tenants from rental agreements
   */
  extractTenants(agreements: RentalAgreement[]): TenantItem[] {
    return agreements.flatMap(agreement => agreement.tenants ?? []);
  }
}

export const rentalAgreementService = new RentalAgreementService();
