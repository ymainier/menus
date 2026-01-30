import { getNextAvailableWeek } from "../actions";
import { NewPlanForm } from "./new-plan-form";

export default async function NewPlanPage() {
  const defaultWeek = await getNextAvailableWeek();

  return <NewPlanForm defaultWeek={defaultWeek} />;
}
