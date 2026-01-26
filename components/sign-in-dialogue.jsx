"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react"
import { VerifyEmailDialog } from "./verify-email-dialogue"
import { ForgotPasswordPage } from "./forgot-password-dialogue"

export function SignInDialog({ open, onOpenChange, onSignUp }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Add state to control VerifyEmailDialog visibility
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const {toast} = useToast()

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setIsForgotPassword(false); // Reset isForgotPassword when dialog is closed
    }
    onOpenChange(isOpen);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false, // Prevent full page reload
        email: formData.email,
        password: formData.password,
      });

      console.log("response: ", res);

      if (res.error) {
        // Check if the error is due to an unverified email
        if (res.error === "Email not verified") {
          await sendOtp(formData.email);
          setShowVerifyEmail(true);
        } else if(res.error === "No user found with this email" || res.error === "Invalid email or password") {
            toast({
              title: "Invalid email or password",
            })
        } else {
           toast({
            description:res.error || "Failed to sign in",
            variant: "destructive"});
        }
      } else {
        toast({
          title: "Signed in successfully",
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title:"An unexpected error occurred"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
      toast.success("Successfully signed in with Google!");
    } catch (error) {
      toast.error("Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (email) => {
    try {
      const otpResponse = await fetch(`/api/sendOtp?type=verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const otpData = await otpResponse.json();
      if (!otpResponse.ok) throw new Error(otpData.message || "Failed to send OTP");

      toast({
        title:"OTP sent to your email"});
    } catch (error) {
      toast({
        description:error.message || "Failed to send OTP",
        variant: "destructive",
        });
    }
  };

  return (
    <>
     {isForgotPassword ? (
              <ForgotPasswordPage open={isForgotPassword} onOpenChange={setIsForgotPassword} />
            ) : (
      <Dialog open={open} onOpenChange={handleOpenChange} >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
               "Welcome Back"
            </DialogTitle>         
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button variant="outline" disabled={isLoading} onClick={handleGoogleSignIn} className="relative">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPassword(true); // Now only sets this when the button is clicked
                    }}
                  >
                    Forgot Password?
                  </Button>
                </div>
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                Sign in
              </Button>
            </form>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => { onOpenChange(false); onSignUp(); }}>
              Sign up
            </Button>
          </div>
          
        </DialogContent>
      </Dialog>
      )}

      {/* Render the VerifyEmailDialog */}
      <VerifyEmailDialog
        open={showVerifyEmail}
        onOpenChange={setShowVerifyEmail}
        email={formData.email}
        onVerifySuccess={() => setShowVerifyEmail(false)} // Close dialog after verification
      />
      {/* {showForgotPassword && (
        <ForgotPasswordPage open={showForgotPassword} onOpenChange={setShowForgotPassword} />
      )}    */}
    </>
  );
}