import {
  Box,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography, Grid, Button,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { auth, firestore } from 'firebase.ts';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReviewStage from 'review_market.tsx';

interface CompanyData {
  'Company Name': string;
  'Region': string;
  'Market Capitalization': string;
  'Industry': string;
  'Business Description': string;
  'Approved': boolean | string;
}

interface ApprovedState {
  [key: number]: boolean;
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

interface QuestionnaireProps {
  pId?: string | null; // Allow projectId to be optional
}


const MarketAnalysis: React.FC<QuestionnaireProps> = ({ pId }) => {
  const classes = useStyles();
  const [companiesData, setCompaniesData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [approvedCompanies, setApprovedCompanies] = useState<ApprovedState>({});
  const [selectionLocked, setSelectionLocked] = useState<ApprovedState>({}); // Track approval selection
  const navigate = useNavigate();
  const location = useLocation();
    useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user logged in');
        }

        const projectId = pId;
        // Check if projectId is valid before using it in Firestore function
        if (projectId) {
          const docRef = doc(firestore, 'users', user.uid, 'projects', projectId);
          const docSnap = await getDoc(docRef); // Now docSnap is correctly defined here

          if (docSnap.exists()) {
            const data = docSnap.data();
            const excelData = (data?.excelData || []) as CompanyData[];

            // Filter out companies with empty fields for Company Name, Region, or Market Capitalization
            const filteredData = excelData.filter(company =>
              company['Company Name'] && company['Region'] && company['Market Capitalization']
            );

            // Initialize approved status based on filtered Excel data
            const initialApprovedState: ApprovedState = {};
            filteredData.forEach((company: CompanyData, index: number) => {
              initialApprovedState[index] = company.Approved === 'true' || company.Approved === true;
            });

            setApprovedCompanies(initialApprovedState);
            setCompaniesData(filteredData);
          } else {
            throw new Error('No data found');
          }
        } else {
          // Handle the case when pId is null or undefined
          setError('Project ID is missing or invalid');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pId]);

  const saveAndNext = async () => {
    // navigate(`${location.hash}/grossMargin`);
     navigate(`${location.hash.replace('marketAnalysis', 'forecastsChecks')}`);
    };
    // navigate(`${location.hash}/grossMargin`);
  const handlePrevious = async () => {
    navigate(`${location.hash.replace('marketAnalysis', 'riskAssumptions')}`);
    // await storeFormData();
    // navigate(`/#myprojects/${projectId}/questionnaire`)
    // navigate('#newproject/' + projectId + "/questionnaire");
  };

  const handleApprovalChange = async (index: number, value: string): Promise<void> => {
    try {
      // Update local state for approved companies
      setApprovedCompanies((prev) => ({
        ...prev,
        [index]: value === "Approved",
      }));

      // Lock the selection after an approval is made
      setSelectionLocked((prev) => ({
        ...prev,
        [index]: true,
      }));

      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }
     
      const projectId = pId;
      const docRef = doc(firestore, 'users', user.uid, 'projects', projectId);

      // Get the current data from Firestore and update the approval status
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("data", data);
        const data = docSnap.data();
        const excelData = (data.excelData || []) as CompanyData[];

        // Update the approval status for the selected company
        excelData[index].Approved = value === "Approved" ? true : false;

        // Update Firestore document with the new approval state
        await updateDoc(docRef, {
          excelData: excelData,
        });
      } else {
        throw new Error('No data found in Firestore');
      }
    } catch (err) {
      console.error("Error updating approval status:", err);
    }
  };

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
              <TableCell className={classes.tableHeaderCell}>Approve</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companiesData.map((company, index) => (
              <TableRow key={index}>
                <TableCell className={classes.tableCell}>{company['Company Name']}</TableCell>
                <TableCell className={classes.tableCell}>{company['Region']}</TableCell>
                <TableCell className={classes.tableCell}>{company['Market Capitalization']}</TableCell>
                <TableCell className={classes.tableCell}>{company['Industry']}</TableCell>
                <TableCell className={classes.tableCell}>{company['Business Description']}</TableCell>
                <TableCell className={classes.tableCell}>
                  <Select
                    value={approvedCompanies[index] ? "Approved" : "Rejected"}
                    onChange={(e) => handleApprovalChange(index, e.target.value)}
                    color="primary"
                    disabled={selectionLocked[index]} // Disable after selection
                    sx={{
                      width: '130px',
                      backgroundColor: '#51D3E1',
                      '& .MuiSelect-select': {
                        marginLeft: '-24px',
                      },
                    }}
                  >
                    <MenuItem value="Approved">Approve</MenuItem>
                    <MenuItem value="Rejected">Reject</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Grid container justifyContent="space-evenly" spacing={2} mt={2}>
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={handlePrevious}
                        sx={{ color: 'black', paddingX: 8, border: 1, borderColor: 'primary.main' }}
                    >
                        Previous
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" onClick={saveAndNext}>
                        Next
                    </Button>
                </Grid>

            </Grid>
    
    
    </Box>
  );
};

export default MarketAnalysis;
