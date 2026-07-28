import type { ComposerTranslation } from 'vue-i18n';
import type { IssueCategory } from '@/services/IssueService';

export interface CategoryOption {
  value: IssueCategory;
  label: string;
  examples?: string;
}

export const getGeneralCategory = (t: ComposerTranslation): CategoryOption => ({
  value: 'GENERAL',
  label: t('issueCategory.GENERAL'),
  examples: t('issueCategory.examples.GENERAL'),
});

export const getDefectCategories = (t: ComposerTranslation): CategoryOption[] => [
  {
    value: 'BLOCKED_DRAIN',
    label: t('issueCategory.BLOCKED_DRAIN'),
    examples: t('issueCategory.examples.BLOCKED_DRAIN'),
  },
  {
    value: 'ELECTRICAL_FAULT',
    label: t('issueCategory.ELECTRICAL_FAULT'),
    examples: t('issueCategory.examples.ELECTRICAL_FAULT'),
  },
  {
    value: 'FIRE_DAMAGE',
    label: t('issueCategory.FIRE_DAMAGE'),
    examples: t('issueCategory.examples.FIRE_DAMAGE'),
  },
  {
    value: 'HEATING_SYSTEM_MALFUNCTION',
    label: t('issueCategory.HEATING_SYSTEM_MALFUNCTION'),
    examples: t('issueCategory.examples.HEATING_SYSTEM_MALFUNCTION'),
  },
  {
    value: 'PEST_INFESTATION',
    label: t('issueCategory.PEST_INFESTATION'),
    examples: t('issueCategory.examples.PEST_INFESTATION'),
  },
  {
    value: 'POLLUTION_INSIDE_BUILDING',
    label: t('issueCategory.POLLUTION_INSIDE_BUILDING'),
    examples: t('issueCategory.examples.POLLUTION_INSIDE_BUILDING'),
  },
  {
    value: 'POLLUTION_OUTSIDE_BUILDING',
    label: t('issueCategory.POLLUTION_OUTSIDE_BUILDING'),
    examples: t('issueCategory.examples.POLLUTION_OUTSIDE_BUILDING'),
  },
  {
    value: 'SANITARY_SYSTEM_DAMAGE',
    label: t('issueCategory.SANITARY_SYSTEM_DAMAGE'),
    examples: t('issueCategory.examples.SANITARY_SYSTEM_DAMAGE'),
  },
  {
    value: 'ROLLER_SHUTTER_DAMAGE',
    label: t('issueCategory.ROLLER_SHUTTER_DAMAGE'),
    examples: t('issueCategory.examples.ROLLER_SHUTTER_DAMAGE'),
  },
  {
    value: 'WATER_DAMAGE',
    label: t('issueCategory.WATER_DAMAGE'),
    examples: t('issueCategory.examples.WATER_DAMAGE'),
  },
  getGeneralCategory(t),
];

export const getInquiryCategories = (t: ComposerTranslation): CategoryOption[] => [
  {
    value: 'CERTIFICATE_OF_NO_RENT_ARREARS',
    label: t('issueCategory.CERTIFICATE_OF_NO_RENT_ARREARS'),
  },
  {
    value: 'CONFIRMATION_OF_RESIDENCE',
    label: t('issueCategory.CONFIRMATION_OF_RESIDENCE'),
  },
  getGeneralCategory(t),
];

export const getMaintenanceCategories = (t: ComposerTranslation): CategoryOption[] => [
  { value: 'ALARM_SYSTEM_MAINTENANCE', label: t('issueCategory.ALARM_SYSTEM_MAINTENANCE') },
  { value: 'CHIMNEY_SWEEP_MAINTENANCE', label: t('issueCategory.CHIMNEY_SWEEP_MAINTENANCE') },
  { value: 'CLEANING_MAINTENANCE', label: t('issueCategory.CLEANING_MAINTENANCE') },
  { value: 'FIRE_ALARM_MAINTENANCE', label: t('issueCategory.FIRE_ALARM_MAINTENANCE') },
  { value: 'FIRE_EXTINGUISHER_MAINTENANCE', label: t('issueCategory.FIRE_EXTINGUISHER_MAINTENANCE') },
  { value: 'GARDEN_MAINTENANCE', label: t('issueCategory.GARDEN_MAINTENANCE') },
  { value: 'HEATING_MAINTENANCE', label: t('issueCategory.HEATING_MAINTENANCE') },
  { value: 'PUMP_MAINTENANCE', label: t('issueCategory.PUMP_MAINTENANCE') },
  { value: 'SNOW_REMOVAL_MAINTENANCE', label: t('issueCategory.SNOW_REMOVAL_MAINTENANCE') },
  { value: 'TREE_CARE_MAINTENANCE', label: t('issueCategory.TREE_CARE_MAINTENANCE') },
  getGeneralCategory(t),
];

// Full flat list, deduplicated by value, used to resolve a category string back to its option object
export const getAllCategories = (t: ComposerTranslation): CategoryOption[] => {
  const combined = [
    ...getDefectCategories(t),
    ...getInquiryCategories(t),
    ...getMaintenanceCategories(t),
  ];
  return combined.filter(
    (option, index) => combined.findIndex((other) => other.value === option.value) === index,
  );
};

export const findCategoryOption = (
  value: IssueCategory | null | undefined,
  t: ComposerTranslation,
): CategoryOption | null => {
  if (!value) return null;
  return getAllCategories(t).find((option) => option.value === value) ?? null;
};
