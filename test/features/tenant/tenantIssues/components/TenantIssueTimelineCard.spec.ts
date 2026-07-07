import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantIssueTimelineCard from '@/features/tenant/tenantIssues/components/TenantIssueTimelineCard.vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

describe('TenantIssueTimelineCard.vue', () => {
  it('renders title and timeline placeholder', () => {
    const wrapper = mount(TenantIssueTimelineCard);

    expect(wrapper.text()).toContain('tenantIssues.timeline.title');
    expect(wrapper.text()).toContain('tenantIssues.timeline.placeholder');
    expect(wrapper.find('[data-testid="tenant-issue-timeline-placeholder"]').exists()).toBe(true);
  });
});