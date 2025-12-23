import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ProjectChatView from '../../src/views/ProjectChatView.vue';
import Button from 'primevue/button';

// Use vi.hoisted to ensure the mock function is available during hoisting
const { mockGetPhoto } = vi.hoisted(() => ({ mockGetPhoto: vi.fn(), }));

vi.mock('@capacitor/camera', () => ({
  Camera: { getPhoto: mockGetPhoto, },
  CameraResultType: { DataUrl: 'dataUrl', },
  CameraSource: { Prompt: 'PROMPT', },
}));


describe('ProjectChatView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountAndEnterChat = async (username = 'TestUser') => {
    const wrapper = mount(ProjectChatView);
    await wrapper.find('input').setValue(username);
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    return wrapper;
  };

  it('zeigt Eingabe für Benutzernamen', () => {
    const wrapper = mount(ProjectChatView);
    expect(wrapper.find('input[placeholder="Dein Name..."]').exists()).toBe(true);
  });

  it('wechselt in den Chatbereich nach Namenseingabe', async () => {
    const wrapper = await mountAndEnterChat('Bilal');
    expect(wrapper.text()).toContain('Projekt-Chat');
  });

  it('fügt eine Nachricht hinzu und leert das Eingabefeld', async () => {
    const wrapper = mount(ProjectChatView);

    // Name eingeben und Start klicken
    const nameInput = wrapper.find('input[placeholder="Dein Name..."]');
    expect(nameInput.exists()).toBe(true);
    await nameInput.setValue('Bilal');

    const startButton = wrapper.find('button');
    await startButton.trigger('click');

    // Warte auf DOM-Update nach Start
    await wrapper.vm.$nextTick();
    await flushPromises();

    // Nachricht schreiben
    const messageInput = wrapper.find<HTMLInputElement>('input[data-testid="message-input"]');
    expect(messageInput.exists()).toBe(true); // sanity check
    await messageInput.setValue('Testnachricht');

    // Senden-Button finden und klicken
    const buttons = wrapper.findAllComponents(Button);
    const sendenButton = buttons.find((b) => b.text() === 'Senden');
    expect(sendenButton).toBeTruthy();
    await sendenButton!.trigger('click');

    await wrapper.vm.$nextTick();
    await flushPromises();

    // Nachricht sollte angezeigt werden
    expect(wrapper.text()).toContain('Testnachricht');

    // Eingabefeld sollte leer sein
    expect(messageInput.element.value).toBe('');
  });

  it('fügt Emoji zur Nachricht hinzu', async () => {
    const wrapper = await mountAndEnterChat('Bilal');

    const emojiButtons = wrapper.findAll('[data-testid="emoji-button"]');
    expect(emojiButtons.length).toBeGreaterThan(0);

    const targetEmoji = '🙂';
    const matchingButton = emojiButtons.find((button) => button.text() === targetEmoji);
    expect(matchingButton).toBeTruthy();

    await matchingButton!.trigger('click');
    expect(wrapper.text()).toContain(targetEmoji);
  });

  it('zeigt Dateiname nach Dateiupload', async () => {
    // ⬇️ DataTransfer Polyfill
    class MockDataTransfer {
      files: File[] = [];
      items = { add: (file: File) => this.files.push(file) };
    }
    globalThis.DataTransfer = MockDataTransfer as never;

    const wrapper = await mountAndEnterChat('Bilal');

    const file = new File(['dummy content'], 'bild.png', { type: 'image/png' });
    const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    Object.defineProperty(inputEl, 'files', { value: dataTransfer.files, writable: false });

    await wrapper.find('input[type="file"]').trigger('change');

    expect(wrapper.html()).toContain('bild.png');
  });

  describe('takePhoto functionality', () => {
    it('should add image message when photo is captured successfully', async () => {
      const mockImageDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      mockGetPhoto.mockResolvedValue({ dataUrl: mockImageDataUrl });

      const wrapper = await mountAndEnterChat();

      // Click the camera button
      const cameraButton = wrapper.find('[data-testid="camera-button"]');
      expect(cameraButton.exists()).toBe(true);
      await cameraButton.trigger('click');
      await flushPromises();

      // Check that photo was added to messages
      expect(wrapper.html()).toContain(mockImageDataUrl);
      expect(wrapper.html()).toContain('Foto aufgenommen');
    });

    it('should handle camera permission denied silently', async () => {
      mockGetPhoto.mockRejectedValue(new Error('User denied permission'));

      const wrapper = await mountAndEnterChat();

      // Get initial message count (should be 1 - the welcome message)
      wrapper.html();
      // Click the camera button
      const cameraButton = wrapper.find('[data-testid="camera-button"]');
      await cameraButton.trigger('click');
      await flushPromises();

      // Should not crash and should not add any new content
      expect(wrapper.html()).not.toContain('Foto aufgenommen');
    });

    it('should handle user cancellation silently', async () => {
      mockGetPhoto.mockRejectedValue(new Error('User cancelled'));

      const wrapper = await mountAndEnterChat();

      // Click the camera button
      const cameraButton = wrapper.find('[data-testid="camera-button"]');
      await cameraButton.trigger('click');
      await flushPromises();

      // Should handle error gracefully without showing error message
      expect(wrapper.html()).not.toContain('Foto aufgenommen');
    });

    it('should not add message when dataUrl is undefined', async () => {
      mockGetPhoto.mockResolvedValue({ dataUrl: undefined });

      const wrapper = await mountAndEnterChat();

      // Click the camera button
      const cameraButton = wrapper.find('[data-testid="camera-button"]');
      await cameraButton.trigger('click');
      await flushPromises();

      // Should not add any photo message
      expect(wrapper.html()).not.toContain('Foto aufgenommen');
    });
  });
});
