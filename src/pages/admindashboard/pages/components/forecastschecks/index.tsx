import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';

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
    color: '#0D0D0D',
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
    padding: '30px',
    borderBottom: '1px solid #65B5BE',
    borderRight: '1px solid #65B5BE',
    height: '70px',
    color: '#0D0D0D',
    '&:last-child': {
      borderRight: 'none',
    },
  },
}));

const ForecastsChecks: React.FC = () => {
  const classes = useStyles();
  const hash = window.location.hash;
  const navigate = useNavigate();
  // Extract the parameters from the hash
  const [base, projectId, userId] = hash.split("/").slice(1);
  // Placeholder rows for backend data
  const rows = [
    { name: '', region: '', marketCap: '', industry: '', description: '', rationale: '' },
    { name: '', region: '', marketCap: '', industry: '', description: '', rationale: '' },
  ];
  const handleNextClick = () => {

    navigate(`/#myprojects/${projectId}/user/${userId}/reviewStage`, {
      state: { projectId: projectId, userId: userId  
             }
    });
    console.log(base);
  };
  const handlePreviousClick = () => {

    navigate(`/#myprojects/${projectId}/user/${userId}/marketAnalysis`, {
      state: { projectId: projectId, userId: userId  
             }
    });
  };

  return (
    <Box className={classes.container}>
     
      <TableContainer className={classes.tableContainer} component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell className={classes.tableHeaderCell}>Flag Header</TableCell>
              <TableCell className={classes.tableHeaderCell}>Flag Label</TableCell>
              <TableCell className={classes.tableHeaderCell}>Screening Criteria</TableCell>
              <TableCell className={classes.tableHeaderCell}>Flag Action</TableCell>
              <TableCell className={classes.tableHeaderCell}>Suggested Sensitivity</TableCell>
              <TableCell className={classes.tableHeaderCell}>Rationale</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Hardcoded row */}
            <TableRow>
              <TableCell className={classes.tableCell}>Revenue growth</TableCell>
              <TableCell className={classes.tableCell}>Declining revenue growth flag</TableCell>
              <TableCell className={classes.tableCell}>&lt; 0% Growth p.a.</TableCell>
              <TableCell className={classes.tableCell}>&lt; 0% Growth p.a.</TableCell>
              <TableCell className={classes.tableCell}>Maintain Management Forecasts</TableCell>
              <TableCell className={classes.tableCell}>Lorem ipsum text</TableCell>
            </TableRow>

            {/* Empty rows for backend data */}
            {rows.map((_, index) => (
              <TableRow key={index}>
                <TableCell className={classes.tableCell}></TableCell>
                <TableCell className={classes.tableCell}></TableCell>
                <TableCell className={classes.tableCell}></TableCell>
                <TableCell className={classes.tableCell}></TableCell>
                <TableCell className={classes.tableCell}></TableCell>
                <TableCell className={classes.tableCell}></TableCell>
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
    mt: 3 // Add some margin below if needed
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

export default ForecastsChecks;
