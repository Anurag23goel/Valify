import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from 'firebase.ts';
import { useNavigate } from 'react-router-dom';
import { Button
  } from '@mui/material';

// Define interfaces for type safety
interface CompanyData {
  'Company Name': string;
  'Region': string;
  'Market Capitalization': string;
  'Industry': string;
  'Business Description': string;
  'Approved': boolean | string;
}

const useStyles = makeStyles(() => ({
  container: {
    maxWidth: '1200px',
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
    fontWeight: '400',
    fontSize: '16px',
    textAlign: 'center',
    padding: '20px',
    borderRight: '1px solid #65B5BE',
    color: '#000',
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
    padding: '20px',
    borderBottom: '1px solid #65B5BE',
    borderRight: '1px solid #65B5BE',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  text: {
    fontSize: '16px',
    color: '#0D0D0D',
    marginBottom: '15px',
  },
  noteText: {
    fontSize: '16px',
    color: '#3D3D3D',
    marginBottom: '40px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
}));
interface AdminProjectWorkSpaceProps {
  pId?: string | null; // Allow projectId to be optional
  isAdmin?: boolean; // Indicates if the user is an admin
}
const MarketAnalysis: React.FC<AdminProjectWorkSpaceProps> = ({ pId }) => {
  const classes = useStyles();
  const [companiesData, setCompaniesData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hash = window.location.hash;
  const navigate = useNavigate();
  // Extract the parameters from the hash
  const [base, projectId, userId] = hash.split("/").slice(1);

  const handleNextClick = () => {

    navigate(`/#myprojects/${projectId}/user/${userId}/forecastsChecks`, {
      state: { projectId: projectId, userId: userId  
             }
    });
    console.log(base);
  };
  const handlePreviousClick = () => {

    navigate(`/#myprojects/${projectId}/user/${userId}/questionnaire`, {
      state: { projectId: projectId, userId: userId  
             }
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user logged in');
        }

        console.log(pId)
        const projectId = '7uK5deN8XCSWKpxdjo0a' /* pId */;
        const docRef = doc(firestore, 'users', user.uid, 'projects', projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const excelData = (data.excelData || []) as CompanyData[];
          console.log(excelData)


          setCompaniesData(excelData);
        } else {
          throw new Error('No data found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.container}>
        <Typography color="error">Error loading data: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
   

      <Typography variant="body1" className={classes.text}>
        We used our business information to analyze the market and determine the most comparable
        companies for your business in the existing market. Please review the below list of
        companies and approve our understanding on whether these are truly suitable peers for your
        business.
      </Typography>
      <Typography variant="body1" className={classes.noteText}>
        *Note that we will utilize your approved list of peer companies to determine market
        benchmark levels for business operations, profitability & valuation multiples for your
        Target business.
      </Typography>

      <TableContainer className={classes.tableContainer} component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell className={classes.tableHeaderCell}>Company Name</TableCell>
              <TableCell className={classes.tableHeaderCell}>Region</TableCell>
              <TableCell className={classes.tableHeaderCell}>Market Capitalization</TableCell>
              <TableCell className={classes.tableHeaderCell}>Industry</TableCell>
              <TableCell className={classes.tableHeaderCell}>Business Description</TableCell>
              <TableCell className={classes.tableHeaderCell}>Approval</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companiesData
              .filter((company) => company['Company Name'] && company['Region'] && company['Industry']) // Filter out empty fields
              .map((company, index) => (
                <TableRow key={index}>
                  <TableCell className={classes.tableCell}>{company['Company Name']}</TableCell>
                  <TableCell className={classes.tableCell}>{company['Region']}</TableCell>
                  <TableCell className={classes.tableCell}>{company['Market Capitalization']}</TableCell>
                  <TableCell className={classes.tableCell}>{company['Industry']}</TableCell>
                  <TableCell className={classes.tableCell}>{company['Business Description']}</TableCell>
                  <TableCell>
                    <Box sx={{
                      backgroundColor: company['Approved'] ? '#51D3E1' : 'red',
                      color: 'black',
                      padding: '8px',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {typeof company['Approved'] === 'boolean' ? (company['Approved'] ? 'Approved' : 'Rejected') : company['Approved']}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between', // Ensure space between buttons
    alignItems: 'center', // Align buttons vertically
    mb: 2, 
    mt: 4// Add some margin below if needed
  }}
>
  <Button
    variant="outlined"
    onClick={handlePreviousClick}
    sx={{
      borderColor: '#51D3E1', // Custom border color
      color: '#51D3E1',
      height: '50px',
      '&:hover': {
        borderColor: '#51D3E1', // Keep the border color consistent on hover
        backgroundColor: '#51D3E1',
        color: '#fff',
      },
      fontSize: '16px',
    }}
  >
    Previous
  </Button>

  <Button
    variant="outlined"
    onClick={handleNextClick}
    sx={{
      borderColor: '#51D3E1', // Custom border color
      color: '#51D3E1',
      height: '50px',
      '&:hover': {
        borderColor: '#51D3E1', // Keep the border color consistent on hover
        backgroundColor: '#51D3E1',
        color: '#fff',
      },
      fontSize: '16px',
    }}
  >
    Next
  </Button>
</Box>
    </Box>

  );
};

export default MarketAnalysis;