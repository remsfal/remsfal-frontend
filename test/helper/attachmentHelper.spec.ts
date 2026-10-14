import { describe, expect, it } from 'vitest';
import { getAttachmentTypeLabel, isImageAttachment, toAttachmentViews } from '@/helper/attachmentHelper';

describe('attachmentHelper', () => {
  it('detects image attachments by content type', () => {
    expect(isImageAttachment({ contentType: 'image/png' })).toBe(true);
    expect(isImageAttachment({ contentType: 'application/pdf' })).toBe(false);
    expect(isImageAttachment({ fileName: 'photo.jpg' })).toBe(false);
  });

  it('derives the type label from the file extension', () => {
    expect(getAttachmentTypeLabel({ fileName: 'plan.pdf' })).toBe('PDF');
    expect(getAttachmentTypeLabel({ fileName: 'README' })).toBe('FILE');
  });

  describe('toAttachmentViews', () => {
    it('returns an empty list for missing attachments', () => {
      expect(toAttachmentViews(undefined)).toEqual([]);
      expect(toAttachmentViews([])).toEqual([]);
    });

    it('keeps id, content type, download URL and file name and skips entries without id or URL', () => {
      expect(toAttachmentViews([
        {
          attachmentId: 'att-1',
          fileName: 'plan.pdf',
          contentType: 'application/pdf',
          downloadUrl: '/download/att-1/plan.pdf',
        },
        { fileName: 'missing-id.pdf', downloadUrl: '/download/missing-id.pdf' },
        { attachmentId: 'att-2', fileName: 'missing-url.pdf' },
      ])).toEqual([
        {
          attachmentId: 'att-1',
          contentType: 'application/pdf',
          downloadUrl: '/download/att-1/plan.pdf',
          fileName: 'plan.pdf',
        },
      ]);
    });
  });
});
