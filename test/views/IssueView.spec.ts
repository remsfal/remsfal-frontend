import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ------------------ MOCKS ------------------

// Mock router push
const pushMock = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock IssueService
const createIssueMock = vi.fn().mockResolvedValue({
  id: "1",
  title: "Test Issue",
  description: "Test Description",
  status: "OPEN",
});

const getIssuesMock = vi.fn().mockResolvedValue({ issues: [] });

vi.mock("@/services/IssueService", () => ({
  IssueService: vi.fn().mockImplementation(() => ({
    createIssue: createIssueMock,
    getIssues: getIssuesMock,
  })),
  StatusValues: { OPEN: "OPEN" },
  ISSUE_TYPE_TASK: "TASK",
}));

// Now import the component AFTER mocks
import IssueView from "@/views/IssueView.vue";

// ------------------ TESTS ------------------

describe("IssueView.vue", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(async () => {
    wrapper = mount(IssueView, {
      props: { projectId: "proj-1", owner: "user1", category: "TASK" },
      global: {
        stubs: {
          IssueTable: true, // stub table
          Dialog: false,    // real dialog
          Button: false,
          InputText: false,
        },
      },
    });
    await flushPromises();
  });

  it("renders component", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("renders correct title based on props", () => {
    const h1 = wrapper.find("h1");
    expect(h1.text()).toBe("Meine Aufgaben");
  });

  it("opens create issue dialog", async () => {
    const button = wrapper.findAllComponents({ name: "Button" }).find(
      b => b.props("label") === "Aufgabe erstellen"
    );

    expect(button).toBeDefined();

    await button!.vm.$emit("click");
    await flushPromises();

    expect(wrapper.vm.visible).toBe(true);
  });

  it('creates a new issue and updates tables', async () => {
    const wrapper = mount(IssueView, { props: { projectId: '123' } });

    // Open dialog
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();

    // Simulate creating an issue
    const newIssue: IssueItem = {
      id: '1',
      title: 'New Issue',
      description: 'Description',
      status: StatusValues.OPEN,
      type: 'TASK',
    };
    wrapper.vm.issues.push(newIssue); // Add issue to the issues array
    wrapper.vm.issuesByStatusOpen.push(newIssue); // Add issue to the open issues array
    wrapper.vm.myIssues.push(newIssue); // Add issue to the user's issues array
    await wrapper.vm.$nextTick();

    // Close dialog
    wrapper.vm.visible = false;
    await wrapper.vm.$nextTick();

    // Assertions
    expect(wrapper.vm.visible).toBe(false);
    expect(wrapper.vm.issues.length).toBe(1);
    expect(wrapper.vm.issuesByStatusOpen.length).toBe(1);
    expect(wrapper.vm.myIssues.length).toBe(1);
  });


  it("navigates to issue details on row select", async () => {
    const issue = { id: "123", title: "Sample", status: "OPEN" };
    wrapper.vm.onIssueSelect(issue);

    expect(pushMock).toHaveBeenCalledWith({
      name: "IssueDetails",
      params: { issueId: "123" },
    });
  });
});
