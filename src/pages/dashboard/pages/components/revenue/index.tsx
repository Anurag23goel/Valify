import {
  Accordion,
  //   AccordionSummary,
  AccordionDetails,
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { auth, doc, firestore, getDoc, setDoc } from 'firebase.ts'; // Firestore for storing data
import { User } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Timeline from '../Timeline';
import RevenueTables from './Table';

// Sample dynamic questionnaire data structure
const questionnaireData = [
  {
    segmentTitle: 'Revenue Information',
    questions: [
      // {
      //   type: 'dropdown',
      //   question: 'Select your revenue categorization style.',
      //   id: 'revenueCategorizationStyle',
      //   questionName: ' ',
      //   options: [
      //     ' Product/Service',
      //     'Major Clients',
      //     ' Region of Operation',
      //     'Other',
      //     'Mix(Not recommended)',
      //   ],
      // },
      {
        type: 'text',
        question: ' ',
        id: 'existingStream1',
        questionName: 'Existing Stream 1',
      },
      {
        type: 'text',
        question: ' ',
        id: 'existingStream2',
        questionName: 'Existing Stream 2',
      },
      {
        type: 'text',
        question: ' ',
        id: 'existingStream3',
        questionName: 'Existing Stream 3 ',
      },
      {
        type: 'text',
        question: ' ',
        id: 'existingStream4',
        questionName: 'Existing Stream 4',
      },
      {
        type: 'mcq',
        question:
          'Pipeline revenues" are new revenue streams that are confirmed/signed to become operational in the next 5 years.Does the business have any such pipeline revenues? If yes, please identify and add names of such pipeline revenue categories for the below. \n\n ',
        id: 'pipelinerevenue',
        questionName: 'Pipeline  revenue',
        options: ['Yes', 'No'],
      },
      {
        type: 'text',
        question: '  ',
        id: 'pipelineStream1',
        questionName: 'Pipeline Stream 1 ',
        dependsOn: 'pipelinerevenue',
        showWhen: 'Yes',
      },
      {
        type: 'text',
        question: ' ',
        id: 'pipelineStream2',
        questionName: 'Pipeline Stream 2 ',
        dependsOn: 'pipelinerevenue',
        showWhen: 'Yes',
      },
      {
        type: 'text',
        question: ' ',
        id: 'pipelineStream3',
        questionName: 'Pipeline Stream 3',
        dependsOn: 'pipelinerevenue',
        showWhen: 'Yes',
      },
      {
        type: 'text',
        question: ' ',
        id: 'pipelineStream4',
        questionName: 'Pipeline Stream 4',
        dependsOn: 'pipelinerevenue',
        showWhen: 'Yes',
      },
      {
        type: 'mcq',
        question:
          '"Potential revenues" are new revenue streams that are not yet confirmed, but the business may achieve in the next 5 years.  Does the business have any such potential revenues? If yes, please identify and add names of such potential revenue categories for the below \n\n.Note: Example - An ongoing bid for a new service contract for next 2 years which is not yet won or signed OR a manufacturer looking to enter retail market by opening stores in the future.',
        id: 'potentialrevenue',
        questionName: 'Potential revenues',
        options: ['Yes', 'No'],
      },

      {
        type: 'text',
        question: ' ',
        id: 'pipelineStream1',
        questionName: 'Potential Stream 1',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
      },
      {
        type: 'text',
        question: ' ',
        id: 'pipelineStream2',
        questionName: 'Potential Stream 2',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
      },
      {
        type: 'text',
        question: ' ',
        id: 'pipelineStream3',
        questionName: 'Potential Stream 3 ',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
      },
      {
        type: 'text',
        question: ' ',
        id: 'pipelineStream4',
        questionName: 'Potential Stream 4 ',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
      },
      {
        type: 'mcq',
        question:
          'Since the potential revenues are uncertain, please share an expected probability of achieving these over next 5 years? If you are unsure about this, it is recommended to consider a 50%-50% probability of achievement.',
        id: 'potentialrevenue',
        questionName: ' ',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
      },
      {
        type: 'text',
        question: ' ',
        id: 'potentialStream1Probability',
        questionName: 'Probability for Potential Stream 1',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
        explanation:
          'Please provide an expected probability of achieving this revenue stream over the next 5 years.',
      },
      {
        type: 'text',
        question: ' ',
        id: 'potentialStream2Probability',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
        questionName: 'Probability for Potential Stream 2',
      },
      {
        type: 'text',
        question: ' ',
        id: 'potentialStream3Probability',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
        questionName: 'Probability for Potential Stream 3',
      },
      {
        type: 'text',
        question: ' ',
        id: 'potentialStream4Probability',
        dependsOn: 'potentialrevenue',
        showWhen: 'Yes',
        questionName: 'Probability for Potential Stream 4',
      },
      {
        type: 'mcq',
        question:
          'We are now about to collect forecast information on revenues of the above-mentioned business lines. A typical revenue build-up includes 2 key drivers: ',
        questionName: 'Data Check',
        id: 'datacheck',
        points: `1. Price: subscription fees, average goods price, one-time consulting charge, etc.
                 2. Volumes: sales volumes, service subscribers, number of customers, etc.
                 Please confirm if you currently possess a revenue buildup with such price x volume data for each of the above-mentioned business lines?`,
        options: ['Yes', 'No'],
      },
      {
        type: 'dropdown',
        question: ' ',
        id: 'existingBusinessRevenues',
        questionName: 'Existing Business Revenues',
        options: [
          'I have price & volume data for existing business lines',
          'I DO NOT have price & volume data for existing business',
        ],
        dependsOn: 'datacheck',
        autofill: {
          Yes: 'I have price & volume data for existing business lines',
          No: 'I DO NOT have price & volume data for existing business',
        },
      },
      {
        type: 'dropdown',
        question: ' ',
        id: 'pipelineBusinessRevenues',
        questionName: 'Pipeline Business Revenues',
        options: [
          'I have price & volume data for existing business lines',
          'I DO NOT have price & volume data for existing business',
        ],
        dependsOn: 'datacheck',
        autofill: {
          Yes: 'I have price & volume data for existing business lines',
          No: 'I DO NOT have price & volume data for existing business',
        },
      },
      {
        type: 'dropdown',
        question: ' ',
        id: 'potentialBusinessRevenues',
        questionName: 'Potential Business Revenues',
        options: [
          'I have price & volume data for existing business lines',
          'I DO NOT have price & volume data for existing business',
        ],
        dependsOn: 'datacheck',
        autofill: {
          Yes: 'I have price & volume data for existing business lines',
          No: 'I DO NOT have price & volume data for existing business',
        },
      },
      {
        type: 'table',
        question: '',
        questionName: 'Existing Streams Contribution Table',
        id: 'existingStreamsContribution',
        rows: [
          { label: 'Revenue Stream 1' },
          { label: 'Revenue Stream 2' },
          { label: 'Revenue Stream 3' },
          { label: 'Revenue Stream 4' },
        ],
        columns: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        ignore: true,
      },
    ],
  },
];

// Define the type for a question
interface OtherQuestion {
  id: string;
  questionName: string;
  isCompulsory?: boolean; // This property should exist in every question
  type: string; // e.g., 'text', 'mcq', etc.
  question: string;
  options?: string[]; // Optional, for MCQ or dropdown types
  explanation?: string; // Optional
  ignore?: boolean; // Optional, if you need this property
  columns?: string[];
  rows?: Row[];
  dependsOn?: string; // Optional, for conditional display logic
  showWhen?: string;
  Tablenumber?: string;
  autoCalculate?: string;
  autofill?: { [key: string]: string };
}

interface TableQuestion {
  type: 'table'; // Literal type 'table' to ensure TypeScript understands it
  question: string;
  questionName: string;
  id: string;
  rows: { label: string; values: { [column: string]: string | number } }[];
  columns: string[]; // Names of the columns
  ignore?: boolean;
  dependsOn?: string;
  showWhen?: string;
  autofill?: { [key: string]: string };
  subheader?: string; // Optional, for additional headers
}

// type QuestionnaireData = QuestionnaireSegment[];
interface QuestionWithPoints extends OtherQuestion {
  points: string; // Only add points to types that should have it
}

type Question = TableQuestion | OtherQuestion;

interface Row {
  label: string; // Label for the row
}

// Define the type for a segment
interface Segment {
  segmentTitle: string;
  questions: Question[];
}

function hasPoints(question: Question): question is QuestionWithPoints {
  return (question as QuestionWithPoints).points !== undefined;
}

// Define the type for answers as a Record where keys are strings and values are strings (for answers)
type AnswerState = Record<string, string>;

interface RevenueProps {
  pId?: string | null; // Allow projectId to be optional
}

const Revenue: React.FC<RevenueProps> = ({ pId }) => {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [user, setUser] = useState<User | null>(null);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string | null | undefined>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Selected file:', files[0]);
    }
  };

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

  useEffect(() => {
    const isFormComplete = questionnaireData.every((segment) =>
      segment.questions.every(
        (question) => question.ignore === true || !!answers[question.id], // Skip ignored fields
      ),
    );
    setIsFormComplete(isFormComplete);
  }, [answers]);

  // Function to handle the change of answers dynamically

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const isSegmentCompleted = (segment: Segment) => {
    return segment.questions.every((question: Question) => {
      // Check if the question is compulsory and whether it has an answer
      return question.ignore === true || !!answers[question.id];
    });
  };

  const handleAutoFillChange = (
    questionId: string,
    value: string,
    questionnaireData: Segment[], // Accepting the correct type here
    currentAnswers: Record<string, string>, // The state holding answers
    setAnswers: (answers: Record<string, string>) => void, // Function to update answers state
  ) => {
    // Clone current answers to avoid direct mutation
    const updatedAnswers = { ...currentAnswers, [questionId]: value };

    // Loop through all segments and their questions to find dependent questions
    questionnaireData.forEach((segment) => {
      segment.questions.forEach((question) => {
        if (question.dependsOn === questionId && question.autofill) {
          const autofillValue = question.autofill[value];
          if (autofillValue) {
            // Update the answer if an autofill value exists
            updatedAnswers[question.id] = autofillValue;
          } else {
            // Remove the dependent answer if no autofill value exists
            delete updatedAnswers[question.id];
          }
        }
      });
    });

    // Update the state with the new answers
    setAnswers(updatedAnswers);
  };

  const handleOptionChange = (
    questionId: string,
    value: string,
    currentAnswers: Record<string, string>,
    setAnswers: (answers: Record<string, string>) => void,
  ) => {
    handleAutoFillChange(questionId, value, questionnaireData, currentAnswers, setAnswers);
  };

  // Check if a question should be displayed based on its dependsOn and showWhen
  const shouldShowQuestion = (question: OtherQuestion): boolean => {
    if (question.dependsOn && question.showWhen) {
      const dependsOnAnswer = answers[question.dependsOn];
      return dependsOnAnswer === question.showWhen;
    }
    return true; // Always show if no dependsOn condition
  };

  // Function to store data in Firestore
  const storeFormData = async () => {
    console.log('A', projectId);
    if (!user || !projectId) {
      console.error('User is not authenticated or project ID is missing', projectId);
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
    setLoading(true);
    await storeFormData();
    console.log('B');
    // navigate(`${location.hash}/grossMargin`);
    navigate(`#newproject/${projectId}/grossMargin`);
    // navigate(`${location.hash.replace('revenue', 'grossMargin')}`);
  };
  // navigate(`${location.hash}/grossMargin`);
  const handlePreviousStep = async () => {
    navigate(`#newproject/${projectId}/general`);
    // navigate(`${location.hash.replace('revenue', 'general')}`);
    // await storeFormData();
    // navigate(`/#myprojects/${projectId}/questionnaire`)
    // navigate('#newproject/' + projectId + "/questionnaire");
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return !loading ? (
    <Box mt={5}>
      <Timeline currentStep={3} /> {/* Placeholder for the timeline component */}
      <Typography sx={{ marginTop: 6, marginX: 6, color: '#0D0D0D' }}>
        Now let us move ahead to building the business forecasts over next 5 years, to support the
        valuation estimation. In the next section, we will ask you to share information regarding
        the key drivers of revenues & costs and make reasonable assumptions of how these drivers are
        expected to move in the next 5 years.
      </Typography>
      <Typography sx={{ marginTop: 3, marginX: 6, color: '#0D0D0D' }}>
        If you have prepared the forecast information using our template, upload it here
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'left', marginTop: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleButtonClick}
          sx={{
            textTransform: 'none',
            fontSize: '16px',
            padding: '8px 16px',
            width: '200px',
            marginLeft: '45px',
          }}
        >
          <img src="/folder.png" alt="Upload File" style={{ marginRight: '12px' }} />
          Upload File
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Box>
      <div
        className=""
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          justifyContent: 'center',
          marginLeft: '-85px',
        }}
      >
        <Typography
          sx={{
            textTransform: 'none',
            fontSize: '14px',
            padding: '8px 24px',
            marginTop: '-70px',
            display: 'flex',
            alignItems: 'center',
            color: '#333',
            marginLeft: {
              xs: '0px',
              md: '360px',
            },
            justifyContent: {
              xs: 'flex-start',
              md: 'center',
            },
            position: 'relative',
            zIndex: 100,
            cursor: 'pointer',
          }}
        >
          <span
            // onClick={handleDownload}
            style={{
              color: '#007BFF',
            }}
          >
            Click here to download Valfiy Forecasts Template
          </span>
        </Typography>
      </div>
      <Typography sx={{ marginTop: 8, marginX: 6, color: 'primary.main', fontWeight: 'bold' }}>
        <h1 className="text-xl">Existing Revenues</h1>
      </Typography>
      <Typography sx={{ marginTop: 1, marginX: 6, color: '#3D3D3D' }}>
        <span className="text-[#51D3E1]">Existing Revenues</span> are revenue streams that are
        historically and currently operational.
      </Typography>
      <Typography sx={{ marginTop: 2, marginX: 6, color: '#3D3D3D' }}>
        Please identify such existing revenue streams for the subject company, and list them into 4
        main categories. You can categorize the revenue streams based on products/services, major
        clients or regions of operations. Add the names of these categories below.
      </Typography>
      <Typography sx={{ marginTop: 2, marginX: 6, fontWeight: 'bold', color: '#3D3D3D' }}>
        It is recommended to follow any one type of categorisation (either by product/service,
        clients or region). Avoid combining multiple categorisations for optimal analysis.
      </Typography>
      {questionnaireData.slice(0, 1).map((segment, segmentIndex) => {
        return (
          <Accordion key={segmentIndex} expanded={true}>
            {
              <>
                <AccordionDetails>
                  {segment.questions.map((question, questionIndex) => {
                    // Skip rendering if it's a dependent question and condition is not met
                    if (question.dependsOn && !shouldShowQuestion(question)) {
                      return null;
                    }
                    return (
                      <Box key={questionIndex} mb={3}>
                        <Grid container spacing={2}>
                          {question.type === 'table' ? (
                            <React.Fragment>
                              <Typography
                                variant="body1"
                                sx={{ color: 'primary.main', marginY: 3, marginLeft: 3 }}
                              >
                                {question.question}
                              </Typography>

                              {/* Table for 'table' type questions */}
                              {question.type === 'table' && <RevenueTables pId={pId} />}
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
                                {/* points */}
                                {hasPoints(question) && (
                                  <Typography sx={{ gap: 2, display: 'flex', flexDirection: 'column' }} gutterBottom>
                                    {question.points.split('\n').map((point, index) => {
                                      const parts = point.split(':'); // Split the heading and the content
                                      return (
                                        <span key={index} className='text-md '>
                                          {parts[0]}: {parts.slice(1).join('.')}
                                          <br />
                                        </span>
                                      );
                                    })}
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
                                {/* Select for 'mcq' type questions */}
                                {question.type === 'mcq' && question.options && (
                                  <FormControl component="fieldset">
                                    <RadioGroup
                                      row
                                      value={answers[question.id] || 'No'}
                                      onChange={(e) => {
                                        const selectedValue = e.target.value;

                                        // Handle option change to apply autofill logic for dependent dropdowns
                                        handleOptionChange(
                                          question.id,
                                          selectedValue,
                                          answers,
                                          setAnswers,
                                        );

                                        // If needed, handle other logic for MCQ
                                        handleChange(question.id, selectedValue);
                                      }}
                                      sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                      }}
                                    >
                                      {question.options.map((option, optionIndex) => (
                                        <FormControlLabel
                                          key={optionIndex}
                                          value={option}
                                          control={<Radio />}
                                          label={option}
                                        />
                                      ))}
                                    </RadioGroup>
                                    {answers[question.id] === 'Other' && (
                                      <TextField
                                        fullWidth
                                        label="Please specify"
                                        value={answers[`${question.id}_other`] || ''}
                                        onChange={(e) =>
                                          handleChange(`${question.id}_other`, e.target.value)
                                        }
                                      />
                                    )}
                                  </FormControl>
                                )}
                                {/* Select with others for 'mcq-other' type questions */}
                                {question.type === 'mcq-other' && question.options && (
                                  <FormControl>
                                    <RadioGroup
                                      value={answers[question.id] || ''}
                                      onChange={(e) => handleChange(question.id, e.target.value)}
                                    >
                                      {question.options.map((option, optionIndex) => (
                                        <FormControlLabel
                                          key={optionIndex}
                                          value={option}
                                          control={<Radio />}
                                          label={option}
                                        />
                                      ))}
                                      <FormControlLabel
                                        value="Other"
                                        control={<Radio />}
                                        label={
                                          <TextField
                                            label="Other"
                                            fullWidth
                                            value={answers[`${question.id}_other`] || ''}
                                            onChange={(e) =>
                                              handleChange(`${question.id}_other`, e.target.value)
                                            }
                                            variant="outlined"
                                            size="small"
                                          />
                                        }
                                      />
                                    </RadioGroup>
                                  </FormControl>
                                )}
                                {/* Dropdown for 'dropdown' type questions */}
                                {question.type === 'dropdown' && question.options && (
                                  <FormControl fullWidth variant="outlined">
                                    <Select
                                      value={answers[question.id] || ''}
                                      onChange={(e) => handleChange(question.id, e.target.value)}
                                      displayEmpty
                                    >
                                      <MenuItem value="" disabled>
                                        Select an option
                                      </MenuItem>
                                      {question.options.map((option, optionIndex) => (
                                        <MenuItem key={optionIndex} value={option}>
                                          {option}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    {answers[question.id] === 'Other' && (
                                      <TextField
                                        fullWidth
                                        label="Please specify"
                                        style={{ marginTop: '8px' }}
                                        value={answers[`${question.id}_other`] || ''}
                                        onChange={(e) =>
                                          handleChange(`${question.id}_other`, e.target.value)
                                        }
                                      />
                                    )}
                                  </FormControl>
                                )}
                                {/* Autocomplete for 'autocomplete' type questions */}
                                {question.type === 'autocomplete' && question.options && (
                                  <FormControl fullWidth variant="outlined">
                                    <Autocomplete
                                      value={answers[question.id] || ''}
                                      onChange={(_, newValue) =>
                                        handleChange(question.id, newValue || '')
                                      }
                                      options={question.options}
                                      getOptionLabel={(option) => option}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Select an option"
                                          variant="outlined"
                                          placeholder="Start typing..."
                                        />
                                      )}
                                    />
                                  </FormControl>
                                )}
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Box>
                    );
                  })}

                  {/* <Grid container justifyContent="flex-end" mt={2}>
                    <Button
                      variant="contained"
                      onClick={storeFormData} // Call storeSegmentData for the segment
                      // disabled={!isSegmentCompleted(segment)} // Disable if not completed
                    >
                      Next
                    </Button>
                  </Grid> */}
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
        <Button variant="contained" onClick={saveAndNext}>
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
  ) : (
    <CircularProgress />
  );
};

export default Revenue;
