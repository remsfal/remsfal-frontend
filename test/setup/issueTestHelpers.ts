/**
 * Shared test utilities and helpers for Issue-related components
 * Reduces code duplication across test files
 */
import { vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';

// ========== Mock Setup ==========

/**
 * Global ResizeObserver mock for PrimeVue components
 */
export class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

/**
 * Setup ResizeObserver mock globally
 */
export function setupResizeObserverMock() {
  global.ResizeObserver = ResizeObserverMock as any;
}

/**
 * Mock issueService with default implementations
 */
export function createIssueServiceMock() {
  return {
    modifyIssue: vi.fn().mockResolvedValue({}),
    getIssue: vi.fn().mockResolvedValue({}),
    createIssue: vi.fn().mockResolvedValue({}),
  };
}

// ========== Test Data Fixtures ==========

/**
 * Default props for IssueDescriptionCard
 */
export const defaultIssueDescriptionProps = {
  projectId: 'proj-1',
  issueId: 'issue-1',
  initialDescription: 'Initial description',
};

/**
 * Default props for IssueDescription
 */
export const defaultIssueDescriptionViewProps = {
  description: 'Initial description',
};

/**
 * Common PrimeVue component stubs
 */
export const primeVueStubs = {
  Card: true,
  Button: true,
  IssueDescription: true,
  Textarea: true,
};

// ========== Component Mounting Helpers ==========

/**
 * Mount IssueDescriptionCard with default configuration
 */
export function mountIssueDescriptionCard(props = {}, options = {}) {
  return mount(IssueDescriptionCard as any, {
    props: { ...defaultIssueDescriptionProps, ...props },
    global: {
      stubs: primeVueStubs,
      ...options.global,
    },
    ...options,
  });
}

/**
 * Mount IssueDescription with default configuration
 */
export function mountIssueDescription(props = {}, options = {}) {
  return mount(IssueDescriptionView as any, {
    props: { ...defaultIssueDescriptionViewProps, ...props },
    global: {
      stubs: { Textarea: true },
      ...options.global,
    },
    ...options,
  });
}

// ========== Test Utilities ==========

/**
 * Simulate textarea value change
 */
export async function setTextareaValue(wrapper: VueWrapper<any>, value: string) {
  const textarea = wrapper.find('textarea');
  await textarea.setValue(value);
  return textarea;
}

/**
 * Get emitted events of a specific type
 */
export function getEmittedEvents(wrapper: VueWrapper<any>, eventName: string) {
  return wrapper.emitted(eventName);
}

/**
 * Wait for save operation to complete
 */
export async function waitForSave(wrapper: VueWrapper<any>) {
  await wrapper.vm.$nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
}

// ========== Common Test Assertions ==========

/**
 * Assert that issueService.modifyIssue was called with expected params
 */
export function expectModifyIssueCalled(
  mockFn: any,
  projectId: string,
  issueId: string,
  payload: any
) {
  expect(mockFn).toHaveBeenCalledWith(projectId, issueId, payload);
}

/**
 * Assert that an event was emitted with expected payload
 */
export function expectEventEmitted(
  wrapper: VueWrapper<any>,
  eventName: string,
  payload?: any
) {
  const emitted = wrapper.emitted(eventName);
  expect(emitted).toBeTruthy();
  if (payload !== undefined) {
    expect(emitted![emitted!.length - 1]).toEqual(payload);
  }
}

// ========== Edge Case Test Data ==========

/**
 * Collection of edge case test strings
 */
export const edgeCaseTestData = {
  emptyString: '',
  longText: 'A'.repeat(10000),
  veryLongText: 'A'.repeat(50000),
  specialChars: '<script>alert("XSS")</script>\\n\\r\\t\\u0000',
  markdown: '# Header\\n\\n## Subheader\\n\\n- Item 1\\n- Item 2\\n\\n```js\\nconsole.log("test");\\n```',
  unicode: 'Test with emojis 😀🎉 and unicode: ñ, ü, 中文, 日本語',
  unicodeExtended: '你好世界 🌍 Привет мир',
  emojis: '😀 👍 🎉 ⭐ ✅ ❌ ⚠️ 📝',
  tabsAndWhitespace: 'Normal\\tTabbed\\t\\tDouble Tab\\n\\t\\tIndented',
  lineBreaks: 'Line 1\\nLine 2\\nLine 3',
};

/**
 * Generate test cases for different ID formats
 */
export function generateIdTestCases() {
  return [
    { projectId: 'simple-id', issueId: 'issue-1' },
    { projectId: '123-numeric', issueId: 'issue-2' },
    { projectId: 'uuid-123e4567-e89b-12d3', issueId: 'issue-3' },
    { projectId: 'proj-with-dash', issueId: 'issue-with-dash' },
    { projectId: 'proj_underscore', issueId: 'issue_underscore' },
  ];
}

// Placeholder imports (will be resolved at runtime)
let IssueDescriptionCard: any;
let IssueDescriptionView: any;

try {
  IssueDescriptionCard = require('@/components/issue/IssueDescriptionCard.vue').default;
} catch (e) {
  // Component not available in this context
}

try {
  IssueDescriptionView = require('@/views/IssueDescription.vue').default;
} catch (e) {
  // Component not available in this context
}
