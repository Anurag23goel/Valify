import {
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { auth, firestore } from 'firebase.ts';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },
  tableContainer: {
    borderRadius: '10px',
    width: '100%',
    marginTop: '40px',
    border: '1px solid #65B5BE',
    padding: 0,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    borderSpacing: 0,
  },
  tableHeadRow: {
    backgroundColor: '#C1E5E9',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: '16px',
    textAlign: 'center',
    padding: '12px',
    borderRight: '1px solid #65B5BE',
    color: '#000000',
    '&:first-child': {
      borderTopLeftRadius: '10px',
    },
    '&:last-child': {
      borderTopRightRadius: '10px',
      borderRight: 'none',
    },
  },
  tableCell: {
    fontSize: '16px',
    textAlign: 'center',
    padding: '12px',
    borderBottom: '1px solid #65B5BE',
    borderRight: '1px solid #65B5BE',
    color: '#000000',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  tableCellFirst: {
    fontSize: '16px',
    textAlign: 'center',
    paddingTop: '20px',
    padding: '12px',
    verticalAlign: 'top',
    borderBottom: '1px solid #65B5BE',
    borderRight: '1px solid #65B5BE',
    minWidth: '250px',
    color: '#000000',
  },
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  text: {
    fontSize: '16px',
    marginBottom: '15px',
    color: '#0D0D0D',
  },
  error: {
    marginBottom: '20px',
  },
  paginationContainer: {
    borderTop: '1px solid #65B5BE',
  },
}));

interface Project {
  id: string;
  projectName: string;
  clientName: string;
  companyName: string;
  projectStage: string;
  completionDate: string;
  userId: string;
}

const AdminProjects: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // useEffect(() => {
  //   const fetchProjects = async (userId: string) => {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       const projectsRef = collection(firestore, 'users', userId, 'projects');
  //       const projectsQuery = query(projectsRef);
  //       const projectsSnapshot = await getDocs(projectsQuery);

  //       const userProjects: Project[] = [];

  //       projectsSnapshot.forEach(projectDoc => {
  //         const data = projectDoc.data();
  //         userProjects.push({
  //           id: projectDoc.id,
  //           projectName: data.projectId,
  //           clientName: data.answers?.clientName,
  //           companyName: data.answers?.companyName,
  //           projectStage: data.Status,
  //           completionDate: data.answers?.completionDate,
  //           userId: userId
  //         });
  //       });

  //       setProjects(userProjects);
  //     } catch (error) {
  //       setError(error instanceof Error ? error.message : 'Unknown error');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       fetchProjects(user.uid);
  //     } else {
  //       setError('Authentication required');
  //       setLoading(false);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // Fetch all users from the "users" collection
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);
  
        const allProjects: Project[] = [];
  
        // Fetch projects for each user
        const fetchUserProjectsPromises = usersSnapshot.docs.map(async (userDoc) => {
          const userId = userDoc.id;
          const projectsRef = collection(firestore, 'users', "li1hBHSaNJWf7uCfm9xiSmvSdAJ3", 'projects');
          const projectsSnapshot = await getDocs(projectsRef);
  
          projectsSnapshot.forEach((projectDoc) => {
            const data = projectDoc.data();
            allProjects.push({
              id: projectDoc.id,
              projectName: data.projectId || 'N/A',
              clientName: data.answers?.clientName || 'N/A',
              companyName: data.answers?.companyName || 'N/A',
              projectStage: data.Status || 'N/A',
              completionDate: data.answers?.completionDate || 'N/A',
              userId: userId,
            });
          });
        });
  
        await Promise.all(fetchUserProjectsPromises);
        setProjects(allProjects);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllProjects();
  }, []);
  
  const handleRowClick = (project: Project, userId) => {

    navigate(`/#myprojects/${project.id}/user/${userId}`, {
      state: { projectId: project.id, userId: userId  
             }
    });
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
    console.log(event);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedProjects = projects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box className={classes.container}>
        <Typography>Loading projects...</Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Typography variant="body1" className={classes.text}>
        All Projects ({projects.length})
      </Typography>

      {error && (
        <Alert severity="error" className={classes.error}>
          {error}
        </Alert>
      )}

      <TableContainer className={classes.tableContainer} component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell className={classes.tableHeaderCell}>Project Name</TableCell>
              <TableCell className={classes.tableHeaderCell}>Client Name</TableCell>
              <TableCell className={classes.tableHeaderCell}>Company Name</TableCell>
              <TableCell className={classes.tableHeaderCell}>Project Stage</TableCell>
              <TableCell className={classes.tableHeaderCell}>Completion Date</TableCell>
              <TableCell className={classes.tableHeaderCell}>User ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedProjects.map((project) => (
              <TableRow
                key={project.id}
                onClick={() => handleRowClick(project, project.userId )}
                className={classes.tableRow}
              >
                <TableCell className={classes.tableCellFirst}>{project.projectName}</TableCell>
                <TableCell className={classes.tableCell}>{project.clientName}</TableCell>
                <TableCell className={classes.tableCell}>{project.companyName}</TableCell>
                <TableCell className={classes.tableCell}>{project.projectStage}</TableCell>
                <TableCell className={classes.tableCell}>{project.completionDate || 'N/A'}</TableCell>
                <TableCell className={classes.tableCell}>{project.userId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          className={classes.paginationContainer}
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={projects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default AdminProjects;