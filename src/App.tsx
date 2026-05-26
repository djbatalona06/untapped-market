import { useStore } from './store/useStore';
import { Nav } from './components/Nav';
import { ToastContainer } from './components/Toast';
import { NotificationCenter } from './components/NotificationCenter';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { StrainDetailPage } from './pages/StrainDetailPage';
import { FinderPage } from './pages/FinderPage';
import { LibraryPage } from './pages/LibraryPage';
import { ExplorePage } from './pages/ExplorePage';
import { PremiumPage } from './pages/PremiumPage';
import { QuizPage } from './pages/QuizPage';
import { AccountPage } from './pages/AccountPage';

export function App() {
  const route = useStore((s) => s.route);

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
    default:
      page = <HomePage />;
  }

  return (
    <>
      <Nav />
      <NotificationCenter />
      {page}
      <ToastContainer />
    </>
  );
}
