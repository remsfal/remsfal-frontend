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
import NewIssueButton from "@/features/project/issues/components/NewIssueButton.vue";
import { issueService } from "@/services/IssueService";
import type { IssueStatus, IssueType } from "@/services/IssueService";

const getIssuesMock = vi.mocked(issueService.getIssues);

// ---- TESTS ----
describe("IssueListView.vue", () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueListView>>;

  beforeEach(() => {
    vi.clearAllMocks();
    getIssuesMock.mockResolvedValue({ size: 0, issues: []});

    wrapper = mount(IssueListView, {
      props: {
        projectId: "proj-1", assigneeId: "user1", type: 'TASK' as IssueType
      },
      global: {
        stubs: {
          IssueTable: true,
          NewIssueButton: true, NewTenantIssueButton: true,
          Button: false,
        },
      },
    });
  });

  test("renders component", () => {
    expect(wrapper.exists()).toBe(true);
  });

  test("fetches issues once on mount with status, type and assigneeId forwarded to the backend", async () => {
    await flushPromises();
    expect(getIssuesMock).toHaveBeenCalledTimes(1);
    expect(getIssuesMock).toHaveBeenCalledWith("proj-1", undefined, "TASK", "user1");
  });

  test("re-fetches when status changes", async () => {
    await flushPromises();
    getIssuesMock.mockClear();

    await wrapper.setProps({ status: 'OPEN' as IssueStatus });
    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledTimes(1);
    expect(getIssuesMock).toHaveBeenCalledWith("proj-1", "OPEN", "TASK", "user1");
  });

  test("re-fetches when type changes (server-side filter)", async () => {
    await flushPromises();
    getIssuesMock.mockClear();

    await wrapper.setProps({ type: 'DEFECT' as IssueType });
    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledTimes(1);
    expect(getIssuesMock).toHaveBeenCalledWith("proj-1", undefined, "DEFECT", "user1");
  });

  test("forwards array-valued status/type filters to getIssues untouched", async () => {
    await flushPromises();
    getIssuesMock.mockClear();

    await wrapper.setProps({
      status: ['OPEN', 'IN_PROGRESS'] as IssueStatus[],
      type: ['APPLICATION', 'INQUIRY', 'TASK', 'TERMINATION'] as IssueType[],
    });
    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledWith(
      "proj-1",
      ['OPEN', 'IN_PROGRESS'],
      ['APPLICATION', 'INQUIRY', 'TASK', 'TERMINATION'],
      "user1",
    );
  });

  test("passes type to the backend and displays issues returned by it as-is", async () => {
    getIssuesMock.mockResolvedValueOnce({
      size: 1,
      issues: [
        {
          id: "1", title: "Task issue", type: 'TASK' as IssueType, status: 'OPEN' as IssueStatus
        },
      ],
    });

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1", type: 'TASK' as IssueType },
      global: {
        stubs: {
          NewIssueButton: true, NewTenantIssueButton: true, Button: false 
        } 
      },
    });
    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledWith("proj-1", undefined, "TASK", undefined);
    const issues = localWrapper.findComponent(IssueTable).props("issues");
    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe("1");
  });

  test("shows all issues when type is not set", async () => {
    getIssuesMock.mockResolvedValueOnce({
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
      global: {
        stubs: {
          NewIssueButton: true, NewTenantIssueButton: true, Button: false 
        } 
      },
    });
    await flushPromises();

    expect(localWrapper.findComponent(IssueTable).props("issues")).toHaveLength(2);
  });

  test("follows nextCursor to load and merge all pages", async () => {
    getIssuesMock.mockReset();
    getIssuesMock
      .mockResolvedValueOnce({
        size: 1,
        issues: [{
          id: "1", title: "Page 1 issue", status: 'OPEN' as IssueStatus
        }],
        nextCursor: "cursor-abc",
      })
      .mockResolvedValueOnce({
        size: 1,
        issues: [{
          id: "2", title: "Page 2 issue", status: 'OPEN' as IssueStatus
        }],
      });

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1" },
      global: {
        stubs: {
          NewIssueButton: true, NewTenantIssueButton: true, Button: false 
        } 
      },
    });
    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledTimes(2);
    expect(getIssuesMock).toHaveBeenNthCalledWith(1, "proj-1", undefined, undefined, undefined);
    expect(getIssuesMock).toHaveBeenNthCalledWith(
      2, "proj-1", undefined, undefined, undefined, undefined, undefined, undefined, "cursor-abc",
    );

    const issues = localWrapper.findComponent(IssueTable).props("issues");
    expect(issues).toHaveLength(2);
    expect(issues.map((issue: { id?: string }) => issue.id)).toEqual(["1", "2"]);
  });

  test("uses the fallback columns when the filter signature matches no specific preset", async () => {
    await flushPromises();
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['issueNumber', 'title', 'type', 'status', 'modifiedAt']);

    await wrapper.setProps({ type: ['DEFECT', 'TASK'] as IssueType[] });
    await flushPromises();
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['issueNumber', 'title', 'type', 'status', 'modifiedAt']);
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

  test("renders 'Meine Aufgaben' with its columns when only assigneeId is set", async () => {
    await wrapper.setProps({
      assigneeId: "user1", type: undefined, status: undefined
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Meine Aufgaben");
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['title', 'type', 'status', 'priority', 'modifiedAt']);
  });

  test("renders 'Offene Aufgaben' with its columns when status is OPEN/IN_PROGRESS with no type", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: undefined, status: ['OPEN', 'IN_PROGRESS'] as IssueStatus[]
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Offene Aufgaben");
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['issueNumber', 'title', 'type', 'assignee', 'priority']);
  });

  test("renders 'Alle Aufgaben' with its columns when no filters are set", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: undefined, status: undefined
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Alle Aufgaben");
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['issueNumber', 'title', 'type', 'status', 'modifiedAt']);
  });

  test("renders 'Alle Aufgaben' as a fallback for an unrecognized filter combination", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: undefined, status: 'CLOSED' as IssueStatus
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Alle Aufgaben");
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['issueNumber', 'title', 'type', 'status', 'modifiedAt']);
  });

  test("renders 'Neue Meldungen' with its columns when status is PENDING with no type", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: undefined, status: 'PENDING' as IssueStatus
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Neue Meldungen");
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['issueNumber', 'title', 'type', 'modifiedAt']);
  });

  test("renders 'Offene Mängel' with its columns when status is OPEN/IN_PROGRESS and type is DEFECT", async () => {
    await wrapper.setProps({
      assigneeId: undefined, type: 'DEFECT' as IssueType, status: ['OPEN', 'IN_PROGRESS'] as IssueStatus[]
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Offene Mängel");
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['issueNumber', 'title', 'type', 'assignee', 'priority']);
  });

  test("renders 'Offene Vorgänge' with its columns for status OPEN/IN_PROGRESS and the request-type set", async () => {
    await wrapper.setProps({
      assigneeId: undefined,
      type: ['APPLICATION', 'INQUIRY', 'TASK', 'TERMINATION'] as IssueType[],
      status: ['OPEN', 'IN_PROGRESS'] as IssueStatus[],
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Offene Vorgänge");
    expect(wrapper.findComponent(IssueTable).props("columns"))
      .toEqual(['issueNumber', 'title', 'type', 'assignee', 'priority']);
  });

  test("handles error during loadIssues", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getIssuesMock.mockRejectedValueOnce(new Error("Network error"));

    const localWrapper = mount(IssueListView, {
      props: { projectId: "proj-1", type: 'TASK' as IssueType },
      global: {
        stubs: {
          IssueTable: true, NewIssueButton: true, NewTenantIssueButton: true, Button: false
        }
      },
    });
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(localWrapper.exists()).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  test("renders the create-issue button regardless of the active filter", async () => {
    await wrapper.setProps({ type: "DEFECT" });
    expect(wrapper.findComponent(NewIssueButton).exists()).toBe(true);

    await wrapper.setProps({ type: undefined });
    expect(wrapper.findComponent(NewIssueButton).exists()).toBe(true);
  });

  test("does not pass a category to NewIssueButton", async () => {
    await flushPromises();
    expect(wrapper.findComponent(NewIssueButton).props("category")).toBeUndefined();
  });

  test("handleIssueCreated re-fetches issues and navigates to the new issue", async () => {
    await flushPromises();
    getIssuesMock.mockClear();
    getIssuesMock.mockResolvedValueOnce({
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

    await wrapper.findComponent(NewIssueButton).vm.$emit("issueCreated", newIssue);
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

    await wrapper.findComponent(NewIssueButton).vm.$emit("issueCreated", newIssue);
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
          NewIssueButton: true, NewTenantIssueButton: true,
          Button: false,
        },
      },
    });

    await flushPromises();

    expect(getIssuesMock).toHaveBeenCalledTimes(1);
    expect(getIssuesMock).toHaveBeenCalledWith("proj-1", undefined, "TASK", undefined);
    expect(localWrapper.findComponent(IssueTable).props("issues")).toHaveLength(0);
  });
});
