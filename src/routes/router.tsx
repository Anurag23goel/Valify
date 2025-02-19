 
import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter, Navigate } from 'react-router-dom';
import paths, { rootPaths } from './paths';
import MainLayout from 'layouts/main-layout';
import Splash from 'components/loader/Splash';
import PageLoader from 'components/loader/PageLoader';
import AuthLayout from 'layouts/auth-layout';
import { auth } from '../firebase'; // Import Firebase auth

// Lazy-loaded components
const App = lazy(() => import('App'));
const AdminDashboard = lazy(() => import('pages/admindashboard/AdminDashboard.tsx'))
/* const Dashboard = lazy(() => import('pages/dashboard/Dashbaord')); */
const Signin = lazy(() => import('pages/authentication/Signin'));
const Signup = lazy(() => import('pages/authentication/Signup'));
// Function to check authentication and redirect
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = auth.currentUser;

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to={paths.signin} replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    element: (
      <Suspense fallback={<Splash />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: '/',
        element: (
          <PrivateRoute>
            {' '}
            {/* Wrap the protected routes with PrivateRoute */}
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </MainLayout>
          </PrivateRoute>
        ),
        children: [
          /*    {
               index: true,
               element: <Dashboard />,
             }, */
          {
            index: true,
            element: <AdminDashboard />,
          },
        ],
      },
      {
        path: rootPaths.authRoot,
        element: (
          <AuthLayout>
            <Outlet />
          </AuthLayout>
        ),
        children: [
          {
            path: paths.signin,
            element: <Signin />,
          },
          {
            path: paths.signup,
            element: <Signup />,
          },
        ],
      },
    ],
  },
]);

export default router;
