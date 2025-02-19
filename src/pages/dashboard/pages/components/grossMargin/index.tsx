import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Accordion,
  //   AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  // FormControl,
  // FormControlLabel,
  // RadioGroup,
  // Radio,Gross Margin Information
  Button,
  Grid,
  // Select,
  // MenuItem,
  Autocomplete,
  Snackbar,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { auth, firestore, doc, setDoc, getDoc } from 'firebase.ts'; // Firestore for storing data
import { User } from 'firebase/auth';
import Timeline from '../Timeline';

// Sample dynamic questionnaire data structure
const questionnaireData = [
  {
    segmentTitle: '3. Gross Margin Information',
    questions: [
      {
        type: 'table',
        question: 'Gross Margin for Existing Streams',
        questionName: 'Existing Streams Gross Margin Table',
        id: 'existingStreamsGrossMargin',
        rows: [
          { label: 'Existing Stream 1' },
          { label: 'Existing Stream 2' },
          { label: 'Existing Stream 3' },
          { label: 'Existing Stream 4' },
        ],
        columns: ['Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        ignore: true,
      },
      {
        type: 'table',
        question: 'Gross Margin for Pipeline Streams',
        questionName: 'Pipeline Streams Gross Margin Table',
        id: 'pipelineStreamsGrossMargin',
        rows: [
          { label: 'Pipeline Stream 1' },
          { label: 'Pipeline Stream 2' },
          { label: 'Pipeline Stream 3' },
          { label: 'Pipeline Stream 4' },
        ],
        ignore: true,
        columns: ['Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      },
      {
        type: 'table',
        question: 'Gross Margin for Potential Streams',
        questionName: 'Potential Streams Gross Margin Table',
        id: 'potentialStreamsGrossMargin',
        rows: [
          { label: 'Potential Stream 1' },
          { label: 'Potential Stream 2' },
          { label: 'Potential Stream 3' },
          { label: 'Potential Stream 4' },
        ],
        columns: ['Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
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
  label: string; // Label for the row
}

// Define the type for a segment
interface Segment {
  segmentTitle: string;
  questions: Question[];
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
      console.log("Hey PKS");
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
              updateFields['Estimated time to completion'] = '3 Days';
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
    navigate(`${location.hash.replace('grossMargin', 'operatingExpenses')}`);
  };
  const handlePreviousStep = async () => {
    navigate(`${location.hash.replace('grossMargin', 'revenue')}`);
    // await storeFormData();
    // navigate(`/#myprojects/${projectId}/questionnaire`)
    // navigate('#newproject/' + projectId + "/questionnaire");
  };
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box mt={5}>
      <Timeline currentStep={4} /> {/* Placeholder for the timeline component */}
      {/* <Typography sx={{ marginTop: 5, marginX: 6 }}>
        Now let us move ahead to building the business forecasts over next 5 years, to support the
        valuation estimation. In the next section, we will ask you to share information regarding
        the key drivers of revenues & costs and make reasonable assumptions of how these drivers are
        expected to move in the next 5 years.
      </Typography>
      <Typography sx={{ marginTop: 2, marginX: 6, color: 'primary.main', fontWeight: 'bold' }}>
        Existing Revenues
      </Typography>
      <Typography sx={{ marginTop: 2, marginX: 6 }}>
        "Existing revenues" include revenue streams that may be historically and currently
        operational and expected to sustain over atleast next 5 years.
      </Typography>
      <Typography sx={{ marginTop: 2, marginX: 6 }}>
        Please identify the existing revenue streams for the subject company, and categorize them
        into 4 main categories. You may categorize your revenue streams based on different
        products/services, major clients or different regions of operations. Add the names of these
        categories below.
      </Typography>
      <Typography sx={{ marginTop: 2, marginX: 6, fontWeight: 'bold' }}>
        It is recommended to follow any one type of categorisation (either by product/service,
        clients or region). Avoid combining multiple categorisations for optimal analysis.
      </Typography> */}
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
                    {segment.segmentTitle}
                  </Typography> */}
                  {segment.questions.map((question, questionIndex) => (
                    <Box key={questionIndex} mb={3}>
                      <Grid container spacing={2}>
                        {question.type === 'table' ? (
                          <React.Fragment>
                            <Typography
                              variant="body1"
                              sx={{ color: 'primary.main', marginY: 3, marginLeft: 3 }}
                            >
                              {question.questionName}
                            </Typography>
                            {/* Table for 'table' type questions */}
                            {(question as TableQuestion).type === 'table' &&
                              (question as TableQuestion).rows &&
                              (question as TableQuestion).columns && (
                                <TableContainer sx={{ marginY: 2 }}>
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
                                        </TableCell>{' '}
                                        {/* Content in the top left */}
                                        {(question as TableQuestion).columns.map(
                                          (column: string, colIndex: number) => (
                                            <TableCell
                                              align="center"
                                              key={colIndex}
                                              style={{ border: '1px solid #ccc', width: '150px' }}
                                            >
                                              {column}
                                            </TableCell>
                                          ),
                                        )}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(question as TableQuestion).rows.map(
                                        (row: { label: string }, rowIndex: number) => (
                                          <TableRow key={rowIndex}>
                                            <TableCell
                                              align="center"
                                              style={{ border: '1px solid #ccc', width: '150px' }}
                                            >
                                              {row.label}
                                            </TableCell>{' '}
                                            {/* Row Label */}
                                            {(question as TableQuestion).columns.map(
                                              (_, colIndex: number) => (
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
                                                      answers[
                                                      `${question.id}_${rowIndex}_${colIndex}`
                                                      ] || ''
                                                    }
                                                    onChange={(e) => handleChange(question.id, rowIndex, colIndex, e.target.value)}
                                                    // onChange={(e) =>
                                                    //   handleChange(
                                                    //     `${question.id}_${rowIndex}_${colIndex}`,
                                                    //     e.target.value,
                                                    //   )
                                                    // }
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
                              {/* 
                              {question.explanation && (
                                <Typography
                                  variant="body2"
                                  sx={{ fontStyle: 'italic', color: 'gray' }}
                                  gutterBottom
                                >
                                  {question.explanation}
                                </Typography>
                              )} */}

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
                              {/* {question.type === 'mcq' && question.options && (
                                <FormControl component="fieldset">
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
                                  </RadioGroup>
                                </FormControl>
                              )} */}

                              {/* Select with others for 'mcq-other' type questions */}
                              {/* {question.type === 'mcq-other' && question.options && (
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
                              )} */}

                              {/* Dropdown for 'dropdown' type questions */}
                              {/* {question.type === 'dropdown' && question.options && (
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
                                </FormControl>
                              )} */}

                              {/* Autocomplete for 'autocomplete' type questions */}
                              {/* {question.type === 'autocomplete' && question.options && (
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
                              )} */}

                              {/* Date for 'date' type questions */}
                              {question.type === 'date' && (
                                <Grid container spacing={2}>
                                  <Grid item xs={4}>
                                    <TextField
                                      fullWidth
                                      variant="outlined"
                                      label="Day"
                                      type="number"
                                      inputProps={{ min: 1, max: 31 }} // Constraints for the day input
                                      value={answers[`${question.id}_day`] || ''}
                                      onChange={(e) =>
                                        handleChange(`${question.id}_day`, e.target.value)
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Autocomplete
                                      options={[
                                        'January',
                                        'February',
                                        'March',
                                        'April',
                                        'May',
                                        'June',
                                        'July',
                                        'August',
                                        'September',
                                        'October',
                                        'November',
                                        'December',
                                      ]}
                                      getOptionLabel={(option) => option}
                                      value={answers[`${question.id}_month`] || ''}
                                      onChange={(_, newValue) =>
                                        handleChange(`${question.id}_month`, newValue ?? '')
                                      } // Use fallback to empty string if null
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Month"
                                          variant="outlined"
                                          fullWidth
                                          InputProps={{
                                            ...params.InputProps,
                                            sx: { height: '42px' }, // Ensure height matches other input fields
                                          }}
                                        />
                                      )}
                                    />
                                  </Grid>
                                  <Grid item xs={4}>
                                    <TextField
                                      fullWidth
                                      variant="outlined"
                                      label="Year"
                                      type="number"
                                      inputProps={{ min: 1900, max: new Date().getFullYear() }} // Constraints for the year input
                                      value={answers[`${question.id}_year`] || ''}
                                      onChange={(e) =>
                                        handleChange(`${question.id}_year`, e.target.value)
                                      }
                                    />
                                  </Grid>
                                </Grid>
                              )}

                              {/* Month for 'month' type questions */}
                              {question.type === 'month' && (
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  value={answers[question.id] || ''}
                                  inputProps={{ min: 1, max: 12 }}
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
                                              <TableCell>{row.label}</TableCell> {/* Row Label */}
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
                                                      onChange={(e) => handleChange(question.id, rowIndex, colIndex, e.target.value)}
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
        <Button variant="contained" onClick={saveAndNext} disabled={!isFormComplete}>
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

export default Revenue;
