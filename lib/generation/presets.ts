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
      { count: 1, requiredTag: "long", excludedTags: ["soupe"] },
      { count: 2, requiredTag: "pate", excludedTags: ["soupe", "long"] },
      {
        count: 2,
        requiredTag: "riz",
        excludedTags: ["soupe", "long", "pate"],
      },
      { count: 1, requiredTag: "oeuf", excludedTags: ["soupe", "long"] },
      { count: 1, requiredTag: "quiche", excludedTags: ["soupe", "long"] },
    ],
  },
  {
    name: "Summer",
    key: "summer",
    fixedMealNames: ["Commande", "Barbecue", "Congel AC", "Congel Y"],
    randomRules: [
      { count: 1, requiredTag: "long", excludedTags: [] },
      { count: 2, requiredTag: "pasta", excludedTags: ["long"] },
      { count: 2, requiredTag: "rice", excludedTags: ["long", "pate"] },
      { count: 1, requiredTag: "egg", excludedTags: ["long"] },
      { count: 1, requiredTag: "quiche", excludedTags: ["long"] },
      { count: 1, requiredTag: "salad", excludedTags: ["long"] },
    ],
  },
];
