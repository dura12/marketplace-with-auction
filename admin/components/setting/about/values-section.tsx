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
import { IconPicker } from "../shared/icon-picker"
import { fetchValues, updateValues } from "@/utils/about"
import { Loader2, Plus, Trash2 } from "lucide-react"

const valueSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  icon: z.string().min(1, { message: "Please select an icon." }),
})

const formSchema = z.object({
  values: z.array(valueSchema).min(1, { message: "You must add at least one value." }),
})

type ValuesFormValues = z.infer<typeof formSchema>

interface ValuesSectionProps {
  onSaveSuccess: () => void
}

export function ValuesSection({ onSaveSuccess }: ValuesSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ValuesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      values: [{ title: "", description: "", icon: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchValues()
        if (data && data.length > 0) {
          form.reset({ values: data })
        }
      } catch (error) {
        console.error("Failed to load values data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [form])

  async function onSubmit(values: ValuesFormValues) {
    try {
      setIsSaving(true)
      await updateValues(values.values)
      onSaveSuccess()
    } catch (error) {
      console.error("Failed to update values:", error)
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
                <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">
                  <FormField
                    control={form.control}
                    name={`values.${index}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <IconPicker value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                        </FormControl>
                        <FormDescription>Select an icon that represents this value.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`values.${index}.title`}
                        render={({ field }) => (
                          <FormItem className="flex-1 mr-4">
                            <FormLabel>Value Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter value title" {...field} />
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
                      name={`values.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter value description" {...field} />
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
          onClick={() => append({ title: "", description: "", icon: "" })}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Value
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
