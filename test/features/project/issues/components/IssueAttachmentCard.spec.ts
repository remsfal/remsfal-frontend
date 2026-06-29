import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import IssueAttachmentCard from '@/features/project/issues/components/IssueAttachmentCard.vue';
import { issueService } from '@/services/IssueService';

const toastAddMock = vi.fn();

vi.mock('@/services/IssueService', () => ({
  issueService: {
    uploadAttachments: vi.fn(),
    deleteAttachment: vi.fn(),
  },
}));

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

describe('IssueAttachmentCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(issueService, 'uploadAttachments').mockResolvedValue();
    vi.spyOn(issueService, 'deleteAttachment').mockResolvedValue();
  });

  test('uploads selected files and emits saved', async () => {
    const wrapper = mount(IssueAttachmentCard, {
      props: {
        issueId: 'issue-1',
        attachments: [],
      },
      global: {
        stubs: {
          Card: { template: '<div><slot name="title" /><slot name="content" /></div>' },
          FileUpload: {
            template:
              '<button data-test="upload"' +
              ' @click="$emit(\'uploader\', { files: [{ name: \'doc.pdf\', type: \'application/pdf\' }] })" />',
          },
          Galleria: true,
          Button: { template: '<button @click="$emit(\'click\')" />' },
        },
      },
    });

    await wrapper.find('[data-test="upload"]').trigger('click');
    await flushPromises();

    expect(issueService.uploadAttachments).toHaveBeenCalledWith(
      'issue-1',
      expect.arrayContaining([expect.objectContaining({ name: 'doc.pdf' })])
    );
    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  test('deletes attachment and emits saved', async () => {
    const wrapper = mount(IssueAttachmentCard, {
      props: {
        issueId: 'issue-1',
        attachments: [
          {
            attachmentId: 'att-1',
            fileName: 'img.png',
            contentType: 'image/png',
          },
        ],
      },
      global: {
        stubs: {
          Card: { template: '<div><slot name="title" /><slot name="content" /></div>' },
          FileUpload: { template: '<div />' },
          Galleria: true,
          Button: { template: '<button data-test="delete-button" @click="$emit(\'click\')" />' },
        },
      },
    });

    await wrapper.find('[data-test="delete-button"]').trigger('click');
    await flushPromises();

    expect(issueService.deleteAttachment).toHaveBeenCalledWith('issue-1', 'att-1');
    expect(wrapper.emitted('saved')).toBeTruthy();
  });
});
