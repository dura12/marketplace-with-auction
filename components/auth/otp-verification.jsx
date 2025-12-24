"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export function OtpVerification({ email, purpose, onVerified, onCancel, isLoading = false }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
    if (index === 5 && value && !otp.includes("")) {
      setTimeout(() => handleVerify(), 300);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      if (inputRefs.current[5]) inputRefs.current[5].focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "Please enter a valid 6-digit code" });
      return;
    }
    onVerified(otpString);
  };

  const handleResend = async () => {
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: "OTP Resent", description: "A new verification code has been sent to your email" });
        setResendDisabled(true);
        setCountdown(60);
      } else {
        toast({ variant: "destructive", title: "Resend Failed", description: result.message || "Failed to resend verification code" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Resend Failed", description: "An error occurred. Please try again." });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Verification Code</CardTitle>
        <CardDescription className="text-center">Enter the 6-digit code sent to {email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
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
              <button type="button" onClick={handleResend} className="text-primary hover:underline focus:outline-none">
                Resend code
              </button>
            )}
          </div>
          <Button onClick={handleVerify} className="w-full" disabled={otp.join("").length !== 6 || isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardFooter>
    </Card>
  );
}
