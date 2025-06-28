import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ChatView from '../../src/views/ChatView.vue'
import Button from 'primevue/button'

describe('ChatView.vue', () => {
    it('zeigt Eingabe für Benutzernamen', () => {
        const wrapper = mount(ChatView)
        expect(wrapper.find('input[placeholder="Dein Name..."]').exists()).toBe(true)

    })

    it('wechselt in den Chatbereich nach Namenseingabe', async () => {
        const wrapper = mount(ChatView)
        const input = wrapper.find('input')
        await input.setValue('Bilal')
        const button = wrapper.get('button')
        await button.trigger('click')

        expect(wrapper.text()).toContain('Projekt-Chat')
    })

    it('fügt eine Nachricht hinzu und leert das Eingabefeld', async () => {
        const wrapper = mount(ChatView)

        // Name eingeben und Start klicken
        await wrapper.find('input').setValue('Bilal')
        let buttons = wrapper.findAllComponents(Button)
        await buttons[0].trigger('click')

        await flushPromises() // DOM nach dem Klick auf „Start“ abwarten

        // Nachricht schreiben
        const input = wrapper.find('input[placeholder="Nachricht eingeben..."]')
        await input.setValue('Testnachricht')

        // Buttons nach DOM-Update neu holen
        buttons = wrapper.findAllComponents(Button)
        const sendenButton = buttons.find(b => b.text() === 'Senden')

        expect(sendenButton).toBeTruthy()
        await sendenButton!.trigger('click')

        // Erwartung: Nachricht ist da
        expect(wrapper.text()).toContain('Testnachricht')

        // Erwartung: Eingabefeld ist leer
        expect(input.element.value).toBe('')
    })


    it('fügt Emoji zur Nachricht hinzu', async () => {
        const wrapper = mount(ChatView)
        await wrapper.find('input').setValue('Bilal')
        await wrapper.get('button').trigger('click')

        const emojiButton = wrapper.findAll('button').find(b => b.text() === '😄')
        await emojiButton?.trigger('click')

        const input = wrapper.find('input[placeholder="Nachricht eingeben..."]')
        expect((input.element as HTMLInputElement).value).toContain('😄')
    })

    it('zeigt Dateiname nach Dateiupload', async () => {
        // ⬇️ DataTransfer polyfill (wichtig!)
        class MockDataTransfer {
            files: File[] = []
            items = {
                add: (file: File) => {
                    this.files.push(file)
                }
            }
        }
        globalThis.DataTransfer = MockDataTransfer as any

        const wrapper = mount(ChatView)

        await wrapper.find('input').setValue('Bilal')
        await wrapper.find('button').trigger('click')

        const file = new File(['dummy content'], 'bild.png', { type: 'image/png' })
        const inputEl = wrapper.find('input[type="file"]').element as HTMLInputElement

        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)

        Object.defineProperty(inputEl, 'files', {
            value: dataTransfer.files,
            writable: false,
        })

        await wrapper.find('input[type="file"]').trigger('change')

        expect(wrapper.html()).toContain('bild.png')
    })

})
