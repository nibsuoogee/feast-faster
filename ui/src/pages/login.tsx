import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// Icons replaced by inline SVG in the banner
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string(),
});

export const Login = () => {
  const { login, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect after login based on role
  useEffect(() => {
    switch (user?.role) {
      case "driver":
        navigate("/home");
        break;
      case "restaurant_manager":
        navigate("/restaurant");
        break;
      default:
        break;
    }
  }, [user, navigate]);

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsSubmitting(true);
    try {
      // Send login request to the auth server
      const auth = await userService.postLogin({
        email: values.email,
        password: values.password,
      });
      if (!auth) return;

      // Extract the access token from the response
      const { access_token } = auth;

      // Update authentication state using the context
      login(access_token);
    } catch (err) {
      console.error("Login failed", err);
      toast("Login failed — check credentials or network");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="p-0">
          <div className="rounded-t-xl px-6 py-6 bg-gradient-to-r from-green-600 to-green-400">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white animate-pulse transform-gpu transition-transform hover:scale-105"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  {/* Bolt (charging) */}
                  <path
                    className="icon-bolt"
                    d="M13 2L3 14h7l-1 8 10-12h-7l1-10z"
                    fill="currentColor"
                    opacity="0.95"
                  />

                  {/* Utensils (food) - fork and knife overlay */}
                  <g
                    className="icon-utensil"
                    transform="translate(12,6) scale(0.65)"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 2v7" />
                    <path d="M4 2v7" />
                    <path d="M2 4h2" />
                    <path d="M6 1v8" />
                  </g>
                </svg>
              </div>
              <div>
                <h2 className="text-primary-foreground text-2xl font-semibold">
                  Sign in
                </h2>
                <p className="text-primary-foreground text-sm opacity-90">
                  Sign in to your account
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm">Email</Label>
              <Input {...form.register("email")} className="mt-1" />
              {form.formState.errors.email?.message && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email?.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm">Password</Label>
              <Input
                {...form.register("password")}
                type="password"
                className="mt-1"
              />
              {form.formState.errors.password?.message && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.password?.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <button onClick={() => navigate("/register")} className="w-full">
                Create account
              </button>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
