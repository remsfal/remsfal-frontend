import { describe, it, expect } from 'vitest';

/**
 * AppRoleLayout stacks the page content with `flex flex-col gap-8`. Views must not wrap their
 * cards in an own spacing container, otherwise the cards get a different spacing than on other pages.
 */
const viewSources = import.meta.glob('/src/features/**/views/*View.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Views outside the role layouts (own full-page layout)
const EXCLUDED = ['/src/features/common/authentication/views/LoginView.vue'];

function firstTemplateElement(source: string): string | undefined {
  const template = source.match(/<template>\s*(?:<!--[\s\S]*?-->\s*)*(<[^>]+>)/);
  return template?.[1];
}

describe('view card spacing', () => {
  const views = Object.entries(viewSources).filter(([path]) => !EXCLUDED.includes(path));

  it('finds the views to check', () => {
    expect(views.length).toBeGreaterThan(0);
  });

  it.each(views.map(([path, source]) => [path, source]))(
    '%s does not wrap its content in an own spacing container',
    (_path, source) => {
      const root = firstTemplateElement(source as string) ?? '';
      expect(root).not.toMatch(/class="[^"]*\b(gap-\d+|p-\d+|space-y-\d+)\b/);
    },
  );
});

/**
 * Dashboard components render their cards directly into the page. Their top-level elements must not
 * add margins, and card grids must use the same gap as the layout (gap-8).
 */
const dashboardSources = import.meta.glob(
  ['/src/features/**/components/*KpiCards.vue', '/src/features/**/components/*Dashboard*.vue'],
  {
    query: '?raw', import: 'default', eager: true 
  },
) as Record<string, string>;

function topLevelElements(source: string): string[] {
  const template = source.match(/^<template>\n([\s\S]*)^<\/template>/m)?.[1] ?? '';
  // top-level opening tags are indented by exactly two spaces; collect each tag up to its closing '>'
  return [...template.matchAll(/^ {2}<(?!\/|!--)[^>]*>/gm)].map((match) => match[0]);
}

describe('dashboard card spacing', () => {
  const dashboards = Object.entries(dashboardSources);

  it('finds the dashboard components to check', () => {
    expect(dashboards.length).toBeGreaterThan(0);
  });

  it.each(dashboards.map(([path, source]) => [path, source]))(
    '%s uses the layout spacing for its cards',
    (_path, source) => {
      for (const element of topLevelElements(source as string)) {
        expect(element).not.toMatch(/class="[^"]*\b(m[tby]?-\d+|space-y-\d+)\b/);
        const gaps = element.match(/\bgap-\d+\b/g) ?? [];
        gaps.forEach((gap) => expect(gap).toBe('gap-8'));
      }
    },
  );
});
