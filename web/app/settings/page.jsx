// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import * as z from "zod"
// import { Tabs, TabsContent } from "@/components/ui/tabs"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { Switch } from "@/components/ui/switch"
// import { useToast } from "@/components/ui/use-toast"
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { SettingsSidebar } from "@/components/settings/settings-sidebar"
// import { AlertCircle, Check, Eye, EyeOff, Loader2, Upload } from "lucide-react"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"

// // Mock user data based on the schema
// const userData = {
//   fullName: "John Doe",
//   email: "john.doe@example.com",
//   role: "merchant",
//   image: "/placeholder.svg?height=100&width=100",
//   isMerchant: true,
//   approvedBy: "Admin",
//   bannedBy: null,
//   tinNumber: "123456789",
//   nationalId: "AB123456",
//   isBanned: false,
//   isEmailVerified: true,
//   stateName: "New York",
//   cityName: "New York City",
//   phoneNumber: "+1 (555) 123-4567",
//   isDeleted: false,
//   account_name: "John Doe",
//   account_number: "1234567890",
//   bank_code: "ABCDEF",
// }

// // Form schemas
// const profileFormSchema = z.object({
//   fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
//   email: z.string().email({ message: "Please enter a valid email address." }),
//   phoneNumber: z.string().optional(),
//   stateName: z.string().optional(),
//   cityName: z.string().optional(),
// })

// const passwordFormSchema = z
//   .object({
//     currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
//     newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
//     confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
//   })
//   .refine((data) => data.newPassword === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   })

// const merchantFormSchema = z.object({
//   tinNumber: z.string().min(1, { message: "Tax ID Number is required." }),
//   nationalId: z.string().min(1, { message: "National ID is required." }),
//   account_name: z.string().min(1, { message: "Account name is required." }),
//   account_number: z.string().min(1, { message: "Account number is required." }),
//   bank_code: z.string().min(1, { message: "Bank code is required." }),
// })

// export default function SettingsPage() {
//   const { toast } = useToast()
//   const router = useRouter()
//   const [activeTab, setActiveTab] = useState("profile")
//   const [showPassword, setShowPassword] = useState({
//     current: false,
//     new: false,
//     confirm: false,
//   })
//   const [isUploading, setIsUploading] = useState(false)
//   const [isDeactivating, setIsDeactivating] = useState(false)

//   // Profile form
//   const profileForm = useForm({
//     resolver: zodResolver(profileFormSchema),
//     defaultValues: {
//       fullName: userData.fullName,
//       email: userData.email,
//       phoneNumber: userData.phoneNumber || "",
//       stateName: userData.stateName || "",
//       cityName: userData.cityName || "",
//     },
//   })

//   // Password form
//   const passwordForm = useForm({
//     resolver: zodResolver(passwordFormSchema),
//     defaultValues: {
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     },
//   })

//   // Merchant form
//   const merchantForm = useForm({
//     resolver: zodResolver(merchantFormSchema),
//     defaultValues: {
//       tinNumber: userData.tinNumber || "",
//       nationalId: userData.nationalId || "",
//       account_name: userData.account_name || "",
//       account_number: userData.account_number || "",
//       bank_code: userData.bank_code || "",
//     },
//   })

//   // Form submission handlers
//   function onProfileSubmit(values) {
//     toast({
//       title: "Profile updated",
//       description: "Your profile information has been updated successfully.",
//     })
//     console.log(values)
//   }

//   function onPasswordSubmit(values) {
//     toast({
//       title: "Password updated",
//       description: "Your password has been changed successfully.",
//     })
//     console.log(values)
//     passwordForm.reset({
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     })
//   }

//   function onMerchantSubmit(values) {
//     toast({
//       title: "Merchant details updated",
//       description: "Your merchant information has been updated successfully.",
//     })
//     console.log(values)
//   }

//   function handleProfilePictureUpload() {
//     setIsUploading(true)
//     // Simulate upload delay
//     setTimeout(() => {
//       setIsUploading(false)
//       toast({
//         title: "Profile picture updated",
//         description: "Your profile picture has been updated successfully.",
//       })
//     }, 1500)
//   }

