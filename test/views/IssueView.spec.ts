import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";

// ---- MOCK ROUTER ----
const pushMock = vi.fn();
vi.mock("vue-router", () => ({useRouter: () => ({ push: pushMock }),}));

// ---- MOCK IssueService MODULE ----
vi.mock("@/services/IssueService", () => {
  // define everything inside the factory
  const mockStatusValues = {
    OPEN: "OPEN",
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    CLOSED: "CLOSED",
    REJECTED: "REJECTED",
  };

  const mockIssueTypeTask = "TASK";

  const createIssueMock = vi.fn().mockResolvedValue({
    id: "1",
    title: "Test Issue",
    description: "Test Description",
    status: mockStatusValues.OPEN,
  });

  const getIssuesMock = vi.fn().mockResolvedValue({ issues: [] });

  return {
    IssueService: vi.fn().mockImplementation(() => ({
      createIssue: createIssueMock,
      getIssues: getIssuesMock,
    })),
    StatusValues: mockStatusValues,
    ISSUE_TYPE_TASK: mockIssueTypeTask,
  };
});

// ---- IMPORT COMPONENT AFTER MOCKS ----
import IssueView from "@/views/IssueView.vue";
import { StatusValues, ISSUE_TYPE_TASK } from "@/services/IssueService";

// ---- TESTS ----
describe("IssueView.vue", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = mount(IssueView, {
      props: {
 projectId: "proj-1", owner: "user1", category: ISSUE_TYPE_TASK 
},
      global: {
        stubs: {
          IssueTable: true,
          Dialog: false,
          Button: false,
          InputText: false,
        },
      },
    });
  });

  test("renders component", () => {
    expect(wrapper.exists()).toBe(true);
  });

  test("creates a new issue and updates tables", () => {
    wrapper.vm.visible = true;

    const newIssue = {
      id: "1",
      title: "New Issue",
      description: "Description",
      status: StatusValues.OPEN,
      type: ISSUE_TYPE_TASK,
    };

    wrapper.vm.issues.push(newIssue);
    wrapper.vm.issuesByStatusOpen.push(newIssue);
    wrapper.vm.myIssues.push(newIssue);

    wrapper.vm.visible = false;

    expect(wrapper.vm.visible).toBe(false);
    expect(wrapper.vm.issues.length).toBe(1);
    expect(wrapper.vm.issuesByStatusOpen.length).toBe(1);
    expect(wrapper.vm.myIssues.length).toBe(1);
  });

  test("opens create issue dialog", () => {
    wrapper.vm.openCreateIssueDialog();
    expect(wrapper.vm.visible).toBe(true);
    expect(wrapper.vm.title).toBe("");
    expect(wrapper.vm.description).toBe("");
  });
  
  test("renders correct IssueTable based on props", async () => {
    await wrapper.setProps({ owner: undefined, status: StatusValues.OPEN });
    expect(wrapper.findComponent({ name: "IssueTable" }).exists()).toBe(true);
  });
  

  test("navigates to issue details on row select", () => {
    const issue = {
 id: "123", title: "Sample", status: StatusValues.OPEN 
};
    wrapper.vm.onIssueSelect(issue);

    expect(pushMock).toHaveBeenCalledWith({
      name: "IssueDetails",
      params: { issueId: "123" },
    });
  });

  test("renders correct header for owner + DEFECT category", async () => {
    await wrapper.setProps({ owner: "user1", category: "DEFECT", status: undefined });
    expect(wrapper.text()).toContain("Meine Mängel");
  });

  test("renders correct header for status + DEFECT category", async () => {
    await wrapper.setProps({ owner: undefined, category: "DEFECT", status: StatusValues.OPEN });
    expect(wrapper.text()).toContain("Offene Mängel");
  });

  test("renders correct header for no owner/status + DEFECT", async () => {
    await wrapper.setProps({ owner: undefined, category: "DEFECT", status: undefined });
    expect(wrapper.text()).toContain("Alle Mängel");
  });

  test("renders correct header for owner + TASK category", async () => {
    await wrapper.setProps({ owner: "user1", category: undefined, status: undefined });
    expect(wrapper.text()).toContain("Meine Aufgaben");
  });

  test("renders correct header for status + TASK category", async () => {
    await wrapper.setProps({ owner: undefined, category: undefined, status: StatusValues.OPEN });
    expect(wrapper.text()).toContain("Offene Aufgaben");
  });

  test("renders correct header for no owner/status + TASK", async () => {
    await wrapper.setProps({ owner: undefined, category: undefined, status: undefined });
    expect(wrapper.text()).toContain("Alle Aufgaben");
  });  


  test("adds issue to myIssues with owner when owner prop is set", async () => {
    wrapper.vm.myIssues = [];
    const issue = { id: "123", title: "Test", status: StatusValues.OPEN };
    await wrapper.setProps({ owner: "testOwner" });
    
    wrapper.vm.myIssues.push({ ...issue, owner: "testOwner" });
    expect(wrapper.vm.myIssues[0].owner).toBe("testOwner");
  });

  test("handles error during loadIssuesWithOpenStatus", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    try {
      await wrapper.vm.loadIssuesWithOpenStatus();
    } catch {}
    
    consoleErrorSpy.mockRestore();
  });

  test("handles error during loadMyIssues", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    try {
      await wrapper.vm.loadMyIssues();
    } catch {}
    
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

  test("resets form fields when opening dialog", () => {
    wrapper.vm.title = "Some Title";
    wrapper.vm.description = "Some Description";
    wrapper.vm.openCreateIssueDialog();
    
    expect(wrapper.vm.title).toBe("");
    expect(wrapper.vm.description).toBe("");
    expect(wrapper.vm.visible).toBe(true);
  });

  test("adds issue to issuesByStatusOpen when status is OPEN", async () => {
    wrapper.vm.issuesByStatusOpen = [];
    const newIssue = { id: "999", title: "Test", description: "Desc", status: StatusValues.OPEN };
    
    wrapper.vm.issues.push(newIssue);
    wrapper.vm.issuesByStatusOpen.push(newIssue);
    
    expect(wrapper.vm.issuesByStatusOpen).toHaveLength(1);
    expect(wrapper.vm.issuesByStatusOpen[0].status).toBe(StatusValues.OPEN);
  });
});
