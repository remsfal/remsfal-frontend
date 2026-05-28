import { ref, watch } from 'vue';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';

export function createBaseRentableUnitSchema(t: ReturnType<typeof useI18n>['t']) {
  return {
    title: z.string().trim().min(3, { message: t('validation.minLength', { min: 3 }) }),
    description: z
      .string()
      .trim()
      .max(500, { message: t('validation.maxLength', { max: 500 }) })
      .optional()
      .or(z.literal('')),
    location: z.string().trim().optional().or(z.literal('')),
  };
}

export function useRentableUnitForm<T extends { title: string; location: string }>(
  currentValues: T,
) {
  const titleMatchesLocation = ref(false);
  const formKey = ref(0);
  const initialValues = ref<Record<string, unknown>>({});

  watch(titleMatchesLocation, (checked) => {
    if (checked) {
      currentValues.location = currentValues.title;
      initialValues.value = { ...currentValues };
      formKey.value++;
    }
  });

  watch(
    () => currentValues.title,
    (newTitle) => {
      if (titleMatchesLocation.value) {
        currentValues.location = newTitle;
      }
    },
  );

  function syncState<S extends Record<string, unknown>>(
    serverValues: S,
    currentRef: S,
    loaded: S,
  ) {
    Object.assign(serverValues, loaded);
    Object.assign(currentRef, loaded);
    initialValues.value = { ...loaded };
    titleMatchesLocation.value = !!(
      (loaded as { title?: string; location?: string }).title &&
      (loaded as { title?: string; location?: string }).location &&
      (loaded as { title?: string; location?: string }).title ===
        (loaded as { title?: string; location?: string }).location
    );
    formKey.value++;
  }

  return {
 titleMatchesLocation, formKey, initialValues, syncState 
};
}
