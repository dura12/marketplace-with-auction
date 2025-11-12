"use client"

import type React from "react"

import { useState } from "react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

interface UpdateProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: any
  onUpdate: (updatedProfile: any) => void
}

export function UpdateProfileDialog({ open, onOpenChange, profile, onUpdate }: UpdateProfileDialogProps) {
  const [formData, setFormData] = useState({
    fullname: profile?.fullname || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    image: profile?.image || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real implementation, this would handle file upload
    // For demo purposes, we'll just simulate it
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, image: event.target?.result as string }))
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  // Demo API function to update admin profile
  const updateAdminProfile = async (profileData: any) => {
    console.log("Updating admin profile:", profileData)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    return {
      ...profile,
      ...profileData,
      updatedAt: new Date().toISOString(),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updatedProfile = await updateAdminProfile(formData)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      onUpdate(updatedProfile)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24 border">
                <AvatarImage src={formData.image || "/placeholder.svg"} alt={formData.fullname} />
                <AvatarFallback className="text-2xl">
                  {formData.fullname
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="image-upload"
                className="cursor-pointer flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Camera className="h-4 w-4" />
                Change Photo
              </Label>
              <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
