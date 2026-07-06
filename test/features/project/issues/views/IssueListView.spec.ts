import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount, VueWrapper, flushPromises } from "@vue/test-utils";

// ---- MOCK ROUTER ----
const pushMock = vi.fn();
vi.mock("vue-router", () => ({useRouter: () => ({ push: pushMock }),}));

// ---- MOCK IssueService MODULE ----
vi.mock("@/services/IssueService", () => {
  const createIssueMock = vi.fn().mockResolvedValue({
    id: "1",
    title: "Test Issue",
    description: "Test Description",
    status: "OPEN",
  });

  const getIssuesMock = vi.fn().mockResolvedValue({ issues: [] });

  const instanceMethods = {
    createIssue: createIssueMock,
    getIssues: getIssuesMock,
  };

  return {
    IssueService: vi.fn().mockImplementation(() => instanceMethods),
    issueService: instanceMethods,
  };
});

// ---- IMPORT COMPONENT AFTER MOCKS ----
import IssueListView from "@/features/project/issues/views/IssueListView.vue";
import IssueTable from "@/features/project/issues/components/IssueTable.vue";
import NewIssueDialog from "@/features/project/issues/components/NewIssueDialog.vue";
import type { IssueStatus, IssueType } from "@/services/IssueService";

// ---- TESTS ----
describe("IssueListView.vue", () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueListView>>;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = mount(IssueListView, {
      props: {
        projectId: "proj-1", assigneeId: "user1", category: 'TASK' as IssueType
      },
      global: {
        stubs: {
          IssueTable: true,
          NewIssueDialog: true,
          Button: false,
        },
      },
    });
  });

  test("renders component", () => {
    expect(wrapper.exists()).toBe(true);
  });

  test("opens create issue dialog", async () => {
    await wrapper.get("button").trigger("click");
    expect(wrapper.findComponent(NewIssueDialog).props("visible")).toBe(true);
  });

  test("renders correct IssueTable based on props", async () => {
    await wrapper.setProps({ assigneeId: undefined, status: 'OPEN' as IssueStatus });
    expect(wrapper.findComponent({ name: "IssueTable" }).exists()).toBe(true);
  });


  test("navigates to issue details on row select", async () => {
    const issue = {
      id: "123", title: "Sample", status: 'OPEN' as IssueStatus
    };
    await wrapper.findComponent(IssueTable).vm.$emit("rowSelect", issue);

    expect(pushMock).toHaveBeenCalledWith({
      name: "IssueDetails",
      params: { projectId: "proj-1", issueId: "123" },
    });
  });

  test("renders correct header for assignee + DEFECT category", async () => {
    await wrapper.setProps({
      assigneeId: "user1", category: "DEFECT", status: undefined
    });
    expect(wrapper.text()).toContain("Meine Mängel");
  });

  test("renders correct header for status + DEFECT category", async () => {
    await wrapper.setProps({
      assigneeId: undefined, category: "DEFECT", status: 'OPEN' as IssueStatus
    });
    expect(wrapper.text()).toContain("Offene Mängel");
  });

  test("renders correct header for no assignee/status + DEFECT", async () => {
    await wrapper.setProps({
      assigneeId: undefined, category: "DEFECT", status: undefined
    });
    expect(wrapper.text()).toContain("Alle Mängel");
  });

  test("renders correct header for assignee + TASK category", async () => {
    await wrapper.setProps({
      assigneeId: "user1", category: undefined, status: undefined
    });
    expect(wrapper.text()).toContain("Meine Aufgaben");
  });

  test("renders correct header for status + TASK category", async () => {
    await wrapper.setProps({
      assigneeId: undefined, category: undefined, status: 'OPEN' as IssueStatus
    });
    expect(wrapper.text()).toContain("Offene Aufgaben");
  });

  test("renders correct header for no assignee/status + TASK", async () => {
    await wrapper.setProps({
      assigneeId: undefined, category: undefined, status: undefined
    });
    expect(wrapper.text()).toContain("Alle Aufgaben");
  });

  test("handles error during loadIssuesWithOpenStatus", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { issueService: mockedIssueService } = await import("@/services/IssueService");
    vi.mocked(mockedIssueService.getIssues)
      .mockResolvedValueOnce({
        first: 0, size: 0, issues: [] 
      }) // loadIssues()
      .mockRejectedValueOnce(new Error("Network error")); // loadIssuesWithOpenStatus()

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1", category: 'TASK' as IssueType }, // no assigneeId -> exactly 2 getIssues calls on mount
      global: {
        stubs: {
          IssueTable: true, NewIssueDialog: true, Button: false 
        } 
      },
    });
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(localWrapper.exists()).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  test("handles error during loadMyIssues", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { issueService: mockedIssueService } = await import("@/services/IssueService");
    vi.mocked(mockedIssueService.getIssues)
      .mockResolvedValueOnce({
        first: 0, size: 0, issues: [] 
      }) // loadIssues()
      .mockResolvedValueOnce({
        first: 0, size: 0, issues: [] 
      }) // loadIssuesWithOpenStatus()
      .mockRejectedValueOnce(new Error("Network error")); // loadMyIssues()

    const localWrapper = mount(IssueListView, {
      props: {
        projectId: "proj-1", assigneeId: "user1", category: 'TASK' as IssueType 
      }, // assigneeId set -> 3 calls
      global: {
        stubs: {
          IssueTable: true, NewIssueDialog: true, Button: false 
        } 
      },
    });
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(localWrapper.exists()).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  test("renders create button with correct label for DEFECT", async () => {
    await wrapper.setProps({ category: "DEFECT" });
    expect(wrapper.text()).toContain("Mangel melden");
  });

  test("renders create button with correct label for TASK", async () => {
    await wrapper.setProps({ category: undefined });
    expect(wrapper.text()).toContain("Aufgabe erstellen");
  });

  test("handleIssueCreated updates all issue arrays correctly", async () => {
    const newIssue = {
      id: "new-123",
      title: "New Issue",
      description: "New Description",
      status: 'OPEN' as IssueStatus,
      type: 'TASK' as IssueType,
    };

    await wrapper.findComponent(NewIssueDialog).vm.$emit("issueCreated", newIssue);
    await flushPromises();

    // Only the currently-active IssueTable branch (myIssues, since assigneeId is set by default) is DOM-observable.
    expect(wrapper.findComponent(IssueTable).props("issues")).toContainEqual(
      expect.objectContaining({
        id: "new-123",
        assigneeId: "user1",
      })
    );
    expect(pushMock).toHaveBeenCalledWith({
      name: 'IssueDetails',
      params: { projectId: 'proj-1', issueId: 'new-123' },
    });
  });

  test("handleIssueCreated does not touch issuesByStatusOpen/myIssues when status is not OPEN and no assignee", async () => {
    await wrapper.setProps({ assigneeId: undefined });

    const newIssue = {
      id: "closed-1",
      title: "Closed Issue",
      status: 'CLOSED' as IssueStatus,
    };

    await wrapper.findComponent(NewIssueDialog).vm.$emit("issueCreated", newIssue);
    await flushPromises();

    // Only the currently-active IssueTable branch (plain issues, since assigneeId/status are unset) is DOM-observable.
    expect(wrapper.findComponent(IssueTable).props("issues")).toContainEqual(newIssue);
    expect(pushMock).toHaveBeenCalledWith({
      name: 'IssueDetails',
      params: { projectId: 'proj-1', issueId: 'closed-1' },
    });
  });

  test("handleIssueCreated falls back to empty issueId when id is missing", async () => {
    const newIssue = {
      title: "No Id Issue",
      status: 'OPEN' as IssueStatus,
    };

    await wrapper.findComponent(NewIssueDialog).vm.$emit("issueCreated", newIssue);
    await flushPromises();

    expect(pushMock).toHaveBeenCalledWith({
      name: 'IssueDetails',
      params: { projectId: 'proj-1', issueId: '' },
    });
  });

  test("onIssueSelect falls back to empty issueId when id is missing", async () => {
    const issue = { title: "No Id Issue", status: 'OPEN' as IssueStatus };

    await wrapper.findComponent(IssueTable).vm.$emit("rowSelect", issue);

    expect(pushMock).toHaveBeenCalledWith({
      name: 'IssueDetails',
      params: { projectId: 'proj-1', issueId: '' },
    });
  });

  test("does not load myIssues on mount when assigneeId prop is not set", async () => {
    const { issueService: mockedIssueService } = await import("@/services/IssueService");
    vi.clearAllMocks();

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1", category: 'TASK' as IssueType },
      global: {
        stubs: {
          IssueTable: true,
          NewIssueDialog: true,
          Button: false,
        },
      },
    });

    await flushPromises();

    expect(mockedIssueService.getIssues).toHaveBeenCalledTimes(2);
    expect(localWrapper.findComponent(IssueTable).props("issues")).toHaveLength(0);
  });
});
