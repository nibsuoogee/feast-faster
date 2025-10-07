import { Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  return (
    <div>
      {/* Add shared layout if needed */}
      <Outlet />
    </div>
  );
}
