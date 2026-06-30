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

  const baseStubs = {
    Card: { template: '<div><slot name="title" /><slot name="content" /></div>' },
    FileUpload: {
      template:
        '<button data-test="upload"' +
        ' @click="$emit(\'uploader\', { files: [{ name: \'doc.pdf\', type: \'application/pdf\' }] })" />',
    },
    Image: {
      props: ['src', 'alt', 'preview', 'imageClass'],
      template: '<img :src="src" :alt="alt" />',
    },
    Button: { template: '<button @click="$emit(\'click\')" />' },
  };

  function mountCard(attachments: Array<Record<string, unknown>> = []) {
    return mount(IssueAttachmentCard, {
      props: {
        issueId: 'issue-1',
        attachments,
      },
      global: {stubs: baseStubs,},
    });
  }

  test('uploads selected files and emits saved', async () => {
    const wrapper = mountCard();

    await wrapper.find('[data-test="upload"]').trigger('click');
    await flushPromises();

    expect(issueService.uploadAttachments).toHaveBeenCalledWith(
      'issue-1',
      expect.arrayContaining([expect.objectContaining({ name: 'doc.pdf' })])
    );
    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  test('skips upload when no files are provided', async () => {
    const wrapper = mount(IssueAttachmentCard, {
      props: {
        issueId: 'issue-1',
        attachments: [],
      },
      global: {
        stubs: {
          ...baseStubs,
          FileUpload: {
            template:
              '<button data-test="upload-empty"' +
              ' @click="$emit(\'uploader\', { files: [] })" />',
          },
        },
      },
    });

    await wrapper.find('[data-test="upload-empty"]').trigger('click');
    await flushPromises();

    expect(issueService.uploadAttachments).not.toHaveBeenCalled();
    expect(wrapper.emitted('saved')).toBeFalsy();
  });

  test('shows error toast when upload fails', async () => {
    vi.spyOn(issueService, 'uploadAttachments').mockRejectedValue(new Error('upload failed'));
    const wrapper = mountCard();

    await wrapper.find('[data-test="upload"]').trigger('click');
    await flushPromises();

    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: 'issueDetails.attachmentsUploadError',
    }));
    expect(wrapper.emitted('saved')).toBeFalsy();
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
          ...baseStubs,
          FileUpload: { template: '<div />' },
          Button: { template: '<button data-test="delete-button" @click="$emit(\'click\')" />' },
        },
      },
    });

    await wrapper.find('[data-test="delete-button"]').trigger('click');
    await flushPromises();

    expect(issueService.deleteAttachment).toHaveBeenCalledWith('issue-1', 'att-1');
    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  test('shows error toast when delete fails', async () => {
    vi.spyOn(issueService, 'deleteAttachment').mockRejectedValue(new Error('delete failed'));
    const wrapper = mount(IssueAttachmentCard, {
      props: {
        issueId: 'issue-1',
        attachments: [{
          attachmentId: 'att-1', fileName: 'img.png', contentType: 'image/png' 
        }],
      },
      global: {
        stubs: {
          ...baseStubs,
          FileUpload: { template: '<div />' },
          Button: { template: '<button data-test="delete-button" @click="$emit(\'click\')" />' },
        },
      },
    });

    await wrapper.find('[data-test="delete-button"]').trigger('click');
    await flushPromises();

    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: 'issueDetails.attachmentDeleteError',
    }));
    expect(wrapper.emitted('saved')).toBeFalsy();
  });

  test('renders indicator tiles for non-image attachments grouped by extension', async () => {
    const wrapper = mountCard([
      {
        attachmentId: 'a1', fileName: 'report.pdf', contentType: 'application/pdf' 
      },
      {
        attachmentId: 'a2', fileName: 'invoice.pdf', contentType: 'application/pdf' 
      },
      {
        attachmentId: 'a3', fileName: 'video.mov', contentType: 'video/quicktime' 
      },
    ]);

    await flushPromises();

    const tiles = wrapper.findAll('[data-test="non-image-tile"]');
    expect(tiles).toHaveLength(2);

    const pdfTile = tiles.find(t => t.text().includes('PDF'));
    const movTile = tiles.find(t => t.text().includes('MOV'));

    expect(pdfTile?.text()).toContain('+2');
    expect(movTile?.text()).toContain('+1');
  });

  test('renders fallback values for image preview and download url', async () => {
    const wrapper = mountCard([
      {
        attachmentId: undefined,
        fileName: undefined,
        contentType: 'image/png',
      },
    ]);

    await flushPromises();

    const links = wrapper.findAll('a');
    expect(links[0].attributes('href')).toBe('/ticketing/v1/issues/issue-1/attachments//');
    expect(wrapper.find('img[alt="issue-attachment"]').exists()).toBe(true);
  });
});
