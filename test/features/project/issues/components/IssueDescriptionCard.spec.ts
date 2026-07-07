import { describe, test, expect, beforeEach, vi, type Mock } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import IssueDescriptionCard from '@/features/project/issues/components/IssueDescriptionCard.vue';
import { issueService, type IssueJson } from '@/services/IssueService';
import {defaultIssueDescriptionProps,
  edgeCaseTestData,
  expectModifyIssueCalled,
  expectEventEmitted,
  setupResizeObserverMock,} from '../../../../setup/issueTestHelpers';

// ---- Mock issueService ----
vi.mock('@/services/IssueService', () => ({ issueService: { updateIssue: vi.fn() } }));

// Textarea's autoResize feature relies on ResizeObserver, which JSDOM does not implement.
setupResizeObserverMock();

function findSaveButton(w: VueWrapper) {
  const button = w.findAll('button').find((b) => b.text().includes('Speichern'));
  if (!button) throw new Error('Save button not found');
  return button;
}

// ---- Test Suite ----
describe('IssueDescriptionCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueDescriptionCard>>;

  const mountComponent = (props = {}) =>
    mount(IssueDescriptionCard, { props: { ...defaultIssueDescriptionProps, ...props } });

  beforeEach(() => {
    vi.clearAllMocks();
    (issueService.updateIssue as Mock).mockResolvedValue({});
    wrapper = mountComponent();
  });

  test('renders component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('calls updateIssue when saving', async () => {
    await wrapper.find('#issue-description').setValue('Updated description');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expectModifyIssueCalled(
      // issueService is mocked via vi.mock() above, but keeps its real declared type here
      issueService.updateIssue as unknown as Mock,
      defaultIssueDescriptionProps.issueId,
      { description: 'Updated description' } as Partial<IssueJson>,
    );
  });

  test('emits saved event after save', async () => {
    await wrapper.find('#issue-description').setValue('Updated description');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expectEventEmitted(wrapper, 'saved');
  });

  test('does not call updateIssue if canSave is false', async () => {
    await wrapper.find('#issue-description').setValue('Initial description'); // same as original
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).not.toHaveBeenCalled();
  });

  test('resets originalDescription after successful save', async () => {
    await wrapper.find('#issue-description').setValue('Updated description');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(wrapper.find<HTMLTextAreaElement>('#issue-description').element.value).toBe(
      'Updated description',
    );
    // canSave is now false (description matches the updated originalDescription), so the button is disabled again
    expect(findSaveButton(wrapper).attributes('disabled')).toBeDefined();
  });

  test('handles error when updateIssue fails', async () => {
    (issueService.updateIssue as Mock).mockRejectedValueOnce(new Error('API Error'));

    await wrapper.find('#issue-description').setValue('Updated description');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    // loadingSave is back to false, and canSave is still true, so the button must be enabled
    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  test('updates description when initialDescription prop changes', async () => {
    await wrapper.setProps({ initialDescription: 'New description from parent' });
    await nextTick();

    expect(wrapper.find<HTMLTextAreaElement>('#issue-description').element.value).toBe(
      'New description from parent',
    );
    // originalDescription was updated to match, so canSave is false and the button is disabled
    expect(findSaveButton(wrapper).attributes('disabled')).toBeDefined();
  });

  test('canSave returns true when description differs from original', async () => {
    await wrapper.find('#issue-description').setValue('Different description');

    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  test('canSave returns false when description matches original', async () => {
    await wrapper.find('#issue-description').setValue('Initial description');

    expect(findSaveButton(wrapper).attributes('disabled')).toBeDefined();
  });

  test('sets loading state to true during save operation', async () => {
    let resolveUpdate!: (value?: unknown) => void;
    (issueService.updateIssue as Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );

    await wrapper.find('#issue-description').setValue('Updated');
    const saveButton = findSaveButton(wrapper);
    const clickPromise = saveButton.trigger('click');
    await nextTick();

    expect(saveButton.attributes('disabled')).toBeDefined();

    resolveUpdate();
    await clickPromise;
    await flushPromises();

    // The save succeeded, so originalDescription now matches description (canSave is false),
    // which keeps the button disabled regardless of loadingSave. Change the description again to
    // isolate and confirm that loadingSave itself was reset to false: if it were still true, the
    // button would stay disabled even though canSave is now true.
    await wrapper.find('#issue-description').setValue('Updated again');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  test('does not save when description is empty but different', async () => {
    await wrapper.find('#issue-description').setValue(edgeCaseTestData.emptyString);
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    // Should still save empty string if it's different
    expect(issueService.updateIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.emptyString },
    );
  });

  test('handles very long description text', async () => {
    await wrapper.find('#issue-description').setValue(edgeCaseTestData.longText);
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.longText },
    );
  });

  test('handles special characters in description', async () => {
    await wrapper.find('#issue-description').setValue(edgeCaseTestData.specialChars);
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    // A real <textarea> element normalizes line endings (lone \r and \r\n both become \n) as part
    // of its value-sanitization algorithm, so that's what ends up in the DOM (and thus the model)
    // after setValue - not the raw fixture string.
    const normalizedSpecialChars = edgeCaseTestData.specialChars.replace(/\r\n?/g, '\n');
    expect(issueService.updateIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.issueId,
      { description: normalizedSpecialChars },
    );
  });

  test('handles rapid save attempts (concurrent saves blocked)', async () => {
    await wrapper.find('#issue-description').setValue('First update');

    const saveButton = findSaveButton(wrapper);
    const click1 = saveButton.trigger('click');
    const click2 = saveButton.trigger('click'); // Should be blocked

    await Promise.all([click1, click2]);
    await flushPromises();

    // Should only be called once due to loadingSave guard
    expect(issueService.updateIssue).toHaveBeenCalledTimes(1);
  });

  test('preserves description after failed save', async () => {
    (issueService.updateIssue as Mock).mockRejectedValueOnce(new Error('Network error'));

    const updatedDesc = 'Updated but failed';
    await wrapper.find('#issue-description').setValue(updatedDesc);
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(wrapper.find<HTMLTextAreaElement>('#issue-description').element.value).toBe(
      updatedDesc,
    );
    // originalDescription was not updated, so canSave is still true and the button remains enabled
    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  test('emit saved event is called exactly once per successful save', async () => {
    await wrapper.find('#issue-description').setValue('New save');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    const emittedEvents = wrapper.emitted('saved');
    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents![0]).toEqual([]);
  });

  test('handles markdown content in description', async () => {
    await wrapper.find('#issue-description').setValue(edgeCaseTestData.markdown);
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.markdown },
    );
  });

  test('handles unicode and emoji in description', async () => {
    await wrapper.find('#issue-description').setValue(edgeCaseTestData.unicode);
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.unicode },
    );
  });
});
