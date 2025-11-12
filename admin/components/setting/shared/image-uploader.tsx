/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload } from "lucide-react"
import { uploadImage } from "@/utils/upload"

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
}

export function ImageUploader({ value, onChange, onBlur }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setError(null)

      const imageUrl = await uploadImage(file)
      onChange(imageUrl)
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Input
          type="url"
          placeholder="Image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />

        <div className="flex items-center gap-2">
          <Input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <label htmlFor="image-upload" className="w-full">
            <Button type="button" variant="outline" className="w-full cursor-pointer" disabled={isUploading} asChild>
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <img
            src={value || "/placeholder.svg"}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={() => setError("Invalid image URL")}
          />
        </div>
      )}
    </div>
  )
}
