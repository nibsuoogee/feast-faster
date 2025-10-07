import { useAuth } from "@/contexts/AuthContext";

export const Home = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Home</h1>

      <button onClick={logout}>Logout</button>
    </div>
  );
};
