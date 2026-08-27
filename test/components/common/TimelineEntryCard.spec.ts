import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TimelineEntryCard from '@/components/common/TimelineEntryCard.vue';

describe('TimelineEntryCard component', () => {
  it('renders title, message and formatted date', () => {
    const wrapper = mount(TimelineEntryCard, {
      props: {
        title: 'Titel',
        message: 'Hallo Welt',
        date: '2026-01-02T10:00:00.000Z',
      },
    });

    expect(wrapper.text()).toContain('Titel');
    expect(wrapper.text()).toContain('Hallo Welt');
    expect(wrapper.find('.w-40').text()).not.toBe('-');
  });

  it('shows a placeholder dash when no date is given', () => {
    const wrapper = mount(TimelineEntryCard, { props: { title: 'Titel' } });

    expect(wrapper.find('.w-40').text()).toBe('-');
  });

  it('applies the given testId to the article element', () => {
    const wrapper = mount(TimelineEntryCard, { props: { title: 'Titel', testId: 'my-entry' } });

    expect(wrapper.find('[data-testid="my-entry"]').exists()).toBe(true);
  });

  it('renders nothing attachment-related when no attachments are given', () => {
    const wrapper = mount(TimelineEntryCard, { props: { title: 'Titel', attachmentsLabel: 'Anhänge' } });

    expect(wrapper.text()).not.toContain('Anhänge');
  });

  it('renders image attachments with a preview and triggers download from the overlay button', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = mount(TimelineEntryCard, {
      props: {
        title: 'Titel',
        attachmentsLabel: 'Anhänge',
        downloadAttachmentLabel: 'Herunterladen',
        attachments: [
          {
            attachmentId: 'img-1',
            fileName: 'photo.jpg',
            contentType: 'image/jpeg',
            downloadUrl: '/img-1',
          },
        ],
      },
    });

    expect(wrapper.find('img').exists()).toBe(true);
    await wrapper.get('button.p-button').trigger('click');

    expect(openSpy).toHaveBeenCalledWith('/img-1', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('treats image extensions as images even without a content type', () => {
    const wrapper = mount(TimelineEntryCard, {
      props: {
        title: 'Titel',
        attachmentsLabel: 'Anhänge',
        attachments: [
          {
            attachmentId: 'img-1',
            fileName: 'photo.webp',
            downloadUrl: '/img-1',
          },
        ],
      },
    });

    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('WEBP');
  });

  it('renders non-image attachments as a labeled tile and triggers download on click', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = mount(TimelineEntryCard, {
      props: {
        title: 'Titel',
        attachmentsLabel: 'Anhänge',
        downloadAttachmentLabel: 'Herunterladen',
        attachments: [
          {
            attachmentId: 'att-1',
            fileName: 'report.pdf',
            contentType: 'application/pdf',
            downloadUrl: '/att-1',
          },
        ],
      },
    });

    expect(wrapper.text()).toContain('PDF');
    await wrapper.get('button.cursor-pointer').trigger('click');

    expect(openSpy).toHaveBeenCalledWith('/att-1', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('shows a FILE label for attachments without a recognizable extension', () => {
    const wrapper = mount(TimelineEntryCard, {
      props: {
        title: 'Titel',
        attachmentsLabel: 'Anhänge',
        attachments: [
          {
            attachmentId: 'file-1',
            fileName: 'README',
            downloadUrl: '/file-1',
          },
        ],
      },
    });

    expect(wrapper.text()).toContain('FILE');
  });
});
