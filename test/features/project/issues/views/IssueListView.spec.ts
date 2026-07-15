import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount, VueWrapper, flushPromises } from "@vue/test-utils";

// ---- MOCK ROUTER ----
const pushMock = vi.fn();
vi.mock("vue-router", () => ({useRouter: () => ({ push: pushMock }),}));

// ---- MOCK IssueService MODULE ----
vi.mock("@/services/IssueService", () => {
  const getIssuesMock = vi.fn().mockResolvedValue({ issues: [] });

  const instanceMethods = {getIssues: getIssuesMock,};

  return {
    IssueService: vi.fn().mockImplementation(() => instanceMethods),
    issueService: instanceMethods,
  };
});

// ---- IMPORT COMPONENT AFTER MOCKS ----
import IssueListView from "@/features/project/issues/views/IssueListView.vue";
import IssueTable from "@/features/project/issues/components/IssueTable.vue";
import NewIssueDialog from "@/features/project/issues/components/NewIssueDialog.vue";
import { issueService } from "@/services/IssueService";
import type { IssueStatus, IssueType } from "@/services/IssueService";

const getIssuesMock = vi.mocked(issueService.getIssues);

// ---- TESTS ----
describe("IssueListView.vue", () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueListView>>;

  beforeEach(() => {
    vi.clearAllMocks();
    getIssuesMock.mockResolvedValue({
      first: 0, size: 0, issues: [] 
    });

    wrapper = mount(IssueListView, {
      props: {
        projectId: "proj-1", assigneeId: "user1", type: 'TASK' as IssueType
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

  test("fetches issues once on mount with status and assigneeId forwarded to the backend", async () => {
    await flushPromises();
    expect(getIssuesMock).toHaveBeenCalledTimes(1);
    expect(getIssuesMock).toHaveBeenCalledWith("proj-1", undefined, undefined, "user1");
  });

  test("re-fetches when status changes", async () => {
    await flushPromises();
    getIssuesMock.mockClear();

    await wrapper.setProps({ status: 'OPEN' as IssueStatus });
    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledTimes(1);
    expect(getIssuesMock).toHaveBeenCalledWith("proj-1", undefined, "OPEN", "user1");
  });

  test("does not re-fetch when only type changes (client-side filter)", async () => {
    await flushPromises();
    getIssuesMock.mockClear();

    await wrapper.setProps({ type: 'DEFECT' as IssueType });
    await flushPromises();

    expect(getIssuesMock).not.toHaveBeenCalled();
  });

  test("filters issues by type on the client", async () => {
    getIssuesMock.mockResolvedValueOnce({
      first: 0,
      size: 2,
      issues: [
        {
          id: "1", title: "Task issue", type: 'TASK' as IssueType, status: 'OPEN' as IssueStatus 
        },
        {
          id: "2", title: "Defect issue", type: 'DEFECT' as IssueType, status: 'OPEN' as IssueStatus 
        },
      ],
    });

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1", type: 'TASK' as IssueType },
      global: { stubs: { NewIssueDialog: true, Button: false } },
    });
    await flushPromises();

    const issues = localWrapper.findComponent(IssueTable).props("issues");
    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe("1");
  });

  test("shows all issues when type is not set", async () => {
    getIssuesMock.mockResolvedValueOnce({
      first: 0,
      size: 2,
      issues: [
        {
          id: "1", title: "Task issue", type: 'TASK' as IssueType, status: 'OPEN' as IssueStatus 
        },
        {
          id: "2", title: "Defect issue", type: 'DEFECT' as IssueType, status: 'OPEN' as IssueStatus 
        },
      ],
    });

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1" },
      global: { stubs: { NewIssueDialog: true, Button: false } },
    });
    await flushPromises();

    expect(localWrapper.findComponent(IssueTable).props("issues")).toHaveLength(2);
  });

  test("passes different columns for DEFECT vs TASK views", async () => {
    await flushPromises();
    expect(wrapper.findComponent(IssueTable).props("columns")).toEqual(['title', 'assignee', 'status']);

    await wrapper.setProps({ type: 'DEFECT' as IssueType });
    await flushPromises();
    expect(wrapper.findComponent(IssueTable).props("columns")).toEqual(['title', 'status', 'priority']);
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

  test("renders correct header for assignee + DEFECT type", async () => {
    await wrapper.setProps({
      assigneeId: "user1", type: "DEFECT", status: undefined
    });
    expect(wrapper.text()).toContain("Meine Mängel");
  });

  test("renders correct header for status OPEN + DEFECT type", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: "DEFECT", status: 'OPEN' as IssueStatus
    });
    expect(wrapper.text()).toContain("Offene Mängel");
  });

  test("renders correct header for status CLOSED + DEFECT type", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: "DEFECT", status: 'CLOSED' as IssueStatus
    });
    expect(wrapper.text()).toContain("Geschlossene Mängel");
  });

  test("renders correct header for status PENDING + DEFECT type", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: "DEFECT", status: 'PENDING' as IssueStatus
    });
    expect(wrapper.text()).toContain("Neue Mängel");
  });

  test("renders correct header for no assignee/status + DEFECT", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: "DEFECT", status: undefined
    });
    expect(wrapper.text()).toContain("Alle Mängel");
  });

  test("renders correct header for assignee + TASK type", async () => {
    await wrapper.setProps({
      assigneeId: "user1", type: undefined, status: undefined
    });
    expect(wrapper.text()).toContain("Meine Aufgaben");
  });

  test("renders correct header for status + TASK type", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: undefined, status: 'OPEN' as IssueStatus
    });
    expect(wrapper.text()).toContain("Offene Aufgaben");
  });

  test("renders correct header for no assignee/status + TASK", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: undefined, status: undefined
    });
    expect(wrapper.text()).toContain("Alle Aufgaben");
  });

  test("handles error during loadIssues", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getIssuesMock.mockRejectedValueOnce(new Error("Network error"));

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1", type: 'TASK' as IssueType },
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
    await wrapper.setProps({ type: "DEFECT" });
    expect(wrapper.text()).toContain("Mangel melden");
  });

  test("renders create button with correct label for TASK", async () => {
    await wrapper.setProps({ type: undefined });
    expect(wrapper.text()).toContain("Aufgabe erstellen");
  });

  test("handleIssueCreated re-fetches issues and navigates to the new issue", async () => {
    await flushPromises();
    getIssuesMock.mockClear();
    getIssuesMock.mockResolvedValueOnce({
      first: 0,
      size: 1,
      issues: [{
        id: "new-123", title: "New Issue", type: 'TASK' as IssueType, status: 'OPEN' as IssueStatus 
      }],
    });

    const newIssue = {
      id: "new-123",
      title: "New Issue",
      status: 'OPEN' as IssueStatus,
      type: 'TASK' as IssueType,
    };

    await wrapper.findComponent(NewIssueDialog).vm.$emit("issueCreated", newIssue);
    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith({
      name: 'IssueDetails',
      params: { projectId: 'proj-1', issueId: 'new-123' },
    });
  });

  test("falls back to empty issueId when the created issue has no id", async () => {
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

  test("does not pass assigneeId to the backend when the prop is not set", async () => {
    getIssuesMock.mockClear();

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1", type: 'TASK' as IssueType },
      global: {
        stubs: {
          IssueTable: true,
          NewIssueDialog: true,
          Button: false,
        },
      },
    });

    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledTimes(1);
    expect(getIssuesMock).toHaveBeenCalledWith("proj-1", undefined, undefined, undefined);
    expect(localWrapper.findComponent(IssueTable).props("issues")).toHaveLength(0);
  });
});
