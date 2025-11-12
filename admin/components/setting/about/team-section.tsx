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
import { fetchTeamMembers, updateTeamMembers } from "@/utils/about"
import { Loader2, Plus, Trash2 } from "lucide-react"

const teamMemberSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  image: z.string().url({ message: "Please enter a valid image URL." }),
})

const formSchema = z.object({
  members: z.array(teamMemberSchema).min(1, { message: "You must add at least one team member." }),
})

type TeamFormValues = z.infer<typeof formSchema>

interface TeamSectionProps {
  onSaveSuccess: () => void
}

export function TeamSection({ onSaveSuccess }: TeamSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      members: [{ name: "", role: "", bio: "", image: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchTeamMembers()
        if (data && data.length > 0) {
          form.reset({ members: data })
        }
      } catch (error) {
        console.error("Failed to load team members data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [form])

  async function onSubmit(values: TeamFormValues) {
    try {
      setIsSaving(true)
      await updateTeamMembers(values.members)
      onSaveSuccess()
    } catch (error) {
      console.error("Failed to update team members:", error)
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
                    name={`members.${index}.image`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <ImageUploader value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                        </FormControl>
                        <FormDescription>Upload a profile image (recommended size: 400x400px).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`members.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1 mr-4">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter team member name" {...field} />
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
                      name={`members.${index}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter team member role" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`members.${index}.bio`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter team member bio" {...field} />
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
          onClick={() => append({ name: "", role: "", bio: "", image: "" })}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
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
