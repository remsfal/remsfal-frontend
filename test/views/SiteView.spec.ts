import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import SiteView from '../../src/views/SiteView.vue';
import { siteService } from '../../src/services/SiteService';

vi.mock('../../src/services/SiteService', () => ({
  siteService: {
    getSite: vi.fn(),
    updateSite: vi.fn(),
  },
}));

vi.mock('../../src/components/SiteFormComponent.vue', () => ({
  default: {
    name: 'SiteFormComponent',
    template: '<div class="mock-site-form"></div>',
    props: [
      'projectId',
      'propertyId',
      'siteId',
      'headline',
      'saveButtonText',
      'cancelButtonText',
      'onSubmit',
      'onCancel',
      'initialValues',
    ],
  },
}));

describe('SiteView.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the view correctly', () => {
    wrapper = mount(SiteView, {
      props: {
        projectId: 'project-1',
        propertyId: 'property-1',
        siteId: 'site-1',
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders SiteFormComponent with correct props', () => {
    wrapper = mount(SiteView, {
      props: {
        projectId: 'project-1',
        propertyId: 'property-1',
        siteId: 'site-1',
      },
    });

    const siteForm = wrapper.findComponent({ name: 'SiteFormComponent' });
    expect(siteForm.exists()).toBe(true);
    expect(siteForm.props('projectId')).toBe('project-1');
    expect(siteForm.props('propertyId')).toBe('property-1');
    expect(siteForm.props('siteId')).toBe('site-1');
    expect(siteForm.props('headline')).toBe('Außenanlage bearbeiten');
    expect(siteForm.props('saveButtonText')).toBe('Speichern');
    expect(siteForm.props('cancelButtonText')).toBe('Abbrechen');
  });

  it('fetches site data on mount', async () => {
    const mockSite = {
      title: 'Test Site',
      description: 'Test Description',
    };

    vi.mocked(siteService.getSite).mockResolvedValue(mockSite);

    wrapper = mount(SiteView, {
      props: {
        projectId: 'project-1',
        siteId: 'site-1',
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(siteService.getSite).toHaveBeenCalledWith('project-1', 'site-1');
  });

  it('handles submit correctly', async () => {
    vi.mocked(siteService.updateSite).mockResolvedValue(undefined);

    wrapper = mount(SiteView, {
      props: {
        projectId: 'project-1',
        siteId: 'site-1',
      },
    });

    const siteForm = wrapper.findComponent({ name: 'SiteFormComponent' });
    const onSubmit = siteForm.props('onSubmit');

    const formValues = {
      title: 'Updated Title',
      description: 'Updated Description',
      space: 100,
    };

    await onSubmit(formValues);

    expect(siteService.updateSite).toHaveBeenCalledWith(
      'project-1',
      'site-1',
      expect.objectContaining({
        title: 'Updated Title',
        description: 'Updated Description',
        space: 100,
      }),
    );
  });

  it('handles cancel correctly', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    wrapper = mount(SiteView, {
      props: {
        projectId: 'project-1',
        siteId: 'site-1',
      },
    });

    const siteForm = wrapper.findComponent({ name: 'SiteFormComponent' });
    const onCancel = siteForm.props('onCancel');

    onCancel();

    expect(alertSpy).toHaveBeenCalledWith('Form submission cancelled');
    alertSpy.mockRestore();
  });
});
