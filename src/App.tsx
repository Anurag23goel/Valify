import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import Signin from "./pages/authentication/Signin";
import Signup from "./pages/authentication/Signup";
import AdminDashboard from "./pages/admindashboard/AdminDashboard";
import Dashboard from "./pages/dashboard/Dashbaord.tsx";
import Splash from "./components/loader/Splash"; // Optional loading screen
import MainLayout from 'layouts/main-layout';
import AuthLayout from 'layouts/auth-layout';

const ADMIN_EMAIL = "swaps@gmail.com";

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/auth/signin"); // Redirect to Signin if not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <Splash />; // Show a loading screen while checking auth

  if (!user) return <AuthLayout><Signin /></AuthLayout>; // If not authenticated, show Signin

  // If authenticated, check role
  return user.email === ADMIN_EMAIL ? <MainLayout><AdminDashboard /></MainLayout> : <MainLayout><Dashboard /></MainLayout>;
};

export default App;
