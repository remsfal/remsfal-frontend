import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantIssueAttachmentsCard from '@/features/tenant/tenantIssues/components/TenantIssueAttachmentsCard.vue';
import type { IssueAttachmentJson } from '@/services/IssueService';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

describe('TenantIssueAttachmentsCard.vue', () => {
  const mountComponent = (attachments: IssueAttachmentJson[], issueId = 'issue-prop-id') => mount(
    TenantIssueAttachmentsCard,
    {
      props: {
        issueId,
        attachments,
      },
    },
  );

  it('renders empty state when there are no attachments', () => {
    const wrapper = mountComponent([]);

    expect(wrapper.text()).toContain('issueDetails.noAttachments');
    expect(wrapper.find('[data-test="non-image-tile"]').exists()).toBe(false);
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('groups non-image files by uppercase extension and count', () => {
    const wrapper = mountComponent([
      {
        attachmentId: '1',
        fileName: 'one.pdf',
        contentType: 'application/pdf',
      },
      {
        attachmentId: '2',
        fileName: 'two.Pdf',
        contentType: 'application/pdf',
      },
      {
        attachmentId: '3',
        fileName: 'clip.mov',
        contentType: 'video/quicktime',
      },
    ]);

    const tiles = wrapper.findAll('[data-test="non-image-tile"]');
    expect(tiles).toHaveLength(2);

    const pdfTile = tiles.find((tile) => tile.text().includes('PDF'));
    const movTile = tiles.find((tile) => tile.text().includes('MOV'));

    expect(pdfTile?.text()).toContain('+2');
    expect(movTile?.text()).toContain('+1');
  });

  it('builds encoded link URL and prefers attachment issueId over prop issueId', () => {
    const wrapper = mountComponent([
      {
        issueId: 'issue with space',
        attachmentId: 'att/1',
        fileName: 'my file.pdf',
        contentType: 'application/pdf',
      },
    ], 'issue-from-prop');

    const link = wrapper.get('a');
    expect(link.attributes('href')).toBe(
      '/ticketing/v1/issues/issue%20with%20space/attachments/att%2F1/my%20file.pdf',
    );
  });

  it('uses prop issueId when attachment issueId is missing', () => {
    const wrapper = mountComponent([
      {
        attachmentId: 'att-1',
        fileName: 'report.pdf',
        contentType: 'application/pdf',
      },
    ], 'issue-from-prop');

    expect(wrapper.get('a').attributes('href')).toBe(
      '/ticketing/v1/issues/issue-from-prop/attachments/att-1/report.pdf',
    );
  });

  it('renders image preview only for image attachments', () => {
    const wrapper = mountComponent([
      {
        attachmentId: 'image-1',
        fileName: 'img.png',
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
});
