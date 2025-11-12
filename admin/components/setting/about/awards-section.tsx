"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fetchAwards, updateAwards } from "@/utils/about"
import { Loader2, Plus, Trash2 } from "lucide-react"

const awardSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  organization: z.string().min(2, { message: "Organization must be at least 2 characters." }),
  year: z.string().min(4, { message: "Year must be at least 4 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
})

const formSchema = z.object({
  awards: z.array(awardSchema).min(1, { message: "You must add at least one award." }),
})

type AwardsFormValues = z.infer<typeof formSchema>

interface AwardsSectionProps {
  onSaveSuccess: () => void
}

export function AwardsSection({ onSaveSuccess }: AwardsSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<AwardsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      awards: [{ title: "", organization: "", year: "", description: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "awards",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchAwards()
        if (data && data.length > 0) {
          form.reset({ awards: data })
        }
      } catch (error) {
        console.error("Failed to load awards data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [form])

  async function onSubmit(values: AwardsFormValues) {
    try {
      setIsSaving(true)
      await updateAwards(values.awards)
      onSaveSuccess()
    } catch (error) {
      console.error("Failed to update awards:", error)
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
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name={`awards.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-1 mr-4">
                          <FormLabel>Award Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter award title" {...field} />
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`awards.${index}.organization`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter awarding organization" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`awards.${index}.year`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2023" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`awards.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter award description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: "", organization: "", year: "", description: "" })}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Award
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
