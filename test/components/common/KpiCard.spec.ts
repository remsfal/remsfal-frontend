import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import KpiCard from '@/components/common/KpiCard.vue';

describe('KpiCard', () => {
  it('renders icon, title, value and subtext', () => {
    const wrapper = mount(KpiCard, {
      props: {
        icon: 'pi pi-home',
        title: 'Gebäude',
        value: 4,
        subtext: '340 m²',
      },
    });

    expect(wrapper.find('i.pi-home').exists()).toBe(true);
    expect(wrapper.text()).toContain('Gebäude');
    expect(wrapper.text()).toContain('4');
    expect(wrapper.text()).toContain('340 m²');
  });

  it('applies var(--primary-color) as the default icon background', () => {
    const wrapper = mount(KpiCard, {
      props: {
        icon: 'pi pi-home', title: 'Gebäude', value: 4 
      },
    });

    const iconBox = wrapper.find('i.pi-home').element.parentElement as HTMLElement;
    expect(iconBox.style.backgroundColor).toBe('var(--primary-color)');
  });

  it('omits the subtext when not provided', () => {
    const wrapper = mount(KpiCard, {
      props: {
        icon: 'pi pi-home', title: 'Gebäude', value: 4 
      },
    });

    expect(wrapper.find('.mt-1').exists()).toBe(false);
  });

  it('allows overriding the icon background', () => {
    const wrapper = mount(KpiCard, {
      props: {
        icon: 'pi pi-home',
        title: 'Gebäude',
        value: 4,
        iconBackground: '#ff0000',
      },
    });

    const iconBox = wrapper.find('i.pi-home').element.parentElement as HTMLElement;
    expect(iconBox.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });
});