//   function handleDeactivateAccount() {
//     setIsDeactivating(true)
//     // Simulate deactivation delay
//     setTimeout(() => {
//       setIsDeactivating(false)
//       toast({
//         title: "Account deactivated",
//         description: "Your account has been deactivated. You will be logged out.",
//         variant: "destructive",
//       })
//       // Redirect to home page after deactivation
//       setTimeout(() => router.push("/"), 2000)
//     }, 1500)
//   }

//   // Toggle password visibility
//   const togglePasswordVisibility = (field) => {
//     setShowPassword((prev) => ({
//       ...prev,
//       [field]: !prev[field],
//     }))
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Settings Sidebar */}
//         <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

//         {/* Main Content */}
//         <div className="flex-1">
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold">Account Settings</h1>
//             <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
//           </div>

//           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//             {/* Profile Tab */}
//             <TabsContent value="profile" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Profile Information</CardTitle>
//                   <CardDescription>Update your personal information and contact details</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex flex-col md:flex-row gap-8">
//                     {/* Profile Picture */}
//                     <div className="flex flex-col items-center gap-4">
//                       <Avatar className="h-32 w-32 border-2 border-border">
//                         <AvatarImage src={userData.image} alt={userData.fullName} />
//                         <AvatarFallback className="text-2xl">{userData.fullName.charAt(0)}</AvatarFallback>
//                       </Avatar>
//                       <Button
//                         variant="outline"
//                         className="flex gap-2"
//                         onClick={handleProfilePictureUpload}
//                         disabled={isUploading}
//                       >
//                         {isUploading ? (
//                           <>
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                             Uploading...
//                           </>
//                         ) : (
//                           <>
//                             <Upload className="h-4 w-4" />
//                             Change Photo
//                           </>
//                         )}
//                       </Button>
//                     </div>

