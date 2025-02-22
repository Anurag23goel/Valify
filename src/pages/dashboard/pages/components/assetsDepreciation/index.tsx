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
} from '@mui/material';
import { auth, firestore, doc, setDoc, getDoc } from 'firebase.ts';
import { User } from 'firebase/auth';
import Timeline from '../Timeline';


const questionnaireData = [
  {
    "segmentTitle": "5. Assets & Depreciation",
    "questions": [
      {
        "type": "mcq",
        "questionHeader": "We are now moving ahead to analyse & forecast capital expenditure for the business. Please share the subject company's budget for growth & expansion over next 5 years, by selecting from below 3 options: ",
        "id": "investmentPlan",
        
        "questionName": "Investment Plan",
        "options": [
          "A. The company has determined specific long-term and short-term assets they will require over the 5 years.",
          "B. The company has set an annual budget for expansion over next 5 years",
          "C. You prefer to estimate capital expenditure spend in proportion with the sales made over next 5 years."
        ]
      },
      {
        "type": "table",
        ignore: true,
        "question": "A. Long-term Capital Expenditure Plan by Useful Life",
        "questionName": "Capital Expenditure",
        "id": "capexPlan",
        "rows": [
          {
            "label": "GROSS BLOCK A - 30 Years",
            "explanation": "Building, heavy machinery, etc. which can have a 30 years long useful life."
          },
          {
            "label": "GROSS BLOCK B - 20 Years",
            "explanation": "Plant & equipment, renovations, etc. which can have a 20 years long useful life."
          },
          {
            "label": "GROSS BLOCK C - 10 Years",
            "explanation": "Light equipment, appliances, furniture, etc. which can have a 10 years useful life."
          },
          {
            "label": "GROSS BLOCK D - 5 Years",
            "explanation": "Tools, printers, appliances, etc. which can have a 5 years useful life."
          }
        ],
        "columns": ["Existing Capex", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
        "dependsOn": "investmentPlan",
        "showWhen": "A. The company has determined specific long-term and short-term assets they will require over the 5 years."
      },
      {
        "type": "table",
        ignore: true,
        "question": "B. Annual Budget for Expansion",
        "questionName": "Total Annual Capex Value",
        "id": "capexAnnualBudget",
        "rows": [
          {
            "label": "Total Annual Capex Value",
            "explanation": "",
            "input": {
              "type": "number",
              "placeholder": "Enter total capex value",
              "name": "annualCapexValue"
            }
          }
        ],
        "columns": ["Existing Capex", "Current Year", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
        "dependsOn": "investmentPlan",
        "showWhen": "B. The company has set an annual budget for expansion over next 5 years"
      },
      {
        "type": "table",
        ignore: true,
        "question": "C. Capital Expenditure as a Percentage of Revenue",
        "questionName": "Capex as a % of Revenue",
        "id": "capexRevenuePercentage",
        "rows": [
          {
            "label": "Please enter the % of capital expenditure planned to spend against earned revenues.",
            "explanation": "",
            "input": {
              "type": "number",
              "placeholder": "Enter percentage",
              "name": "capexRevenuePercentage"
            }
          }
        ],
        "columns": ["Existing Capex", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
        "dependsOn": "investmentPlan",
        "showWhen": "C. You prefer to estimate capital expenditure spend in proportion with the sales made over next 5 years."
      }
    ]
  }
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
  dependsOn?: string;
  showWhen?: string;
}

interface TableQuestion {
  type: 'table';
  question: string;
  questionName: string;
  id: string;
  rows: { label: string }[];
  columns: string[];
  ignore?: boolean;
  dependsOn?: string;
  showWhen?: string;
}

type Question = TableQuestion | OtherQuestion;

interface Row {
  label: string;
}



type AnswerState = Record<string, string>;

interface OperatingExpensesProps {
  pId?: string | null;
}

const AssestsDepreciation: React.FC<OperatingExpensesProps> = ({ pId }) => {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [user, setUser] = useState<User | null>(null);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string | null | undefined>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

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
  }, [navigate, pId]);

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
    // Revised form completeness check
    const isFormComplete = questionnaireData.every((segment) =>
      segment.questions.every((question) => {
        // Skip the first MCQ question
        if (question.id === 'investmentPlan') return true;

        // Check dependent questions
        if (question.dependsOn) {
          const parentAnswer = answers[question.dependsOn];
          // Only require an answer if this specific option is selected
          return parentAnswer === question.showWhen ? !!answers[question.id] : true;
        }

        return true;
      })
    );
    setIsFormComplete(true);
  }, [answers]);

  // Function to handle the change of answers dynamically
  const handleChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => {
      const newAnswers = {
        ...prevAnswers,
        [questionId]: value,
      };

      // Clear dependent question's answer if parent option changes
      questionnaireData.forEach(segment => {
        segment.questions.forEach(question => {
          if (question.dependsOn === questionId) {
            // Clear the answer if the selected option doesn't match
            if (value !== question.showWhen) {
              delete newAnswers[question.id];
            }
          }
        });
      });

      return newAnswers;
    });
  };

  // Function to check if a dependent question should be shown
  const shouldShowDependentQuestion = (question: Question) => {
    if (!question.dependsOn) return true;

    // Only show if the parent question's answer matches the specific condition
    return question.dependsOn &&
      question.showWhen === answers[question.dependsOn];
  };

  // Function to store data in Firestore
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
          Status: 'Assets & Depreciation',
          route: 'assetsAndDepreciation',
          estimatedTime: '16 Days',
          Percentage: '60',
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
    navigate(`#newproject/${projectId}/networkingCapital`);
    // navigate(`${location.hash.replace('assetsAndDepreciation', 'networkingCapital')}`);
  };

  const handlePreviousStep = async () => {
    navigate(`#newproject/${projectId}/operatingExpenses`);
    // navigate(`${location.hash.replace('assetsAndDepreciation', 'operatingExpenses')}`);
    // await storeFormData();
    // navigate(`/#myprojects/${projectId}/questionnaire`)
    // navigate('#newproject/' + projectId + "/questionnaire");
  };


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box mt={5}
    >
      <Timeline currentStep={6} />
      <Box sx={{
        marginX: 5
      }}>
        {/* <Typography
          variant="h6"
          gutterBottom
          color="'#0D0D0D'"
          sx={{
            backgroundColor: 'primary.main',
            color: '#0D0D0D',
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 2,
            width: '100%',
            borderRadius: 2,
            marginTop: 4,

          }}
        >
          5. Assets and Depreciations
        </Typography> */}
      </Box>

      {questionnaireData.slice(0, 1).map((segment, segmentIndex) => (
        <Accordion key={segmentIndex} expanded={true}>
          <AccordionDetails>
            {segment.questions.map((question, questionIndex) => {
              // Skip rendering if it's a dependent question and condition is not met
              if (question.dependsOn && !shouldShowDependentQuestion(question)) {
                return null;
              }

              return (
                <Box key={questionIndex} mb={3}>
                  <Grid container spacing={2} direction="column">
                    <Grid item xs={12}>

                      {question.question && (
                        <Box
                          width="100%"
                          sx={{
                            backgroundColor: '#F4F4F4',
                            paddingY: 1,
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="body1"
                            gutterBottom
                            sx={{
                              color: '#0D0D0D',
                              fontWeight: 'bold',
                              marginLeft: 1
                            }}
                          >
                            {question.question}
                          </Typography>
                        </Box>
                      )}



                      <Typography variant="body1" gutterBottom color='#0D0D0D'>
                        {question.questionHeader}
                      </Typography>


                      {question.type === 'mcq' && question.options && (
                        <FormControl component="fieldset" fullWidth >
                          <RadioGroup
                            value={answers[question.id] || ''}
                            onChange={(e) => handleChange(question.id, e.target.value)}
                          >
                            {question.options.map((option, optionIndex) => (
                              <FormControlLabel
                                color='#0D0D0D'
                                key={optionIndex}
                                value={option}
                                control={<Radio />}

                                label={option}
                                sx={{
                                  '& .MuiFormControlLabel-label': {
                                    color: '#0D0D0D', // Custom label color
                                  },
                                }}

                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      )}

                      {question.type === 'table' && question.rows && question.columns && (
                        <TableContainer sx={{ marginY: 2 }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  align="left"
                                  style={{
                                    border: "1px solid #ccc",

                                    color: '#0D0D0D',
                                  }}
                                >
                                  {question.questionName}
                                </TableCell>
                                {question.columns.map((column, colIndex) => (
                                  <TableCell
                                    key={colIndex}
                                    align="left"
                                    style={{
                                      border: "1px solid #ccc",
                                      color: '#0D0D0D',
                                    }}
                                  >
                                    {column}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {question.id === 'capexPlan'
                                ? question.rows.map((row, rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    <TableCell
                                      align="left"
                                      style={{
                                        border: "1px solid #ccc",
                                        fontWeight: "bold",
                                        color: '#0D0D0D',
                                      }}
                                    >
                                      {row.label}
                                      {row.explanation && (
                                        <Typography
                                          variant="body2"
                                          sx={{

                                            color: '#0D0D0D',
                                            marginTop: 1,
                                          }}
                                        >
                                          {row.explanation}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    {question.columns.map((_, colIndex) => (
                                      <TableCell
                                        key={colIndex}
                                        align="left"
                                        style={{
                                          border: "1px solid #ccc",
                                          color: '#0D0D0D',
                                        }}
                                      >
                                        <TextField
                                          variant="outlined"
                                          fullWidth
                                          value={answers[`${question.id}_${rowIndex}_${colIndex}`] || ""}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleChange(`${question.id}_${rowIndex}_${colIndex}`, value);
                                          }}
                                        />
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))
                                : question.rows.slice(0, 1).map((row, rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    <TableCell
                                      align="left"
                                      style={{
                                        border: "1px solid #ccc",
                                        fontWeight: "bold",
                                        color: '#0D0D0D',
                                      }}
                                    >
                                      {row.label}
                                      {row.explanation && (
                                        <Typography
                                          variant="body2"
                                          sx={{

                                            color: '#0D0D0D',
                                            marginTop: 1,
                                          }}
                                        >
                                          {row.explanation}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    {question.columns.map((_, colIndex) => (
                                      <TableCell
                                        key={colIndex}
                                        align="left"
                                        style={{
                                          border: "1px solid #ccc",
                                          color: '#0D0D0D',
                                        }}
                                      >
                                        {question.id === 'capexRevenuePercentage' ? (
                                          <TextField
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            inputProps={{
                                              min: 0,
                                              step: 1  // Ensures no decimals
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
                                            value={answers[`${question.id}_${rowIndex}_${colIndex}`] || ""}
                                            onChange={(e) => {
                                              // Ensure only non-negative integers for Question C
                                              const value = Math.max(0, parseInt(e.target.value) || 0).toString();
                                              handleChange(`${question.id}_${rowIndex}_${colIndex}`, value);
                                            }}
                                          />
                                        ) : (
                                          <TextField
                                            variant="outlined"
                                            fullWidth
                                            value={answers[`${question.id}_${rowIndex}_${colIndex}`] || ""}
                                            onChange={(e) => {
                                              // Original behavior for other questions (including Question B)
                                              const value = e.target.value;
                                              handleChange(`${question.id}_${rowIndex}_${colIndex}`, value);
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
                      )}
                    </Grid>
                  </Grid>
                </Box>
              );
            })}

            <Grid container justifyContent="flex-end" mt={2}>
              {/* <Button
                variant="contained"
                onClick={storeFormData}
                disabled={!isFormComplete}
              >
                Next
              </Button> */}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      <Grid container justifyContent="space-evenly" mt={2}>
        <Button
          variant="outlined"
          sx={{ color: 'black', paddingX: 8, border: 1, borderColor: 'primary.main' }}
          onClick={handlePreviousStep}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          onClick={saveAndNext}
          disabled={!isFormComplete}
        >
          Save and Next
        </Button>
      </Grid>

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

export default AssestsDepreciation;