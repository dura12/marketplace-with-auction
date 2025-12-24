"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export function VerifyEmailDialog({ open, onOpenChange, email, onVerifySuccess }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef([]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0 && open) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer, open]);

  const handleChange = (element, index) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      inputs.current[5]?.focus(); // Focus on the last input
    } else {
      toast.error("Please paste a valid 6-digit OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const otpCode = otp.join(""); // Combine OTP digits into a single string

    try {
      const response = await fetch("/api/verifyOtp?action=verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      toast.success("Email verified successfully");
      setOtp(["", "", "", "", "", ""]); // Reset OTP inputs
      onVerifySuccess(); // Trigger opening the sign-in dialog
      onOpenChange(false); // Close the dialog
    } catch (error) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch("/api/sendOtp?type=verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("data after otp resend: ", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setResendTimer(30); // Reset timer
      toast.success("Verification code resent");
    } catch (error) {
      toast.error(error.message || "Failed to resend verification code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Verify your email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Enter the verification code sent to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputs.current[index] = el)}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined} // Paste handler on first input only
                  className="h-12 w-12 text-center text-lg"
                  disabled={isLoading}
                />
              ))}
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={isLoading || otp.some((digit) => !digit)}
            >
              Verify Email
            </Button>
          </form>
          <div className="text-center">
            <Button
              variant="link"
              className="text-sm"
              disabled={resendTimer > 0}
              onClick={handleResend}
            >
              {resendTimer > 0 ? `Resend code (${resendTimer}s)` : "Didn't receive a code? Resend"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}