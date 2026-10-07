import type { TimelineAttachmentView } from '@/components/TimelineEntryCard.vue';

export interface AttachmentLike {
  contentType?: string;
  fileName?: string;
}

export function isImageAttachment(attachment: AttachmentLike): boolean {
  return attachment.contentType?.startsWith('image/') ?? false;
}

export function getAttachmentTypeLabel(attachment: AttachmentLike): string {
  const fileName = attachment.fileName?.trim().toLowerCase();
  if (!fileName?.includes('.')) {
    return 'FILE';
  }

  const extension = fileName.split('.').pop();
  return extension ? extension.toUpperCase() : 'FILE';
}

export interface AttachmentSource extends AttachmentLike {
  attachmentId?: string;
  downloadUrl?: string;
}

/**
 * Maps backend attachments to the view model of TimelineEntryCard, skipping entries
 * without id or download URL (they cannot be previewed or downloaded).
 */
export function toAttachmentViews(attachments?: AttachmentSource[]): TimelineAttachmentView[] {
  return (attachments ?? []).flatMap((attachment) => {
    const { attachmentId, downloadUrl } = attachment;
    if (!attachmentId || !downloadUrl) {
      return [];
    }

    return [{
      attachmentId,
      contentType: attachment.contentType,
      downloadUrl,
      fileName: attachment.fileName,
    }];
  });
}
