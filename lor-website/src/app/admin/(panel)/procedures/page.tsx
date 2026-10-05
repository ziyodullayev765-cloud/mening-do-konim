import { redirect } from "next/navigation";

/** Procedures are now a category filter on the unified services page. */
export default function ProceduresRedirect() {
  redirect("/admin/services");
}
