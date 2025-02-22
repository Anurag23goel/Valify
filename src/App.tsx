import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import Signin from "./pages/authentication/Signin";
import Signup from "./pages/authentication/Signup";
import AdminDashboard from "./pages/admindashboard/AdminDashboard";
import Dashboard from "./pages/dashboard/Dashbaord.tsx";
import Splash from "./components/loader/Splash";
import MainLayout from 'layouts/main-layout';
import AuthLayout from 'layouts/auth-layout';

const ADMIN_EMAIL = "swap@gmail.com";

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser && location.pathname !== "/auth/signup") {
        navigate("/auth/signin"); // Redirect only if not already on signup page
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  if (loading) return <Splash />;

  if (!user) {
    // Allow unauthenticated users to access both Signin and Signup
    return (
      <AuthLayout>
        {location.pathname === "/auth/signup" ? <Signup /> : <Signin />}
      </AuthLayout>
    );
  }

  // Authenticated user routing
  return user.email === ADMIN_EMAIL ? <MainLayout><AdminDashboard /></MainLayout> : <MainLayout><Dashboard /></MainLayout>;
};

export default App;
