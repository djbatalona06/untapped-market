import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Nav } from './components/Nav';
import { ToastContainer } from './components/Toast';
import { NotificationCenter } from './components/NotificationCenter';
import { TweaksPanel } from './components/tweaks/TweaksPanel';
import { useTweaks } from './components/tweaks/useTweaks';
import { AuthModal } from './components/auth/AuthModal';
import { AdminGate } from './components/auth/AdminGate';
import { useAuthState } from './lib/auth';
import { useMediaSync } from './lib/media';
import { init as initScrollEngine, scan as scanScrollEngine } from './lib/scrollEngine';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { StrainDetailPage } from './pages/StrainDetailPage';
import { FinderPage } from './pages/FinderPage';
import { LibraryPage } from './pages/LibraryPage';
import { ExplorePage } from './pages/ExplorePage';
import { PremiumPage } from './pages/PremiumPage';
import { QuizPage } from './pages/QuizPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const route = useStore((s) => s.route);
  // Mount the tweaks state once at the App root so saved CSS vars apply globally.
  useTweaks();
  // Restore the Supabase session (no-op in mock mode) and hydrate strain photos.
  useAuthState();
  useMediaSync();

  useEffect(() => {
    initScrollEngine();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => scanScrollEngine(), 60);
    return () => clearTimeout(id);
  }, [route]);

  let page;
  switch (route.page) {
    case 'home':
      page = <HomePage />;
      break;
    case 'catalog':
      page = <CatalogPage />;
      break;
    case 'strain':
      page = <StrainDetailPage strainId={route.id} />;
      break;
    case 'finder':
      page = <FinderPage />;
      break;
    case 'library':
      page = <LibraryPage />;
      break;
    case 'explore':
      page = <ExplorePage />;
      break;
    case 'premium':
      page = <PremiumPage />;
      break;
    case 'quiz':
      page = <QuizPage />;
      break;
    case 'account':
      page = <AccountPage />;
      break;
    case 'admin':
      page = (
        <AdminGate>
          <AdminPage />
        </AdminGate>
      );
      break;
    default:
      page = <HomePage />;
  }

  return (
    <>
      <Nav />
      <div className="scroll-progress" aria-hidden="true" />
      <NotificationCenter />
      {page}
      <ToastContainer />
      <TweaksPanel />
      <AuthModal />
    </>
  );
}
