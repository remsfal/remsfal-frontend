import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/ApiClient.ts", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/services/ApiClient.ts";
import { ContractorService } from "@/services/ContractorService";

const PROJECT_ID = "p1";
const CONTRACTOR_ID = "c1";

describe("ContractorService", () => {
  let service: ContractorService;

  beforeEach(() => {
    service = new ContractorService();
    (apiClient.get as any).mockReset();
    (apiClient.post as any).mockReset();
    (apiClient.patch as any).mockReset();
    (apiClient.delete as any).mockReset();
  });

  it("getContractors calls apiClient.get", async () => {
    (apiClient.get as any).mockResolvedValue({ contractors: [] });

    const res = await service.getContractors(PROJECT_ID);

    expect(apiClient.get).toHaveBeenCalledWith(`/api/v1/projects/${PROJECT_ID}/contractors`);
    expect(res).toEqual({ contractors: [] });
  });

  it("getContractor calls apiClient.get", async () => {
    (apiClient.get as any).mockResolvedValue({ id: CONTRACTOR_ID });

    const res = await service.getContractor(PROJECT_ID, CONTRACTOR_ID);

    expect(apiClient.get).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
    );
    expect(res).toEqual({ id: CONTRACTOR_ID });
  });

  it("createContractor calls apiClient.post", async () => {
    const payload = { companyName: "Firma" };
    (apiClient.post as any).mockResolvedValue({ id: CONTRACTOR_ID });

    const res = await service.createContractor(PROJECT_ID, payload as any);

    expect(apiClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors`,
        payload,
    );
    expect(res).toEqual({ id: CONTRACTOR_ID });
  });

  it("updateContractor calls apiClient.patch", async () => {
    const payload = { companyName: "Firma 2" };
    (apiClient.patch as any).mockResolvedValue({ id: CONTRACTOR_ID });

    const res = await service.updateContractor(PROJECT_ID, CONTRACTOR_ID, payload as any);

    expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
        payload,
    );
    expect(res).toEqual({ id: CONTRACTOR_ID });
  });

  it("deleteContractor calls apiClient.delete", async () => {
    (apiClient.delete as any).mockResolvedValue(undefined);

    await service.deleteContractor(PROJECT_ID, CONTRACTOR_ID);

    expect(apiClient.delete).toHaveBeenCalledWith(
        `/api/v1/projects/${PROJECT_ID}/contractors/${CONTRACTOR_ID}`,
    );
  });

  it("deprecated wrappers delegate to new methods", async () => {
    const list = { contractors: [] } as any;
    const contractor = { id: CONTRACTOR_ID } as any;

    const getContractorsSpy = vi.spyOn(service, "getContractors").mockResolvedValue(list);
    const getContractorSpy = vi.spyOn(service, "getContractor").mockResolvedValue(contractor);
    const createSpy = vi.spyOn(service, "createContractor").mockResolvedValue(contractor);
    const updateSpy = vi.spyOn(service, "updateContractor").mockResolvedValue(contractor);
    const deleteSpy = vi.spyOn(service, "deleteContractor").mockResolvedValue(undefined);

    await expect(service.getIssues(PROJECT_ID)).resolves.toBe(list);
    expect(getContractorsSpy).toHaveBeenCalledWith(PROJECT_ID);

    await expect(service.getIssue(PROJECT_ID, CONTRACTOR_ID)).resolves.toBe(contractor);
    expect(getContractorSpy).toHaveBeenCalledWith(PROJECT_ID, CONTRACTOR_ID);

    await expect(service.createIssue(PROJECT_ID, { companyName: "X" } as any)).resolves.toBe(contractor);
    expect(createSpy).toHaveBeenCalled();

    await expect(service.updateIssue(PROJECT_ID, CONTRACTOR_ID, { companyName: "Y" } as any)).resolves.toBe(contractor);
    expect(updateSpy).toHaveBeenCalledWith(PROJECT_ID, CONTRACTOR_ID, { companyName: "Y" });

    await expect(service.deleteIssue(PROJECT_ID, CONTRACTOR_ID)).resolves.toBeUndefined();
    expect(deleteSpy).toHaveBeenCalledWith(PROJECT_ID, CONTRACTOR_ID);
  });
});
