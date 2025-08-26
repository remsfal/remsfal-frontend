import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ProjectChatView from '../../src/views/ProjectChatView.vue';
import Button from 'primevue/button';

describe('ProjectChatView.vue', () => {
  it('zeigt Eingabe für Benutzernamen', () => {
    const wrapper = mount(ProjectChatView);
    expect(wrapper.find('input[placeholder="Dein Name..."]').exists()).toBe(true);
  });

  it('wechselt in den Chatbereich nach Namenseingabe', async () => {
    const wrapper = mount(ProjectChatView);
    const input = wrapper.find('input');
    await input.setValue('Bilal');
    const button = wrapper.get('button');
    await button.trigger('click');

    expect(wrapper.text()).toContain('Projekt-Chat');
  });

  it('fügt eine Nachricht hinzu und leert das Eingabefeld', async () => {
    const wrapper = mount(ProjectChatView);

    // Name eingeben und Start klicken
    await wrapper.find('input').setValue('Bilal');
    let buttons = wrapper.findAllComponents(Button);
    await buttons[0].trigger('click');

    await flushPromises(); // DOM nach dem Klick auf „Start“ abwarten

    // Nachricht schreiben
    const input = wrapper.find('input[placeholder="Nachricht eingeben..."]');
    await input.setValue('Testnachricht');

    // Buttons nach DOM-Update neu holen
    buttons = wrapper.findAllComponents(Button);
    const sendenButton = buttons.find(b => b.text() === 'Senden');

    expect(sendenButton).toBeTruthy();
    await sendenButton!.trigger('click');

    // Erwartung: Nachricht ist da
    expect(wrapper.text()).toContain('Testnachricht');

    // Erwartung: Eingabefeld ist leer
    expect(input.element.value).toBe('');
  });

  it('fügt Emoji zur Nachricht hinzu', async () => {
    const wrapper = mount(ProjectChatView);

    await wrapper.find('input').setValue('Bilal');
    await wrapper.get('button').trigger('click');

    const emojiButtons = wrapper.findAll('[data-testid="emoji-button"]');
    expect(emojiButtons.length).toBeGreaterThan(0);

    const targetEmoji = '🙂';
    const matchingButton = emojiButtons.find(button => button.text() === targetEmoji);
    expect(matchingButton).toBeTruthy();

    await matchingButton!.trigger('click');

    expect(wrapper.text()).toContain(targetEmoji);
  });

  it('zeigt Dateiname nach Dateiupload', async () => {
    // ⬇️ DataTransfer polyfill (wichtig!)
    class MockDataTransfer {
      files: File[] = [];
      items = {
        add: (file: File) => {
          this.files.push(file);
        },
      };
    }
    globalThis.DataTransfer = MockDataTransfer as any;

    const wrapper = mount(ProjectChatView);

    await wrapper.find('input').setValue('Bilal');
    await wrapper.find('button').trigger('click');

    const file = new File(['dummy content'], 'bild.png', { type: 'image/png' });
    const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    Object.defineProperty(inputEl, 'files', {
      value: dataTransfer.files,
      writable: false,
    });

    await wrapper.find('input[type="file"]').trigger('change');

    expect(wrapper.html()).toContain('bild.png');
  });
});
