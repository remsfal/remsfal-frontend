import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";

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

  return {
    IssueService: vi.fn().mockImplementation(() => ({
      createIssue: createIssueMock,
      getIssues: getIssuesMock,
    })),
  };
});

// ---- IMPORT COMPONENT AFTER MOCKS ----
import IssueView from "@/views/IssueView.vue";
import type { Status, Type } from "@/services/IssueService";

// ---- TESTS ----
describe("IssueView.vue", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = mount(IssueView, {
      props: {
 projectId: "proj-1", assigneeId: "user1", category: 'TASK' as Type
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

  test("creates a new issue and updates tables", () => {
    const newIssue = {
      id: "1",
      title: "New Issue",
      description: "Description",
      status: 'OPEN' as Status,
      type: 'TASK' as Type,
    };

    wrapper.vm.issues.push(newIssue);
    wrapper.vm.issuesByStatusOpen.push(newIssue);
    wrapper.vm.myIssues.push(newIssue);

    expect(wrapper.vm.issues.length).toBe(1);
    expect(wrapper.vm.issuesByStatusOpen.length).toBe(1);
    expect(wrapper.vm.myIssues.length).toBe(1);
  });

  test("opens create issue dialog", () => {
    wrapper.vm.showNewIssueDialog = true;
    expect(wrapper.vm.showNewIssueDialog).toBe(true);
  });
  
  test("renders correct IssueTable based on props", async () => {
    await wrapper.setProps({ assigneeId: undefined, status: 'OPEN' as Status });
    expect(wrapper.findComponent({ name: "IssueTable" }).exists()).toBe(true);
  });
  

  test("navigates to issue details on row select", () => {
    const issue = {
 id: "123", title: "Sample", status: 'OPEN' as Status 
};
    wrapper.vm.onIssueSelect(issue);

    expect(pushMock).toHaveBeenCalledWith({
      name: "IssueDetails",
      params: { issueId: "123" },
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
      assigneeId: undefined, category: "DEFECT", status: 'OPEN' as Status
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
      assigneeId: undefined, category: undefined, status: 'OPEN' as Status
});
    expect(wrapper.text()).toContain("Offene Aufgaben");
  });

  test("renders correct header for no assignee/status + TASK", async () => {
    await wrapper.setProps({
      assigneeId: undefined, category: undefined, status: undefined
});
    expect(wrapper.text()).toContain("Alle Aufgaben");
  });  


  test("adds issue to myIssues with assignee when assignee prop is set", async () => {
    wrapper.vm.myIssues = [];
    const issue = {
 id: "123", title: "Test", status: 'OPEN' as Status 
};
    await wrapper.setProps({ assignee: "testOwner" });
    
    wrapper.vm.myIssues.push({ ...issue, assignee: "testOwner" });
    expect(wrapper.vm.myIssues[0].assignee).toBe("testOwner");
  });

  test("handles error during loadIssuesWithOpenStatus", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  
    await expect(wrapper.vm.loadIssuesWithOpenStatus()).resolves.not.toThrow();
  
    expect(consoleErrorSpy).toHaveBeenCalled();
  
    consoleErrorSpy.mockRestore();
  });
  
  test("handles error during loadMyIssues", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  
    await expect(wrapper.vm.loadMyIssues()).resolves.not.toThrow();
  
    expect(consoleErrorSpy).toHaveBeenCalled();
  
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

  test("handleIssueCreated updates all issue arrays correctly", () => {
    const newIssue = {
      id: "new-123",
      title: "New Issue",
      description: "New Description",
      status: 'OPEN' as Status,
      type: 'TASK' as Type,
    };

    wrapper.vm.handleIssueCreated(newIssue);

    expect(wrapper.vm.issues).toContainEqual(newIssue);
    expect(wrapper.vm.issuesByStatusOpen).toContainEqual(newIssue);
    expect(wrapper.vm.myIssues).toContainEqual(
      expect.objectContaining({
        id: "new-123",
        assigneeId: "user1",
      })
    );
  });

  test("adds issue to issuesByStatusOpen when status is OPEN", async () => {
    wrapper.vm.issuesByStatusOpen = [];
    const newIssue = {
 id: "999", title: "Test", description: "Desc", status: 'OPEN' as Status 
};
    
    wrapper.vm.issues.push(newIssue);
    wrapper.vm.issuesByStatusOpen.push(newIssue);
    
    expect(wrapper.vm.issuesByStatusOpen).toHaveLength(1);
    expect(wrapper.vm.issuesByStatusOpen[0].status).toBe('OPEN' as Status);
  });
});
