"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "../shared/image-uploader"
import { fetchTimelineEvents, updateTimelineEvents } from "@/utils/about"
import { Loader2, Plus, Trash2 } from "lucide-react"

// Schema validation for each timeline event
const timelineEventSchema = z.object({
  year: z.string().min(1, { message: "Year is required." }),
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  image: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal("")),
})

// Main form schema for multiple events
const formSchema = z.object({
  events: z.array(timelineEventSchema).min(1, { message: "You must add at least one timeline event." }),
})

type TimelineFormValues = z.infer<typeof formSchema>

interface TimelineSectionProps {
  onSaveSuccess: () => void
}

export function TimelineSection({ onSaveSuccess }: TimelineSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form with validation and default values
  const form = useForm<TimelineFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      events: [{ year: "", title: "", description: "", image: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "events",
  })

  // Fetch initial timeline data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchTimelineEvents()
        if (data && data.length > 0) {
          form.reset({ events: data })
        }
      } catch (error) {
        console.error("Failed to load timeline events data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [form])

  const transformTimelineEvents = (events: { year: string; title: string; description: string; image?: string }[]) => {
    return events.map(event => ({
      title: event.title,
      description: event.description,
      date: event.year, // Assuming `year` should be the `date`
    }));
  };
  
  // In your onSubmit function:
  async function onSubmit(values: TimelineFormValues) {
    try {
      setIsSaving(true);
      const transformedValues = transformTimelineEvents(values.events);
      await updateTimelineEvents(transformedValues);
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to update timeline events:", error);
    } finally {
      setIsSaving(false);
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
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`events.${index}.year`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`events.${index}.image`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image (Optional)</FormLabel>
                          <FormControl>
                            <ImageUploader value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />
                          </FormControl>
                          <FormDescription>Upload an image for this timeline event.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`events.${index}.title`}
                        render={({ field }) => (
                          <FormItem className="flex-1 mr-4">
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter event title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="mt-8"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`events.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter event description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ year: "", title: "", description: "", image: "" })}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Timeline Event
        </Button>

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
