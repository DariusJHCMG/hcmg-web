/**
 * /slice — shortcut redirect to the SLICE by HCMG login
 * hcmgloans.com/slice → /goal-engine-login
 */
import { redirect } from "next/navigation";

export default function SliceRedirect() {
  redirect("/goal-engine-login");
}
