import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Lazy Loaded Pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AuthPage = lazy(() => import('./pages/public/AuthPage'));
const OverviewPage = lazy(() => import('./pages/dashboard/OverviewPage'));
const LibraryPage = lazy(() => import('./pages/reader/LibraryPage'));
const ReaderPage = lazy(() => import('./pages/reader/ReaderPage'));
const AuthorsPage = lazy(() => import('./pages/reader/AuthorsPage'));
const AuthorProfilePage = lazy(() => import('./pages/reader/AuthorProfilePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'));
const PublishPage = lazy(() => import('./pages/author/PublishPage'));
const MyBooksPage = lazy(() => import('./pages/author/MyBooksPage'));
const VerificationPage = lazy(() => import('./pages/author/VerificationPage'));
const EarningsPage = lazy(() => import('./pages/author/EarningsPage'));
const PayoutsPage = lazy(() => import('./pages/author/PayoutsPage'));
const ProUpgradePage = lazy(() => import('./pages/author/ProUpgradePage'));
const CreativeCornerPage = lazy(() => import('./pages/creative/CreativeCornerPage'));
const CreateWorkPage = lazy(() => import('./pages/creative/CreateWorkPage'));
const WorkDetailsPage = lazy(() => import('./pages/creative/WorkDetailsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminBooksPage = lazy(() => import('./pages/admin/AdminBooksPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminVerificationsPage = lazy(() => import('./pages/admin/AdminVerificationsPage'));
const AdminCreativePage = lazy(() => import('./pages/admin/AdminCreativePage'));
const AdminChatPage = lazy(() => import('./pages/admin/AdminChatPage'));
const AdminCreditsPage = lazy(() => import('./pages/admin/AdminCreditsPage'));
const AdminPayoutsPage = lazy(() => import('./pages/admin/AdminPayoutsPage'));
const AdminContactsPage = lazy(() => import('./pages/admin/AdminContactsPage'));
const SupportPage = lazy(() => import('./pages/dashboard/SupportPage'));
const BuyCreditsPage = lazy(() => import('./pages/dashboard/BuyCreditsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'));

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
        <Suspense fallback={<LoadingScreen onComplete={() => {}} />}>
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
        </Suspense>
      </BrowserRouter>
    </>
  );
};

export default App;
