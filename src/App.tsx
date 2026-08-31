import { lazy, Suspense } from 'react';
import { AssistantLayer } from './components/ai';
import CookieBanner from './components/CookieBanner';
import Footer from './components/Footer';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import MobileCTA from './components/MobileCTA';
import { AssistantProvider } from './contexts/AssistantContext';
import { ThemeProvider } from './contexts/ThemeContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const normalizedPath = () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  return path || '/';
};

const CurrentPage = () => {
  switch (normalizedPath()) {
    case '/':
    case '/index.html':
      return <HomePage />;
    case '/privacy':
      return <PrivacyPage />;
    case '/terms':
      return <TermsPage />;
    case '/thank-you':
      return <ThankYouPage />;
    default:
      return <NotFoundPage />;
  }
};

const App = () => (
  <ThemeProvider>
    <AssistantProvider>
      <div className="min-h-screen overflow-x-hidden bg-background pb-24 text-foreground transition-colors duration-300 md:pb-0">
        <Header />
        <Suspense fallback={<LoadingScreen />}>
          <CurrentPage />
        </Suspense>
        <Footer />
        <MobileCTA />
        <AssistantLayer />
        <CookieBanner />
      </div>
    </AssistantProvider>
  </ThemeProvider>
);

export default App;
