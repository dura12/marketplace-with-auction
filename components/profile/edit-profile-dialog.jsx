"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { Edit, Loader2, Upload } from "lucide-react"
import { State, City } from "country-state-city";

// Form schema with validation
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  phoneNumber: z.string().optional(),
  stateName: z.string().optional(),
  cityName: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
  image: z.any().optional(),
})


export function EditProfileDialog({ user, trigger }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(user?.image)
  const [selectedState, setSelectedState] = useState(user?.stateName || "")
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  // Initialize form with user data
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName,
      email: user?.email,
      phoneNumber: user?.phoneNumber || "",
      stateName: user?.stateName || "",
      cityName: user?.cityName || "",
      bio: user?.bio || "",
    },
  })
  useEffect(() => {
    const ethiopiaStates = State.getStatesOfCountry("ET");
    setStates(ethiopiaStates);
  }, []);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.stateName) {
        const stateCities = City.getCitiesOfState("ET", value.stateName);
        setCities(stateCities);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle image upload
  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you would upload this to your server/cloud storage
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result)
        form.setValue("image", file)
      }
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(data) {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Append all fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image') formData.append(key, value);
      });
      
      if (data.image) {
        formData.append('image', data.image);
      }
  
      const response = await fetch('/api/user', {
        method: 'PUT',
        body: JSON.stringify({
          _id: user._id,
          email: user.email,
          ...data,
          image: data.image ? await convertToBase64(data.image) : undefined
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) throw new Error('Update failed');
      
      const updatedUser = await response.json();
      
      toast.success({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setOpen(false);
      window.location.reload(); // Or update context/state
  
    } catch (error) {
      toast.fail(error.message,);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Add this helper function
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  // Handle state change to update city options
  const handleStateChange = (value) => {
    setSelectedState(value)
    form.setValue("stateName", value)
    form.setValue("cityName", "") // Reset city when state changes
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-4 border-muted">
                <AvatarImage src={imagePreview} alt={user?.fullName} />
                <AvatarFallback>{user?.fullName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex items-center">
                <label htmlFor="profile-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Upload className="h-4 w-4" />
                    Change profile picture
                  </div>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Full Name */}
            <FormField
              control={form.control}
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

            {/* Email (Read-only) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email" {...field} disabled />
                  </FormControl>
                  <FormDescription>Email cannot be changed. Contact support for assistance.</FormDescription>
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
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

            {/* Location - State and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={handleStateChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {states.map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
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
                control={form.control}
                name="cityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedState}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
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

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself" className="resize-none min-h-[120px]" {...field} />
                  </FormControl>
                  <FormDescription>Brief description that will appear on your public profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}