import { describe, it, expect } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import {useTimelineAttachments,
  isImageAttachment,
  getAttachmentTypeLabel,} from '@/composables/useTimelineAttachments';
import type { TimelineAttachmentSource } from '@/composables/useTimelineAttachments';

function mountAttachments(attachments: TimelineAttachmentSource[]) {
  const TestComponent = defineComponent({
    setup() {
      return {
        ...useTimelineAttachments({
          attachments: () => attachments,
          buildDownloadUrl: (attachmentId, fileName) =>
            `/base/${encodeURIComponent(attachmentId)}/${encodeURIComponent(fileName ?? attachmentId)}`,
        }),
      };
    },
    template: '<div></div>',
  });
  return mount(TestComponent);
}

describe('useTimelineAttachments', () => {
  it('builds a download URL and ignores attachments without an id', () => {
    const wrapper = mountAttachments([
      {
        attachmentId: 'att-1', fileName: 'report.pdf', contentType: 'application/pdf' 
      },
      { fileName: 'missing-id.txt' },
    ]);

    expect(wrapper.vm.attachments).toHaveLength(1);
    expect(wrapper.vm.attachments[0]).toMatchObject({
      attachmentId: 'att-1',
      downloadUrl: '/base/att-1/report.pdf',
    });
  });

  it('splits attachments into image and non-image groups', () => {
    const wrapper = mountAttachments([
      {
        attachmentId: 'img-1', fileName: 'photo.jpg', contentType: 'image/jpeg' 
      },
      {
        attachmentId: 'doc-1', fileName: 'report.pdf', contentType: 'application/pdf' 
      },
    ]);

    expect(wrapper.vm.imageAttachments).toHaveLength(1);
    expect(wrapper.vm.imageAttachments[0]?.attachmentId).toBe('img-1');
    expect(wrapper.vm.nonImageAttachments).toHaveLength(1);
    expect(wrapper.vm.nonImageAttachments[0]?.attachmentId).toBe('doc-1');
  });

  it('returns an empty list when attachments() is undefined', () => {
    const wrapper = mountAttachments(undefined as unknown as TimelineAttachmentSource[]);

    expect(wrapper.vm.attachments).toEqual([]);
  });
});

describe('isImageAttachment', () => {
  it('detects images by contentType', () => {
    expect(isImageAttachment({ contentType: 'image/png' })).toBe(true);
  });

  it('falls back to a known image extension when contentType is missing', () => {
    expect(isImageAttachment({ fileName: 'photo.webp' })).toBe(true);
  });

  it('returns false for a non-image without a recognized extension', () => {
    expect(isImageAttachment({ fileName: 'README' })).toBe(false);
  });
});

describe('getAttachmentTypeLabel', () => {
  it('uppercases the file extension', () => {
    expect(getAttachmentTypeLabel({ fileName: 'report.pdf' })).toBe('PDF');
  });

  it('falls back to FILE when there is no extension', () => {
    expect(getAttachmentTypeLabel({ fileName: 'README' })).toBe('FILE');
    expect(getAttachmentTypeLabel({})).toBe('FILE');
  });
});
