import { redirect } from "next/navigation";

export default function RootPage() {
  // Middleware decides: authed admins land on /admin, everyone else on /login.
  redirect("/admin");
}
