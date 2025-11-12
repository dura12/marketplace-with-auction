"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { fetchStats, updateStats } from "@/utils/about"
import { Loader2, Plus, Trash2 } from "lucide-react"

const statSchema = z.object({
  value: z.string().min(1, { message: "Value is required." }),
  label: z.string().min(1, { message: "Label is required." }),
})

const formSchema = z.object({
  stats: z.array(statSchema).min(1, { message: "You must add at least one stat." }),
})

type StatsFormValues = z.infer<typeof formSchema>

interface StatsSectionProps {
  onSaveSuccess: () => void
}

export function StatsSection({ onSaveSuccess }: StatsSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<StatsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stats: [{ value: "", label: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stats",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchStats()
        if (data && data.length > 0) {
          form.reset({ stats: data })
        }
      } catch (error) {
        console.error("Failed to load stats data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [form])

  async function onSubmit(values: StatsFormValues) {
    try {
      setIsSaving(true)
      await updateStats(values.stats)
      onSaveSuccess()
    } catch (error) {
      console.error("Failed to update stats:", error)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`stats.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1 mr-4">
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 500+" {...field} />
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
                      name={`stats.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Happy Clients" {...field} />
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
        </div>

        <Button type="button" variant="outline" onClick={() => append({ value: "", label: "" })} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Stat
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
