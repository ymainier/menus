ALTER TABLE "planned_meals" DROP CONSTRAINT "planned_meals_meal_id_meals_id_fk";
--> statement-breakpoint
ALTER TABLE "planned_meals" ADD CONSTRAINT "planned_meals_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;