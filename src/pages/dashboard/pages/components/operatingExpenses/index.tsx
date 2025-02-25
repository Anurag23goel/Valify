import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Accordion,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Grid,
  Snackbar,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
} from '@mui/material';
import { auth, firestore, doc, setDoc, getDoc } from 'firebase.ts';
import { User } from 'firebase/auth';
import Timeline from '../Timeline';

// Sample dynamic questionnaire data structure
const questionnaireData = [
  {
    segmentTitle: '4. Operating Expenses Information',
    questions: [
      {
        type: 'mcq',
        question: 'Coming to operating expenses, such as staff salaries, rent, office expenses, utilities, etc., please select the relevant option based on the data you can provide. If you only have total operating expenses (without breakdowns), you may use "Office expenses" in the below schedules to populate total.',
        id: 'operatingExpenseForecastPreference',
        questionName: 'Operating Expense Forecast Preference',
        options: [
          'A.I can provide operating expense information for the current & forecast period.',
          'B.I have operating expenses for current year, and would like Valify to forecast growth with revenues and inflation.'
        ]
      },
      {
        type: 'table',
        question: 'Operating Expenses (Option 1)',
        questionName: 'A. Operating Expenses ',
        id: 'operatingExpensesOption1',
        rows: [
          { label: 'Selling, General and Admin Expenses' },
          { label: 'Staff Salaries' },
          { label: 'Staff Commission (if any)' },
          { label: 'Rent Expense' },
          { label: 'Legal and Professional Fee' },
          { label: 'Travelling & Communication' },
          { label: 'Office expenses' },
          { label: 'Utilities' },
          { label: 'Finance Cost - Interest' },
          { label: 'Bank Charges' }
        ],
        columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
      },
      {
        type: 'table',
        question: 'Operating Expenses (Option 2)',
        questionName: 'B. Operating Expenses ',
        id: 'operatingExpensesOption2',
        rows: [
          { label: 'Selling, General and Admin Expenses' },
          { label: 'Staff Salaries' },
          { label: 'Staff Commission (if any)' },
          { label: 'Rent Expense' },
          { label: 'Legal and Professional Fee' },
          { label: 'Travelling & Communication' },
          { label: 'Printing & Stationary' },
          { label: 'Utilitiess' },
          { label: 'Finance Cost - Interest' },
          { label: 'Bank Charges' }
        ],
        columns: ['Is this expense a fixed cost or variable?', 'YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        extraInfo: {
          note: 'Fixed or Variable costs may be specified for each category.'
        }
      }
    ]
  }
];

interface TableQuestion {
  type: 'table';
  question: string;
  questionName: string;
  id: string;
  rows: { label: string }[];
  columns: string[];
  ignore?: boolean;
}


type AnswerState = Record<string, string>;

interface OperatingExpensesProps {
  pId?: string | null;
}

