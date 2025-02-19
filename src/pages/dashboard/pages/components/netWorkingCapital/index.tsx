import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Accordion,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { auth, firestore, doc, setDoc, getDoc } from 'firebase.ts'; // Firestore for storing data
import { User } from 'firebase/auth';
import Timeline from '../Timeline';

// Sample dynamic questionnaire data structure
const questionnaireData = [
  {
    segmentTitle: '6. Net Working Capital',
    questions: [
      {
        type: "table",
        question: "",
        questionName: "Current Assets",
        id: "CurrentAssets",
        rows: [
          {
            label: "Trade Receivables Days",
            explanation: "Customer credit terms - Please enter how many days of credit does the business give, on average, to its customers? If customers pay in advance, enter a negative value for the days inputs."
          },
          {
            label: "Other Receivables Days",
            explanation: "If there is anyone else who owes money to the business, on average, how many days would they take to pay back?"
          },
          {
            label: "Inventory Days",
            explanation: "In how many days does the business turn its stock inventory, on average? If the business is a service-provider, please enter 0 days."
          },
          {
            label: "Prepaid Expenses & Other Days",
            explanation: "If the business makes prepayments on expenses, on average, how many days in advance do they pay?"
          }
        ],
        columns: ["Current year", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],

      },
      {
        type: "table",
        question: "A. Long-term Capital Expenditure Plan by Useful Life",
        questionName: "Current Liabilities",
        id: "currentLiabilities",
        rows: [
          {
            "label": "Trade Payables Days",
            "explanation": "Supplier credit terms - Please enter how many days of credit does the business receive, on average, from its suppliers & vendors? If the business pays in advance, enter a negative value for the days inputs."
          },
          {
            label: "Salaries Payable",
            explanation: "In how many days does the business pay salaries to its employees?"
          },
          {
            label: "Accrued Expenses Days",
            explanation: "If the business makes delayed payments on other expenses, on average, how many days late do they pay?"
          },
          {
            label: "Tax Payables Days",
            explanation: "In how many days does the business settle tax expenses?"
          },
          {
            label: "Other Payables Days",
            explanation: "If the business owes money to anyone else, on average, how many days would it take to pay back?"
          }
        ],
        columns: ["Current year", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],

      },

    ],
  },
];

// Define the type for a question
interface OtherQuestion {
  id: string;
  questionName: string;
  isCompulsory?: boolean;
  type: string;
  question: string;
  options?: string[];
  explanation?: string;
  ignore?: boolean;
  columns?: string[];
  rows?: Row[];
}

interface TableQuestion {
  type: 'table';
  question: string;
  questionName: string;
  id: string;
  rows: { label: string }[];
  columns: string[];
  ignore?: boolean;
}

type Question = TableQuestion | OtherQuestion;

interface Row {
  label: string;
  explanation?: string;  // Make explanation optional
}


// Define the type for a segment
interface Segment {
  segmentTitle: string;
  questions: Question[];
}

// Define the type for answers as a Record where keys are strings and values are strings (for answers)
type AnswerState = Record<string, string>;

interface OperatingExpensesProps {
  pId?: string | null; // Allow projectId to be optional
}

