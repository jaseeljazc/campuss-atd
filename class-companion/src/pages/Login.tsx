import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { PageLoader } from "@/components/ui/loader";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Login successful!");
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoader message="Signing in..." />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--present)/0.1),transparent_50%)]" />

      <Card className="w-full max-w-md relative z-10 shadow-elevated pb-10">
        <CardHeader className="space-y-3 sm:space-y-4 text-center px-4 sm:px-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-display">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
