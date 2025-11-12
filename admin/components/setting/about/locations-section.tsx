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
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUploader } from "../shared/image-uploader"
import { fetchLocations, updateLocations } from "@/utils/about"
import { Loader2, Plus, Trash2 } from "lucide-react"

const locationSchema = z.object({
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  image: z.string().url({ message: "Please enter a valid image URL." }),
  isHeadquarters: z.boolean().default(false),
})

const formSchema = z.object({
  locations: z.array(locationSchema).min(1, { message: "You must add at least one location." }),
})

type LocationsFormValues = z.infer<typeof formSchema>

interface LocationsSectionProps {
  onSaveSuccess: () => void
}

export function LocationsSection({ onSaveSuccess }: LocationsSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<LocationsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locations: [{ city: "", country: "", address: "", image: "", isHeadquarters: false }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchLocations()
        if (data && data.length > 0) {
          form.reset({ locations: data })
        }
      } catch (error) {
        console.error("Failed to load locations data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [form])

  async function onSubmit(values: LocationsFormValues) {
    try {
      setIsSaving(true)
      await updateLocations(values.locations)
      onSaveSuccess()
    } catch (error) {
      console.error("Failed to update locations:", error)
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
                    name={`locations.${index}.image`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Image</FormLabel>
                        <FormControl>
                          <ImageUploader value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                        </FormControl>
                        <FormDescription>
                          Upload an image of this location (recommended size: 800x600px).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 mr-4">
                        <FormField
                          control={form.control}
                          name={`locations.${index}.city`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`locations.${index}.country`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                      name={`locations.${index}.address`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter full address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`locations.${index}.isHeadquarters`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Headquarters</FormLabel>
                            <FormDescription>Mark this location as your company headquarters.</FormDescription>
                          </div>
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
          onClick={() => append({ city: "", country: "", address: "", image: "", isHeadquarters: false })}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Location
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
