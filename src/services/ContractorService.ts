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
  async getContractor(projectId: string, contractorId: string): Promise<Contractor> {
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
  async deleteContractor(projectId: string, contractorId: string): Promise<void> {
    await apiClient.delete(
        `/api/v1/projects/${projectId}/contractors/${contractorId}` as DeletePath,
    );
  }

  // ---------------------------------------------------------------------------
  // Backwards compatible wrappers (falls irgendwo noch alte Namen genutzt werden)
  // ---------------------------------------------------------------------------

  /** @deprecated Use getContractors(projectId) instead. */
  async getIssues(projectId: string): Promise<ContractorList> {
    return this.getContractors(projectId);
  }

  /** @deprecated Use getContractor(projectId, contractorId) instead. */
  async getIssue(projectId: string, contractorId: string): Promise<Contractor> {
    return this.getContractor(projectId, contractorId);
  }

  /** @deprecated Use createContractor(projectId, payload) instead. */
  async createIssue(
      projectId: string,
      payload: Omit<Contractor, 'id' | 'projectId'>,
  ): Promise<Contractor> {
    return this.createContractor(projectId, payload);
  }

  /** @deprecated Use updateContractor(projectId, contractorId, payload) instead. */
  async updateIssue(
      projectId: string,
      contractorId: string,
      payload: Partial<Contractor>,
  ): Promise<Contractor> {
    return this.updateContractor(projectId, contractorId, payload);
  }

  /** @deprecated Use deleteContractor(projectId, contractorId) instead. */
  async deleteIssue(projectId: string, contractorId: string): Promise<void> {
    return this.deleteContractor(projectId, contractorId);
  }
}

export const contractorService = new ContractorService();
