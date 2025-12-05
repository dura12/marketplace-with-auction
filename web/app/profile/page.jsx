"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin, Shield, Star, UserIcon, Eye, EyeOff, Pencil } from "lucide-react"
import { useSession } from "next-auth/react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { State, City } from "country-state-city"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { uploadImagesToFirebase } from "@/libs/utils"

// Form schemas
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().optional(),
  stateName: z.string().min(1, { message: "State is required." }),
  cityName: z.string().min(1, { message: "City is required." }),
})

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const merchantInfoFormSchema = z.object({
  account_name: z.string().min(2, { message: "Account name must be at least 2 characters." }),
  account_number: z.string().min(8, { message: "Account number must be at least 8 characters." }),
  bank_code: z.string().min(3, { message: "Bank code must be at least 3 characters." }),
})

const promoteToMerchantSchema = z.object({
  account_name: z.string().min(2, { message: "Account name must be at least 2 characters." }),
  account_number: z.string().min(8, { message: "Account number must be at least 8 characters." }),
  bank_code: z.string().min(3, { message: "Bank code must be at least 3 characters." }),
});

const ProfilePage = () => {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [loggedUser, setLoggedUser] = useState(null)
  const [stats, setStats] = useState({})
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [selectedStateIsoCode, setSelectedStateIsoCode] = useState("")
  const [bankAccounts, setBankAccounts] = useState([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(false) // New: Track bank list loading
  const [bankFetchError, setBankFetchError] = useState(null) // New: Track bank fetch errors
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isEditingMerchant, setIsEditingMerchant] = useState(false)
  const [isUpdatingMerchant, setIsUpdatingMerchant] = useState(false)
  const [isPromoting, setIsPromoting] = useState(false)
  const tinFileInputRef = useRef(null);
  const nationalIdFileInputRef = useRef(null);
  

  // Fetch user data when session changes
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        setIsLoading(true)
        try {
          const response = await fetch('/api/user')
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
          }
          const user = await response.json()
          setLoggedUser(user)
          merchantInfoForm.reset({
            account_name: user.account_name || "",
            account_number: user.account_number || "",
            bank_code: user.bank_code || "",
          })
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUser()
  }, [session])

  // Fetch states for Ethiopia
  useEffect(() => {
    const ethiopianStates = State.getStatesOfCountry("ET")
    setStates(ethiopianStates)
  }, [])

   // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      setIsLoadingBanks(true)
      try {
        const response = await fetch("/api/bankList")
        const data = await response.json()
        if (Array.isArray(data.data)) {
          setBankAccounts(data.data)
        } else {
          console.error("Invalid bank accounts data format:", data)
          setBankFetchError("Invalid bank accounts data format")
          toast({
            title: "Error",
            description: "Failed to load bank accounts",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch bank accounts:", error)
        setBankFetchError(error.message)
        toast({
          title: "Error",
          description: "Failed to load bank accounts",
          variant: "destructive",
        })
      } finally {
        setIsLoadingBanks(false)
      }
    }
    fetchBankAccounts()
  }, [toast])

  // Set initial selected state ISO code
  useEffect(() => {
    if (loggedUser?.stateName && states.length > 0) {
      const stateObj = states.find((state) => state.name === loggedUser.stateName)
      setSelectedStateIsoCode(stateObj ? stateObj.isoCode : "")
    }
  }, [loggedUser, states])

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedStateIsoCode) {
      const stateCities = City.getCitiesOfState("ET", selectedStateIsoCode)
      setCities(stateCities)
    } else {
      setCities([])
    }
  }, [selectedStateIsoCode])

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Merchant info form
  const merchantInfoForm = useForm({
    resolver: zodResolver(merchantInfoFormSchema),
    defaultValues: {
      account_name: "",
      account_number: "",
      bank_code: "",
    },
  })

  // Promote to merchant form
  const promoteForm = useForm({
    resolver: zodResolver(promoteToMerchantSchema),
    defaultValues: {
      tinNumber: "",
      nationalId: "",
      account_name: "",
      account_number: "",
      bank_code: "",
    },
  })

  // Function to toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  async function onPasswordSubmit(values) {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: loggedUser._id, password: values.newPassword }),
      })
      if (!response.ok) throw new Error('Failed to update password')
      toast({ title: "Password updated", description: "Your password has been changed successfully." })
      passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  async function onMerchantInfoSubmit(values) {
    setIsUpdatingMerchant(true)
    try {
      const selectedBank = bankAccounts.find((acc) => acc.name === values.account_name)
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: loggedUser._id,
          account_name: values.account_name,
          account_number: values.account_number,
          bank_code: selectedBank ? String(selectedBank.id) : values.bank_code,
        }),
      })
      if (!response.ok) throw new Error('Failed to update merchant information')
      const updatedUser = await response.json()
      setLoggedUser(updatedUser)
      setIsEditingMerchant(false)
      toast({ title: "Success", description: "Merchant information updated successfully." })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsUpdatingMerchant(false)
    }
  }

