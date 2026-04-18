import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  const location = useLocation();
  const isAuth = location.pathname === '/auth';

  return (
    <div className="min-h-screen text-slate-900 transition-colors duration-500">
      {!isAuth && <Navbar />}
      <main className={isAuth ? '' : ''}>
        <Outlet />
      </main>
      {!isAuth && <Footer />}
    </div>
  );
};

export default PublicLayout;
