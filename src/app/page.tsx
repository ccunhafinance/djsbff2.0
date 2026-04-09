import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            DJSBFF <span className="text-primary">2.0</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your music library, organized and always available
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
