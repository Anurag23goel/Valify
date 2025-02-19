import { auth } from 'firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LandingAdmin from './pages/LandingAdmin';
import AdminProjects from './pages/AdminProjects';
import Dashboard from 'pages/dashboard/Dashbaord';
import AdminProjectWorkSpace from './pages/ProjectWorkspace';

interface UserRole {
  isAdmin: boolean;
  role: 'admin' | 'user' | null;
}



const ADMIN_EMAIL = 'swap@gmail.com';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole>({ isAdmin: false, role: null });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentComponent, setCurrentComponent] = useState<React.ReactNode>(null);

  // Authentication and role checking
  useEffect(() => {
    const db = getFirestore();

    const checkUserRole = async (currentUser: User) => {
      try {
        setUser(currentUser);
        const userEmail = currentUser.email?.toLowerCase().trim() || '';
        const isEmailAdmin = userEmail === ADMIN_EMAIL;

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        const roleFromDB = userDocSnap.exists() ? userDocSnap.data()?.role : null;
        const isAdmin = isEmailAdmin || roleFromDB === 'admin';

        setUserRole({
          isAdmin,
          role: isAdmin ? 'admin' : 'user',
        });

        // After setting role, ensure proper redirect
        if (!isAdmin) {
          setCurrentComponent(<Dashboard />);
        }
      } catch (err) {
        console.error('Error in checkUserRole:', err);
        setError('Failed to verify user role. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        navigate('/auth/signin');
        return;
      }

      if (!currentUser.email) {
        setError('User account must have an associated email');
        setLoading(false);
        return;
      }

      await checkUserRole(currentUser);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle routing based on hash and admin status
  useEffect(() => {
    const handleRouting = () => {
      if (!userRole.isAdmin) {
        setCurrentComponent(<Dashboard />);
        return;
      }

      const hash = window.location.hash;
      const projectIdMatch = hash.match(/#myprojects\/([^/]+)/);
      if (projectIdMatch) {
        console.log("projectIdMatch", projectIdMatch);
        const projectId = projectIdMatch[1];
        setCurrentComponent(<AdminProjectWorkSpace pId={projectId} isAdmin={userRole.isAdmin} />);
      } else if (hash === '#myprojects') {
        setCurrentComponent(<AdminProjects />);
      } else {
        setCurrentComponent(<LandingAdmin />);
      }
    };

    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    return () => window.removeEventListener('hashchange', handleRouting);
  }, [userRole.isAdmin, location]);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Verifying user access...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/auth/signin')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  if (!user) {
    navigate('/auth/signin');
    return null;
  }

  return (
    <>
      {userRole.isAdmin}
      {currentComponent}
    </>
  );
};

export default AdminDashboard;