//                     {/* Profile Form */}
//                     <div className="flex-1">
//                       <Form {...profileForm}>
//                         <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
//                           <FormField
//                             control={profileForm.control}
//                             name="fullName"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Full Name</FormLabel>
//                                 <FormControl>
//                                   <Input placeholder="Your full name" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={profileForm.control}
//                             name="email"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Email</FormLabel>
//                                 <FormControl>
//                                   <div className="relative">
//                                     <Input placeholder="Your email address" {...field} />
//                                     {userData.isEmailVerified && (
//                                       <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-success">
//                                         <Check className="h-3 w-3 mr-1" />
//                                         Verified
//                                       </div>
//                                     )}
//                                   </div>
//                                 </FormControl>
//                                 {!userData.isEmailVerified && (
//                                   <div className="flex items-center text-xs text-warning mt-1">
//                                     <AlertCircle className="h-3 w-3 mr-1" />
//                                     Not verified.{" "}
//                                     <Button variant="link" className="h-auto p-0 text-xs">
//                                       Resend verification
//                                     </Button>
//                                   </div>
//                                 )}
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={profileForm.control}
//                             name="phoneNumber"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Phone Number</FormLabel>
//                                 <FormControl>
//                                   <Input placeholder="Your phone number" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <FormField
//                               control={profileForm.control}
//                               name="stateName"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>State</FormLabel>
//                                   <FormControl>
//                                     <Input placeholder="Your state" {...field} />
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                             <FormField
//                               control={profileForm.control}
//                               name="cityName"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>City</FormLabel>
//                                   <FormControl>
//                                     <Input placeholder="Your city" {...field} />
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                           </div>
//                           <div className="flex justify-end">
//                             <Button type="submit" className="gradient-bg border-0">
//                               Save Changes
//                             </Button>
//                           </div>
//                         </form>
//                       </Form>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Account Type</CardTitle>
//                   <CardDescription>Your current account type and status</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium">Account Type</p>
//                         <p className="text-sm text-muted-foreground capitalize">{userData.role}</p>
//                       </div>
//                       <div className="flex items-center">
//                         {userData.role === "merchant" && (
//                           <div className="flex items-center text-xs bg-success/10 text-success px-2 py-1 rounded-full">
//                             <Check className="h-3 w-3 mr-1" />
//                             Approved
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     {userData.role === "customer" && (
//                       <div>
//                         <Button variant="outline" className="w-full sm:w-auto">
//                           Upgrade to Merchant Account
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Security Tab */}
//             <TabsContent value="security" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Change Password</CardTitle>
//                   <CardDescription>Update your password to keep your account secure</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Form {...passwordForm}>
//                     <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
//                       <FormField
//                         control={passwordForm.control}
//                         name="currentPassword"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Current Password</FormLabel>
//                             <FormControl>
//                               <div className="relative">
//                                 <Input
//                                   type={showPassword.current ? "text" : "password"}
//                                   placeholder="Enter your current password"
//                                   {...field}
//                                 />
//                                 <Button
//                                   type="button"
//                                   variant="ghost"
//                                   size="icon"
//                                   className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
//                                   onClick={() => togglePasswordVisibility("current")}
//                                 >
//                                   {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                                   <span className="sr-only">
//                                     {showPassword.current ? "Hide password" : "Show password"}
//                                   </span>
//                                 </Button>
//                               </div>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={passwordForm.control}
//                         name="newPassword"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>New Password</FormLabel>
//                             <FormControl>
//                               <div className="relative">
//                                 <Input
//                                   type={showPassword.new ? "text" : "password"}
//                                   placeholder="Enter your new password"
//                                   {...field}
//                                 />
//                                 <Button
//                                   type="button"
//                                   variant="ghost"
//                                   size="icon"
//                                   className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
//                                   onClick={() => togglePasswordVisibility("new")}
//                                 >
//                                   {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                                   <span className="sr-only">
//                                     {showPassword.new ? "Hide password" : "Show password"}
//                                   </span>
//                                 </Button>
//                               </div>
//                             </FormControl>
//                             <FormDescription>Password must be at least 8 characters long.</FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={passwordForm.control}
//                         name="confirmPassword"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Confirm New Password</FormLabel>
//                             <FormControl>
//                               <div className="relative">
//                                 <Input
//                                   type={showPassword.confirm ? "text" : "password"}
//                                   placeholder="Confirm your new password"
//                                   {...field}
//                                 />
//                                 <Button
//                                   type="button"
//                                   variant="ghost"
//                                   size="icon"
//                                   className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
//                                   onClick={() => togglePasswordVisibility("confirm")}
//                                 >
//                                   {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                                   <span className="sr-only">
//                                     {showPassword.confirm ? "Hide password" : "Show password"}
//                                   </span>
//                                 </Button>
//                               </div>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <div className="flex justify-end">
//                         <Button type="submit" className="gradient-bg border-0">
//                           Update Password
//                         </Button>
//                       </div>
//                     </form>
//                   </Form>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Two-Factor Authentication</CardTitle>
//                   <CardDescription>Add an extra layer of security to your account</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div className="space-y-0.5">
//                         <Label htmlFor="2fa">Two-factor authentication</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Receive a verification code via SMS when signing in
//                         </p>
//                       </div>
//                       <Switch id="2fa" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Login Sessions</CardTitle>
//                   <CardDescription>Manage your active login sessions</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="rounded-md border p-4">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="font-medium">Current Session</p>
//                           <p className="text-sm text-muted-foreground">
//                             Chrome on Windows • New York, USA • IP: 192.168.1.1
//                           </p>
//                           <p className="text-xs text-muted-foreground mt-1">Last active: Just now</p>
//                         </div>
//                         <div className="flex items-center text-xs bg-success/10 text-success px-2 py-1 rounded-full">
//                           <Check className="h-3 w-3 mr-1" />
//                           Current
//                         </div>
//                       </div>
//                     </div>
//                     <Button variant="outline" className="w-full">
//                       Log Out of All Other Sessions
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Notifications Tab */}
//             <TabsContent value="notifications" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Notification Preferences</CardTitle>
//                   <CardDescription>Choose how you want to be notified</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label htmlFor="email-bids">New bids on your auctions</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Receive notifications when someone bids on your auction
//                             </p>
//                           </div>
//                           <Switch id="email-bids" defaultChecked />
//                         </div>
//                         <Separator />
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label htmlFor="email-outbid">Outbid notifications</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Receive notifications when someone outbids you
//                             </p>
//                           </div>
//                           <Switch id="email-outbid" defaultChecked />
//                         </div>
//                         <Separator />
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label htmlFor="email-ending">Auction ending soon</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Receive notifications when auctions you're watching are ending soon
//                             </p>
//                           </div>
//                           <Switch id="email-ending" defaultChecked />
//                         </div>
//                         <Separator />
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label htmlFor="email-marketing">Marketing emails</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Receive emails about new features and special offers
//                             </p>
//                           </div>
//                           <Switch id="email-marketing" />
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label htmlFor="push-all">Enable push notifications</Label>
//                             <p className="text-sm text-muted-foreground">Allow browser push notifications</p>
//                           </div>
//                           <Switch id="push-all" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//                 <CardFooter className="flex justify-end">
//                   <Button className="gradient-bg border-0">Save Preferences</Button>
//                 </CardFooter>
//               </Card>
//             </TabsContent>

