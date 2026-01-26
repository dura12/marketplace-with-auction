"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resendOtp } from "@/lib/data-fetching"
import { toast } from "@/components/ui/use-toast"

interface OtpVerificationProps {
  email: string
  purpose: "login" | "reset-password"
  onVerified: (otp: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function OtpVerification({ email, purpose, onVerified, onCancel, isLoading = false }: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [resendDisabled, setResendDisabled] = useState(true)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setResendDisabled(false)
    }
  }, [countdown, resendDisabled])

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }

    // If all digits are filled, automatically verify
    if (index === 5 && value && !otp.includes("")) {
      const completeOtp = [...newOtp.slice(0, 5), value].join("")
      if (completeOtp.length === 6) {
        setTimeout(() => handleVerify(), 300) // Small delay for better UX
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus()
      }
    }
  }

  const handleVerify = () => {
    const otpString = otp.join("")

    // Validate OTP
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code",
      })
      return
    }

    onVerified(otpString)
  }

  const handleResend = async () => {
    try {
      const result = await resendOtp(email, purpose)

      if (result.success) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email",
        })
        // Reset countdown
        setResendDisabled(true)
        setCountdown(60)
      } else {
        toast({
          variant: "destructive",
          title: "Resend Failed",
          description: result.message || "Failed to resend verification code",
        })
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: "An error occurred. Please try again.",
      })
    }
  }

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
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardFooter>
    </Card>
  )
}

