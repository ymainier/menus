import type { MealPlanPreset } from "./presets";

type MealInput = {
  id: string;
  name: string;
  tags: { name: string }[];
};

export type GenerationWarning = {
  message: string;
};

export type GenerationResult = {
  mealIds: string[];
  warnings: GenerationWarning[];
};

export function generateMealPlan(
  preset: MealPlanPreset,
  allMeals: MealInput[],
  previousDoneMealIds: Set<string>,
): GenerationResult {
  const warnings: GenerationWarning[] = [];
  const selectedIds = new Set<string>();

  // 1. Add fixed meals by case-insensitive name lookup
  for (const fixedName of preset.fixedMealNames) {
    const meal = allMeals.find(
      (m) => m.name.toLowerCase() === fixedName.toLowerCase(),
    );
    if (meal) {
      selectedIds.add(meal.id);
    } else {
      warnings.push({ message: `Fixed meal "${fixedName}" not found` });
    }
  }

  // 2. For each random rule, filter and pick
  for (const rule of preset.randomRules) {
    const eligible = allMeals.filter((m) => {
      if (selectedIds.has(m.id)) return false;
      if (previousDoneMealIds.has(m.id)) return false;

      const tagNames = m.tags.map((t) => t.name.toLowerCase());
      const hasRequired = tagNames.includes(rule.requiredTag.toLowerCase());
      if (!hasRequired) return false;

      const hasExcluded = rule.excludedTags.some((ex) =>
        tagNames.includes(ex.toLowerCase()),
      );
      if (hasExcluded) return false;

      return true;
    });

    // Fisher-Yates partial shuffle to pick `count` random meals
    const picks = Math.min(rule.count, eligible.length);
    for (let i = 0; i < picks; i++) {
      const j = i + Math.floor(Math.random() * (eligible.length - i));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
      selectedIds.add(eligible[i].id);
    }

    if (picks < rule.count) {
      const deficit = rule.count - picks;
      warnings.push({
        message: `Could only find ${picks}/${rule.count} meals with tag "${rule.requiredTag}" (missing ${deficit})`,
      });
    }
  }

  return {
    mealIds: Array.from(selectedIds),
    warnings,
  };
}
