import { mount } from '@vue/test-utils'
import DocumentationView from '../../src/views/DocumentationView.vue'
import { describe, it, expect, vi } from 'vitest'

// Mock des sous-composants pour isoler le test
vi.mock('../../components/TitleWidget.vue', () => ({
  default: {
    name: 'TitleWidget',
    template: '<div data-test="title-widget"></div>'
  }
}))

vi.mock('../../components/Section.vue', () => ({
  default: {
    name: 'Section',
    template: '<div data-test="section"></div>'
  }
}))

vi.mock('../../components/FeaturesSection.vue', () => ({
  default: {
    name: 'FeaturesSection',
    template: '<div data-test="features-section"></div>'
  }
}))

describe('DocumentationView.vue', () => {
  it('renders correctly without crashing', () => {
    const wrapper = mount(DocumentationView)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render TitleWidget', () => {
    const wrapper = mount(DocumentationView)
    expect(wrapper.find('[data-test="title-widget"]').exists()).toBe(true)
  })

  it('should render Section', () => {
    const wrapper = mount(DocumentationView)
    expect(wrapper.find('[data-test="section"]').exists()).toBe(true)
  })

  it('should render FeaturesSection', () => {
    const wrapper = mount(DocumentationView)
    expect(wrapper.find('[data-test="features-section"]').exists()).toBe(true)
  })
})
