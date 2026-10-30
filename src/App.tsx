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
import { CursorGlow } from '@/components/CursorGlow';

function App() {
  const { route, navigate } = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <ScrollProgress />
      <CursorGlow />
      <Header route={route} navigate={navigate} />
      <main className="flex-1 pb-16 lg:pb-0">
        {route === '/' && <HomePage navigate={navigate} />}
        {route === '/cameras' && <CamerasPage navigate={navigate} />}
        {route === '/voip' && <VoipPage navigate={navigate} />}
        {route === '/network' && <NetworkPage navigate={navigate} />}
        {route === '/pricing' && <PricingPage navigate={navigate} />}
        {route === '/case-studies' && <CaseStudiesPage navigate={navigate} />}
        {route === '/about' && <AboutPage navigate={navigate} />}
        {route === '/contact' && <ContactPage navigate={navigate} />}
        {route === '/articles' && <ArticlesPage navigate={navigate} />}
        {route.startsWith('/articles/') && (
          <ArticleDetailPage navigate={navigate} slug={route.replace('/articles/', '')} />
        )}
      </main>
      <Footer navigate={navigate} />
      <MobileCallBar />
    </div>
  );
}

export default App;
