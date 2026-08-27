import { computed } from 'vue';
import type { ComputedRef } from 'vue';

export interface TimelineAttachmentSource {
  attachmentId?: string;
  contentType?: string;
  fileName?: string;
}

export interface TimelineAttachmentView {
  attachmentId: string;
  contentType?: string;
  downloadUrl: string;
  fileName?: string;
}

export interface UseTimelineAttachmentsOptions<A extends TimelineAttachmentSource> {
  attachments: () => A[] | undefined;
  buildDownloadUrl: (attachmentId: string, fileName?: string) => string;
}

const imageFileExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);

function getFileExtension(fileName?: string): string | undefined {
  const trimmed = fileName?.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('.')) {
    return undefined;
  }
  return trimmed.split('.').pop();
}

export function isImageAttachment(attachment: { contentType?: string; fileName?: string }): boolean {
  if (attachment.contentType?.startsWith('image/')) {
    return true;
  }
  const extension = getFileExtension(attachment.fileName);
  return extension ? imageFileExtensions.has(extension) : false;
}

export function getAttachmentTypeLabel(attachment: { fileName?: string }): string {
  const extension = getFileExtension(attachment.fileName);
  return extension ? extension.toUpperCase() : 'FILE';
}

export function openAttachmentDownload(downloadUrl: string): void {
  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
}

export function useTimelineAttachments<A extends TimelineAttachmentSource>(
  options: UseTimelineAttachmentsOptions<A>,
): {
  attachments: ComputedRef<TimelineAttachmentView[]>;
  imageAttachments: ComputedRef<TimelineAttachmentView[]>;
  nonImageAttachments: ComputedRef<TimelineAttachmentView[]>;
} {
  const attachments = computed<TimelineAttachmentView[]>(() =>
    (options.attachments() ?? []).flatMap((attachment) => {
      const attachmentId = attachment.attachmentId;
      if (!attachmentId) {
        return [];
      }

      const fileName = attachment.fileName;
      return [{
        attachmentId,
        contentType: attachment.contentType,
        downloadUrl: options.buildDownloadUrl(attachmentId, fileName),
        fileName,
      }];
    }),
  );

  const imageAttachments = computed(() => attachments.value.filter(isImageAttachment));
  const nonImageAttachments = computed(() => attachments.value.filter((attachment) => !isImageAttachment(attachment)));

  return {
    attachments, imageAttachments, nonImageAttachments 
  };
}
