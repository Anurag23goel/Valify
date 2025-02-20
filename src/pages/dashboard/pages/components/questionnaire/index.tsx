import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Grid,
  Select,
  MenuItem,
  Autocomplete,
  Snackbar,
  Alert,
  InputLabel,
  DialogActions,
  DialogContent,
  Dialog,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableHead,
  CircularProgress
} from '@mui/material';
import { auth, firestore, doc, setDoc, collection, getDoc } from 'firebase.ts'; // Firestore for storing data
import { User } from 'firebase/auth';
import Timeline from '../Timeline';
import * as XLSX from 'xlsx';


// Sample dynamic questionnaire data structure
const questionnaireData = [
  {
    segmentTitle: '1.0 Valuation Approach Test',
    questions: [
      {
        type: 'mcq-other',
        question:
          'Is the business a going concern? (I.e. Is the business expected to sustain for the foreseeable future?)',
        id: 'concern',
        questionName: 'Going Concern',
        options: ['Yes', 'No'],
      },
      {
        type: 'mcq-other',
        question: 'Can you provide financial forecasts of the business?',
        id: 'forecasts',
        questionName: 'Forecasts',
        options: ['Yes', 'No'],
      },
      {
        type: 'dropdown',
        question:
          'Which of the options best describe the current development stage of the business?',
        id: 'developmentPhase',
        questionName: 'Development Phase',
        options: ['Early-stage / Pre-revenue', 'Start-up', 'Growth', 'Mature Growth', 'Matured', 'Innovate or Decline'],
      },
    ],
  }
];

// Define the type for a question
interface QuestionBase {
  id: string;
  questionName: string;
  isCompulsory?: boolean; // This property should exist in every question
  type: string; // e.g., 'text', 'mcq', etc.
  question: string;
  options?: string[]; // Optional, for MCQ or dropdown types
  explanation?: string; // Optional
  ignore?: boolean; // Optional, if you need this property
}
interface QuestionWithPoints extends QuestionBase {
  points: string; // Only add `points` to types that should have it
}
type Question = QuestionBase | QuestionWithPoints;
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

interface QuestionnaireProps {
  pId?: string | null; // Allow projectId to be optional
}
type FileInputEvent = React.ChangeEvent<HTMLInputElement>;
type FileReaderEvent = ProgressEvent<FileReader>;

