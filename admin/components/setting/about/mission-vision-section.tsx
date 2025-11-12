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
import { ImageUploader } from "../shared/image-uploader"
import { fetchMission, fetchVision, updateMission, updateVision } from "@/utils/about"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  image: z.string().url({ message: "Please enter a valid image URL." }),
})

type MissionVisionFormValues = z.infer<typeof formSchema>

interface MissionVisionSectionProps {
  type: "mission" | "vision"
  onSaveSuccess: () => void
}

export function MissionVisionSection({ type, onSaveSuccess }: MissionVisionSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const title = type === "mission" ? "Mission" : "Vision"

  const form = useForm<MissionVisionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      image: "",
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = type === "mission" ? await fetchMission() : await fetchVision()
        if (data) {
          form.reset({
            title: data.title,
            content: data.content,
            image: data.image,
          })
        }
      } catch (error) {
        console.error(`Failed to load ${type} data:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [form, type])

  async function onSubmit(values: MissionVisionFormValues) {
    try {
      setIsSaving(true)
      if (type === "mission") {
        await updateMission(values)
      } else {
        await updateVision(values)
      }
      onSaveSuccess()
    } catch (error) {
      console.error(`Failed to update ${type}:`, error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{title} Title</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter ${title.toLowerCase()} title`} {...field} />
                  </FormControl>
                  <FormDescription>The heading for your {title.toLowerCase()} section.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{title} Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder={`Enter ${title.toLowerCase()} content`} className="min-h-32" {...field} />
                  </FormControl>
                  <FormDescription>Describe your organization's {title.toLowerCase()}.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{title} Image</FormLabel>
                <FormControl>
                  <ImageUploader value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                </FormControl>
                <FormDescription>
                  Upload an image that represents your {title.toLowerCase()} (recommended size: 800x600px).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
