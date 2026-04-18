import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/public/HomePage';
import AuthPage from './pages/public/AuthPage';
import OverviewPage from './pages/dashboard/OverviewPage';
import LibraryPage from './pages/reader/LibraryPage';
import ReaderPage from './pages/reader/ReaderPage';
import AuthorsPage from './pages/reader/AuthorsPage';
import AuthorProfilePage from './pages/reader/AuthorProfilePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import PublishPage from './pages/author/PublishPage';
import MyBooksPage from './pages/author/MyBooksPage';
import VerificationPage from './pages/author/VerificationPage';
import EarningsPage from './pages/author/EarningsPage';
import PayoutsPage from './pages/author/PayoutsPage';
import ProUpgradePage from './pages/author/ProUpgradePage';
import CreativeCornerPage from './pages/creative/CreativeCornerPage';
import CreateWorkPage from './pages/creative/CreateWorkPage';
import WorkDetailsPage from './pages/creative/WorkDetailsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminCreativePage from './pages/admin/AdminCreativePage';
import AdminChatPage from './pages/admin/AdminChatPage';
import AdminCreditsPage from './pages/admin/AdminCreditsPage';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage';
import AdminContactsPage from './pages/admin/AdminContactsPage';
import SupportPage from './pages/dashboard/SupportPage';
import BuyCreditsPage from './pages/dashboard/BuyCreditsPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}
      </AnimatePresence>

      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: 'var(--slate-900)',
          color: 'white',
          fontSize: '11px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '16px 24px',
          borderRadius: '1.25rem',
        }
      }} />

      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="library/:id" element={<ReaderPage />} />
              <Route path="authors" element={<AuthorsPage />} />
              <Route path="authors/:id" element={<AuthorProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="pro" element={<ProUpgradePage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="credits" element={<BuyCreditsPage />} />

              <Route path="creative" element={<CreativeCornerPage />} />
              <Route path="creative/:id" element={<WorkDetailsPage />} />
              <Route path="creative/new" element={<CreateWorkPage />} />

              <Route path="verification" element={<VerificationPage />} />

              <Route element={<ProtectedRoute roles={['author', 'verified_author', 'pro_writer']} />}>
                <Route path="publish" element={<PublishPage />} />
                <Route path="my-books" element={<MyBooksPage />} />
                <Route path="earnings" element={<EarningsPage />} />
                <Route path="payouts" element={<PayoutsPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="admin/books" element={<AdminBooksPage />} />
                <Route path="admin/reviews" element={<AdminReviewsPage />} />
                <Route path="admin/verifications" element={<AdminVerificationsPage />} />
                <Route path="admin/creative" element={<AdminCreativePage />} />
                <Route path="admin/chat" element={<AdminChatPage />} />
                <Route path="admin/credits" element={<AdminCreditsPage />} />
                <Route path="admin/payouts" element={<AdminPayoutsPage />} />
                <Route path="admin/contacts" element={<AdminContactsPage />} />
                <Route path="admin" element={<Navigate to="/dashboard/admin/users" replace />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