const Questionnaire: React.FC<QuestionnaireProps> = ({ pId }) => {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [user, setUser] = useState<User | null>(null);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string | null | undefined>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState(false); // State for the popup
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [tableAnswers, setTableAnswers] = useState<Record<string, string>>({});
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

  //update functions 
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  /* download fnc */
  const handleDownload = () => {
    // Path to the file in the public folder
    const fileUrl = '/hist-fin.xlsx';

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'hist-fin.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (e: FileInputEvent) => {
    const files = e.target.files;
    if (files && files[0] && user && projectId) {
      const reader = new FileReader();

      reader.onload = async (event: FileReaderEvent) => {
        if (event.target && event.target.result) {
          // Parse Excel file to JSON
          const data = event.target.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet);

          // Log the JSON data
          console.log('Excel Data:', json);

          try {
            // Store in Firebase under the project document
            const projectDocRef = doc(firestore, 'users', user.uid, 'projects', projectId);

            await setDoc(projectDocRef, {
              excelData: json, // Store the Excel data
              uploadTimestamp: new Date(),
              fileName: files[0].name
            }, { merge: true }); // Use merge to preserve existing document data

            console.log('Excel data successfully stored in Firebase');
            setOpenSnackbar(true); // Show success message to user

          } catch (error) {
            console.error('Error storing Excel data:', error);
            // Optionally show error message to user
          }
        }
      };

      reader.readAsArrayBuffer(files[0]);
    }
  };

  useEffect(() => {
    const checkAndUpdateProjectData = async () => {
      if (user && !projectId) {
        console.log("Hey Purush");
        console.log(user);
        
        const projectRef = doc(collection(firestore, 'users', user.uid, 'projects'));
        
        try {
          // Set default fields for a new project document
          await setDoc(
            projectRef,
            {
              projectId: projectRef.id,
              Status: 'Questionnaire',
              estimatedTime: '30 Days',
              Percentage: '10',
            },
            { merge: true }, // Merge with existing data if any
          );
          
          setProjectId(projectRef.id);
        } catch (error) {
          console.error('Error setting default project fields:', error);
        }
      }

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
      segment.questions.every((question) => {
        // Type guard to check if the question has an 'ignore' property
        if ('ignore' in question && question.ignore) {
          return true; // Skip ignored questions
        }
        // Ensure the question is answered
        return !!answers[question.id];
      }),
    );
    setIsFormComplete(isFormComplete);
  }, [answers, questionnaireData]);

  // Function to handle the change of answers dynamically
  const handleChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));

    // Check for the specific question and value
    if (questionId === 'concern' && value === 'No') {
      // Trigger popup first, then navigate with a slight delay
      setOpenPopup(true); // Show the popup
      setTimeout(() => {
        navigate('#myprojects'); // Navigate after a slight delay
      }, 10000); // Adjust delay if needed
    }
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

  // const saveAndNext = async () => {
  //   // setLoading(true);
  //   // await storeFormData();
  //   // navigate(`${location.hash.replace(projectId, "/general")}`);
  //    const currentPath = `#newprojects/${projectId}`; // Get current path
  //   const newPath = `#newprojects/${projectId}/general`; // Append '/general'
  //   console.log("cp",currentPath);
  //   console.log("np",newPath)
  //   await navigate(newPath);
  //   // Navigate to the new path
  //   // navigate(newPath);
  //   // router.push(newPath);
  // };
  // const saveAndNext = async () => {
  //   setLoading(true);
  //   // await storeFormData();
  //   // console.log(location.hash);
  //   // console.log(`#newproject/${projectId}questionnaire`);
  //   if(location.hash === `#newproject/${projectId}/questionnaire`){
  //     // console.log("Hello PKS");
  //     navigate(`${location.hash.replace('questionnaire', 'general')}`);
  //   }
  //   else{
  //     navigate(`${location.hash}/general`);
  //     console.log("Hello PKS2");

  //   }
  // };
  const saveAndNext = async () => {
    setLoading(true);
   await storeFormData();
   navigate(`#newproject/${projectId}/general`);
    // let newPath = "";
  
    // if (location.hash === `#newproject/${projectId}/questionnaire`) {
    //   newPath = location.hash.replace("questionnaire", "general");
    // } else {
    //   newPath = `#${location.hash}/${projectId}/general`;
    // }
  
    // console.log("Navigating to:", newPath);
    // navigate(newPath.replace("#", "")); // Remove "#" for react-router
  };



  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleChanges = (questionId: string, value: string) => {
    setTableAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  const handleDropdownChange = (questionId: string, value: string) => {
    // Ensure selectedOptions[questionId] is an array
    if (!selectedOptions[questionId]) {
      selectedOptions[questionId] = [];
    }

    // Check if the array has 3 or fewer selected countries
    if (selectedOptions[questionId].length < 3 && !selectedOptions[questionId].includes(value)) {
      setSelectedOptions((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), value],
      }));
    } else if (selectedOptions[questionId].length === 3) {
      // If there are already 3 countries selected, replace the first one with the fourth
      const updatedOptions = [...selectedOptions[questionId]];
      updatedOptions[0] = value; // Replace the first country with the selected value

      setSelectedOptions((prev) => ({
        ...prev,
        [questionId]: updatedOptions,
      }));
    }
  };

  const countryList = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
    'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
    'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso',
    'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
    'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Congo-Brazzaville)',
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia (Czech Republic)', 'Democratic Republic of the Congo',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini (fmr. "Swaziland")', 'Ethiopia', 'Fiji',
    'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
    'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland',
    'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
    'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kuwait',
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
    'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
    'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
    'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar (formerly Burma)', 'Namibia',
    'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia',
    'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
    'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
    'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
    'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste',
    'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];


  {/* Helper function to get the number of days in a month */ }
  const getDaysInMonth = (month: string, year?: number): number => {
    const monthMap: { [key: string]: number } = {
      'January': 31,
      'February': year && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 29 : 28,
      'March': 31,
      'April': 30,
      'May': 31,
      'June': 30,
      'July': 31,
      'August': 31,
      'September': 30,
      'October': 31,
      'November': 30,
      'December': 31
    };

    return monthMap[month] || 31;
  };

  return !loading ? (
    <Box sx={{
      mx: { xs: -8, md: 1 }, // Reduced margin on the x-axis for max-md screens
    }}>
      <Timeline currentStep={1} /> {/* Placeholder for the timeline component */}
      {
        questionnaireData.map((segment, segmentIndex) => {
          return (
            <Accordion key={segmentIndex} expanded={true}>
             

              {
                <>
                  <AccordionDetails>
                    {segment.questions.map((question, questionIndex) => (
                      <Box key={questionIndex} mb={3}>
                        <Grid container spacing={2} direction={{ xs: 'column', md: 'row' }}>
                          <Grid item xs={3}>
                            <Typography variant="body1" sx={{ color: 'primary.main' }}>
                              {question.questionName}
                            </Typography>
                          </Grid>
                          <Grid item xs={9}>
                            <Typography variant="body1" gutterBottom>
                              {question.question}
                            </Typography>
                            {question.explanation && (
                              <Typography
                                variant="body2"
                                sx={{ fontStyle: 'italic', color: 'gray' }}
                                gutterBottom
                              >
                                {question.explanation}
                              </Typography>
                            )}
                            {/* points */}
                            {hasPoints(question) && (
                              <Typography variant="body2" sx={{ color: 'black' }} gutterBottom>
                                {question.points.split('\n').map((point, index) => {
                                  const parts = point.split(':');
                                  return (
                                    <span key={index}>
                                      <strong>{parts[0]}.</strong> {parts.slice(1).join('.')}
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
                                  value={answers[question.id] || ''}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                  row
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
                            )}

                            {/* Select with others for 'mcq-other' type questions */}
                            {question.type === 'mcq-other' && question.options && (
                              <FormControl>
                                <RadioGroup
                                  row
                                  value={answers[question.id] || ''}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                  sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} // To ensure proper alignment
                                >
                                  {question.options.map((option, optionIndex) => (
                                    <FormControlLabel
                                      key={optionIndex}
                                      value={option}
                                      control={<Radio />}
                                      label={option}
                                      sx={{ mr: 3 }}
                                    />
                                  ))}
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
                              </FormControl>
                            )}

                            {/* Country dropdown */}
                            <>
                              {question.type === 'other-table' && question.options && (
                                <FormControl fullWidth variant="outlined">
                                  <Autocomplete
                                    value={tableAnswers[question.id] || ''}
                                    onChange={(e, newValue) => {
                                      console.log(e);
                                      handleChanges(question.id, newValue || '');
                                      handleDropdownChange(question.id, newValue || '');
                                    }}
                                    options={countryList}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        label="Select a Country"
                                        variant="outlined"
                                        fullWidth
                                      />
                                    )}
                                    disableClearable
                                    isOptionEqualToValue={(option, value) => option === value}
                                    getOptionLabel={(option) => option}
                                    filterOptions={(options, state) => options.filter((option) => option.toLowerCase().includes(state.inputValue.toLowerCase()))} // Filter options
                                    noOptionsText="No countries found"
                                    ListboxProps={{
                                      sx: {
                                        borderRadius: '8px',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#fff',
                                        maxHeight: '200px',
                                        width: '100%',
                                        marginTop: -3,
                                        marginLeft: '-24px'
                                      },
                                    }}
                                  />
                                </FormControl>
                              )}

                              {/* Render table only if options are selected for the current question */}
                              {selectedOptions[question.id]?.length > 0 && (
                                <TableContainer
                                  sx={{
                                    marginY: 2,
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                  }}
                                >
                                  <Table className="border-collapse border border-gray-300">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell
                                          style={{
                                            width: '220px',
                                            fontWeight: 'bold',
                                            color: '#0D0D0D',
                                            padding: '10px',
                                            borderRight: '1px solid #ccc',
                                          }}
                                        >
                                          Other Operating Regions
                                        </TableCell>
                                        <TableCell
                                          style={{
                                            width: '220px',
                                            fontWeight: 'bold',
                                            color: '#0D0D0D',
                                            padding: '10px',
                                          }}
                                        >
                                          Country name
                                        </TableCell>
                                        <TableCell
                                          style={{
                                            width: '240px',
                                            padding: '2px',
                                            textAlign: 'center',
                                            color: '#0D0D0D',
                                            borderLeft: '1px solid #ccc',
                                          }}
                                        >
                                          Average Revenue Contribution (%)
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {selectedOptions[question.id].map((option, index) => (
                                        <TableRow key={index} className="border-t border-b border-gray-200">
                                          <TableCell
                                            className="border-r border-gray-200"
                                            style={{
                                              width: '270px',
                                              color: '#0D0D0D',
                                              padding: '10px',
                                              borderRight: '1px solid #ccc',
                                            }}
                                          >
                                            {`Other Operating Region ${index + 1}`}
                                          </TableCell>

                                          <TableCell
                                            className="border-r border-gray-200"
                                            style={{
                                              width: '270px',
                                              color: '#0D0D0D',
                                              padding: '10px',
                                            }}
                                          >
                                            {option}
                                          </TableCell>
                                          <TableCell
                                            className="border-r border-gray-200"
                                            style={{
                                              width: '150px',
                                              padding: '2px',
                                              textAlign: 'center',
                                              color: '#0D0D0D',
                                              borderLeft: '1px solid #ccc',
                                            }}
                                          >
                                            <TextField
                                              variant="outlined"
                                              fullWidth
                                              value={tableAnswers[`revenue-${question.id}-${option}`] || ''}
                                              onChange={(e) =>
                                                setTableAnswers((prev) => ({
                                                  ...prev,
                                                  [`revenue-${question.id}-${option}`]: e.target.value,
                                                }))
                                              }
                                              type="number"
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
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              )}
                            </>
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

                            {/* Date for 'date' type questions */}
                            {question.type === 'date' && (
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Day"
                                    type="number"
                                    placeholder="Day"
                                    disabled
                                    value={
                                      answers[`${question.id}_month`]
                                        ? getDaysInMonth(
                                          answers[`${question.id}_month`],
                                          answers[`${question.id}_year`] ? parseInt(answers[`${question.id}_year`]) : undefined
                                        )
                                        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
                                    }

                                  />
                                </Grid>

                                <Grid item xs={4}>
                                  <Autocomplete
                                    options={[
                                      'January', 'February', 'March', 'April', 'May', 'June',
                                      'July', 'August', 'September', 'October', 'November', 'December'
                                    ]}
                                    getOptionLabel={(option) => option}
                                    value={answers[`${question.id}_month`] || new Date().toLocaleString('default', { month: 'long' })}
                                    onChange={(_, newValue) =>
                                      handleChange(`${question.id}_month`, newValue ?? '')
                                    }
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        label="Month"
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                          ...params.InputProps,
                                          sx: { height: '42px' },
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
                                    inputProps={{ min: 1900, max: new Date().getFullYear() }}
                                    value={answers[`${question.id}_year`] || new Date().getFullYear()}
                                    onChange={(e) => handleChange(`${question.id}_year`, e.target.value)}
                                  />
                                </Grid>
                              </Grid>
                            )}
                            {question.type === 'month' && (
                              <FormControl fullWidth variant="outlined">
                                <InputLabel>Duration</InputLabel>
                                <Select
                                  value={answers[question.id] || ''}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                  label="Duration"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                                    <MenuItem key={month} value={month}>
                                      {month} {month === 1 ? 'month' : 'months'}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          </Grid>
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
        })
      }

      <Grid container justifyContent="space-evenly" mt={2}>
        {/* Previous Button */}
        <Button
          variant="outlined"
          disabled
          sx={{ color: 'black', paddingX: 8, border: 1, borderColor: 'primary.main' }}
        // onClick={handlePreviousStep}
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
      {/* popup for concern */}
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
        <DialogTitle align='center' style={{
          fontWeight: 'bold',
          color: '#0D0D0D'
        }}>Notice</DialogTitle>
        <DialogContent>
          <Typography style={{
            color: '#0D0D0D'
          }}>
            Hello! Please note that Valify generates valuations for going-concern businesses only.
            Since the specified business is not expected to continue in future, we cannot consider
            any future cash flows to contribute to the business value. Thus, the most appropriate
            way to value such a business would be the net gain from liquidating assets. This is
            known as the liquidation method of business valuation, which requires a case-by-case
            asset analysis.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#51D3E1',
              borderRadius: '0.375rem',
            }}
          >
            <Button
              onClick={() => {
                setOpenPopup(false);
                navigate('#myprojects');
              }}
              sx={{
                backgroundColor: '#51D3E1',
                color: 'Black',
                padding: '8px 16px',
              }}
            >
              Okay, I understand!
            </Button>
          </Box>

        </DialogActions>
      </Dialog>
    </Box >
  ) : (<CircularProgress />);
};

export default Questionnaire;
