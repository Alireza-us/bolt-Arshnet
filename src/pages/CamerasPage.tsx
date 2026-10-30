import type { Route } from '@/lib/router';
import { ServicePageTemplate } from '@/components/ServicePageTemplate';

export function CamerasPage({ navigate }: { navigate: (to: Route) => void }) {
  return <ServicePageTemplate serviceKey="cameras" navigate={navigate} />;
}
