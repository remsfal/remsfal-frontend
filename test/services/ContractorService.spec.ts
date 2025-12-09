import { describe, it, expect, vi, beforeEach } from 'vitest';

// Erst ApiClient mocken – WICHTIG: Pfad exakt wie in ContractorService.ts
vi.mock('@/services/ApiClient.ts', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Danach Service & apiClient importieren
import { ContractorService, contractorService } from '@/services/ContractorService';
import { apiClient } from '@/services/ApiClient.ts';

describe('ContractorService', () => {
  const PROJECT_ID = 'project-123';
  const CONTRACTOR_ID = 'contractor-456';

  // Für jeden Test frische Mocks
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getContractors ruft apiClient.get mit der richtigen URL auf und gibt das Ergebnis zurück', async () => {
    const service = new ContractorService();

    const fakeList = { items: [{ id: CONTRACTOR_ID }] } as any;
    (apiClient.get as any).mockResolvedValue(fakeList);

    const result = await service.getContractors(PROJECT_ID);

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(apiClient.get).toHaveBeenCalledWith(`/api/v1/projects/${PROJECT_ID}/contractors`);
    expect(result).toBe(fakeList);
  });

  it('getContractor ruft apiClient.get mit der richtigen URL auf und gibt den Auftragnehmer zurück', async () => {
    const service = new ContractorService();

    const fakeContractor = { id: CONTRACTOR_ID, companyName: 'Testfirma' } as any;
    (apiClient.get as any).mockResolvedValue(fakeContractor);

    const result = await service.getContractor(PROJECT_ID, CONTRACTOR_ID);

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(apiClient.get).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
    );
    expect(result).toBe(fakeContractor);
  });

  it('createContractor ruft apiClient.post mit richtiger URL und Payload auf', async () => {
    const service = new ContractorService();

    const payload = {
      companyName: 'Neue Firma',
      email: 'new@example.com',
    } as any;

    const fakeResponse = { id: CONTRACTOR_ID, ...payload } as any;
    (apiClient.post as any).mockResolvedValue(fakeResponse);

    const result = await service.createContractor(PROJECT_ID, payload);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors`,
        payload,
    );
    expect(result).toBe(fakeResponse);
  });

  it('updateContractor ruft apiClient.patch mit richtiger URL und Payload auf', async () => {
    const service = new ContractorService();

    const payload = { companyName: 'Geänderte Firma' } as any;
    const fakeResponse = { id: CONTRACTOR_ID, ...payload } as any;

    (apiClient.patch as any).mockResolvedValue(fakeResponse);

    const result = await service.updateContractor(PROJECT_ID, CONTRACTOR_ID, payload);

    expect(apiClient.patch).toHaveBeenCalledTimes(1);
    expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
        payload,
    );
    expect(result).toBe(fakeResponse);
  });

  it('deleteContractor ruft apiClient.delete mit richtiger URL auf', async () => {
    const service = new ContractorService();

    (apiClient.delete as any).mockResolvedValue(undefined);

    await service.deleteContractor(PROJECT_ID, CONTRACTOR_ID);

    expect(apiClient.delete).toHaveBeenCalledTimes(1);
    expect(apiClient.delete).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
    );
  });

  it('exportiertes Singleton contractorService verwendet dieselbe Implementierung', async () => {
    (apiClient.get as any).mockResolvedValue({} as any);

    await contractorService.getContractors(PROJECT_ID);

    expect(apiClient.get).toHaveBeenCalledWith(`/api/v1/projects/${PROJECT_ID}/contractors`);
  });
});
