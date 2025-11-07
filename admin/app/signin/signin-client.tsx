"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/toaster";
import { signIn } from "next-auth/react";

export default function SignInClient() {
  const router = useRouter();

  // **State Variables**
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [storedPassword, setStoredPassword] = useState<string>(""); // Store password for OTP verification
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showOtpVerification, setShowOtpVerification] =
    useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill("")); // OTP as array for 6 digits
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]); // Refs for OTP input focus

  // **Handle Initial Sign-In (Send OTP)**
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter both email and password",
        });
        return;
      }

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate OTP");
      }

      if (data.message === "OTP sent") {
        setStoredPassword(password);
        setShowOtpVerification(true);
        setOtp(Array(6).fill("")); // Reset OTP input
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // **Handle OTP Verification**
  const handleOtpSubmit = async (otpString: string) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password: storedPassword,
        otp: otpString,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Login successful!",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "An error occurred during verification.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // **OTP Input Handlers**
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Limit to one character
    setOtp(newOtp);

    // Move to next input if value entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits filled
    if (index === 5 && value && !newOtp.includes("")) {
      setTimeout(() => handleVerify(), 300); // Slight delay for UX
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) prevInput.focus(); // Move to previous input on backspace
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (/^\d{6}$/.test(pastedData)) {
      // Validate 6-digit number
      const digits = pastedData.split("");
      setOtp(digits);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
      setTimeout(() => handleVerify(), 300);
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code",
      });
      return;
    }
    handleOtpSubmit(otpString);
  };

  const handleResend = async () => {
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (result.success) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email",
        });

        setResendDisabled(true);
        setCountdown(60);

        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setResendDisabled(false);
              return 60;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Resend Failed",
          description: result.message || "Failed to resend verification code",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: "An error occurred. Please try again.",
      });
    }
  };

  // **Effects**
  useEffect(() => {
    if (showOtpVerification) {
      setResendDisabled(true);
      setCountdown(60);
    }
  }, [showOtpVerification]);

  useEffect(() => {
    if (showOtpVerification && countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showOtpVerification && countdown === 0) {
      setResendDisabled(false);
    }
  }, [showOtpVerification, countdown, resendDisabled]);

  useEffect(() => {
    if (showOtpVerification && inputRefs.current[0]) {
      inputRefs.current[0].focus(); // Focus first OTP input
    }
  }, [showOtpVerification]);

  // **Render**
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {showOtpVerification ? "Verification Code" : "Sign In"}
            </CardTitle>
            <CardDescription className="text-center">
              {showOtpVerification
                ? `Enter the 6-digit code sent to ${email}`
                : "Enter your email and password to sign in"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showOtpVerification ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="h-12 w-12 text-center text-lg font-semibold"
                    />
                  ))}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {resendDisabled ? (
                    <p>Resend code in {countdown} seconds</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-primary hover:underline focus:outline-none"
                    >
                      Resend code
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleVerify}
                  className="w-full"
                  disabled={otp.join("").length !== 6 || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOtpVerification(false)}
                    disabled={isLoading}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
