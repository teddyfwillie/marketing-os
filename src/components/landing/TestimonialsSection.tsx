import { Card, CardContent } from "@/components/ui/card";
import { Testimonial } from "@/content/landingContent";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16">
      <div className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={`${testimonial.name}-${testimonial.company}`} className="border-border/70 bg-card/75">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm leading-relaxed text-foreground/90">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground/80">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
              <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary/90">{testimonial.result}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
