"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ChatBot from "@/components/commons/ChatBot"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
})

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const chatIconRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        toast({
          title: "Message sent!",
          description: "We'll get back to you as soon as possible.",
        })
        form.reset()
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleStartChat = () => {
    if (chatIconRef.current) {
      chatIconRef.current.click(); // Programmatically trigger the chat icon click
    } else {
      toast({
        title: "Error",
        description: "Chatbot is not available at the moment.",
        variant: "destructive",
      });
    }
  };

  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "To create an account, click on the 'Sign Up' button in the top right corner of the page. Fill in your details and follow the verification process to complete your registration.",
    },
    {
      question: "How do I place a bid?",
      answer:
        "To place a bid, navigate to the auction page of the item you're interested in. Enter your bid amount and click 'Place Bid'. Make sure your bid meets the minimum increment requirement.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our payment gateway.",
    },
    {
      question: "How is shipping handled?",
      answer:
        "Shipping is typically arranged by the seller. The shipping cost and methods available will be listed on the auction page. International shipping options vary by seller.",
    },
    {
      question: "What if I have an issue with my purchase?",
      answer:
        "If you have any issues with your purchase, please contact the seller first through our messaging system. If you can't resolve the issue, our customer support team is available to help mediate.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Have questions or need assistance? We're here to help. Reach out to our team through any of the channels
          below.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="What is this regarding?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Your message" rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gradient-bg border-0" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Contact Info & FAQ */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Reach out to us through any of these channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">abdelazizebrahim@gmail.com</p>
                  <p className="text-muted-foreground">danyaabdella@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">+251975805980</p>
                  <p className="text-muted-foreground">Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">Peyasa building</p>
                  <p className="text-muted-foreground">Bahir Dar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-muted-foreground">Monday-Friday: 9am-5pm EST</p>
                  <p className="text-muted-foreground">Saturday: 10am-2pm EST</p>
                  <p className="text-muted-foreground">Sunday: Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="faq">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="map">Find Us</TabsTrigger>
            </TabsList>
            <TabsContent value="faq" className="border rounded-md mt-2 p-4">
              <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            <TabsContent value="map" className="border rounded-md mt-2">
              <div className="relative aspect-video w-full">
                <Image
                  src="/placeholder.svg?height=400&width=600&text=Map"
                  alt="Office Location Map"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">AuctionHub Headquarters</h3>
                <p className="text-muted-foreground">123 Auction Lane, New York, NY 10001</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Support Options */}
      <section className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Additional Support Options</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Email Support</h3>
              <p className="mt-2 text-muted-foreground">
                For general inquiries and non-urgent issues, email our support team.
              </p>
              <Button variant="link" className="mt-4 text-primary">
                support@auctionhub.com
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Phone Support</h3>
              <p className="mt-2 text-muted-foreground">
                For urgent matters, call our customer service line during business hours.
              </p>
              <Button variant="link" className="mt-4 text-primary">
                +1 (555) 123-4567
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold"> Chat</h3>
              <p className="mt-2 text-muted-foreground">
                Chat with our AI assistance.
              </p>
              <Button
                className="mt-4 gradient-bg border-0"
                onClick={handleStartChat}
              >
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      <ChatBot chatIconRef={chatIconRef} />
    </div>
  )
}