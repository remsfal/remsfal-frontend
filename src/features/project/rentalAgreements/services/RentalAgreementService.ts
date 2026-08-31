import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';
import { type UnitType } from '@/features/project/rentableUnits/services/PropertyService';

export type RentalAgreementJson = Readable<ApiComponents['schemas']['RentalAgreementJson']>;
export type RentalAgreementWritableJson = Writable<ApiComponents['schemas']['RentalAgreementJson']>;
export type RentalAgreementListJson = Readable<ApiComponents['schemas']['RentalAgreementListJson']>;
export type RentalAgreementItemJson = Readable<ApiComponents['schemas']['RentalAgreementItemJson']>;
export type TenantJson = Readable<ApiComponents['schemas']['TenantJson']>;
export type TenantWritableJson = Writable<ApiComponents['schemas']['TenantJson']>;
export type RentalAgreementKeysJson = Readable<ApiComponents['schemas']['RentalAgreementKeysJson']>;
export type RentJson = Readable<ApiComponents['schemas']['RentJson']>;

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
  async createRentalAgreement(projectId: string, agreement: RentalAgreementWritableJson): Promise<void> {
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
    agreement: RentalAgreementWritableJson
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
  async addTenant(projectId: string, agreementId: string, tenant: TenantWritableJson): Promise<TenantJson> {
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

  /**
   * Add a new rent for a rental unit of a rental agreement (used to adjust the rent).
   */
  async addRent(
    projectId: string,
    agreementId: string,
    rentalUnitType: UnitType,
    rentalUnitId: string,
    rent: RentJson,
  ): Promise<RentalAgreementJson> {
    return apiClient.post(
      '/api/v1/projects/{projectId}/rental-agreements/{agreementId}/{rentalUnitType}/{rentalUnitId}',
      rent,
      {
        pathParams: {
          projectId, agreementId, rentalUnitId, rentalUnitType: rentalUnitType.toLowerCase(),
        },
      },
    ) as Promise<RentalAgreementJson>;
  }

  /**
   * Remove a rental unit (and all of its rents) from a rental agreement.
   * The rental unit itself is not deleted, only detached from this agreement.
   */
  async removeRentalUnit(
    projectId: string,
    agreementId: string,
    rentalUnitType: UnitType,
    rentalUnitId: string,
  ): Promise<void> {
    await apiClient.delete(
      '/api/v1/projects/{projectId}/rental-agreements/{agreementId}/{rentalUnitType}/{rentalUnitId}',
      {
        pathParams: {
          projectId, agreementId, rentalUnitId, rentalUnitType: rentalUnitType.toLowerCase(),
        },
      },
    );
  }
}

export const rentalAgreementService = new RentalAgreementService();
