"use client";

import { CardFooter } from "@/components/ui/card";
import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
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
import { OtpVerification } from "@/components/auth/otp-verification";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/toaster";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email
      if (!email) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter your email address",
        });
        setIsLoading(false);
        return;
      }

      // Call API to request password reset
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your email",
        });
        // Move to OTP verification step
        setStep("otp");
      } else {
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: result.error || "Failed to send verification code",
        });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerified = async (otp: string) => {
    try {
      setIsLoading(true);

      // Call API to verify OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Verification Successful",
          description: "You can now reset your password",
        });
        // Move to reset password step
        setStep("reset");
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.error || "Invalid OTP code",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "An error occurred during verification. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);

      // Call API to resend OTP
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Resend Failed",
          description:
            result.message || "Failed to resend OTP. Please try again.",
        });
      }
    } catch (error) {
      console.error("OTP resend error:", error);
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = () => {
    toast({
      title: "Password Reset Successful",
      description: "Your password has been reset successfully",
    });
    // Redirect to login page
    router.push("/signin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        {step === "email" && (
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email address to receive a verification code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestReset} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link
                href="/signin"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </CardFooter>
          </Card>
        )}

        {step === "otp" && (
          <OtpVerification
            email={email}
            purpose="reset-password"
            onVerified={handleOtpVerified}
            onCancel={() => setStep("email")}
            isLoading={isLoading}
          />
        )}

        {step === "reset" && (
          <ResetPasswordForm
            email={email}
            onSuccess={handlePasswordReset}
            onCancel={() => setStep("otp")}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}
