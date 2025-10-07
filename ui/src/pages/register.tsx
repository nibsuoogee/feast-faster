import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { userService } from "@/services/user";
import { useAuth } from "@/contexts/AuthContext";

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
    <div>
      <h1>Create a new account</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <label>Username</label>
        <input {...form.register("username")} />
        {form.formState.errors.username?.message && (
          <p>{form.formState.errors.username?.message}</p>
        )}
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

      <button onClick={() => navigate("/login")}>Login</button>
    </div>
  );
};
