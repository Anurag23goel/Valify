import Grid from '@mui/material/Grid';
import OpenProject from './openproject';
import CompleteProject from './completedproject';
import AddProject from './addproject';
import { useState, useEffect } from 'react';
import { collection, getDocs, firestore, auth } from 'firebase.ts';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const TopCards = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [ongoingProjects, setOngoingProjects] = useState<ProjectData[]>([]);
  const [completedProjects, setCompletedProjects] = useState<ProjectData[]>([]);
  const [processing, setProcessing] = useState(true);

  const isRenderableProject = (project: ProjectData) => {
    return project.answers || project.projectName; // Render only if answers or projectName is present
  };

  useEffect(() => {
    // Track authenticated user state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // User is signed in
      } else {
        setUser(null); // User is signed out
        navigate('/auth/signin'); // Redirect to sign-in if user is not authenticated
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        try {
          // Query Firestore for projects belonging to the current user
          const projectsRef = collection(firestore, 'users', user.uid, 'projects');
          const projectsSnapshot = await getDocs(projectsRef);

          const ongoing: ProjectData[] = [];
          const completed: ProjectData[] = [];

          projectsSnapshot.forEach((doc) => {
            const projectData = doc.data() as ProjectData;
            if (projectData.Status === 'Completed') {
              completed.push(projectData);
            } else {
              ongoing.push(projectData);
            }
          });

          // Update the state with fetched projects
          setOngoingProjects(ongoing.filter(isRenderableProject));
          setCompletedProjects(completed.filter(isRenderableProject));
          setProcessing(false);
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      }
    };

    fetchProjects();
  }, [user]);

  return (
    <div>
      {/* Loading Popup */}
      <Dialog open={processing} onClose={() => {}}>
        {/* <DialogTitle>Loading...</DialogTitle> */}
          <CircularProgress />
       
      </Dialog>

      {/* Content */}
      {!processing && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4} xl={3}>
            <AddProject />
          </Grid>
          <Grid item xs={12} sm={4} xl={3}>
            <OpenProject length={ongoingProjects.length} />
          </Grid>
          <Grid item xs={12} sm={4} xl={3}>
            <CompleteProject length={completedProjects.length} />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default TopCards;
