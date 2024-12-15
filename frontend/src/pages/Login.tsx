"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disc3, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Replace this with your actual API call
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store the token
        localStorage.setItem("token", data.token);
        // Redirect to home page
        router.replace("/");
      } else {
        // Handle login error
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Disc3 className="mx-auto h-12 w-12 text-[#DCEC7C] animate-spin-slow" />
          <h2 className="mt-6 text-3xl font-extrabold text-[#DCEC7C]">
            Welcome back to MeloFlow
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Your personal music sanctuary awaits
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 text-white">
            <div className="rounded-md shadow-sm">
              <Label htmlFor="email-address" className="sr-only">
                Email address
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-[#DCEC7C] focus:border-[#DCEC7C] focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="rounded-md shadow-sm">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-[#DCEC7C] focus:border-[#DCEC7C] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#DCEC7C] focus:ring-[#DCEC7C] border-gray-300 rounded"
              />
              <Label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-400"
              >
                Remember me
              </Label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-[#DCEC7C] hover:text-[#C5D36A]"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#121212] bg-[#DCEC7C] hover:bg-[#C5D36A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DCEC7C]"
            >
              Sign in
              <ArrowRight className="ml-2 -mr-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Dont have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#DCEC7C] hover:text-[#C5D36A]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
