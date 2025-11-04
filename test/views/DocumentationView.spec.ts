import { mount } from '@vue/test-utils'
import DocumentationView from '@/views/DocumentationView.vue'

describe('DocumentationView.vue', () => {
  const mountView = () =>
    mount(DocumentationView, {
      global: {
        stubs: {
          TitleWidget: {
            template: '<div data-test="title-widget" />'
          },
          Section: {
            template: '<div data-test="section" />'
          },
          FeaturesSection: {
            template: '<div data-test="features-section" />'
          }
        }
      }
    })

  it('renders TitleWidget', () => {
    const wrapper = mountView()
    expect(wrapper.find('[data-test="title-widget"]').exists()).toBe(true)
  })

  it('renders Section', () => {
    const wrapper = mountView()
    expect(wrapper.find('[data-test="section"]').exists()).toBe(true)
  })

  it('renders FeaturesSection', () => {
    const wrapper = mountView()
    expect(wrapper.find('[data-test="features-section"]').exists()).toBe(true)
  })
})
