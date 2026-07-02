import { beforeAll, describe, expect, it } from 'vitest';
import { getIssueCategoryLabel, getIssueStatusLabel, getIssueTypeSeverity, getIssuePriorityLabel,
  getIssueStatusSeverity, getIssueTypeLabel, getUnitTypeLabel } from '@/features/tenant/tenantIssues/issueLabels';
import i18n from '@/i18n/i18n';

type Translator = Parameters<typeof getIssueStatusLabel>[1];

const t = i18n.global.t as unknown as Translator;

beforeAll(() => {
  i18n.global.locale.value = 'de';
});

describe('issueLabels', () => {
  describe('getIssueStatusLabel', () => {
    it.each([
      ['PENDING', 'Ausstehend'],
      ['OPEN', 'Offen'],
      ['IN_PROGRESS', 'In Bearbeitung'],
      ['CLOSED', 'Abgeschlossen'],
      ['REJECTED', 'Abgelehnt'],
    ] as const)('maps %s to translated label', (status, expected) => {
      expect(getIssueStatusLabel(status, t)).toBe(expected);
    });

    it('falls back to raw status and dash', () => {
      expect(getIssueStatusLabel('UNKNOWN' as Parameters<typeof getIssueStatusLabel>[0], t)).toBe('UNKNOWN');
      expect(getIssueStatusLabel(undefined, t)).toBe('—');
    });
  });

  describe('getIssueStatusSeverity', () => {
    it.each([
      ['PENDING', 'secondary'],
      ['OPEN', 'info'],
      ['IN_PROGRESS', 'warn'],
      ['CLOSED', 'success'],
      ['REJECTED', 'secondary'],
    ] as const)('maps %s to severity %s', (status, expected) => {
      expect(getIssueStatusSeverity(status)).toBe(expected);
    });

    it('falls back to secondary for unknown and missing status', () => {
      expect(getIssueStatusSeverity('UNKNOWN' as Parameters<typeof getIssueStatusSeverity>[0])).toBe('secondary');
      expect(getIssueStatusSeverity(undefined)).toBe('secondary');
    });
  });

  describe('getIssueTypeLabel', () => {
    it.each([
      ['APPLICATION', 'Antrag'],
      ['TASK', 'Aufgabe'],
      ['DEFECT', 'Mangel'],
      ['MAINTENANCE', 'Wartung'],
      ['TERMINATION', 'Kündigung'],
      ['INQUIRY', 'Anfrage'],
    ] as const)('maps %s to translated label', (type, expected) => {
      expect(getIssueTypeLabel(type, t)).toBe(expected);
    });

    it('falls back to raw type and dash', () => {
      expect(getIssueTypeLabel('UNKNOWN' as Parameters<typeof getIssueTypeLabel>[0], t)).toBe('UNKNOWN');
      expect(getIssueTypeLabel(undefined, t)).toBe('—');
    });
  });

  describe('getIssueTypeSeverity', () => {
    it.each([
      ['APPLICATION', 'secondary'],
      ['TASK', 'contrast'],
      ['DEFECT', 'warn'],
      ['MAINTENANCE', 'success'],
    ] as const)('maps %s to severity %s', (type, expected) => {
      expect(getIssueTypeSeverity(type)).toBe(expected);
    });

    it('falls back to info for unknown and missing type', () => {
      expect(getIssueTypeSeverity('UNKNOWN' as Parameters<typeof getIssueTypeSeverity>[0])).toBe('info');
      expect(getIssueTypeSeverity(undefined)).toBe('info');
    });
  });

  describe('getIssuePriorityLabel', () => {
    it.each([
      ['URGENT', 'Dringend'],
      ['HIGH', 'Hoch'],
      ['MEDIUM', 'Mittel'],
      ['LOW', 'Niedrig'],
      ['UNCLASSIFIED', 'Nicht klassifiziert'],
    ] as const)('maps %s to translated label', (priority, expected) => {
      expect(getIssuePriorityLabel(priority, t)).toBe(expected);
    });

    it('falls back to raw priority and dash', () => {
      expect(getIssuePriorityLabel('UNKNOWN' as Parameters<typeof getIssuePriorityLabel>[0], t)).toBe('UNKNOWN');
      expect(getIssuePriorityLabel(undefined, t)).toBe('—');
    });
  });

  describe('getIssueCategoryLabel', () => {
    it('falls back to raw category and dash', () => {
      expect(getIssueCategoryLabel('UNKNOWN' as Parameters<typeof getIssueCategoryLabel>[0], t)).toBe('UNKNOWN');
      expect(getIssueCategoryLabel(undefined, t)).toBe('—');
    });
  });

  describe('getUnitTypeLabel', () => {
    it('returns translated unit type label when available', () => {
      expect(getUnitTypeLabel('APARTMENT' as Parameters<typeof getUnitTypeLabel>[0], t)).toBe('Wohnung');
    });

    it('falls back to raw unit type and dash', () => {
      expect(getUnitTypeLabel('UNKNOWN' as Parameters<typeof getUnitTypeLabel>[0], t)).toBe('UNKNOWN');
      expect(getUnitTypeLabel(undefined, t)).toBe('—');
    });
  });
});
