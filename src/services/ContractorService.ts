import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Contractor = ApiComponents['schemas']['ContractorJson'];
export type ContractorList = ApiComponents['schemas']['ContractorListJson'];

// Parametertypen des ApiClient ableiten (keine anys!)
type GetPath = Parameters<typeof apiClient.get>[0];
type PostPath = Parameters<typeof apiClient.post>[0];
type PatchPath = Parameters<typeof apiClient.patch>[0];
type DeletePath = Parameters<typeof apiClient.delete>[0];

export class ContractorService {
  /**
   * Alle Auftragnehmer eines Projekts laden
   */
  async getContractors(projectId: string): Promise<ContractorList> {
    return apiClient.get(
        `/api/v1/projects/${projectId}/contractors` as GetPath,
    ) as Promise<ContractorList>;
  }

  /**
   * Einzelnen Auftragnehmer laden
   */
  async getContractor(
      projectId: string,
      contractorId: string,
  ): Promise<Contractor> {
    return apiClient.get(
        `/api/v1/projects/${projectId}/contractors/${contractorId}` as GetPath,
    ) as Promise<Contractor>;
  }

  /**
   * Auftragnehmer anlegen
   */
  async createContractor(
      projectId: string,
      payload: Omit<Contractor, 'id' | 'projectId'>,
  ): Promise<Contractor> {
    return apiClient.post(
        `/api/v1/projects/${projectId}/contractors` as PostPath,
        // Body-Typen des ApiClient ignorieren, aber ohne any
        payload as never,
    ) as Promise<Contractor>;
  }

  /**
   * Auftragnehmer aktualisieren
   */
  async updateContractor(
      projectId: string,
      contractorId: string,
      payload: Partial<Contractor>,
  ): Promise<Contractor> {
    return apiClient.patch(
        `/api/v1/projects/${projectId}/contractors/${contractorId}` as PatchPath,
        payload as never,
    ) as Promise<Contractor>;
  }

  /**
   * Auftragnehmer löschen
   */
  async deleteContractor(
      projectId: string,
      contractorId: string,
  ): Promise<void> {
    await apiClient.delete(
        `/api/v1/projects/${projectId}/contractors/${contractorId}` as DeletePath,
    );
  }
}

export const contractorService = new ContractorService();
