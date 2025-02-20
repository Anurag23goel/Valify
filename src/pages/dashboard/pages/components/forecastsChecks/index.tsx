import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Select,
  Button, Grid
} from '@mui/material';
import * as XLSX from 'xlsx';
import { auth } from 'firebase'; // Adjust import path based on your file structure
import { firestore as db, collection, doc, setDoc, getDocs } from 'firebase'; // Import Firestore
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  tableContainer: {
    width: '100%',
    border: '1px solid #65B5BE',
    marginBottom: '60px',
    padding: 0,
    borderRadius: '0 0 10px 10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: 0,
  },
  tableHeadRow: {
    borderBottom: '2px solid #0D0D0D',
  },
  tableHeaderCell: {
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px',
    borderRight: '1px solid #65B5BE',
    color: '#0D0D0D',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  tableCell: {
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px',
    borderBottom: '1px solid #65B5BE',
    borderRight: '1px solid #65B5BE',
    color: '#0D0D0D',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  sectionTitle: {
    backgroundColor: '#C1E5E9',
    padding: '10px',
    fontSize: '16px',
    marginTop: 0,
    color: '#0D0D0D',
    border: '1px solid #65B5BE',
    borderRadius: '10px 10px 0 0',
    borderBottom: '1px solid #65B5BE',
    fontWeight: 'normal',
    paddingLeft: '25px',
  },
}));

interface QuestionnaireProps {
  pId?: string | null;
}

const ForecastsChecks: React.FC<QuestionnaireProps> = ({ pId }) => {
  const classes = useStyles();
  const [user, setUser] = useState<User | null>(null);
  const [flagsData, setFlagsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSelections, setActionSelections] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string | null | undefined>(null);
    

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        loadData(user.uid);
        setProjectId(pId);
      } else {
        setUser(null);
        navigate('/auth/signin');
      }
    });
    return () => unsubscribe();
  }, [navigate, pId]);


  const handlePrevious = () => {
    navigate(`#newproject/${projectId}/marketAnalysis`);
    // navigate(`${location.hash.replace('riskAssumptions', 'valuationInput')}`);
};

const handleNext = async () => {
    // await storeFormData();
    navigate(`#newproject/${projectId}/reviewStage`);
    // navigate(`${location.hash.replace('riskAssumptions', 'marketAnalysis')}`);
};

  const loadData = async (uid: string) => {
    if (!pId) return;
    const forecastsRef = collection(db, `users/${uid}/projects/${pId}/forecasts`);
    setLoading(true);

    try {
      const snapshot = await getDocs(forecastsRef);

      if (!snapshot.empty) {
        const data = snapshot.docs.map((doc) => doc.data());
        setFlagsData(data);
      } else {
        const newData = await fetchExcelData(uid);
        setFlagsData(newData);

        for (const section of newData) {
          const sectionRef = doc(forecastsRef, section.title);
          await setDoc(sectionRef, section);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }

    setLoading(false);
  };

  const fetchExcelData = async (uid: string) => {
    try {
      const response = await fetch(
        `https://valify-api.technorthstar.com/generate?uid=${uid}&project_id=${pId}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], 'generated_excel.xlsx');
        const reader = new FileReader();

        return new Promise<any[]>((resolve, reject) => {
          reader.onload = (e) => {
            const binaryStr = e.target?.result;
            if (binaryStr) {
              const workbook = XLSX.read(binaryStr, { type: 'binary' });
              const sheet = workbook.Sheets['Flags'];
              const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
              resolve(processData(jsonData));
            } else {
              reject('No data in Excel');
            }
          };

          reader.readAsBinaryString(file);
        });
      }
    } catch (error) {
      console.error('Error fetching Excel data:', error);
    }

    return [];
  };

  const processData = (data: any[][]) => {
    const excelMapping = [
      {
        title: 'Revenue - Sensitivities & Flags',
        rows: [['Revenue growth', 8, 9, 10], ['Revenue Dependency', 12, 13, 14]],
      },
      {
        title: 'Cost Sensitivities',
        rows: [['Direct Costs', 17, 18, 19, 20]],
      },
      {
        title: 'Operating Expenses',
        rows: [
          ['Employee Cost', 23, 24],
          ['Depreciation', 26],
          ['Finance cost', 28],
          ['EBITDA margin', 30],
          ['NWC as a % of sales', 32],
          ['Capex', 34, 35],
        ],
      },
    ];

    return excelMapping.map((section) => ({
      title: section.title,
      rows: section.rows.flatMap(([rowTitle, ...rowIndexes]) =>
        rowIndexes.map((rowIndex) => ({
          component: rowTitle,
          flag: data[rowIndex - 1]?.[3] || '',
          action: data[rowIndex - 1]?.[9] || '',
        }))
      ),
    }));
  };

  const handleSave = async () => {
    if (!user || !pId) return;

    const updatedFlagsData = flagsData.map((section, sectionIndex) => ({
      ...section,
      rows: section.rows.map((row, rowIndex) => ({
        ...row,
        action: actionSelections[`${sectionIndex}-${rowIndex}`] || row.action,
      })),
    }));

    const forecastsRef = collection(db, `users/${user.uid}/projects/${pId}/forecasts`);

    try {
      setLoading(true);
      for (const section of updatedFlagsData) {
        const sectionRef = doc(forecastsRef, section.title);
        await setDoc(sectionRef, section);
      }
      setFlagsData(updatedFlagsData);
      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classes.container}>
      {loading ? (
        <CircularProgress />
      ) : (
        flagsData.map((section, sectionIndex) => (
          <Box key={sectionIndex} marginBottom={4}>
            <Typography variant="h6" className={classes.sectionTitle}>
              {section.title}
            </Typography>
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow className={classes.tableHeadRow}>
                    <TableCell className={classes.tableHeaderCell}>Component</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Flag</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {section.rows.filter((row) => row.flag.trim() !== '').map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className={classes.tableCell}>{row.component}</TableCell>
                      <TableCell className={classes.tableCell}>{row.flag}</TableCell>
                      <TableCell className={classes.tableCell}>
                        <Select
                          value={actionSelections[`${sectionIndex}-${rowIndex}`] || row.action}
                          onChange={(e) =>
                            setActionSelections({
                              ...actionSelections,
                              [`${sectionIndex}-${rowIndex}`]: e.target.value,
                            })
                          }
                          displayEmpty
                          style={{
                             minWidth: '280px', backgroundColor: '#fff', color: '#000' 
                            
                            }}
                        >
                          <MenuItem value="Adopt market growth rate">
                            Adopt market growth rate
                          </MenuItem>
                          <MenuItem value="Limit to historical growth rate">
                            Limit to historical growth rate
                          </MenuItem>
                          <MenuItem value="Maintain Management forecast">
                            Maintain Management forecast
                          </MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
      <Box display="flex" justifyContent="center" marginTop={4}>
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
                    <Button variant="contained" onClick={!flagsData.length ? handleNext : saveAndNext}>
                    {!flagsData.length ? "Next": "Save and Next"}
                    </Button>
                </Grid>
            </Grid>
      
      
        
      </Box>
    </Box>
  );
};

export default ForecastsChecks;
