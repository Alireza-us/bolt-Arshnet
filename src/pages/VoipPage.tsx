import type { Route } from '@/lib/router';
import { ServicePageTemplate } from '@/components/ServicePageTemplate';

export function VoipPage({ navigate }: { navigate: (to: Route) => void }) {
  return <ServicePageTemplate serviceKey="voip" navigate={navigate} />;
}