const OperatingExpenses: React.FC<OperatingExpensesProps> = ({ pId }) => {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [user, setUser] = useState<User | null>(null);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string | null | undefined>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [showFiveRows, setShowFiveRows] = useState(true);
  const [selectedTableOption, setSelectedTableOption] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setProjectId(pId);
      } else {
        setUser(null);
        navigate('/auth/signin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const checkAndUpdateProjectData = async () => {
      if (user && projectId) {
        const existingProjectRef = doc(firestore, 'users', user.uid, 'projects', projectId);
        try {
          const projectSnapshot = await getDoc(existingProjectRef);

          if (projectSnapshot.exists()) {
            const projectData = projectSnapshot.data();

            const updateFields: Record<string, string> = {};
            if (!projectData.Status) updateFields.Status = 'Initial questionnaire';
            if (!projectData['Estimated time to completion']) {
              updateFields['Estimated time to completion'] = '30 Days';
            }
            if (!projectData.Percentage) updateFields.Percentage = '10';

            if (Object.keys(updateFields).length > 0) {
              await setDoc(existingProjectRef, updateFields, { merge: true });
              console.log('Project updated with missing default fields.');
            }

            if (projectData.answers) {
              setAnswers(projectData.answers);
              console.log(projectData.answers);
              setSelectedTableOption(projectData.answers.operatingExpenseForecastPreference);
              console.log(projectData.answers.operatingExpenseForecastPreference);
            }
          }
        } catch (error) {
          console.error('Error updating project with missing fields:', error);
        }
      }
    };

    checkAndUpdateProjectData();
  }, [user, projectId]);

  useEffect(() => {
    const isFormComplete = questionnaireData.every((segment) =>
      segment.questions.every((question) => {
        // Special handling for the preference question
        if (question.id === 'operatingExpenseForecastPreference') {
          return !!answers[question.id];
        }

        // If no table option is selected, form is not complete
        if (!selectedTableOption) return false;

        // Check if the corresponding table is complete
        if (selectedTableOption?.startsWith('A') && question.id === 'operatingExpensesOption1') {
          return question.rows?.every((_, rowIndex) =>
            !!answers[`${question.id}_row_${rowIndex}`]
          );
        }

        if (selectedTableOption?.startsWith('B') && question.id === 'operatingExpensesOption2') {
          return question.rows?.every((_, rowIndex) =>
            !!answers[`${question.id}_row_${rowIndex}`]
          );
        }

        return true;
      }),
    );
    setIsFormComplete(isFormComplete);
  }, [answers, selectedTableOption]);

  // const handleChange = (questionId: string, value: string) => {
  //   // Special handling for the preference question
  //   if (questionId === 'operatingExpenseForecastPreference') {
  //     setSelectedTableOption(value);
  //   }

  //   setAnswers((prevAnswers) => ({
  //     ...prevAnswers,
  //     [questionId]: value,
  //   }));
  //   console.log(answers);
  // };

  const handleChange = (questionId, rowIndex, colIndex, value) => {
    if (questionId === 'operatingExpenseForecastPreference') {
      console.log("HEYPKS", questionId, rowIndex, colIndex, value )
      setSelectedTableOption(value);
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: value
      }));
    }
    else if(colIndex === 0){
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [`${questionId}_${rowIndex}_${colIndex}`]: value,
        [`${questionId}_${rowIndex}_1`]: value,
        [`${questionId}_${rowIndex}_2`]: value,
        [`${questionId}_${rowIndex}_3`]: value,
        [`${questionId}_${rowIndex}_4`]: value,
        [`${questionId}_${rowIndex}_5`]: value,
        [`${questionId}_${rowIndex}_6`]: value,
      }));
    }else{
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [`${questionId}_${rowIndex}_${colIndex}`]: value,
      }));
    }
    console.log(answers)
  };

  const storeFormData = async () => {
    if (!user || !projectId) {
      console.error('User is not authenticated or project ID is missing');
      return;
    }

    try {
      const projectDocRef = doc(firestore, 'users', user.uid, 'projects', projectId);
      await setDoc(
        projectDocRef,
        {
          projectId,
          answers,
          timestamp: new Date(),
          userId: user.uid,
          Status: 'Operating Expenses',
          route: 'operatingExpenses',
          estimatedTime: '18 Days',
          Percentage: '50',
        },
        { merge: true },
      );
      console.log('Form data saved successfully.');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const saveAndNext = async () => {
    await storeFormData();
    navigate(`#newproject/${projectId}/assetsAndDepreciation`);
    // navigate(`${location.hash.replace('operatingExpenses', 'assetsAndDepreciation')}`);
  };
  const handlePreviousStep = async () => {
    navigate(`#newproject/${projectId}/grossMargin`);
    // await storeFormData();
    // navigate(`/#myprojects/${projectId}/questionnaire`)
    // navigate('#newproject/' + projectId + "/questionnaire");
  };
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box mt={5}>
      <Timeline currentStep={5} />
      {questionnaireData.slice(0, 1).map((segment, segmentIndex) => (
        <Accordion key={segmentIndex} expanded={true}>
          <AccordionDetails>
            {/* <Typography
              variant="h6"
              gutterBottom
              sx={{
                backgroundColor: 'primary.main',
                color: '#0D0D0D',
                padding: 1,
                width: '100%',
                borderRadius: 2,
                marginBottom: 6,
              }}
            >
              {segment.segmentTitle}
            </Typography> */}

            {segment.questions.map((question, questionIndex) => (
              <Box key={questionIndex} mb={3}>
                <Grid container spacing={2}>
                  {question.type === 'mcq' && question.id === 'operatingExpenseForecastPreference' ? (
                    <Grid item xs={12}>
                      <Typography variant="body1" sx={{ color: '#0D0D0D' }}>{question.question}</Typography>
                      {question.options && (
                        <FormControl fullWidth>
                          <RadioGroup
                            value={
                              answers[question.id] || ''
// selectedTableOption
                            }
                            onChange={(e) =>
                              handleChange(question.id, "nil","nil", e.target.value)
                            }
                          >
                            {question.options.map((option, index) => (
                              <FormControlLabel
                                key={index}
                                value={option}
                                control={<Radio />}
                                label={option}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      )}
                    </Grid>
                  ) : (question.type === 'table' &&
                    ((selectedTableOption?.startsWith('A') && question.id === 'operatingExpensesOption1') ||
                      (selectedTableOption?.startsWith('B') && question.id === 'operatingExpensesOption2'))) ? (
                    <React.Fragment>
                      <Typography
                        variant="body1"
                        sx={{ color: '#0D0D0D', marginY: 3, marginLeft: 3 }}
                      >
                        {question.questionName}
                      </Typography>
                      <FormControl component="fieldset" fullWidth sx={{ marginLeft: 2 }}>
                        <RadioGroup
                          row
                          value={showFiveRows ? '5' : '1'}
                          onChange={(e) => setShowFiveRows(e.target.value === '5')}
                        >
                          <FormControlLabel value="5" control={<Radio />} label="Selling, general and admin expenses" />
                          <FormControlLabel value="1" control={<Radio />} label="Total Operating Expenses" />
                        </RadioGroup>
                      </FormControl>
                      <TableContainer sx={{ marginY: 2, marginLeft: 3 }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell
                                align="center"
                                style={{
                                  border: '1px solid #ccc',
                                  width: '150px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {question.questionName}
                              </TableCell>

                              {(question as TableQuestion).columns.map(
                                (column: string, colIndex: number) => (
                                  <TableCell
                                    align="center"
                                    key={colIndex}
                                    style={{
                                      border: '1px solid #ccc',
                                      width: '150px',
                                    }}
                                  >
                                    {column}
                                  </TableCell>
                                ),
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {question.rows?.slice(0, showFiveRows ? 5 : 1).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                <TableCell
                                  align="center"
                                  style={{
                                    border: '1px solid #ccc',
                                    width: '150px',
                                  }}
                                >
                                  {showFiveRows ? row.label : 'Enter Total Operating Expenses'}
                                </TableCell>
                                {question.columns?.map((column, colIndex) => (
                                  <TableCell
                                    align="center"
                                    key={`${rowIndex}_${colIndex}`}
                                    style={{
                                      border: '1px solid #ccc',
                                      width: '150px',
                                    }}
                                  >
                                    {column === 'Is this expense a fixed cost or variable?' && selectedTableOption?.startsWith('B') ? (
                                      <TextField
                                        select
                                        fullWidth
                                        value={answers[`${question.id}_${rowIndex}_${colIndex}`] || ''}
                                        onChange={(e) => handleChange(question.id, rowIndex, colIndex, e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                          '& .MuiSelect-select': {

                                            textAlign: 'left',
                                          },
                                          '& .MuiOutlinedInput-root': {
                                            height: '50px',
                                            fontSize: '16px',
                                          },
                                          '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#ccc',
                                          },
                                          '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                          },
                                        }}
                                        SelectProps={{
                                          MenuProps: {
                                            PaperProps: {
                                              style: {
                                                paddingLeft: '2px',
                                                paddingRight: '2px',
                                              },
                                            },
                                          },
                                        }}
                                      >
                                        <MenuItem value="Fixed" sx={{ paddingLeft: '2px' }}>
                                          Fixed
                                        </MenuItem>
                                        <MenuItem value="Variable" sx={{ paddingLeft: '2px' }}>
                                          Variable
                                        </MenuItem>
                                      </TextField>

                                    ) : (
                                      <TextField
                                        variant="outlined"
                                        fullWidth
                                        value={
                                          answers[
                                          `${question.id}_${rowIndex}_${colIndex}`
                                          ] || ''
                                        }
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (/^\d*$/.test(value)) {
                                         handleChange(question.id, rowIndex, colIndex, e.target.value)
                                          }
                                        }}
                                        inputProps={{
                                          type: 'number',
                                          min: 0,
                                        }}
                                        sx={{
                                          '& input[type=number]': {
                                            '-moz-appearance': 'textfield',
                                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                              '-webkit-appearance': 'none',
                                              margin: 0,
                                            },
                                          },
                                        }}
                                      />
                                    )}
                                  </TableCell>
                                ))}

                              </TableRow>
                            ))}
                          </TableBody>

                        </Table>
                      </TableContainer>
                      {!showFiveRows && (
                        <Typography variant="body2" sx={{ color: 'secondary.main' }}>
                          Only the total operating expenses are displayed. You can switch to see rows.
                        </Typography>
                      )}
                    </React.Fragment>
                  ) : null}

                </Grid>
              </Box>
            ))}
            <Grid container justifyContent="flex-end" mt={2}>
              {/* <Button
                variant="contained"
                onClick={storeFormData}
              >
                Next
              </Button> */}
            </Grid>

            <Grid container justifyContent="space-evenly" mt={2}>
              {/* Previous Button */}
              <Button
                variant="outlined"
                sx={{ color: 'black', paddingX: 8, border: 1, borderColor: 'primary.main' }}
              onClick={handlePreviousStep}
              >
                Previous
              </Button>

              {/* Save and Next Button */}
              <Button variant="contained" onClick={saveAndNext} disabled={isFormComplete}>
                Save and Next
              </Button>
            </Grid>

          </AccordionDetails>
        </Accordion>
      ))}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Your data has been saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OperatingExpenses;