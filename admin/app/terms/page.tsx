"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTermsOfService } from "@/utils/api-mock"

export default function TermsOfServicePage() {
  const [termsData, setTermsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTermsData = async () => {
      try {
        const data = await fetchTermsOfService()
        setTermsData(data)
      } catch (err) {
        console.error("Failed to fetch terms data:", err)
        setError("Failed to load Terms of Service. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTermsData()
  }, [])

  if (error) {
    return (
      <div className="container relative mx-auto px-4 py-12 lg:px-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container relative mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 max-w-7xl">
      <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">
              Last updated: {termsData?.lastUpdated || ""}
            </p>
          </>
        )}
      </div>

      {/* Fancy tabs for different sections */}
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full mb-8 sm:mb-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            {termsData?.sections.map((section: any) => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {termsData?.sections.map((section: any) => (
            <TabsContent key={section.id} value={section.id} className="mt-6 space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 sm:p-6 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
                  <Shield className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                  {section.title === "Overview" ? "Our Commitment to You" : section.title}
                </h2>
                <p className="text-muted-foreground">{section.content}</p>
              </div>

              {section.id === "overview" && section.highlights && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {section.highlights.map((highlight: any, index: number) => (
                    <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
                      <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{highlight.title}</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">{highlight.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {section.id === "usage" && section.guidelines && (
                <div className="space-y-4">
                  {section.guidelines.map((guideline: any, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                      <div>
                        <h3 className="font-medium">{guideline.title}</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">{guideline.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.id === "privacy" && section.details && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {section.details.map((detail: any, index: number) => (
                    <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{detail.title}</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">{detail.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {section.id === "legal" && section.disclaimers && (
                <div className="space-y-4 sm:space-y-6">
                  {section.disclaimers.map((disclaimer: any, index: number) => (
                    <div key={index} className="p-4 sm:p-6 border rounded-lg">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{disclaimer.title}</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">{disclaimer.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.id === "privacy" && (
                <div className="text-center mt-8">
                  <Link href="/privacy">
                    <Button variant="outline" className="group">
                      View Full Privacy Policy
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="prose prose-indigo dark:prose-invert max-w-none text-sm sm:text-base">
          {termsData?.fullTerms.map((term: any, index: number) => (
            <div key={index} className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{term.title}</h2>
              <p>{term.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 sm:mt-12 flex justify-center">
        <div className="rounded-lg bg-muted p-4 sm:p-8 max-w-2xl w-full">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">Have Questions About Our Terms?</h3>
          <p className="text-center text-muted-foreground mb-4 sm:mb-6">
            Our team is here to help clarify any points in our Terms of Service.
          </p>
          <div className="flex justify-center">
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Contact Our Legal Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
