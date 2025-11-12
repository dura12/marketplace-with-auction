"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fetchContactInfo, updateContactInfo } from "@/utils/about"
import { Loader2, Mail, Phone, MapPin, Clock } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(5, { message: "Phone number must be at least 5 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  businessHours: z.string().min(5, { message: "Business hours must be at least 5 characters." }),
})

type ContactInfoFormValues = z.infer<typeof formSchema>

interface ContactInfoSectionProps {
  onSaveSuccess: () => void
}

export function ContactInfoSection({ onSaveSuccess }: ContactInfoSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ContactInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      businessHours: "",
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchContactInfo()
        if (data) {
          form.reset({
            email: data.email,
            phone: data.phone,
            address: data.address,
            businessHours: data.businessHours,
          })
        }
      } catch (error) {
        console.error("Failed to load contact info data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [form])

  async function onSubmit(values: ContactInfoFormValues) {
    try {
      setIsSaving(true)
      await updateContactInfo(values)
      onSaveSuccess()
    } catch (error) {
      console.error("Failed to update contact info:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="gradient-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label-themed flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="hello@example.com" {...field} className="form-input-themed" />
                  </FormControl>
                  <FormDescription>The primary contact email for your organization.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label-themed flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} className="form-input-themed" />
                  </FormControl>
                  <FormDescription>The primary contact phone number for your organization.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label-themed flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Office Address
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="123 Business Avenue, Suite 500&#10;San Francisco, CA 94107"
                    className="min-h-24 form-input-themed"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your organization&apos;s physical address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label-themed flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Business Hours
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Monday - Friday: 9am - 5pm&#10;Saturday: 10am - 2pm&#10;Sunday: Closed"
                    className="min-h-24 form-input-themed"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your organization&apos;s operating hours.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gradient-bg text-white">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
