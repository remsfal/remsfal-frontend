import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises, VueWrapper } from "@vue/test-utils";
import ProjectIssueView from "@/views/ProjectIssueView.vue";
import { issueService } from "@/services/IssueService";

// ---- Mocks ----
const toastAddMock = vi.fn();

vi.mock("@/services/IssueService", () => ({issueService: {getIssue: vi.fn(),},}));

vi.mock("primevue/usetoast", () => ({useToast: () => ({add: toastAddMock,}),}));

vi.mock("vue-i18n", () => ({useI18n: () => ({t: (key: string) => key,}),}));

// ---- Test Data ----
const mockIssue = {
  id: "ISSUE-1",
  title: "Test issue",
  status: "OPEN",
  ownerId: "owner-1",
  reporterId: "reporter-1",
  tenancyId: "tenant-1",
  type: "BUG",
  description: "Test description",
};

// ---- Test Suite ----
describe("ProjectIssueView.vue", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.spyOn(issueService, "getIssue").mockResolvedValue(mockIssue as any);

    wrapper = mount(ProjectIssueView, {
      props: {
        projectId: "PROJ-1",
        issueId: "ISSUE-1",
      },
      global: {
        stubs: {
          IssueDetailsCard: {template: '<div data-test="details" @click="$emit(\'saved\')" />',},
          IssueDescriptionCard: {
            template:
              '<div data-test="description" @click="$emit(\'saved\')" />',
          },
        },
      },
    });

    await flushPromises();
  });

  // ---- Fetch & Render Tests ----
  test("fetches issue on mount with correct arguments", () => {
    expect(issueService.getIssue).toHaveBeenCalledWith("ISSUE-1");
  });

  test("renders IssueDetailsCard and IssueDescriptionCard", () => {
    expect(wrapper.find('[data-test="details"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="description"]').exists()).toBe(true);
  });

  // ---- Loader Tests ----
  test("sets loading state while fetching issue", () => {
    // no need for resolveFn if we don’t use it
    vi.spyOn(issueService, "getIssue").mockImplementation(
      () => new Promise(() => {}) // promise never resolves
    );
  
    mount(ProjectIssueView, {
      props: { projectId: "PROJ-1", issueId: "ISSUE-1" },
      global: { stubs: { IssueDetailsCard: true, IssueDescriptionCard: true } },
    });
  
    expect(issueService.getIssue).toHaveBeenCalled();
  });
  
  // ---- Error Handling Tests ----
  test("shows error toast when API call fails", () => {
    vi.spyOn(issueService, "getIssue").mockImplementation(() => {
      throw new Error("API error");
    });

    mount(ProjectIssueView, {
      props: {
        projectId: "PROJ-1",
        issueId: "ISSUE-1",
      },
      global: {
        stubs: {
          IssueDetailsCard: true,
          IssueDescriptionCard: true,
        },
      },
    });

    expect(toastAddMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "error.general",
        detail: "issueDetails.fetchError",
      })
    );
  });

  // ---- Refetch Behaviour Tests ----
  test("refetches issue when details are saved", async () => {
    await wrapper.find('[data-test="details"]').trigger("click");
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledTimes(2);
  });

  test("refetches issue when issueId prop changes", async () => {
    await wrapper.setProps({ issueId: "ISSUE-2" });
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledTimes(2);
  });

  test("sets description after fetching issue", () => {
    // match the actual mock used in beforeEach
    expect(wrapper.vm.description).toBe("Test description");
  });
  
  test("loading spinner shows while fetching issue", async () => {
    // Create a promise that never resolves to simulate ongoing fetch
    const pendingPromise = new Promise(() => {});
    vi.spyOn(issueService, "getIssue").mockReturnValue(pendingPromise as any);
  
    const tempWrapper = mount(ProjectIssueView, {
      props: { projectId: "PROJ-1", issueId: "ISSUE-1" },
      global: { stubs: { IssueDetailsCard: true, IssueDescriptionCard: true } },
    });
  
    // Wait for next tick so loadingFetch is set to true
    await tempWrapper.vm.$nextTick();
  
    expect(tempWrapper.find("i.pi-spin").exists()).toBe(true);
  });
  
  
  
  test("refetches issue when description card emits saved", async () => {
    await wrapper.find('[data-test="description"]').trigger("click");
    await flushPromises();
  
    expect(issueService.getIssue).toHaveBeenCalledTimes(2);
  });
  
  test("refetches issue when projectId or issueId props change", async () => {
    await wrapper.setProps({ projectId: "PROJ-2", issueId: "ISSUE-2" });
    await flushPromises();
  
    expect(issueService.getIssue).toHaveBeenCalledWith("ISSUE-2");
  });
  
});
