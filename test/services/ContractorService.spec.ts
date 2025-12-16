import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

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
import { ContractorService, contractorService, type Contractor } from '@/services/ContractorService';
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

    // Fix: "unknown" statt "any" verwenden, um Sonar zufrieden zu stellen
    const fakeList = { items: [{ id: CONTRACTOR_ID }] };

    // Fix: "as Mock" statt "as any"
    (apiClient.get as Mock).mockResolvedValue(fakeList);

    const result = await service.getContractors(PROJECT_ID);

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(apiClient.get).toHaveBeenCalledWith(`/api/v1/projects/${PROJECT_ID}/contractors`);
    expect(result).toBe(fakeList);
  });

  it('getContractor ruft apiClient.get mit der richtigen URL auf und gibt den Auftragnehmer zurück', async () => {
    const service = new ContractorService();

    // Fix: Cast zu "unknown" dann zu "Contractor" erlaubt unvollständige Objekte ohne "any"
    const fakeContractor = { id: CONTRACTOR_ID, companyName: 'Testfirma' } as unknown as Contractor;
    (apiClient.get as Mock).mockResolvedValue(fakeContractor);

    const result = await service.getContractor(PROJECT_ID, CONTRACTOR_ID);

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(apiClient.get).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
    );
    expect(result).toBe(fakeContractor);
  });

  it('createContractor ruft apiClient.post mit richtiger URL und Payload auf', async () => {
    const service = new ContractorService();

    // Fix: Partial<Contractor> ist sauberer als any
    const payload: Partial<Contractor> = {
      companyName: 'Neue Firma',
      email: 'new@example.com',
    };

    const fakeResponse = { id: CONTRACTOR_ID, ...payload } as unknown as Contractor;
    (apiClient.post as Mock).mockResolvedValue(fakeResponse);

    const result = await service.createContractor(PROJECT_ID, payload as Contractor);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors`,
        payload,
    );
    expect(result).toBe(fakeResponse);
  });

  it('updateContractor ruft apiClient.patch mit richtiger URL und Payload auf', async () => {
    const service = new ContractorService();

    const payload = { companyName: 'Geänderte Firma' };
    const fakeResponse = { id: CONTRACTOR_ID, ...payload } as unknown as Contractor;

    (apiClient.patch as Mock).mockResolvedValue(fakeResponse);

    // Cast payload as Partial or unknown to fit the method signature if needed
    await service.updateContractor(PROJECT_ID, CONTRACTOR_ID, payload as unknown as Contractor);

    expect(apiClient.patch).toHaveBeenCalledTimes(1);
    expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
        payload,
    );
  });

  it('deleteContractor ruft apiClient.delete mit richtiger URL auf', async () => {
    const service = new ContractorService();

    (apiClient.delete as Mock).mockResolvedValue(undefined);

    await service.deleteContractor(PROJECT_ID, CONTRACTOR_ID);

    expect(apiClient.delete).toHaveBeenCalledTimes(1);
    expect(apiClient.delete).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
    );
  });

  it('exportiertes Singleton contractorService verwendet dieselbe Implementierung', async () => {
    (apiClient.get as Mock).mockResolvedValue({});

    await contractorService.getContractors(PROJECT_ID);

    expect(apiClient.get).toHaveBeenCalledWith(`/api/v1/projects/${PROJECT_ID}/contractors`);
  });
});