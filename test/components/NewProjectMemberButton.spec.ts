import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import NewProjectMemberButton from '../../src/components/NewProjectMemberButton.vue';
import { projectMemberService } from '../../src/services/ProjectMemberService';

describe('NewProjectMemberButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewProjectMemberButton>>;

  vi.mock('@/services/ProjectMemberService');

  beforeEach(async () => {
    wrapper = mount(NewProjectMemberButton, {
      propsData: {
        projectId: 'test-project-id',
      },
      attachTo: document.body, // notwendig, da PrimeVue Dialog teleportiert
    });
    vi.clearAllMocks();
  });

  test('addMember - adds a new member successfully', async () => {
    projectMemberService.addMember.mockResolvedValueOnce({});
    wrapper.vm.newMemberEmail = 'test@example.com';
    wrapper.vm.newMemberRole = 'MANAGER';
    await wrapper.vm.addMember();
    expect(projectMemberService.addMember).toHaveBeenCalledWith('test-project-id', {
      email: 'test@example.com',
      role: 'MANAGER',
    });
  });

  test('shows red border and error for invalid email input', async () => {
    // Dialog öffnen
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();

    // Ungültige E-Mail eingeben
    const emailInput = document.querySelector('input#email')!;
    expect(emailInput).toBeTruthy();
    emailInput.value = 'ungueltig';
    emailInput.dispatchEvent(new Event('input'));

    // Rolle setzen
    wrapper.vm.newMemberRole = 'MANAGER';

    // Klick auf Hinzufügen
    const buttons = document.querySelectorAll('button');
    const addButton = Array.from(buttons).find(btn => btn.textContent?.includes('Hinzufügen'));
    expect(addButton).toBeTruthy();
    addButton?.dispatchEvent(new Event('click'));

    await wrapper.vm.$nextTick();

    // Prüfen, ob .p-invalid gesetzt ist und Fehlermeldung erscheint
    expect(emailInput.classList.contains('p-invalid')).toBe(true);
    const errorText = document.querySelector('small.text-red-500');
    expect(errorText).toBeTruthy();
    expect(errorText!.textContent).toContain('gültige E-Mail-Adresse');
  });
});
