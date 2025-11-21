import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="py-10 px-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Feast Faster</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in or create an account to continue.
          </p>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/register")}
            >
              Create account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