//             {/* Merchant Tab */}
//             {userData.role === "merchant" && (
//               <TabsContent value="merchant" className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Merchant Information</CardTitle>
//                     <CardDescription>Update your merchant details and payment information</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <Form {...merchantForm}>
//                       <form onSubmit={merchantForm.handleSubmit(onMerchantSubmit)} className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <FormField
//                             control={merchantForm.control}
//                             name="tinNumber"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Tax ID Number (TIN)</FormLabel>
//                                 <FormControl>
//                                   <Input placeholder="Your tax ID number" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={merchantForm.control}
//                             name="nationalId"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>National ID</FormLabel>
//                                 <FormControl>
//                                   <Input placeholder="Your national ID" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         </div>

//                         <div className="pt-4">
//                           <h3 className="text-lg font-medium mb-4">Payment Information</h3>
//                           <div className="space-y-4">
//                             <FormField
//                               control={merchantForm.control}
//                               name="account_name"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Account Name</FormLabel>
//                                   <FormControl>
//                                     <Input placeholder="Bank account name" {...field} />
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                               <FormField
//                                 control={merchantForm.control}
//                                 name="account_number"
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel>Account Number</FormLabel>
//                                     <FormControl>
//                                       <Input placeholder="Bank account number" {...field} />
//                                     </FormControl>
//                                     <FormMessage />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={merchantForm.control}
//                                 name="bank_code"
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel>Bank Code</FormLabel>
//                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                       <FormControl>
//                                         <SelectTrigger>
//                                           <SelectValue placeholder="Select your bank" />
//                                         </SelectTrigger>
//                                       </FormControl>
//                                       <SelectContent>
//                                         <SelectItem value="ABCDEF">ABC Bank</SelectItem>
//                                         <SelectItem value="DEFGHI">DEF Bank</SelectItem>
//                                         <SelectItem value="GHIJKL">GHI Bank</SelectItem>
//                                         <SelectItem value="JKLMNO">JKL Bank</SelectItem>
//                                       </SelectContent>
//                                     </Select>
//                                     <FormMessage />
//                                   </FormItem>
//                                 )}
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex justify-end">
//                           <Button type="submit" className="gradient-bg border-0">
//                             Save Merchant Details
//                           </Button>
//                         </div>
//                       </form>
//                     </Form>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Merchant Verification Status</CardTitle>
//                     <CardDescription>Your current verification status and documents</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="font-medium">Verification Status</p>
//                           <p className="text-sm text-muted-foreground">Your merchant account is verified</p>
//                         </div>
//                         <div className="flex items-center text-xs bg-success/10 text-success px-2 py-1 rounded-full">
//                           <Check className="h-3 w-3 mr-1" />
//                           Verified
//                         </div>
//                       </div>
//                       <Separator />
//                       <div>
//                         <p className="font-medium">Verification Documents</p>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                           <div className="flex items-center p-3 border rounded-md">
//                             <div className="flex-1">
//                               <p className="text-sm font-medium">Business License</p>
//                               <p className="text-xs text-muted-foreground">Uploaded on Jan 15, 2024</p>
//                             </div>
//                             <Button variant="outline" size="sm">
//                               View
//                             </Button>
//                           </div>
//                           <div className="flex items-center p-3 border rounded-md">
//                             <div className="flex-1">
//                               <p className="text-sm font-medium">Tax Certificate</p>
//                               <p className="text-xs text-muted-foreground">Uploaded on Jan 15, 2024</p>
//                             </div>
//                             <Button variant="outline" size="sm">
//                               View
//                             </Button>
//                           </div>
//                         </div>
//                         <Button variant="outline" className="mt-4">
//                           <Upload className="h-4 w-4 mr-2" />
//                           Upload New Document
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//             )}

