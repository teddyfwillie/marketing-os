import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaqItem } from "@/content/landingContent";

interface FaqSectionProps {
  faq: FaqItem[];
  onFaqExpand: (question: string) => void;
}

export function FaqSection({ faq, onFaqExpand }: FaqSectionProps) {
  return (
    <section id="faq" className="mx-auto w-full max-w-4xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.16em] text-primary">FAQ</p>
      <h2 className="mt-2 text-3xl font-semibold text-foreground">Answers for teams evaluating Marketing OS.</h2>
      <div className="mt-6 rounded-2xl border border-border/70 bg-card/70 px-6">
        <Accordion type="single" collapsible>
          {faq.map((item, idx) => (
            <AccordionItem key={item.question} value={`item-${idx}`} className="border-border/70">
              <AccordionTrigger className="text-left text-foreground hover:no-underline" onClick={() => onFaqExpand(item.question)}>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
