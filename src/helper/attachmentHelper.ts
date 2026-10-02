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