//             {/* Account Tab */}
//             <TabsContent value="account" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Account Management</CardTitle>
//                   <CardDescription>Manage your account status and data</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="text-lg font-medium mb-4">Data & Privacy</h3>
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Download Your Data</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Get a copy of all the data we have about you
//                             </p>
//                           </div>
//                           <Button variant="outline">Download Data</Button>
//                         </div>
//                       </div>
//                     </div>

//                     <Separator />

//                     <div>
//                       <h3 className="text-lg font-medium mb-4 text-destructive">Danger Zone</h3>
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Deactivate Account</Label>
//                             <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
//                           </div>
//                           <Button
//                             variant="outline"
//                             className="text-destructive border-destructive hover:bg-destructive/10"
//                           >
//                             Deactivate
//                           </Button>
//                         </div>
//                         <Separator />
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Delete Account</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Permanently delete your account and all your data
//                             </p>
//                           </div>
//                           <AlertDialog>
//                             <AlertDialogTrigger asChild>
//                               <Button variant="destructive">Delete Account</Button>
//                             </AlertDialogTrigger>
//                             <AlertDialogContent>
//                               <AlertDialogHeader>
//                                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                                 <AlertDialogDescription>
//                                   This action cannot be undone. This will permanently delete your account and remove all
//                                   your data from our servers.
//                                 </AlertDialogDescription>
//                               </AlertDialogHeader>
//                               <AlertDialogFooter>
//                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                 <AlertDialogAction
//                                   onClick={handleDeactivateAccount}
//                                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                                   disabled={isDeactivating}
//                                 >
//                                   {isDeactivating ? (
//                                     <>
//                                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                                       Deleting...
//                                     </>
//                                   ) : (
//                                     "Delete Account"
//                                   )}
//                                 </AlertDialogAction>
//                               </AlertDialogFooter>
//                             </AlertDialogContent>
//                           </AlertDialog>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SettingsSidebar } from "@/components/settings/settings-sidebar"
import { AlertCircle, Check, Eye, EyeOff, Loader2, Upload } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { State, City } from "country-state-city"

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

const merchantFormSchema = z.object({
  tinNumber: z.string().min(1, { message: "Tax ID Number is required." }),
  nationalId: z.string().min(1, { message: "National ID is required." }),
  account_name: z.string().min(1, { message: "Account name is required." }),
  account_number: z.string().min(1, { message: "Account number is required." }),
  bank_code: z.string().min(1, { message: "Bank code is required." }),
})

