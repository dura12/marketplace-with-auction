import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from 'lucide-react'

type Testimonial = {
  name: string;
  message: string;
};

type TestimonialsProps = {
  testimonialsData: Testimonial[];
};
// Testimonial data
const testimonials = [
  {
    quote: "Working with this team has been transformative for our business. Their innovative solutions and dedicated support have helped us achieve remarkable growth.",
    author: "Sarah Johnson",
    position: "CEO, TechStart Inc.",
    company: "TechStart Inc.",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5
  },
  {
    quote: "The level of expertise and professionalism is unmatched. They delivered our project on time and exceeded all our expectations. Highly recommended!",
    author: "Michael Chen",
    position: "CTO, InnovateCorp",
    company: "InnovateCorp",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5
  },
  {
    quote: "Their strategic approach to problem-solving has been invaluable. They don't just provide solutions; they become true partners in your success.",
    author: "Elena Rodriguez",
    position: "Marketing Director",
    company: "Global Brands Ltd.",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 4
  },
  {
    quote: "We've worked with many vendors over the years, but none have demonstrated the commitment to excellence that this team consistently delivers.",
    author: "David Okafor",
    position: "Operations Manager",
    company: "Logistics Plus",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5
  },
  {
    quote: "From the initial consultation to ongoing support, the entire experience has been seamless. They truly understand our business needs and deliver accordingly.",
    author: "Aisha Patel",
    position: "Product Manager",
    company: "NextGen Solutions",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5
  },
  {
    quote: "The team's attention to detail and commitment to quality is evident in everything they do. They've helped us streamline operations and increase efficiency.",
    author: "Thomas Weber",
    position: "Finance Director",
    company: "European Ventures",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 4
  }
]

export function Testimonials({ testimonialsData }: TestimonialsProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">What Our Clients Say</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Don&apos;t just take our word for it. Here&apos;s what our clients have to say about working with us.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6 pb-0">
              <div className="flex mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="italic text-muted-foreground mb-6">"{testimonial.quote}"</p>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.author} />
                  <AvatarFallback>{testimonial.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.position}, {testimonial.company}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900 text-center">
        <h4 className="text-lg font-medium mb-3">Ready to experience the difference?</h4>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join our growing list of satisfied clients and discover how we can help your business thrive.
        </p>
        <div className="flex justify-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=100&width=100" alt="Client logo" />
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=100&width=100" alt="Client logo" />
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=100&width=100" alt="Client logo" />
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=100&width=100" alt="Client logo" />
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=100&width=100" alt="Client logo" />
          </Avatar>
        </div>
      </div>
    </div>
  )
}
