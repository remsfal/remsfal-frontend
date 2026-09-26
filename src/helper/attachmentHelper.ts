export interface AttachmentLike {
  contentType?: string;
  fileName?: string;
}

export function isImageAttachment(attachment: AttachmentLike): boolean {
  return attachment.contentType?.startsWith('image/') ?? false;
}

export function getIssueAttachmentUrl(
  issueId: string,
  attachment: { attachmentId?: string; fileName?: string },
): string {
  const encodedIssueId = encodeURIComponent(issueId);
  const encodedAttachmentId = encodeURIComponent(attachment.attachmentId ?? '');
  const encodedFileName = encodeURIComponent(attachment.fileName ?? '');
  return `/ticketing/v1/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
}

export function getAttachmentTypeLabel(attachment: AttachmentLike): string {
  const fileName = attachment.fileName?.trim().toLowerCase();
  if (!fileName?.includes('.')) {
    return 'FILE';
  }

  const extension = fileName.split('.').pop();
  return extension ? extension.toUpperCase() : 'FILE';
}
