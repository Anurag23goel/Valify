// MyProjects.tsx

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'; // Import Button
import ProjectStatus from 'components/sections/dashboard/top-cards/projectStatus';
import AddProjectDialog from 'components/dialogs/AddProjectDialog'; // Import your AddProjectDialog component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, firestore, auth } from 'firebase.ts';
import { User } from 'firebase/auth';

interface Answers {
  clientName: string;
  disclaimer: string;
  purpose: string;
  purposeDetail: string;
  purposeDetailCheck: string;
  valuerDesignation: string;
  valuerName: string;
  valuerType: string;
}

// Define a type for project data
interface ProjectData {
  projectName: string;
  Status: 'Initial questionnaire' | 'Completed'; // Explicit types
  Percentage?: string;
  estimatedTime?: string;
  dateOfCompletion?: string;
  projectId?: string | undefined | null;
  answers?: Answers; // Make optional as not all projects will have answers
}

const MyProjects = () => {
  const [ongoingProjects, setOngoingProjects] = useState<ProjectData[]>([]);
  const [completedProjects, setCompletedProjects] = useState<ProjectData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

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

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Helper function to check if a project should be rendered
  const isRenderableProject = (project: ProjectData) => {
    return project.answers || project.projectName; // Render only if answers or projectName is present
  };

  // Fetch user projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        try {
          // Query Firestore for projects belonging to the current user
          console.log("000a", user.uid)
          const projectsRef = collection(firestore, 'users', user.uid, 'projects');
          const projectsSnapshot = await getDocs(projectsRef);

          const ongoing: ProjectData[] = [];
          const completed: ProjectData[] = [];

          // Loop through the projects and categorize them as ongoing or completed
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
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      }
    };

    fetchProjects();
  }, [user]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} mb={3} container justifyContent="space-between" alignItems="center">
        <Typography variant="h3">My Projects</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          + New Project
        </Button>
      </Grid>

      {/* Ongoing Projects */}
      <Grid item xs={12}>
        <Typography variant="h4">Ongoing projects ({ongoingProjects.length})</Typography>
      </Grid>
      <Grid item xs={12} mb={3}>
        <Grid container spacing={2.5}>
          {ongoingProjects.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="h6">No ongoing projects.</Typography>
            </Grid>
          ) : (
            ongoingProjects.map((project, index) => (
              <Grid key={index} item xs={12} sm={6} xl={4}>
                <ProjectStatus
                  projectId={project.projectId}
                  projectName={project.answers?.clientName || 'Yet To be Named'}
                  projectStatus={project.Status}
                  progressPercentage={project.Percentage ? parseInt(project.Percentage) : 0}
                  estimatedDuration={project.estimatedTime}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Grid>

      {/* Completed Projects */}
      <Grid item xs={12}>
        <Typography variant="h4">Completed projects ({completedProjects.length})</Typography>
      </Grid>
      <Grid item xs={12} mb={3}>
        <Grid container spacing={2.5}>
          {completedProjects.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="h6">No completed projects.</Typography>
            </Grid>
          ) : (
            completedProjects.map((project, index) => (
              <Grid key={index} item xs={12} sm={6} xl={4}>
                <ProjectStatus
                  projectName={project.projectName}
                  projectStatus={project.Status}
                  progressPercentage={project.Percentage ? parseInt(project.Percentage) : 0}
                  dateOfCompletion={project.dateOfCompletion}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Grid>

      {/* Add Project Dialog */}
      <AddProjectDialog open={dialogOpen} onClose={handleCloseDialog} />
    </Grid>
  );
};

export default MyProjects;
