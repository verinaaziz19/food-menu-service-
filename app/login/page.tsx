"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.log("[v0] Form submitted");

    try {
      console.log("[v0] Calling login function");
      await login(email, password);
      console.log("[v0] Login successful, pushing to dashboard");
      router.push("/dashboard");
    } catch (err) {
      console.log("[v0] Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-red-50 p-4">
      <Card className="w-full max-w-md border-2 border-amber-200 shadow-lg">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-amber-900">
            Osteria
          </h1>
          <p className="text-center text-amber-700 mb-8">Italian Restaurant</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="border-amber-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-amber-200"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded text-sm">
            <p className="font-semibold text-amber-900 mb-2">
              Demo Credentials:
            </p>
            <p className="text-amber-800 mb-1">
              <strong>Client:</strong> client@example.com / password123
            </p>
            <p className="text-amber-800 mb-3">
              <strong>Employee:</strong> employee@example.com / password123
            </p>
            <p className="text-xs text-amber-700">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="underline font-semibold hover:text-amber-900"
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