async function onPromoteSubmit(values) {
  setIsPromoting(true);
  try {
    // Upload TIN file
    const tinFile = tinFileInputRef.current.files[0];
    if (!tinFile) {
      throw new Error("TIN number file is required");
    }
    const [tinUrl] = await uploadImagesToFirebase([tinFile]);

    // Upload National ID file
    const nationalIdFile = nationalIdFileInputRef.current.files[0];
    if (!nationalIdFile) {
      throw new Error("National ID file is required");
    }
    const [nationalIdUrl] = await uploadImagesToFirebase([nationalIdFile]);

    // Use URLs in the API request
    const selectedBank = bankAccounts.find((acc) => acc.name === values.account_name);
    const response = await fetch('/api/user/promote', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: loggedUser._id,
        tinNumber: tinUrl,
        nationalId: nationalIdUrl,
        account_name: values.account_name,
        account_number: values.account_number,
        bank_code: selectedBank ? String(selectedBank.id) : values.bank_code,
      }),
    });
    if (!response.ok) throw new Error('Failed to submit merchant promotion request');
    const updatedUser = await response.json();
    setLoggedUser(updatedUser);
    promoteForm.reset();
    toast({ title: "Success", description: "Merchant promotion request submitted successfully." });
  } catch (err) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  } finally {
    setIsPromoting(false);
  }
}

  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-md">
              <AvatarImage src={loggedUser?.image} alt={loggedUser?.fullName} />
              <AvatarFallback className="text-4xl">{loggedUser?.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            {loggedUser?.role === "merchant" && (
              <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">Merchant</Badge>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{loggedUser?.fullName}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm">@{loggedUser?.fullName.toLowerCase().replace(/\s+/g, "")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <EditProfileDialog user={loggedUser} />
                {loggedUser?.role === "customer" && (
                   <Dialog>
                   <DialogTrigger asChild>
                     <Button variant="outline">Promote to Merchant</Button>
                   </DialogTrigger>
                   <DialogContent>
  <DialogHeader>
    <DialogTitle>Promote to Merchant</DialogTitle>
    <DialogDescription>
      Please provide the required information to request merchant status.
    </DialogDescription>
  </DialogHeader>
  <Form {...promoteForm}>
    <form onSubmit={promoteForm.handleSubmit(onPromoteSubmit)} className="space-y-4">
      <FormItem>
        <FormLabel>TIN Number File</FormLabel>
        <FormControl>
          <Input type="file" ref={tinFileInputRef} />
        </FormControl>
      </FormItem>
      <FormItem>
        <FormLabel>National ID File</FormLabel>
        <FormControl>
          <Input type="file" ref={nationalIdFileInputRef} />
        </FormControl>
      </FormItem>
      <FormField
        control={promoteForm.control}
        name="account_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Account</FormLabel>
            <Select
              onValueChange={(value) => {
                const selectedAccount = bankAccounts.find((acc) => acc.name === value);
                field.onChange(value);
                promoteForm.setValue("bank_code", selectedAccount ? String(selectedAccount.id) : "");
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={promoteForm.control}
        name="account_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter account number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={promoteForm.control}
        name="bank_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Code</FormLabel>
            <FormControl>
              <Input placeholder="Enter bank code" {...field} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" disabled={isPromoting} className="w-full">
        {isPromoting ? "Submitting..." : "Submit Request"}
        {isPromoting && (
          <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </Button>
    </form>
  </Form>
</DialogContent>
                 </Dialog>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              {loggedUser?.stateName && loggedUser?.cityName && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {loggedUser?.cityName}, {loggedUser?.stateName}
                  </span>
                </div>
              )}
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Joined {new Date(loggedUser?.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {loggedUser?.isEmailVerified && (
                <div className="flex items-center text-success">
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="text-sm">Verified Account</span>
                </div>
              )}
              {stats.averageRating > 0 && (
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 mr-1 fill-amber-500" />
                  <span className="text-sm">
                    {stats.averageRating} ({stats.reviewsReceived} reviews)
                  </span>
                </div>
              )}
            </div>

            {loggedUser?.bio && <p className="mt-4 text-sm text-muted-foreground">{loggedUser.bio}</p>}
          </div>
        </div>

        <Separator />

        {/* Profile Content Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 md:w-[600px]">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {loggedUser?.role === "merchant" && (
              <TabsTrigger value="merchant">Merchant Information</TabsTrigger>
            )}
          </TabsList>
          {/* Personal Information Tab */}
          <TabsContent value="personal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-sm">{loggedUser.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{loggedUser.email}</p>
                  </div>
                  {loggedUser.phoneNumber && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <p className="text-sm">{loggedUser.phoneNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-sm">{loggedUser.cityName}, {loggedUser.stateName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Joined</p>
                    <p className="text-sm">{new Date(loggedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  {loggedUser.bio && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Bio</p>
                      <p className="text-sm">{loggedUser.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <div className="space-y-8">
              {/* Account Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword.current ? "text" : "password"}
                                  placeholder="Enter your current password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                  onClick={() => togglePasswordVisibility("current")}
                                >
                                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  <span className="sr-only">
                                    {showPassword.current ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword.new ? "text" : "password"}
                                  placeholder="Enter your new password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                  onClick={() => togglePasswordVisibility("new")}
                                >
                                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  <span className="sr-only">
                                    {showPassword.new ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>Password must be at least 8 characters long.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword.confirm ? "text" : "password"}
                                  placeholder="Confirm your new password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                  onClick={() => togglePasswordVisibility("confirm")}
                                >
                                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  <span className="sr-only">
                                    {showPassword.confirm ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button type="submit" className="gradient-bg border-0">
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {loggedUser?.role === "merchant" && (
            <TabsContent value="merchant" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Merchant Information</CardTitle>
                    <CardDescription>Manage your merchant account details</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingMerchant(!isEditingMerchant)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {isEditingMerchant ? "Cancel" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Form {...merchantInfoForm}>
                    <form onSubmit={merchantInfoForm.handleSubmit(onMerchantInfoSubmit)} className="space-y-4">
                      <FormField
                        control={merchantInfoForm.control}
                        name="account_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Account</FormLabel>
                            <FormControl>
                              {isEditingMerchant ? (
                                <Select
                                  onValueChange={(value) => {
                                    const selectedAccount = bankAccounts.find((acc) => acc.name === value)
                                    field.onChange(value)
                                    merchantInfoForm.setValue("bank_code", selectedAccount ? String(selectedAccount.id) : "")
                                  }}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select bank account" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {bankAccounts.map((account) => (
                                      <SelectItem key={account.id} value={account.name}>
                                        {account.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                ) : (
                                  <Input
                                    value={field.value}
                                    disabled
                                    placeholder="Select a bank account"
                                  />
                                )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={merchantInfoForm.control}
                        name="account_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter account number"
                                {...field}
                                disabled={!isEditingMerchant}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={merchantInfoForm.control}
                        name="bank_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter bank code"
                                {...field}
                                disabled
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {isEditingMerchant && (
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isUpdatingMerchant} className="gradient-bg border-0">
                            {isUpdatingMerchant ? "Updating..." : "Update Information"}
                            {isUpdatingMerchant && (
                              <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Profile Header Skeleton */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Skeleton className="h-32 w-32 rounded-full" />

          <div className="flex-1">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />

            <div className="flex flex-wrap gap-4 mt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>

            <Skeleton className="h-16 w-full mt-4" />
          </div>
        </div>

        <Separator />

        {/* Tabs Skeleton */}
        <Skeleton className="h-10 w-[400px] mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}

export default ProfilePage;