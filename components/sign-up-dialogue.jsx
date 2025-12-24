"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "./ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { VerifyEmailDialog } from "./verify-email-dialogue";
import { State, City } from "country-state-city";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/libs/firebase";

export function SignUpDialog({ open, onOpenChange, onSignIn }) {
  const {toast} = useToast()
  const [role, setRole] = useState("customer");
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isUploadingTinNumber, setIsUploadingTinNumber] = useState(false);
  const [isUploadingNationalId, setIsUploadingNationalId] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    countryCode: "ET",
    stateName: "",
    cityName: "",
    tinNumber: null,
    nationalId: null,
    account_name: "",
    account_number: "",
    bank_code: "",
    acct_length: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ethiopiaStates = State.getStatesOfCountry("ET");
    setStates(ethiopiaStates);
  }, []);

  useEffect(() => {
    if (formData.stateName) {
      const stateCities = City.getCitiesOfState("ET", formData.stateName);
      setCities(stateCities);
    }
  }, [formData.stateName]);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await fetch("/api/bankList");
        const data = await response.json();
        console.log("Bank accounts data:", data.data); // Debug API response
        if (Array.isArray(data.data)) {
          setBankAccounts(data.data);
          if (data.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              bank_code: data.data[0].id,
            }));
          }
        } else {
          console.error("Invalid bank accounts data format:", data);
          toast({
            title: "Error",
            description:"Failed to load bank accounts",
            variant: "destructive"});
        }
      } catch (error) {
        console.error("Failed to fetch bank accounts:", error);
        toast({
          title: "Error",
          description:"Failed to load bank accounts",
          variant: "destructive"});
      }
    };
    if (role === "merchant") fetchBankAccounts();
  }, [role]);

  async function handleUpload(file, field) {
    if (field === "tinNumber") setIsUploadingTinNumber(true);
    else if (field === "nationalId") setIsUploadingNationalId(true);

    try {
      const uniqueFileName = `${Date.now()}_${file.name}`;
      const fileRef = ref(storage, `documents/${field}/${uniqueFileName}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      console.log(`${field} URL:`, downloadUrl);

      setFormData((prev) => ({ ...prev, [field]: downloadUrl }));
      toast({
        description:`${field === "tinNumber" ? "TIN Number" : "National ID"} uploaded successfully!`});
    } catch (error) {
      toast({
        title: "Error",
        description:`Failed to upload ${field === "tinNumber" ? "TIN Number" : "National ID"}`,
        variant: "destructive"});
    } finally {
      if (field === "tinNumber") setIsUploadingTinNumber(false);
      else if (field === "nationalId") setIsUploadingNationalId(false);
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        description:"Passwords do not match",
        variant: "destructive"});
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        description:"Password must be at least 8 characters long",
        variant: "destructive"});
      setIsLoading(false);
      return;
    }

    if (role === "merchant") {
      if (!formData.tinNumber || !formData.nationalId || !formData.account_name || !formData.account_number || !formData.bank_code) {
        toast({
          description:"Please fill in all merchant fields",
          variant:"destruction"});
        setIsLoading(false);
        return;
      }
      if (formData.acct_length && formData.account_number.length !== formData.acct_length) {
        toast({
          description:`Account number must be exactly ${formData.acct_length} digits`,
          variant: "destructive"});
        setIsLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        stateName: formData.stateName,
        cityName: formData.cityName,
        role: role,
      };

      if (role === "merchant") {
        formDataToSend.tinNumber = formData.tinNumber;
        formDataToSend.nationalId = formData.nationalId;
        formDataToSend.account_name = formData.account_name;
        formDataToSend.account_number = formData.account_number;
        formDataToSend.bank_code = formData.bank_code;
      }

      console.log("Data to be sent:", formDataToSend);

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Sign up failed");

      await sendOtp(formData.email);

      toast({
        title: "Success",
        description:"Account created successfully! Please verify your email."});
      setShowVerifyEmail(true);
      onOpenChange(false);
    } catch (error) {
      toast({
        description:error.message || "Failed to create account",
        variant: "destructive"});
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
        description:"OTP sent to your email"});
    } catch (error) {
      toast({
        description:error.message || "Failed to send OTP",
        variant: "destructive"});
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Create your account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-0">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <RadioGroup defaultValue="customer" onValueChange={(value) => setRole(value)} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">Customer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="merchant" id="merchant" />
                    <Label htmlFor="merchant">Merchant</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stateName">State</Label>
                  <Select value={formData.stateName} onValueChange={(value) => setFormData({ ...formData, stateName: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cityName">City</Label>
                  <Select value={formData.cityName} onValueChange={(value) => setFormData({ ...formData, cityName: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={`${formData.stateName}-${city.name}`} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {role === "merchant" && (
                <div className="space-y-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="tinNumber">TIN Number *</Label>
                      <Input
                        id="tinNumber"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUpload(file, "tinNumber");
                          }
                        }}
                      />
                      {isUploadingTinNumber && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nationalId">National ID *</Label>
                      <Input
                        id="nationalId"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUpload(file, "nationalId");
                          }
                        }}
                      />
                      {isUploadingNationalId && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="account_name">Bank Account *</Label>
                      <Select
                        value={formData.account_name}
                        onValueChange={(value) => {
                          const selectedAccount = bankAccounts.find((acc) => acc.name === value);
                          setFormData({
                            ...formData,
                            account_name: value,
                            account_number: "",
                            bank_code: selectedAccount?.id || "",
                            acct_length: selectedAccount?.acct_length || null,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account, index) => (
                            <SelectItem key={account.id || `account-${index}`} value={account.name}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="account_number">Account Number *</Label>
                      <Input
                        id="account_number"
                        value={formData.account_number}
                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                        maxLength={formData.acct_length || undefined}
                      />
                      {formData.acct_length && (
                        <p className="text-sm text-muted-foreground">
                          Must be exactly {formData.acct_length} digits
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <Button
                className="w-full"
                type="submit"
                disabled={isLoading || (role === "merchant" && (isUploadingTinNumber || isUploadingNationalId))}
              >
                Create account
              </Button>
            </form>
          </div>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => { onOpenChange(false); onSignIn(); }}>
              Sign in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <VerifyEmailDialog
        open={showVerifyEmail}
        onOpenChange={setShowVerifyEmail}
        email={formData.email}
        onVerifySuccess={() => {
          setShowVerifyEmail(false);
          onSignIn();
        }}
      />
    </>
  );
}