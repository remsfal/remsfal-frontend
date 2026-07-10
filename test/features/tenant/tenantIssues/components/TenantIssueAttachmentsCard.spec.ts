import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantIssueAttachmentsCard from '@/features/tenant/tenantIssues/components/TenantIssueAttachmentsCard.vue';
import type { IssueAttachmentJson } from '@/services/IssueService';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

describe('TenantIssueAttachmentsCard.vue', () => {
  function mountCard(attachments: IssueAttachmentJson[], issueId = 'issue-1') {
    return mount(TenantIssueAttachmentsCard, {
      props: {
        issueId,
        attachments,
      },
    });
  }

  it('renders no-attachments text when list is empty', () => {
    const wrapper = mountCard([]);

    expect(wrapper.text()).toContain('issueDetails.noAttachments');
    expect(wrapper.find('[data-test="non-image-tile"]').exists()).toBe(false);
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('groups non-image attachments by extension and uses unknown marker fallback', () => {
    const wrapper = mountCard([
      {
        attachmentId: 'a1',
        fileName: 'report.pdf',
        contentType: 'application/pdf',
      },
      {
        attachmentId: 'a2',
        fileName: 'invoice.pdf',
        contentType: 'application/pdf',
      },
      {
        attachmentId: 'a3',
        fileName: 'video.mov',
        contentType: 'video/quicktime',
      },
      { attachmentId: 'a4', contentType: 'application/octet-stream' },
    ]);

    const tiles = wrapper.findAll('[data-test="non-image-tile"]');
    expect(tiles).toHaveLength(3);

    const pdfTile = tiles.find((tile) => tile.text().includes('PDF'));
    const movTile = tiles.find((tile) => tile.text().includes('MOV'));
    const unknownTile = tiles.find((tile) => tile.text().includes('?'));

    expect(pdfTile?.text()).toContain('+2');
    expect(movTile?.text()).toContain('+1');
    expect(unknownTile?.text()).toContain('+1');
  });

  it('renders image previews only for image attachments', () => {
    const wrapper = mountCard([
      {
        attachmentId: 'image-1',
        fileName: 'photo.png',
        contentType: 'image/png',
      },
      {
        attachmentId: 'doc-1',
        fileName: 'report.pdf',
        contentType: 'application/pdf',
      },
    ]);

    expect(wrapper.findAll('img')).toHaveLength(1);
    expect(wrapper.findAll('[data-test="non-image-tile"]')).toHaveLength(1);
  });

  it('adds aria-label for grouped non-image tiles', () => {
    const wrapper = mountCard([
      {
        attachmentId: 'a1',
        fileName: 'report.pdf',
        contentType: 'application/pdf',
      },
    ]);

    const tile = wrapper.get('[data-test="non-image-tile"]');
    expect(tile.attributes('aria-label')).toBe('issueDetails.nonImageAttachmentsAriaLabel');
  });

  it('builds encoded download url and prefers attachment.issueId', () => {
    const wrapper = mountCard([
      {
        issueId: 'issue with space',
        attachmentId: 'att/1',
        fileName: 'my file.pdf',
        contentType: 'application/pdf',
      },
    ], 'issue-from-prop');

    const link = wrapper.get('a');
    expect(link.attributes('href')).toBe('/ticketing/v1/issues/issue%20with%20space/attachments/att%2F1/my%20file.pdf');
  });

  it('falls back to prop issueId when attachment.issueId is missing', () => {
    const wrapper = mountCard([
      {
        attachmentId: 'doc-1',
        fileName: 'report.pdf',
        contentType: 'application/pdf',
      },
    ], 'issue-from-props');

    const link = wrapper.get('a');
    expect(link.attributes('href')).toBe('/ticketing/v1/issues/issue-from-props/attachments/doc-1/report.pdf');
  });

  it('falls back to prop issueId and default values for missing fields', () => {
    const wrapper = mountCard([
      {
        attachmentId: undefined,
        fileName: undefined,
        contentType: 'image/png',
      },
    ], 'issue-from-prop');

    const link = wrapper.get('a');
    const image = wrapper.get('img');

    expect(link.attributes('href')).toBe('/ticketing/v1/issues/issue-from-prop/attachments//');
    expect(image.attributes('src')).toBe('/ticketing/v1/issues/issue-from-prop/attachments//');
    expect(image.attributes('alt')).toBe('issue-attachment');
  });

  it('renders one download row per attachment', () => {
    const wrapper = mountCard([
      {
        attachmentId: 'a1',
        fileName: 'one.pdf',
        contentType: 'application/pdf',
      },
      {
        attachmentId: 'a2',
        fileName: 'two.pdf',
        contentType: 'application/pdf',
      },
    ]);

    expect(wrapper.findAll('a')).toHaveLength(2);
  });

  it('renders link text from fileName and keeps download security attributes', () => {
    const wrapper = mountCard([
      {
        attachmentId: 'a1',
        fileName: 'report.pdf',
        contentType: 'application/pdf',
      },
    ]);

    const link = wrapper.get('a');
    expect(link.text()).toBe('report.pdf');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
  });

  it('normalizes extension grouping to uppercase', () => {
    const wrapper = mountCard([
      {
        attachmentId: 'a1',
        fileName: 'first.Pdf',
        contentType: 'application/pdf',
      },
      {
        attachmentId: 'a2',
        fileName: 'second.pdf',
        contentType: 'application/pdf',
      },
    ]);

    const tiles = wrapper.findAll('[data-test="non-image-tile"]');
    expect(tiles).toHaveLength(1);
    expect(tiles[0].text()).toContain('PDF');
    expect(tiles[0].text()).toContain('+2');
  });
});
