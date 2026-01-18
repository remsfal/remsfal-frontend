// Mock ResizeObserver globally
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import IssueDescription from "@/views/IssueDescription.vue";

describe("IssueDescription.vue", () => {
  it("renders the initial description prop", () => {
    const wrapper = mount(IssueDescription, {
      props: { description: "Initial description" },
    });

    const textarea = wrapper.find("textarea");
    expect(textarea.element.value).toBe("Initial description");
  });

  it("emits 'update:description' when textarea changes", async () => {
    const wrapper = mount(IssueDescription, {
      props: { description: "Initial description" },
    });

    const textarea = wrapper.find("textarea");
    await textarea.setValue("Updated description");

    const emitted = wrapper.emitted("update:description");
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual(["Updated description"]);
  });

  it("updates local value when prop changes", async () => {
    const wrapper = mount(IssueDescription, {
      props: { description: "Initial description" },
    });

    await wrapper.setProps({ description: "New description" });
    const textarea = wrapper.find("textarea");
    expect(textarea.element.value).toBe("New description");
  });
});
