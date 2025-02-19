import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import MyProjects from './pages/MyProjects';
import ProjectWorkSpace from './pages/ProjectWorkSpace';

const Dashboard = () => {
  const location = useLocation();
  const [currentComponent, setCurrentComponent] = useState<JSX.Element>(<Landing />);

  useEffect(() => {
    const hash = location.hash;

    if (hash.startsWith('#newproject')) {
      // Extract projectId if it exists
      const parts = hash.split('/');
      const projectId = parts.length > 1 ? parts[1] : null; // Get projectId if present
    
      // Render ProjectWorkSpace with or without projectId
      setCurrentComponent(<ProjectWorkSpace projectID={projectId} />);
    }
    else if (hash === '#myprojects') {
      setCurrentComponent(<MyProjects />);
    } else {
      setCurrentComponent(<Landing />);
    }
  }, [location]);

  return <div style={{ minHeight: '70vh' }}>{currentComponent}</div>;
};

export default Dashboard;
