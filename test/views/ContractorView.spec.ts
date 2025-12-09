import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ContractorView from '../../src/views/ContractorView.vue';

const PROJECT_ID = 'test-project-id';

const factory = () =>
    shallowMount(ContractorView, {
      props: { projectId: PROJECT_ID },
      global: {
        stubs: {
          Card: { template: '<div><slot name="title"></slot><slot></slot></div>' },
          Dialog: true,
          ContractorTable: true,
          InputText: true,
          Button: true,
        },
      },
    });

describe('ContractorView.vue', () => {
  it('rendert den Header-Text', () => {
    const wrapper = factory();

    const text = wrapper.text();
    expect(text).toContain('Auftraggeber & Dienstleister');
    expect(text).toContain('Verwalte hier externe Firmen, die für dieses Projekt beauftragt werden können.');
  });

  it('setzt showDialog auf true, wenn openCreateDialog aufgerufen wird', () => {
    const wrapper = factory();

    expect((wrapper.vm as any).showDialog).toBe(false);

    (wrapper.vm as any).openCreateDialog();

    expect((wrapper.vm as any).showDialog).toBe(true);
  });
});
