import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Contractor = ApiComponents['schemas']['ContractorJson'];
export type ContractorList = ApiComponents['schemas']['ContractorListJson'];

export class ContractorService {
  /**
   * Alle Auftragnehmer eines Projekts laden
   */
  async getContractors(projectId: string): Promise<ContractorList> {
    return apiClient.get(
        `/api/v1/projects/${projectId}/contractors` as any
    ) as Promise<ContractorList>;
  }

  /**
   * Einzelnen Auftragnehmer laden
   */
  async getContractor(projectId: string, contractorId: string): Promise<Contractor> {
    return apiClient.get(
        `/api/v1/projects/${projectId}/contractors/${contractorId}` as any
    ) as Promise<Contractor>;
  }

  /**
   * Auftragnehmer anlegen
   */
  async createContractor(
      projectId: string,
      payload: Omit<Contractor, 'id' | 'projectId'>
  ): Promise<Contractor> {
    return apiClient.post(
        `/api/v1/projects/${projectId}/contractors` as any,
        payload
    ) as Promise<Contractor>;
  }

  /**
   * Auftragnehmer aktualisieren
   */
  async updateContractor(
      projectId: string,
      contractorId: string,
      payload: Partial<Contractor>
  ): Promise<Contractor> {
    return apiClient.patch(
        `/api/v1/projects/${projectId}/contractors/${contractorId}` as any,
        payload
    ) as Promise<Contractor>;
  }

  /**
   * Auftragnehmer löschen
   */
  async deleteContractor(projectId: string, contractorId: string): Promise<void> {
    await apiClient.delete(
        `/api/v1/projects/${projectId}/contractors/${contractorId}` as any
    );
  }
}

export const contractorService = new ContractorService();
