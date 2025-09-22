import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ProjectChatView from '../../src/views/ProjectChatView.vue';
import Button from 'primevue/button';

describe('ProjectChatView.vue', () => {
  it('renders the username input field', () => {
    const wrapper = mount(ProjectChatView);
    expect(wrapper.find('input[data-testid="username-input"]').exists()).toBe(true);
  });

  it('switches to the chat area after entering a username', async () => {
    const wrapper = mount(ProjectChatView);
    const input = wrapper.find('input[data-testid="username-input"]');
    await input.setValue('Bilal');
    const button = wrapper.get('button');
    await button.trigger('click');

    expect(wrapper.text()).toContain('Projekt-Chat');
  });

  it('adds a message and clears the input field', async () => {
    const wrapper = mount(ProjectChatView);

    // Enter username and start chat
    const nameInput = wrapper.find('input[data-testid="username-input"]');
    await nameInput.setValue('Bilal');
    const buttonsBefore = wrapper.findAllComponents(Button);
    await buttonsBefore[0].trigger('click');

    await flushPromises(); // Wait for DOM updates

    // Write a message
    const messageInput = wrapper.find<HTMLInputElement>('input[data-testid="message-input"]');
    await messageInput.setValue('Testnachricht');

    // Find and click the send button
    const buttons = wrapper.findAllComponents(Button);
    const sendenButton = buttons.find((b) => b.text() === 'Senden');
    expect(sendenButton).toBeTruthy();
    await sendenButton!.trigger('click');

    // Verify the message is displayed
    expect(wrapper.text()).toContain('Testnachricht');

    // Verify the input field is cleared
    expect(messageInput.element.value).toBe('');
  });

  it('adds an emoji to the message', async () => {
    const wrapper = mount(ProjectChatView);

    // Enter username and start chat
    await wrapper.find('input[data-testid="username-input"]').setValue('Bilal');
    await wrapper.get('button').trigger('click');

    // Find emoji buttons
    const emojiButtons = wrapper.findAll('[data-testid="emoji-button"]');
    expect(emojiButtons.length).toBeGreaterThan(0);

    // Select and click an emoji
    const targetEmoji = '🙂';
    const matchingButton = emojiButtons.find((button) => button.text() === targetEmoji);
    expect(matchingButton).toBeTruthy();

    await matchingButton!.trigger('click');

    // Verify the emoji is added to the chat
    expect(wrapper.text()).toContain(targetEmoji);
  });

  it('displays the filename after a file upload', async () => {
    // Mock DataTransfer for file upload
    class MockDataTransfer {
      files: File[] = [];
      items = { add: (file: File) => this.files.push(file) };
    }
    globalThis.DataTransfer = MockDataTransfer as any;

    const wrapper = mount(ProjectChatView);

    // Enter username and start chat
    await wrapper.find('input[data-testid="username-input"]').setValue('Bilal');
    await wrapper.find('button').trigger('click');

    // Mock file upload
    const file = new File(['dummy content'], 'bild.png', { type: 'image/png' });
    const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    Object.defineProperty(inputEl, 'files', { value: dataTransfer.files, writable: false });

    await wrapper.find('input[type="file"]').trigger('change');

    // Verify the filename is displayed
    expect(wrapper.html()).toContain('bild.png');
  });
});
