import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { userService } from "@/services/user";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const registerFormSchema = z.object({
  username: z.string().min(4, {
    message: "Username must be at least 4 characters.",
  }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

export const Register = () => {
  const { registerAccount } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    const auth = await userService.postRegister({
      username: values.username,
      email: values.email,
      password: values.password,
    });
    if (!auth) return;

    // Extract the access token from the response
    const { access_token } = auth;

    // Update authentication state using the context
    registerAccount(access_token);

    // Redirect to the home page or dashboard
    navigate("/home");
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="p-0">
          <div className="rounded-t-xl px-6 py-6 bg-gradient-to-r from-green-600 to-green-400">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M12 2a7 7 0 110 14 7 7 0 010-14zm0 16c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z"
                    fill="currentColor"
                    opacity="0.9"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-primary-foreground text-2xl font-semibold">
                  Create your account
                </h2>
                <p className="text-primary-foreground text-sm opacity-90">
                  Provide your details to register and access the platform
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm">Username</Label>
              <Input {...form.register("username")} className="mt-1" />
              {form.formState.errors.username?.message && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.username?.message}
                </p>
              )}
            </div>

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

            <div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <button onClick={() => navigate("/login")} className="w-full">
                Already have an account? Log in
              </button>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
