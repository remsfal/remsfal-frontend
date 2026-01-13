import { beforeEach, describe, expect, it, vi, type MockedFunction } from "vitest";

vi.mock("@/services/ApiClient.ts", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/services/ApiClient.ts";
import {ContractorService,
  type Contractor,
  type ContractorList,} from "@/services/ContractorService";

const PROJECT_ID = "p1";
const CONTRACTOR_ID = "c1";

describe("ContractorService", () => {
  let service: ContractorService;

  let apiGet: MockedFunction<typeof apiClient.get>;
  let apiPost: MockedFunction<typeof apiClient.post>;
  let apiPatch: MockedFunction<typeof apiClient.patch>;
  let apiDelete: MockedFunction<typeof apiClient.delete>;

  beforeEach(() => {
    service = new ContractorService();

    apiGet = apiClient.get as unknown as MockedFunction<typeof apiClient.get>;
    apiPost = apiClient.post as unknown as MockedFunction<typeof apiClient.post>;
    apiPatch = apiClient.patch as unknown as MockedFunction<typeof apiClient.patch>;
    apiDelete = apiClient.delete as unknown as MockedFunction<typeof apiClient.delete>;

    apiGet.mockReset();
    apiPost.mockReset();
    apiPatch.mockReset();
    apiDelete.mockReset();
  });

  it("getContractors calls apiClient.get", async () => {
    const list = { contractors: [] } as unknown as ContractorList;
    apiGet.mockResolvedValue(list);

    const res = await service.getContractors(PROJECT_ID);

    expect(apiGet).toHaveBeenCalledWith(`/api/v1/projects/${PROJECT_ID}/contractors`);
    expect(res).toBe(list);
  });

  it("getContractor calls apiClient.get", async () => {
    const contractor = { id: CONTRACTOR_ID } as unknown as Contractor;
    apiGet.mockResolvedValue(contractor);

    const res = await service.getContractor(PROJECT_ID, CONTRACTOR_ID);

    expect(apiGet).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
    );
    expect(res).toBe(contractor);
  });

  it("createContractor calls apiClient.post", async () => {
    const payload = { companyName: "Firma" } as unknown as Contractor;
    const created = { id: CONTRACTOR_ID, ...payload } as unknown as Contractor;

    apiPost.mockResolvedValue(created);

    const res = await service.createContractor(PROJECT_ID, payload);

    expect(apiPost).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors`,
        payload,
    );
    expect(res).toBe(created);
  });

  it("updateContractor calls apiClient.patch", async () => {
    const payload = { companyName: "Firma 2" } as unknown as Contractor;
    const updated = { id: CONTRACTOR_ID, ...payload } as unknown as Contractor;

    apiPatch.mockResolvedValue(updated);

    const res = await service.updateContractor(PROJECT_ID, CONTRACTOR_ID, payload);

    expect(apiPatch).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
        payload,
    );
    expect(res).toBe(updated);
  });

  it("deleteContractor calls apiClient.delete", async () => {
    apiDelete.mockResolvedValue(undefined);

    await service.deleteContractor(PROJECT_ID, CONTRACTOR_ID);

    expect(apiDelete).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
    );
  });

  it("deprecated wrappers delegate to new methods", async () => {
    const list = { contractors: [] } as unknown as ContractorList;
    const contractor = { id: CONTRACTOR_ID } as unknown as Contractor;

    const getContractorsSpy = vi
        .spyOn(service, "getContractors")
        .mockResolvedValue(list);

    const getContractorSpy = vi
        .spyOn(service, "getContractor")
        .mockResolvedValue(contractor);

    const createSpy = vi
        .spyOn(service, "createContractor")
        .mockResolvedValue(contractor);

    const updateSpy = vi
        .spyOn(service, "updateContractor")
        .mockResolvedValue(contractor);

    const deleteSpy = vi
        .spyOn(service, "deleteContractor")
        .mockResolvedValue(undefined);

    await expect(service.getIssues(PROJECT_ID)).resolves.toBe(list);
    expect(getContractorsSpy).toHaveBeenCalledWith(PROJECT_ID);

    await expect(service.getIssue(PROJECT_ID, CONTRACTOR_ID)).resolves.toBe(contractor);
    expect(getContractorSpy).toHaveBeenCalledWith(PROJECT_ID, CONTRACTOR_ID);

    await expect(
        service.createIssue(PROJECT_ID, { companyName: "X" } as unknown as Contractor),
    ).resolves.toBe(contractor);
    expect(createSpy).toHaveBeenCalled();

    await expect(
        service.updateIssue(
            PROJECT_ID,
            CONTRACTOR_ID,
            { companyName: "Y" } as unknown as Contractor,
        ),
    ).resolves.toBe(contractor);
    expect(updateSpy).toHaveBeenCalledWith(
        PROJECT_ID,
        CONTRACTOR_ID,
        { companyName: "Y" } as unknown as Contractor,
    );

    await expect(service.deleteIssue(PROJECT_ID, CONTRACTOR_ID)).resolves.toBeUndefined();
    expect(deleteSpy).toHaveBeenCalledWith(PROJECT_ID, CONTRACTOR_ID);
  });
});
