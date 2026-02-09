import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IntegrationItem } from "@/content/landingContent";

interface IntegrationsSectionProps {
  integrations: IntegrationItem[];
}

export function IntegrationsSection({ integrations }: IntegrationsSectionProps) {
  return (
    <section id="integrations" className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-primary">Integrations</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground">Connect your existing stack without migration pain.</h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="border-border/70 bg-card/70">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">{integration.name}</p>
                <p className="text-xs text-muted-foreground/80">{integration.status}</p>
              </div>
              <Zap className="h-4 w-4 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
