import { useRouter } from '@/lib/router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileCallBar } from '@/components/MobileCallBar';
import { HomePage } from '@/pages/HomePage';
import { CamerasPage } from '@/pages/CamerasPage';
import { VoipPage } from '@/pages/VoipPage';
import { NetworkPage } from '@/pages/NetworkPage';
import { PricingPage } from '@/pages/PricingPage';
import { CaseStudiesPage } from '@/pages/CaseStudiesPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { ArticlesPage } from '@/pages/ArticlesPage';
import { ArticleDetailPage } from '@/pages/ArticleDetailPage';
import { ScrollProgress } from '@/components/ScrollProgress';
import { NetworkCursor } from '@/components/NetworkCursor';
import { PageTransition } from '@/components/PageTransition';
import { InteractiveNetwork } from '@/components/InteractiveNetwork';

function renderRoute(route: string, navigate: (to: string) => void) {
  if (route === '/') return <HomePage navigate={navigate} />;
  if (route === '/cameras') return <CamerasPage navigate={navigate} />;
  if (route === '/voip') return <VoipPage navigate={navigate} />;
  if (route === '/network') return <NetworkPage navigate={navigate} />;
  if (route === '/pricing') return <PricingPage navigate={navigate} />;
  if (route === '/case-studies') return <CaseStudiesPage navigate={navigate} />;
  if (route === '/about') return <AboutPage navigate={navigate} />;
  if (route === '/contact') return <ContactPage navigate={navigate} />;
  if (route === '/articles') return <ArticlesPage navigate={navigate} />;
  if (route.startsWith('/articles/'))
    return <ArticleDetailPage navigate={navigate} slug={route.replace('/articles/', '')} />;
  return <HomePage navigate={navigate} />;
}

function App() {
  const { route, navigate } = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col bg-cream">
      <InteractiveNetwork />
      <ScrollProgress />
      <NetworkCursor />
      <div className="network-content relative z-10 flex min-h-screen flex-col">
        <Header route={route} navigate={navigate} />
      <main className="flex-1 pb-16 lg:pb-0">
        <PageTransition routeKey={route}>
          {renderRoute(route, navigate)}
        </PageTransition>
      </main>
      <Footer navigate={navigate} />
      <MobileCallBar />
      </div>
    </div>
  );
}

export default App;
