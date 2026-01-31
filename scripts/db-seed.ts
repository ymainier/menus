import { db } from "../lib/db";
import { meals, tags, mealTags } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import seedData from "../drizzle/seed.json";

async function seed() {
  console.log("Seeding database...");

  // Collect all unique tags from seed data
  const allTags = new Set<string>();
  for (const meal of seedData) {
    for (const tag of meal.tags) {
      allTags.add(tag);
    }
  }

  // Create tags
  console.log(`Creating ${allTags.size} tags...`);
  const tagMap = new Map<string, string>();

  for (const tagName of allTags) {
    const existing = await db.query.tags.findFirst({
      where: eq(tags.name, tagName),
    });

    if (existing) {
      tagMap.set(tagName, existing.id);
    } else {
      const [inserted] = await db
        .insert(tags)
        .values({ name: tagName })
        .returning({ id: tags.id });
      tagMap.set(tagName, inserted.id);
    }
  }

  // Create meals and associations
  console.log(`Creating ${seedData.length} meals...`);

  for (const mealData of seedData) {
    const existing = await db.query.meals.findFirst({
      where: eq(meals.name, mealData.name),
    });

    let mealId: string;

    if (existing) {
      mealId = existing.id;
      console.log(`  Meal "${mealData.name}" already exists, skipping...`);
    } else {
      const [inserted] = await db
        .insert(meals)
        .values({ name: mealData.name })
        .returning({ id: meals.id });
      mealId = inserted.id;
    }

    // Add tag associations
    for (const tagName of mealData.tags) {
      const tagId = tagMap.get(tagName)!;
      await db.insert(mealTags).values({ mealId, tagId }).onConflictDoNothing();
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
