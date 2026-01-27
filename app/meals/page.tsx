import { getMeals } from "./actions";
import { MealsCommand } from "./meals-command";

export default async function MealsPage() {
  const meals = await getMeals();

  return (
    <main className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Meals</h1>
      <MealsCommand initialMeals={meals} />
    </main>
  );
}
