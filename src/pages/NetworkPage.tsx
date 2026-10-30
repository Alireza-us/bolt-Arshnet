import type { Route } from '@/lib/router';
import { ServicePageTemplate } from '@/components/ServicePageTemplate';

export function NetworkPage({ navigate }: { navigate: (to: Route) => void }) {
  return <ServicePageTemplate serviceKey="network" navigate={navigate} />;
}
