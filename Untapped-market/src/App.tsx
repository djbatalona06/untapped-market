import { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom';
import Nav from '@/components/Nav';
import { useStore } from '@/store';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import StrainDetailPage from '@/pages/StrainDetailPage';
import FinderPage from '@/pages/FinderPage';
import LibraryPage from '@/pages/LibraryPage';
import ExplorePage from '@/pages/ExplorePage';
import PremiumPage from '@/pages/PremiumPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { scrollEngine } from '@/lib/scrollEngine';

/**
 * Scrolls to the top of the document any time the pathname changes.
 * (V1 todo #9.x — route-level scroll restoration.)
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = setTimeout(() => {
      scrollEngine.scan();
    }, 80);
    return () => clearTimeout(id);
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <div className="scroll-progress" aria-hidden="true" />
      <Nav />
      <Outlet />
    </>
  );
}

/**
 * Role-gated route wrapper. Currently only used by /admin.
 * If the current user does not have the required tier, they are
 * redirected home. (V1 spec #9.5 — admin shell.)
 */
function RequireAdmin({ children }: { children: JSX.Element }) {
  const user = useStore((s) => s.user);
  // Treat any non-admin tier as unauthorized. The store types only define
  // 'free' | 'premium' today, but admin is checked as a string so future
  // tiers can roll in without a type bump.
  if ((user.tier as string) !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  useEffect(() => {
    scrollEngine.init();
    return () => scrollEngine.destroy();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/strain/:id" element={<StrainDetailPage />} />
        <Route path="/finder" element={<FinderPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
