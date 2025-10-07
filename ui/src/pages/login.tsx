import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string(),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
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

    // Redirect to the home page or dashboard
    navigate("/home");
  }

  return (
    <div>
      <h1>Login to your profile</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <label>Email</label>
        <input {...form.register("email")} />
        {form.formState.errors.email?.message && (
          <p>{form.formState.errors.email?.message}</p>
        )}
        <label>Password</label>
        <input {...form.register("password")} type="password" />
        {form.formState.errors.password?.message && (
          <p>{form.formState.errors.password?.message}</p>
        )}
        <input type="submit" />
      </form>

      <button onClick={() => navigate("/register")}>Register</button>
    </div>
  );
};
