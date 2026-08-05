/**
 * /goal-engine — redirect to dashboard
 */
import { redirect } from "next/navigation";
export default function GoalEngineRoot() {
  redirect("/goal-engine/dashboard");
}
