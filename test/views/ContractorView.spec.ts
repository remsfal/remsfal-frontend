import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ContractorView from '../../src/views/ContractorView.vue';

const PROJECT_ID = 'test-project-id';

const factory = () =>
    shallowMount(ContractorView, {
      props: {
        projectId: PROJECT_ID,
      },
      global: {
        stubs: {
          // Card so stubben, dass Slots gerendert werden (damit der Header-Text sichtbar ist)
          Card: {
            template: '<div><slot name="title"></slot><slot></slot></div>',
          },
          // Rest einfach stubben, wir brauchen nichts davon im Test
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
    // Nur statischer Text – robust und simpel
    expect(text).toContain('Auftraggeber & Dienstleister');
    expect(text).toContain(
        'Verwalte hier externe Firmen, die für dieses Projekt beauftragt werden können.',
    );
  });

  it('setzt showDialog auf true, wenn openCreateDialog aufgerufen wird', () => {
    const wrapper = factory();

    // showDialog ist ein top-level ref aus <script setup>
    expect((wrapper.vm as any).showDialog).toBe(false);

    // Direkt die Logik testen, ohne Button/DOM
    (wrapper.vm as any).openCreateDialog();

    expect((wrapper.vm as any).showDialog).toBe(true);
  });
});
