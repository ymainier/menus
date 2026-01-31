import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Header } from "@/components/header";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <BreadcrumbProvider>
      <Header user={session.user} />
      <main className="container max-w-2xl mx-auto py-8 px-4">{children}</main>
    </BreadcrumbProvider>
  );
}
