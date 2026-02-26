import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises, VueWrapper } from "@vue/test-utils";
import ProjectIssueView from "@/views/ProjectIssueView.vue";
import { issueService } from "@/services/IssueService";

// ---- Mocks ----
const toastAddMock = vi.fn();

vi.mock("@/services/IssueService", () => ({issueService: { getIssue: vi.fn() },}));

vi.mock("primevue/usetoast", () => ({useToast: () => ({ add: toastAddMock }),}));

vi.mock("vue-i18n", () => ({useI18n: () => ({ t: (key: string) => key }),}));

// ---- Test Data (aligned with component mapper) ----
const mockIssue = {
  id: "ISSUE-1",
  title: "Test issue",
  status: "OPEN",
  assigneeId: "owner-1",
  reporterId: "reporter-1",
  projectId: "PROJ-1",
  rentalUnitId: "tenant-1",
  type: "BUG",
  description: "Test description",
};

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
          IssueDetailsCard: {template: `<div data-test="details" @click="$emit('saved')" />`,},
          IssueDescriptionCard: {template: `<div data-test="description" @click="$emit('saved')" />`,},
          IssueRelationshipsCard: true,
        },
      },
    });

    await flushPromises();
  });

  // ---- Fetch & Render Tests ----
  test("fetches issue on mount with correct arguments", () => {
    expect(issueService.getIssue).toHaveBeenCalledWith("ISSUE-1");
    expect(issueService.getIssue).toHaveBeenCalledTimes(1);
  });

  test("renders IssueDetailsCard and IssueDescriptionCard", () => {
    expect(wrapper.find('[data-test="details"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="description"]').exists()).toBe(true);
  });

  // ---- Loader Tests ----
  test("sets loading state while fetching issue", async () => {
    vi.spyOn(issueService, "getIssue").mockImplementation(
      () => new Promise(() => {})
    );

    const tempWrapper = mount(ProjectIssueView, {
      props: { projectId: "PROJ-1", issueId: "ISSUE-1" },
      global: {
        stubs: {
          IssueDetailsCard: true,
          IssueDescriptionCard: true,
          IssueRelationshipsCard: true,
        },
      },
    });

    await tempWrapper.vm.$nextTick();

    expect(issueService.getIssue).toHaveBeenCalled();
    expect(tempWrapper.find("i.pi-spin").exists()).toBe(true);
  });

  // ---- Error Handling Tests ----
  test("shows error toast when API call fails", async () => {
    vi.spyOn(issueService, "getIssue").mockRejectedValue(
      new Error("API error")
    );

    mount(ProjectIssueView, {
      props: {
        projectId: "PROJ-1",
        issueId: "ISSUE-1",
      },
      global: {
        stubs: {
          IssueDetailsCard: true,
          IssueDescriptionCard: true,
          IssueRelationshipsCard: true,
        },
      },
    });

    await flushPromises();

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
    vi.clearAllMocks();

    await wrapper.find('[data-test="details"]').trigger("click");
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledTimes(1);
  });

  test("refetches issue when description card emits saved", async () => {
    vi.clearAllMocks();

    await wrapper.find('[data-test="description"]').trigger("click");
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledTimes(1);
  });

  test("refetches issue when issueId prop changes", async () => {
    vi.clearAllMocks();

    await wrapper.setProps({ issueId: "ISSUE-2" });
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith("ISSUE-2");
    expect(issueService.getIssue).toHaveBeenCalledTimes(1);
  });

  test("does NOT refetch when only projectId changes", async () => {
    vi.clearAllMocks();

    await wrapper.setProps({ projectId: "PROJ-2" });
    await flushPromises();

    expect(issueService.getIssue).not.toHaveBeenCalled();
  });

  test("sets description after fetching issue", () => {
    expect(wrapper.vm.description).toBe("Test description");
  });
});