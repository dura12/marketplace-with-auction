"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Lock, ShieldCheck, Eye, FileText, UserCheck, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPrivacyPolicy } from "@/utils/api-mock"

export default function PrivacyPolicyPage() {
  const [privacyData, setPrivacyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPrivacyData = async () => {
      try {
        const data = await fetchPrivacyPolicy()
        setPrivacyData(data)
      } catch (err) {
        console.error("Failed to fetch privacy policy data:", err)
        setError("Failed to load Privacy Policy. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPrivacyData()
  }, [])

  // Function to render the appropriate icon
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Lock":
        return <Lock className={className} />
      case "ShieldCheck":
        return <ShieldCheck className={className} />
      case "Eye":
        return <Eye className={className} />
      case "FileText":
        return <FileText className={className} />
      case "UserCheck":
        return <UserCheck className={className} />
      default:
        return <ShieldCheck className={className} />
    }
  }

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
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">
              Last updated: {privacyData?.lastUpdated || ""}
            </p>
          </>
        )}
      </div>

      {/* Hero section with visual elements */}
      <div className="relative mb-8 sm:mb-16">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 rounded-xl"></div>
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-8">
              <div className="flex flex-col justify-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Your Privacy Matters</h2>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  We&apos;re committed to protecting your personal information and being transparent about how we use it. This
                  Privacy Policy explains how we collect, use, and share your data.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                    Manage Preferences
                  </Button>
                  <Button variant="outline" className="mt-2 sm:mt-0">Download Policy</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-teal-500 mb-2 sm:mb-3" />
                  <h3 className="font-medium text-sm sm:text-base">Data Protection</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Industry-standard security measures to protect your data</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 mb-2 sm:mb-3" />
                  <h3 className="font-medium text-sm sm:text-base">Your Control</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Access, update, or delete your personal information anytime
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-teal-500 mb-2 sm:mb-3" />
                  <h3 className="font-medium text-sm sm:text-base">Transparency</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Clear information about how we use your data</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 mb-2 sm:mb-3" />
                  <h3 className="font-medium text-sm sm:text-base">Compliance</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Adherence to global privacy regulations</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Key points summary */}
      <div className="mb-8 sm:mb-16">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 mx-auto" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Key Points at a Glance</h2>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {privacyData?.sections.map((section: any, index: number) => (
                <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
                  <div className={`h-2 ${index % 2 === 0 ? "bg-teal-500" : "bg-blue-500"}`}></div>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 flex items-center">
                      {renderIcon(section.icon, `mr-2 h-4 w-4 sm:h-5 sm:w-5 ${index % 2 === 0 ? "text-teal-500" : "text-blue-500"}`)}
                      {section.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">{section.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAQ Accordion */}
      <div className="mb-8 sm:mb-16">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 mx-auto" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {privacyData?.faq.map((item: any, index: number) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        )}
      </div>

      {/* Detailed policy content */}
      {isLoading ? (
        <div className="space-y-6">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="prose prose-blue dark:prose-invert max-w-none text-sm sm:text-base">
          {privacyData?.fullPolicy.map((section: any, index: number) => (
            <div key={index} className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{section.title}</h2>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contact section */}
      <div className="mt-8 sm:mt-12 flex justify-center">
        <div className="rounded-lg bg-muted p-4 sm:p-8 max-w-2xl w-full">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">Have Questions About Your Privacy?</h3>
          <p className="text-center text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
            Our data protection team is here to address any concerns you may have about your personal information.
          </p>
          <div className="flex justify-center">
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                Contact Our Privacy Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
