import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SiteFormComponent from '../../src/components/SiteFormComponent.vue';

const DataTable = {
  props: ['value'],
  template: `
    <table>
      <tbody>
        <tr v-for="item in value" :key="item.id">
          <td>{{ item.firstName }}</td>
          <td>{{ item.lastName }}</td>
          <td>{{ item.period }}</td>
          <td>{{ item.price }}</td>
          <td>{{ item.email }}</td>
        </tr>
      </tbody>
    </table>
  `,
};

const stubs = {
  DataTable,
  Column: true,
  Button: { props: ['label'], template: '<button @click="$emit(\'click\')">{{ label }}</button>' },
  ReusableForm: { template: '<form></form>' },
};

const defaultProps = {
  projectId: '123',
  siteId: '456',
  headline: 'Test-Headline',
  saveButtonText: 'Speichern',
  cancelButtonText: 'Abbrechen',
};

describe('SiteFormComponent Tabelle', () => {
  it('rendert aktuelle Mieter in der Tabelle', async () => {
    const wrapper = mount(SiteFormComponent, {
      props: defaultProps,
      global: { stubs },
    });

    await wrapper.vm.$nextTick();

    // Überprüfe, ob die Tabellendaten im DOM erscheinen
    const tableText = wrapper.find('table').text();
    expect(tableText).toContain('Lena');
    expect(tableText).toContain('Schneider');
    expect(tableText).toContain('01.06.2025 - 11.06.2025');
    expect(tableText).toContain('125');
    expect(tableText).toContain('lena.schneider@example.com');
  });
});