const NetworkCapital: React.FC<OperatingExpensesProps> = ({ pId }) => {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [user, setUser] = useState<User | null>(null);
  /*  const [isFormComplete, setIsFormComplete] = useState<boolean>(false); */
  const [projectId, setProjectId] = useState<string | null | undefined>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Track authenticated user state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // User is signed in
        setProjectId(pId);
      } else {
        setUser(null); // User is signed out
        navigate('/auth/signin'); // Redirect to sign-in if user is not authenticated
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

            // Update default fields if they are missing
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

            // Populate answers state from fetched project data
            if (projectData.answers) {
              setAnswers(projectData.answers);
            }
          }
        } catch (error) {
          console.error('Error updating project with missing fields:', error);
        }
      }
    };

    checkAndUpdateProjectData();
  }, [user, projectId]);

  /* update this useEffect */
  /*   useEffect(() => {
      const isFormComplete = questionnaireData.every((segment) =>
        segment.questions.every(
          (question) => !!answers[question.id], // Skip ignored fields
        ),
      );
      setIsFormComplete(isFormComplete);
    }, [answers]); */

  // Function to handle the change of answers dynamically
  const handleChange = (questionId, rowIndex, colIndex, value) => {
    console.log(questionId,rowIndex,colIndex,value )
    if(colIndex === 0){
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [`${questionId}_${rowIndex}_${colIndex}`]: value,
        [`${questionId}_${rowIndex}_1`]: value,
        [`${questionId}_${rowIndex}_2`]: value,
        [`${questionId}_${rowIndex}_3`]: value,
        [`${questionId}_${rowIndex}_4`]: value,
        [`${questionId}_${rowIndex}_5`]: value,
      }));
    }else{
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [`${questionId}_${rowIndex}_${colIndex}`]: value,
      }));
    }
    console.log(answers)
  };


  const isSegmentCompleted = (segment: Segment) => {
    return segment.questions.every((question: Question) => {
      // Check if the question is compulsory and whether it has an answer
      return question.ignore === true || !!answers[question.id];
    });
  };

  // Function to store data in Firestore
  const storeFormData = async () => {
    if (!user || !projectId) {
      console.error('User is not authenticated or project ID is missing');
      return;
    }

    try {
      // Correct Firestore path to store the project data under the user's projects collection
      const projectDocRef = doc(firestore, 'users', user.uid, 'projects', projectId);
      await setDoc(
        projectDocRef,
        {
          projectId,
          answers,
          timestamp: new Date(),
          userId: user.uid,
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
    navigate(`${location.hash.replace('networkingCapital', 'valuationInput')}`);
  };
  const handlePreviousStep = async () => {
    navigate(`${location.hash.replace('networkingCapital', 'assetsAndDepreciation')}`);
    // await storeFormData();
    // navigate(`/#myprojects/${projectId}/questionnaire`)
    // navigate('#newproject/' + projectId + "/questionnaire");
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowTable(event.target.checked); // Update showTable state based on checkbox
  };

  return (
    <Box mt={5}>
      <Timeline currentStep={7} /> {/* Placeholder for the timeline component */}
      {questionnaireData.slice(0, 1).map((segment, segmentIndex) => {
        return (
          <Accordion key={segmentIndex} expanded={true}>
            {
              <>
                <AccordionDetails>
                  {/* <Typography
                    variant="h6"
                    gutterBottom
                    color="'#0D0D0D'"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: '#0D0D0D',
                      padding: 1,
                      width: '100%',
                      borderRadius: 2,
                      marginBottom: 6,
                      marginTop: 4,
                    }}
                  >
                    {segment.segmentTitle} */}
                  {/* </Typography> */}
                  <Typography variant="body1" paragraph sx={{ color: '#0D0D0D', marginLeft: 1 }}>
                    This is the final section of the business questionnaire. We will now analyze current and forecasted working capital requirements of the business.
                    For this, please enter the customer and supplier credit terms (in days) and other working capital days in the below schedules.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: '#0D0D0D', marginLeft: 1 }}>
                    (i) If, for any of the below elements, you have a range rather than a specific number, please enter the average days.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: '#0D0D0D', marginLeft: 1 }}>
                    (ii) If you are unsure about the days, select the option below to adopt our recommended general credit term standards.
                  </Typography>

                  {/* Checkbox */}
                  <FormControlLabel
                    control={<Checkbox checked={showTable} onChange={handleCheckboxChange} />}
                    label="I am unsure of the days. Please adopt a benchmark credit term standard across the forecast period."
                    sx={{
                      marginTop: 2,
                      '& .MuiFormControlLabel-label': {
                        color: '#0D0D0D',
                        fontWeight: 'normal',
                        fontSize: '1.2rem',
                      }
                    }}
                  />

                  {!showTable && segment.questions.map((question, questionIndex) => (
                    <Box key={questionIndex} mb={3}>
                      <Grid container spacing={2}>
                        {question.type === 'table' ? (
                          <React.Fragment>
                            <Typography
                              variant="body1"
                              sx={{ marginTop: 5, color: '#0D0D0D', fontWeight: "bold", marginLeft: 3 }}
                            >
                              {question.questionName}
                            </Typography>
                            {/* Table for 'table' type questions */}
                            {(question as TableQuestion).type === 'table' &&
                              (question as TableQuestion).rows &&
                              (question as TableQuestion).columns && (
                                <TableContainer sx={{ marginY: 2, marginLeft: 3 }}>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell
                                          align="left"
                                          style={{
                                            border: '1px solid #ccc',
                                            width: '150px',
                                            fontWeight: 'bold',
                                            color: '#0D0D0D'
                                          }}
                                        >
                                          {question.questionName}
                                        </TableCell>
                                        {(question as TableQuestion).columns.map((column, colIndex) => (
                                          <TableCell
                                            align="center"
                                            key={colIndex}
                                            style={{ border: '1px solid #ccc', width: '150px', color: '#0D0D0D' }}
                                          >
                                            {column}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(question as TableQuestion).rows.map((row, rowIndex) => (
                                        <React.Fragment key={rowIndex}>

                                          <TableRow>
                                            <TableCell
                                              align="left"
                                              style={{ border: '1px solid #ccc', width: '270px' }}
                                            >

                                              <span style={{ color: '#0D0D0D', marginBottom: '4px' }}>
                                                {row.label}
                                              </span>


                                              {(row as Row).explanation && (
                                                <p style={{ fontSize: '0.8rem', marginTop: '2px', color: '#555555' }}>
                                                  {(row as Row).explanation}
                                                </p>
                                              )}
                                            </TableCell>


                                            {(question as TableQuestion).columns.map((_, colIndex) => (
                                              <TableCell
                                                align="center"
                                                key={colIndex}
                                                style={{
                                                  border: '1px solid #ccc',
                                                  width: '150px',
                                                }}
                                              >
                                                <TextField
                                                  variant="outlined"
                                                  fullWidth
                                                  value={
                                                    answers[`${question.id}_${rowIndex}_${colIndex}`] || ''
                                                  }
                                                  onChange={(e) => handleChange(question.id, rowIndex, colIndex, e.target.value)}
                                                    
                                                  type='number'
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
                                              </TableCell>
                                            ))}
                                          </TableRow>
                                        </React.Fragment>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>

                              )}
                          </React.Fragment>
                        ) : (
                          <>
                            {question.questionName && (
                              <Grid item xs={3}>
                                <Typography variant="body1" sx={{ color: 'primary.main' }}>
                                  {question.questionName}
                                </Typography>
                              </Grid>
                            )}
                            <Grid item xs={9}>
                              {question.question && (
                                <Typography variant="body1" gutterBottom>
                                  {question.question}
                                </Typography>
                              )}



                              {/* Text for 'text' type questions */}
                              {question.type === 'text' && (
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  value={answers[question.id] || ''}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                />
                              )}

                              {/* Table for 'table' type questions */}
                              {(question as TableQuestion).type === 'table' &&
                                (question as TableQuestion).rows &&
                                (question as TableQuestion).columns && (
                                  <TableContainer component={Paper}>
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>{question.questionName}</TableCell>{' '}
                                          {/* Content in the top left */}
                                          {(question as TableQuestion).columns.map(
                                            (column: string, colIndex: number) => (
                                              <TableCell key={colIndex}>{column}</TableCell>
                                            ),
                                          )}
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {(question as TableQuestion).rows.map(
                                          (row: { label: string }, rowIndex: number) => (
                                            <TableRow key={rowIndex}>
                                              <TableCell>{row.label}</TableCell>
                                              {(question as TableQuestion).columns.map(
                                                (_, colIndex: number) => (
                                                  <TableCell key={colIndex}>
                                                    <TextField
                                                      variant="outlined"
                                                      fullWidth
                                                      value={
                                                        answers[
                                                        `${question.id}_${rowIndex}_${colIndex}`
                                                        ] || ''
                                                      }
                                                      onChange={(e) =>
                                                       handleChange(question.id, rowIndex, colIndex, e.target.value)
                                                   
                                                      }
                                                    />
                                                  </TableCell>
                                                ),
                                              )}
                                            </TableRow>

                                          ),
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                )}
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Box>
                  ))}

                  <Grid container justifyContent="flex-end" mt={2}>
                    {/* <Button
                      variant="contained"
                      onClick={storeFormData} // Call storeSegmentData for the segment
                      disabled={!isSegmentCompleted(segment)} // Disable if not completed
                    >
                      Next
                    </Button> */}
                  </Grid>
                </AccordionDetails>
              </>
            }
          </Accordion>
        );
      })}
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
        <Button variant="contained" onClick={saveAndNext} >
          Save and Next
        </Button>
      </Grid>
      {/* Snackbar component for displaying the success message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Form data saved successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NetworkCapital;
