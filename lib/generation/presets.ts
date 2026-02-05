export type RandomMealRule = {
  count: number;
  requiredTag: string;
  excludedTags: string[];
};

export type MealPlanPreset = {
  name: string;
  key: string;
  fixedMealNames: string[];
  randomRules: RandomMealRule[];
};

export const presets: MealPlanPreset[] = [
  {
    name: "Winter",
    key: "winter",
    fixedMealNames: [
      "Commande",
      "Soupe pour tous",
      "Soupe AC",
      "Soupe Y",
      "Congel AC",
      "Congel Y",
    ],
    randomRules: [
      { count: 1, requiredTag: "long", excludedTags: ["soup"] },
      { count: 2, requiredTag: "pasta", excludedTags: ["soup", "long"] },
      {
        count: 2,
        requiredTag: "rice",
        excludedTags: ["soup", "long", "pasta"],
      },
      { count: 1, requiredTag: "egg", excludedTags: ["soup", "long"] },
      { count: 1, requiredTag: "quiche", excludedTags: ["soup", "long"] },
    ],
  },
  {
    name: "Summer",
    key: "summer",
    fixedMealNames: ["Commande", "Barbecue", "Congel AC", "Congel Y"],
    randomRules: [
      { count: 1, requiredTag: "long", excludedTags: [] },
      { count: 2, requiredTag: "pasta", excludedTags: ["long"] },
      { count: 2, requiredTag: "rice", excludedTags: ["long", "pasta"] },
      { count: 1, requiredTag: "egg", excludedTags: ["long"] },
      { count: 1, requiredTag: "quiche", excludedTags: ["long"] },
      { count: 1, requiredTag: "salad", excludedTags: ["long"] },
    ],
  },
];