export default function SettingsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [selectedStateIsoCode, setSelectedStateIsoCode] = useState("")

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      stateName: "",
      cityName: "",
    },
  })

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Merchant form
  const merchantForm = useForm({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      tinNumber: "",
      nationalId: "",
      account_name: "",
      account_number: "",
      bank_code: "",
    },
  })

  // Fetch states for Ethiopia
  useEffect(() => {
    const ethiopianStates = State.getStatesOfCountry("ET")
    setStates(ethiopianStates)
  }, [])

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedStateIsoCode) {
      const stateCities = City.getCitiesOfState("ET", selectedStateIsoCode)
      setCities(stateCities)
      // Reset city if the current city is not in the new state's cities
      const currentCity = profileForm.getValues("cityName")
      if (currentCity && !stateCities.some((city) => city.name === currentCity)) {
        profileForm.setValue("cityName", "")
      }
    } else {
      setCities([])
      profileForm.setValue("cityName", "")
    }
  }, [selectedStateIsoCode, profileForm])

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch user data')
        }

        const data = await response.json()
        setUserData(data)

        // Update form default values
        profileForm.reset({
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          stateName: data.stateName || "",
          cityName: data.cityName || "",
        })

        // Set initial selected state ISO code
        const stateObj = states.find((state) => state.name === data.stateName)
        setSelectedStateIsoCode(stateObj ? stateObj.isoCode : "")

        merchantForm.reset({
          tinNumber: data.tinNumber || "",
          nationalId: data.nationalId || "",
          account_name: data.account_name || "",
          account_number: data.account_number || "",
          bank_code: data.bank_code || "",
        })
      } catch (err) {
        setError(err.message)
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (states.length > 0) {
      fetchUserData()
    }
  }, [profileForm, merchantForm, toast, states])

  // Form submission handlers
  async function onProfileSubmit(values) {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: userData._id,
          ...values,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedUser = await response.json()
      setUserData(updatedUser)
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  async function onPasswordSubmit(values) {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: userData._id,
          password: values.newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update password')
      }

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  async function onMerchantSubmit(values) {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: userData._id,
          ...values,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update merchant details')
      }

      const updatedUser = await response.json()
      setUserData(updatedUser)
      toast({
        title: "Merchant details updated",
        description: "Your merchant information has been updated successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  function handleProfilePictureUpload() {
    setIsUploading(true)
    // Simulate upload delay (replace with actual upload logic)
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      })
    }, 1500)
  }

  async function handleDeactivateAccount() {
    try {
      setIsDeactivating(true)
      const response = await fetch(`/api/user?email=${userData.email}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deactivate account')
      }

      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated. You will be logged out.",
        variant: "destructive",
      })
      setTimeout(() => router.push("/"), 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsDeactivating(false)
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-32 w-32 border-2 border-border">
                        <AvatarImage src={userData.image} alt={userData.fullName} />
                        <AvatarFallback className="text-2xl">{userData.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        className="flex gap-2"
                        onClick={handleProfilePictureUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Change Photo
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Profile Form */}
                    <div className="flex-1">
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input placeholder="Your email address" {...field} />
                                    {userData.isEmailVerified && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-success">
                                        <Check className="h-3 w-3 mr-1" />
                                        Verified
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                {!userData.isEmailVerified && (
                                  <div className="flex items-center text-xs text-warning mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Not verified.{" "}
                                    <Button variant="link" className="h-auto p-0 text-xs">
                                      Resend verification
                                    </Button>
                                  </div>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="stateName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value)
                                      const stateObj = states.find((state) => state.name === value)
                                      setSelectedStateIsoCode(stateObj ? stateObj.isoCode : "")
                                    }}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select your state" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {states.map((state) => (
                                        <SelectItem key={state.isoCode} value={state.name}>
                                          {state.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="cityName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!selectedStateIsoCode}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select your city" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {cities.map((city) => (
                                        <SelectItem key={city.name} value={city.name}>
                                          {city.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button type="submit" className="gradient-bg border-0">
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Type</CardTitle>
                  <CardDescription>Your current account type and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Type</p>
                        <p className="text-sm text-muted-foreground capitalize">{userData.role}</p>
                      </div>
                      <div className="flex items-center">
                        {userData.role === "merchant" && userData.approvalStatus === "approved" && (
                          <div className="flex items-center text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                            <Check className="h-3 w-3 mr-1" />
                            Approved
                          </div>
                        )}
                      </div>
                    </div>
                    {userData.role === "customer" && (
                      <div>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => setActiveTab("merchant")}
                        >
                          Upgrade to Merchant Account
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
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

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="2fa">Two-factor authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a verification code via SMS when signing in
                        </p>
                      </div>
                      <Switch id="2fa" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login Sessions</CardTitle>
                  <CardDescription>Manage your active login sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">
                            Chrome on Windows • {userData.cityName}, {userData.stateName} • IP: Unknown
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Last active: Just now</p>
                        </div>
                        <div className="flex items-center text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                          <Check className="h-3 w-3 mr-1" />
                          Current
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Log Out of All Other Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-bids">New bids on your auctions</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications when someone bids on your auction
                            </p>
                          </div>
                          <Switch id="email-bids" defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-outbid">Outbid notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications when someone outbids you
                            </p>
                          </div>
                          <Switch id="email-outbid" defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-ending">Auction ending soon</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications when auctions you're watching are ending soon
                            </p>
                          </div>
                          <Switch id="email-ending" defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-marketing">Marketing emails</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive emails about new features and special offers
                            </p>
                          </div>
                          <Switch id="email-marketing" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="push-all">Enable push notifications</Label>
                            <p className="text-sm text-muted-foreground">Allow browser push notifications</p>
                          </div>
                          <Switch id="push-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="gradient-bg border-0">Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Merchant Tab */}
            {userData.role === "merchant" && (
              <TabsContent value="merchant" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Merchant Information</CardTitle>
                    <CardDescription>Update your merchant details and payment information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...merchantForm}>
                      <form onSubmit={merchantForm.handleSubmit(onMerchantSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={merchantForm.control}
                            name="tinNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax ID Number (TIN)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your tax ID number" {...field} disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={merchantForm.control}
                            name="nationalId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>National ID</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your national ID" {...field} disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="pt-4">
                          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                          <div className="space-y-4">
                            <FormField
                              control={merchantForm.control}
                              name="account_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Bank account name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={merchantForm.control}
                                name="account_number"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Bank account number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={merchantForm.control}
                                name="bank_code"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bank Code</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select your bank" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="ABCDEF">ABC Bank</SelectItem>
                                        <SelectItem value="DEFGHI">DEF Bank</SelectItem>
                                        <SelectItem value="GHIJKL">GHI Bank</SelectItem>
                                        <SelectItem value="JKLMNO">JKL Bank</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" className="gradient-bg border-0">
                            Save Merchant Details
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Merchant Verification Status</CardTitle>
                    <CardDescription>Your current verification status and documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Verification Status</p>
                          <p className="text-sm text-muted-foreground">
                            Your merchant account is {userData.approvalStatus}
                          </p>
                        </div>
                        <div
                          className={`flex items-center text-xs px-2 py-1 rounded-full ${
                            userData.approvalStatus === "approved"
                              ? "bg-success/10 text-success"
                              : userData.approvalStatus === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {userData.approvalStatus.charAt(0).toUpperCase() + userData.approvalStatus.slice(1)}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="font-medium">Verification Documents</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="flex items-center p-3 border rounded-md">
                            <div className="flex-1">
                              <p className="text-sm font-medium">Business License</p>
                              <p className="text-xs text-muted-foreground">Uploaded on {new Date(userData.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                          <div className="flex items-center p-3 border rounded-md">
                            <div className="flex-1">
                              <p className="text-sm font-medium">Tax Certificate</p>
                              <p className="text-xs text-muted-foreground">Uploaded on {new Date(userData.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-4">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Document
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>Manage your account status and data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Data & Privacy</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Download Your Data</Label>
                            <p className="text-sm text-muted-foreground">
                              Get a copy of all the data we have about you
                            </p>
                          </div>
                          <Button variant="outline">Download Data</Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4 text-destructive">Danger Zone</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Deactivate Account</Label>
                            <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                          </div>
                          <Button
                            variant="outline"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                          >
                            Deactivate
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Delete Account</Label>
                            <p className="text-sm text-muted-foreground">
                              Permanently delete your account and all your data
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your account and remove all
                                  your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeactivateAccount}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={isDeactivating}
                                >
                                  {isDeactivating ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete Account"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}