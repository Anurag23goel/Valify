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
  CircularProgress,
} from '@mui/material';
import { auth, firestore, doc, setDoc, collection, getDoc } from 'firebase.ts'; // Firestore for storing data
import { User } from 'firebase/auth';
import Timeline from '../Timeline';
import * as XLSX from 'xlsx';
import { IconButton } from '@mui/material';

// Sample dynamic questionnaire data structure
const questionnaireData = [
  {
    segmentTitle: '1.1 Purpose of the exercise',
    questions: [
      {
        type: 'mcq-other',
        question: 'Please select your role with the subject company.',
        id: 'valuerType',
        questionName: 'Valuer Type',
        options: ['Management', 'Investor', 'Consultant', 'Other'],
      },
      {
        type: 'text',
        question: 'What is the official name of your company?',
        id: 'clientName',
        questionName: 'Client Name',
        explanation:
          'We are requesting the name of the firm you represent. It may not be the same as the subject company.',
      },
      {
        type: 'text',
        question: 'Please enter your full name & designation.',
        id: 'valuerName',
        questionName: 'Valuer Name',
        explanation: 'We will address your valuation report to this name.',
      },
      {
        type: 'mcq-other',
        question: 'What is your primary purpose of conducting this exercise?',
        id: 'purpose',
        questionName: 'Purpose',
        points: `A. Vendor Valuation: Select this if you are the seller (or potential seller) of share in a business. 
          B. Target Valuation: Select this if you are an investor looking to value a target business to buy.
          C. Management Valuation: Select this if you represent the business management and would like a valuation for internal decision-making.
          D. Other (please specify)`,
        options: ['Vendor Valuation', 'Target Valuation', 'Management Valuation', 'Other'],
      },
    ],
  },
  {
    segmentTitle: '1.2 Company Information',
    questions: [
      {
        type: 'mcq',
        question: 'Are you seeking a valuation of your own company?',
        id: 'check',
        questionName: 'Check',
        options: ['Yes', 'No'],
      },
      {
        type: 'text',
        question: 'What is the official name of the subject company to be valued?',
        id: 'subjectCompanyName',
        questionName: 'Subject Company Name',
      },
      {
        type: 'text',
        question: 'Enter a short name for the subject company.',
        id: 'shortName',
        questionName: 'Short Name',
      },
    ],
  },

  {
    segmentTitle: '1.3 Dates Information',
    questions: [
      {
        type: 'date',
        question: 'Please enter the date as at which you would like to conduct this valuation.',
        explanation:
          "Please note that this may not be today's date. The valuation date is the date to which you have the latest actual business financial performance which is ideally the most recent month-end.",
        id: 'valuationDate',
        questionName: 'Valuation Date',
        ignore: true,
      },
      {
        type: 'date',
        question: ' What is the next financial year end for the business?',
        id: 'nextFiscalYearEndDate',
        questionName: 'Next fiscal year end date',
        ignore: true,
      },

      {
        type: 'month',
        question: 'How many months have passed since the start of your new financial year?',
        id: 'ytd',
        questionName: 'YTD months - from start of the year till today',
      },

      {
        type: 'mcq',
        question:
          'We will now forecast business performance for the remaining months of this year ("Year to Go"). In the coming sections, we will gather current year budgets of the business, which will serve as a basis for estimating remaining months performance. Please select the forecast approach you prefer:',
        id: 'ytgApproach',
        questionName: 'Year-to-Go Approach',
        explanation: `NOTE: Some businesses are volatile and it is difficult to forecast performance and budgets cannot be maintained. In such cases, you can use a reasonable annual revenue target as a starting point, and proportion for remaining months (Select option 2). Don't worry about the risk of uncertainity - this will be captured at a later stage.`,
        points: `1. YTD Annualized (Default): Select this option if you prefer to forecast performance of upcoming months based on previous months of the year (at the same rate as previous months).

        2. Management Monthly Budget: Select this option if you prefer the remaining months to be forecasted in line with the original monthly budgets, irrespective of previous months' actual performance.

        3. Catch-up Approach: Select this option if the business has under-performed or over-performed the budget in previous months, and you expect the business to catch up in coming months and meet the annual targets budgeted for the current year.
`,

        options: ['YTD Anualized', 'Management FY Estimate', 'Catch-up Approach'],
      },
    ],
  },
  {
    segmentTitle: '1.4 Currency Information',
    questions: [
      {
        type: 'dropdown',
        question: 'Please select the currency of the financial information you will provide.',
        id: 'informationCurrency',
        options: ['USD', 'AED', 'EUR', 'SAR', 'CAD', 'INR', 'GBP'],
        questionName: 'Information Currency',
      },
      {
        type: 'dropdown',
        question:
          'Please select the currency in which you would like us to generate the valuation analysis.',
        id: 'presentationCurrency',
        options: ['USD', 'AED', 'EUR', 'SAR', 'CAD', 'INR', 'GBP'],
        questionName: 'Presentation Currency',
      },
      {
        type: 'dropdown',
        question:
          'Please select the unit of currency (eg: "USD million" or "AED 000s"), in which you would like us to generate the valuation analysis.',
        id: 'units',
        questionName: 'Currency Denomination (Units)',
        options: [`USD million`, `USD 000s`],
        explanation:
          'To ensure clean, legible outputs, it is best to avoid unit metrics unless the business financials are within 4 digits.',
      },
    ],
  },
  {
    segmentTitle: '1.5 Business Information',
    questions: [
      {
        type: 'text',
        question:
          'What is the approximate average annual revenue of the company over last 3-5 years in USD Mn. If historic revenue is volatile, mention the most recent actual or estimate annual revenue. If actual revenue is unavailable, mention a revenue estimate.',
        id: 'avgAnnualRevenue',
        questionName: 'Average Annual Revenue',
        explanation:
          '(Note: This question is purely for size reference only, thus an estimation is sufficient.)',
      },
      {
        type: 'dropdown',
        question:
          "Select the most relevant industry for the company's primary business operations.",
        id: 'industryPrimaryBusiness',
        questionName: 'Industry - Primary Business',
        options: [
          'Advertising',
          'Aerospace/Defense',
          'Air Transport',
          'Apparel',
          'Auto & Truck',
          'Auto Parts',
          'Bank (Money Center)',
          'Banks (Regional)',
          'Beverage (Alcoholic)',
          'Beverage (Soft)',
          'Broadcasting',
          'Brokerage & Investment Banking',
          'Building Materials',
          'Business & Consumer Services',
          'Cable TV',
          'Chemical (Basic)',
          'Chemical (Diversified)',
          'Chemical (Specialty)',
          'Coal & Related Energy',
          'Computer Services',
          'Computers/Peripherals',
          'Construction Supplies',
          'Diversified',
          'Drugs (Biotechnology)',
          'Drugs (Pharmaceutical)',
          'Education',
          'Electrical Equipment',
          'Electronics (Consumer & Office)',
          'Electronics (General)',
          'Engineering/Construction',
          'Entertainment',
          'Environmental & Waste Services',
          'Farming/Agriculture',
          'Financial Svcs. (Non-bank & Insur)',
          'Food Processing',
          'Food Wholesalers',
          'Furn/Home Furnishings',
          'Green & Renewable Energy',
          'Healthcare Products',
          'Healthcare Support Services',
          'Healthcare Information and Techno',
          'Homebuilding',
          'Hospitals/Healthcare Facilities',
          'Hotel/Gaming',
          'Household Products',
          'Information Services',
          'Insurance (General)',
          'Insurance (Life)',
          'Insurance (Prop/Cas.)',
          'Investments & Asset Management',
          'Machinery',
          'Metals & Mining',
          'Office Equipment & Services',
          'Oil/Gas (Integrated)',
          'Oil/Gas (Production and Exploration)',
          'Oil/Gas Distribution',
          'Oilfield Svcs/Equip.',
          'Packaging & Container',
          'Paper/Forest Products',
          'Power',
          'Precious Metals',
          'Publishing & Newspapers',
          'R.E.I.T.',
          'Real Estate (Development)',
          'Real Estate (General/Diversified)',
          'Real Estate (Operations & Service)',
          'Recreation',
          'Reinsurance',
          'Restaurant/Dining',
          'Retail (Automotive)',
          'Retail (Building Supply)',
          'Retail (Distributors)',
          'Retail (General)',
          'Retail (Grocery and Food)',
          'Retail (REITs)',
          'Retail (Special Lines)',
          'Rubber & Tires',
          'Semiconductor',
          'Semiconductor Equip',
          'Shipbuilding & Marine',
          'Shoe',
          'Software (Entertainment)',
          'Software (Internet)',
          'Software (System & Application)',
          'Steel',
          'Telecom (Wireless)',
          'Telecom. Equipment',
          'Telecom. Services',
          'Tobacco',
          'Transportation',
          'Transportation (Railroads)',
          'Trucking',
          'Utility (General)',
          'Utility (Water)',
        ],
      },
      {
        type: 'text',
        question:
          'If relevant, specify a sub-industry for the primary business otherwise write N/A',
        id: 'subindustryPrimaryBusiness',
        questionName: 'Sub-industry - Primary Business',
      },
      {
        type: 'dropdown',
        question:
          'Please select one or more from the below that most accurately describe the nature of your business(es) : ',
        id: 'primaryBusiness',
        questionName: 'Nature of Primary Business',
        options: [
          'Retailer',
          'Wholesaler',
          'Distributor',
          'Manufacturer',
          'Estate Owner',
          'Agent/Broker',
          'Investor',
          'Service Provider',
          'Other',
        ],
      },
      {
        type: 'text',
        question:
          'Please mention 3-5 key words that describe the exact nature of the business within the industry.',
        explanation:
          'These key words will be used to screen the most relevant comparable companies in the market for benchmarking analysis. For example, to describe Tesla Motors, you would say- "B2C" "electric vehicle", "car manufacturer"  - now if we could describe your business , how would u describe.',
        id: 'primaryBusinessDescription',
        questionName: 'Primary Business description (key words)',
      },
      {
        type: 'other-table',
        question: 'Please select the main operating region for the business.',
        id: 'primaryRegions',
        questionName: 'Main operating regions - Primary',
        options: ['Yes', 'No', 'Sii', 'Albania', 'yup'],
      },
      {
        type: 'other-table',
        question:
          'Please select upto 3 other operating regions for the business, if relevant. If so, enter approximate revenue contribution from each added region.',
        id: 'otherRegions',
        questionName: 'Other operating regions - Primary',
        options: ['Yes', 'No', 'Sii', 'Albania', 'yup'],
        ignore: true,
      },
      {
        type: 'mcq',
        question:
          'Does the business currently / intend to venture into a different business line? If yes, answer the below 3 questions.',
        id: 'secondaryBusinessCheck',
        options: ['Yes', 'No'],
        questionName: 'Secondary Business Check',
      },
      {
        type: 'dropdown',
        question:
          "Select the most relevant industry for the company's secondary business operations.",
        id: 'industrySecondaryBusiness',
        questionName: 'Industry - Secondary Business',
        options: [
          'Advertising',
          'Aerospace/Defense',
          'Air Transport',
          'Apparel',
          'Auto & Truck',
          'Auto Parts',
          'Bank (Money Center)',
          'Banks (Regional)',
          'Beverage (Alcoholic)',
          'Beverage (Soft)',
          'Broadcasting',
          'Brokerage & Investment Banking',
          'Building Materials',
          'Business & Consumer Services',
          'Cable TV',
          'Chemical (Basic)',
          'Chemical (Diversified)',
          'Chemical (Specialty)',
          'Coal & Related Energy',
          'Computer Services',
          'Computers/Peripherals',
          'Construction Supplies',
          'Diversified',
          'Drugs (Biotechnology)',
          'Drugs (Pharmaceutical)',
          'Education',
          'Electrical Equipment',
          'Electronics (Consumer & Office)',
          'Electronics (General)',
          'Engineering/Construction',
          'Entertainment',
          'Environmental & Waste Services',
          'Farming/Agriculture',
          'Financial Svcs. (Non-bank & Insur)',
          'Food Processing',
          'Food Wholesalers',
          'Furn/Home Furnishings',
          'Green & Renewable Energy',
          'Healthcare Products',
          'Healthcare Support Services',
          'Healthcare Information and Techno',
          'Homebuilding',
          'Hospitals/Healthcare Facilities',
          'Hotel/Gaming',
          'Household Products',
          'Information Services',
          'Insurance (General)',
          'Insurance (Life)',
          'Insurance (Prop/Cas.)',
          'Investments & Asset Management',
          'Machinery',
          'Metals & Mining',
          'Office Equipment & Services',
          'Oil/Gas (Integrated)',
          'Oil/Gas (Production and Exploration)',
          'Oil/Gas Distribution',
          'Oilfield Svcs/Equip.',
          'Packaging & Container',
          'Paper/Forest Products',
          'Power',
          'Precious Metals',
          'Publishing & Newspapers',
          'R.E.I.T.',
          'Real Estate (Development)',
          'Real Estate (General/Diversified)',
          'Real Estate (Operations & Service)',
          'Recreation',
          'Reinsurance',
          'Restaurant/Dining',
          'Retail (Automotive)',
          'Retail (Building Supply)',
          'Retail (Distributors)',
          'Retail (General)',
          'Retail (Grocery and Food)',
          'Retail (REITs)',
          'Retail (Special Lines)',
          'Rubber & Tires',
          'Semiconductor',
          'Semiconductor Equip',
          'Shipbuilding & Marine',
          'Shoe',
          'Software (Entertainment)',
          'Software (Internet)',
          'Software (System & Application)',
          'Steel',
          'Telecom (Wireless)',
          'Telecom. Equipment',
          'Telecom. Services',
          'Tobacco',
          'Transportation',
          'Transportation (Railroads)',
          'Trucking',
          'Utility (General)',
          'Utility (Water)',
        ],
      },
      {
        type: 'text',
        question: 'If relevant, specify a sub-industry for your secondary business.',
        id: 'subindustrySecondaryBusiness',
        questionName: 'Sub-industry - Secondary Business',
      },
      {
        type: 'dropdown',
        question:
          'Please select one or more from the below that most accurately describe the nature of your secondary business(es):',
        id: 'secondaryBusiness',
        questionName: 'Nature of Secondary Business',
        options: [
          'Retailer',
          'Wholesaler',
          'Distributor',
          'Manufacturer',
          'Estate Owner',
          'Agent/Broker',
          'Investor',
          'Service Provider',
          'Other',
        ],
      },
      {
        type: 'text',
        question:
          'Please mention 3-5 key words that describe the exact nature of the secondary business within the industry.',
        explanation:
          'These key words will be used to screen the most relevant comparable companies in the market for benchmarking analysis. For example, to describe Tesla Motors, you would say- "B2C" "electric vehicle", "car manufacturer".',
        id: 'secondaryBusinessDescription',
        questionName: 'Secondary Business description (key words)',
      },
      {
        type: 'other-table',
        question: 'Please select the main operating region for the secondary business.',
        id: 'secondaryRegions',
        questionName: 'Main Operating regions - Secondary',
        options: ['Yes', 'No', 'Sii', 'Albania', 'yup'],
      },

      {
        type: 'other-table',
        question:
          'Please select upto 3 other operating regions for the secondary business, if relevant. If so, enter approximate revenue contribution from each added region.',
        id: 'otherOperatingRegionsSecondary',
        questionName: 'Other operating regions - Secondary',
        options: ['Yes', 'No', 'Sii', 'suiii', 'yup'],
        ignore: true,
      },

      {
        type: 'text',
        question:
          'Please estimate the average revenue contribution from secondary business (in %).',
        id: 'revenueContributionSecondaryBusiness',
        questionName: 'Revenue contribution - Secondary Business',
      },
    ],
  },
  {
    segmentTitle: '1.6 Historical Data',
    questions: [
      {
        type: 'mcq',
        question: 'Does the company have operating and financial history?',
        id: 'existingBusinessCheck',
        questionName: 'Existing Business check',
        options: ['Yes', 'No'],
      },
      {
        type: 'text',
        question: `If yes, please share the company's financial statements (to the extent available) for the last 3 years using the provided "Historical Financial Information" template. If you have financial information for less than 3 years, or incomplete statements, please use the provided template to populate the data which is available.`,
        id: 'historicalFinancialInformation',
        questionName: 'Historical Financial Information',
        ignore: true,
      },
    ],
  },
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

const General: React.FC<QuestionnaireProps> = ({ pId }) => {
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
  const [expandedSegments, setExpandedSegments] = useState<boolean[]>(
    Array(questionnaireData.length).fill(true),
  );

  const handleToggleAccordion = (index: number) => {
    setExpandedSegments((prev) => prev.map((expanded, i) => (i === index ? !expanded : expanded)));
  };

  const handleNext = async (segmentIndex: number) => {
    await storeFormData(); // Save form data
    setExpandedSegments((prev) =>
      prev.map((expanded, i) => (i === segmentIndex ? false : expanded)),
    );
  };

  const ExpandMoreIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ExpandLessIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 15L12 9L18 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

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
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet);

          // Log the JSON data
          console.log('Excel Data:', json);

          try {
            // Store in Firebase under the project document
            const projectDocRef = doc(firestore, 'users', user.uid, 'projects', projectId);

            await setDoc(
              projectDocRef,
              {
                excelData: json, // Store the Excel data
                uploadTimestamp: new Date(),
                fileName: files[0].name,
              },
              { merge: true },
            ); // Use merge to preserve existing document data

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
        const projectRef = doc(collection(firestore, 'users', user.uid, 'projects'));

        try {
          // Set default fields for a new project document
          await setDoc(
            projectRef,
            {
              projectId: projectRef.id,
              Status: 'Initial questionnaire',
              estimatedTime: '30 Days',
              Percentage: '10',
            },
            { merge: true }, // Merge with existing data if any
          );
          console.log('Project created with default fields.');
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
    if (questionId === 'check' && value === 'Yes') {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: value,
        ['subjectCompanyName']: answers['clientName'],
        ['shortName']: answers['valuerName'],
      }));
    } else if (questionId === 'informationCurrency') {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: value,
        ['presentationCurrency']: value,
      }));
    } else {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: value,
        ...(value === 'Other' && { [`${questionId}_other`]: '' }),
      }));
    }
    console.log(answers);
    // Check for the specific question and value
    if (questionId === 'concern' && value === 'Yes') {
      // Trigger popup first, then navigate with a slight delay
      setOpenPopup(true); // Show the popup
      setTimeout(() => {
        navigate('#myprojects'); // Navigate after a slight delay
      }, 10000); // Adjust delay if needed
    }
  };

  const handleOtherChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${questionId}_other`]: value,
    }));
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
    setLoading(true);
    await storeFormData();
    navigate(`#newproject/${projectId}/revenue`);
    // navigate(`${location.hash.replace('general', 'revenue')}`);
  };

  const handlePreviousStep = async () => {
    // setLoading(true);
    // await storeFormData();
    navigate(`#newproject/${projectId}/questionnaire`);
    // navigate(`${location.hash.replace('general', 'questionnaire')}`);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleChanges = (questionId: string, value: string, index: number) => {
    // setTableAnswers((prev) => ({ ...prev, [questionId]: value }));
    setAnswers((prev) => ({
      ...prev,
      [`${questionId}Value${index + 1}`]: value, // Store revenue with unique key
    }));
  };

  // const handleDropdownChange = (questionId: string, value: string, index: number) => {
  //   // Ensure selectedOptions[questionId] is an array
  //   if (!selectedOptions[questionId]) {
  //     selectedOptions[questionId] = [];
  //   }
  //   setAnswers((prev) => ({
  //     ...prev,
  //     [`${questionId}Name${index + 1}`]: value, // Store country with unique key
  //   }));

  //   // Check if the array has 3 or fewer selected countries
  //   if (selectedOptions[questionId].length < 3 && !selectedOptions[questionId].includes(value)) {

  //     // setSelectedOptions((prev) => ({
  //     //   ...prev,
  //     //   [questionId]: [...(prev[questionId] || []), value],
  //     // }));
  //     setSelectedOptions((prev) => {
  //       const prevOptions = prev[questionId] || [];
  //       if (!prevOptions.includes(value) && prevOptions.length < 3) {
  //         return { ...prev, [questionId]: [...prevOptions, value] };
  //       }
  //       return prev;
  //     });

  //   } else if (selectedOptions[questionId].length === 3) {
  //     // If there are already 3 countries selected, replace the first one with the fourth
  //     const updatedOptions = [...selectedOptions[questionId]];
  //     updatedOptions[0] = value; // Replace the first country with the selected value

  //     setSelectedOptions((prev) => ({
  //       ...prev,
  //       [questionId]: updatedOptions,
  //     }));
  //   }
  // };

  const handleDropdownChange = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const existingRegions = Object.keys(prev)
        .filter((key) => key.startsWith(`${questionId}Name`)) // Get already selected regions
        .map((key) => prev[key]);

      if (existingRegions.includes(value) || existingRegions.length >= 3) {
        return prev; // Prevent duplicate selections and limit to 3
      }

      const newIndex = existingRegions.length + 1; // Determine index for new selection

      return {
        ...prev,
        [`${questionId}Name${newIndex}`]: value, // Store region name
      };
    });
  };

  const countryList = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo (Congo-Brazzaville)',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czechia (Czech Republic)',
    'Democratic Republic of the Congo',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini (fmr. "Swaziland")',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Korea, North',
    'Korea, South',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar (formerly Burma)',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Timor-Leste',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
  ];

  {
    /* Helper function to get the number of days in a month */
  }
  const getDaysInMonth = (month: string, year?: number): number => {
    const monthMap: { [key: string]: number } = {
      January: 31,
      February: year && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28,
      March: 31,
      April: 30,
      May: 31,
      June: 30,
      July: 31,
      August: 31,
      September: 30,
      October: 31,
      November: 30,
      December: 31,
    };

    return monthMap[month] || 31;
  };

  return !loading ? (
    <Box
      sx={{
        mx: { xs: -8, md: 1 }, // Reduced margin on the x-axis for max-md screens
      }}
    >
      <Timeline currentStep={2} /> {/* Placeholder for the timeline component */}
      {questionnaireData.map((segment, segmentIndex) => {
        return (
          <Accordion key={segmentIndex} expanded={expandedSegments[segmentIndex]}>
            <AccordionSummary
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  borderRadius: '5px',

                  bgcolor: isSegmentCompleted(segment) ? 'primary.main' : 'grey.400',
                  '&:hover': {
                    bgcolor: isSegmentCompleted(segment) ? 'primary.main' : 'grey.400',
                  },
                }}
              >
                <Button
                  disabled={!isSegmentCompleted(segment)}
                  variant="contained"
                  sx={{
                    width: '100%',
                    borderRadius: '5px',
                    bgcolor: isSegmentCompleted(segment) ? 'primary.main' : 'grey.400',
                    '&:hover': {
                      bgcolor: isSegmentCompleted(segment) ? 'primary.main' : 'grey.500',
                    },
                    textAlign: 'left',
                    padding: '8px 16px',
                    display: 'flex',
                    justifyContent: 'flex-start',
                  }}
                >
                  {segment.segmentTitle}
                </Button>

                <IconButton onClick={() => handleToggleAccordion(segmentIndex)} size="small">
                  {expandedSegments[segmentIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </AccordionSummary>

            {
              <>
                <AccordionDetails>
                  {segment.questions.map((question, questionIndex) => (
                    <Box key={questionIndex} mb={3}>
                      {(!answers['existingBusinessCheck'] ||
                        answers['existingBusinessCheck'] === 'No') &&
                      question.id === 'historicalFinancialInformation' ? (
                        <div></div>
                      ) : (
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
                              <Typography
                                variant="body2"
                                sx={{ color: 'black', paddingLeft: '16px' }}
                                gutterBottom
                              >
                                {question.points.split('\n').map((point, index) => {
                                  const parts = point.split(':');
                                  return (
                                    <span key={index}>
                                      <strong>{parts[0]}</strong> {parts.slice(1).join('.')}
                                      <br />
                                    </span>
                                  );
                                })}
                              </Typography>
                            )}

                            {/* Text for 'text' type questions */}
                            {question.type === 'text' &&
                              (question.id === 'primaryBusinessDescription' ||
                              question.id === 'secondaryBusinessDescription' ? (
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  value={answers[question.id] || ''}
                                  onChange={(e) => {
                                    const words = e.target.value.split(/\s+/).filter(Boolean); // Split by spaces and remove empty entries
                                    if (words.length <= 15) {
                                      handleChange(question.id, e.target.value);
                                    }
                                  }}
                                />
                              ) : (
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  value={answers[question.id] || ''}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                />
                              ))}

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
                                  row
                                  value={answers[question.id] || ''}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }} // To ensure proper alignment
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
                                {answers[question.id] === 'Other' && (
                                  <TextField
                                    fullWidth
                                    placeholder="Please specify"
                                    value={answers[`${question.id}_other`] || ''}
                                    onChange={(e) =>
                                      handleChange(`${question.id}_other`, e.target.value)
                                    }
                                  />
                                )}
                              </FormControl>
                            )}

                            {/* Dropdown for 'dropdown' type questions */}
                            {question.type === 'dropdown' &&
                              question.options &&
                              (question.id === 'units' ? (
                                <FormControl fullWidth variant="outlined">
                                  <Select
                                    value={answers[question.id] || ''}
                                    onChange={(e) => handleChange(question.id, e.target.value)}
                                    displayEmpty
                                  >
                                    <MenuItem value="" disabled>
                                      Select an option
                                    </MenuItem>
                                    {[
                                      `${answers['presentationCurrency']} million`,
                                      `${answers['presentationCurrency']} 000s`,
                                    ].map((option, optionIndex) => (
                                      <MenuItem key={optionIndex} value={option}>
                                        {option}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              ) : (
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
                                      placeholder="Please specify"
                                      style={{ marginTop: '4px' }}
                                      value={answers[`${question.id}_other`] || ''}
                                      onChange={(e) =>
                                        handleChange(`${question.id}_other`, e.target.value)
                                      }
                                    />
                                  )}
                                </FormControl>
                              ))}

                            {/* Country dropdown */}
                            <>
                              {question.type === 'other-table' && question.options && (
                                <FormControl fullWidth variant="outlined">
                                  {question.id === 'secondaryRegions' ? (
                                    <Autocomplete
                                      multiple
                                      value={Object.keys(answers)
                                        .filter((key) => key.startsWith(`${question.id}Name`))
                                        .map((key) => answers[key])}
                                      onChange={(event, newValues) => {
                                        setAnswers((prev) => {
                                          const updatedAnswers = { ...prev };
                                          newValues.slice(0, 3).forEach((value, index) => {
                                            updatedAnswers[`${question.id}Name${index + 1}`] =
                                              value;
                                          });
                                          return updatedAnswers;
                                        });
                                      }}
                                      options={countryList.filter((country) =>
                                        answers['secondaryRegionsName1'] &&
                                        answers['secondaryRegionsName1'].trim() !== ''
                                          ? country !== answers['secondaryRegionsName1']
                                          : true,
                                      )}
                                      disableClearable
                                      isOptionEqualToValue={(option, value) => option === value}
                                      getOptionLabel={(option) => option}
                                      filterOptions={(options, state) =>
                                        options.filter((option) =>
                                          option
                                            .toLowerCase()
                                            .includes(state.inputValue.toLowerCase()),
                                        )
                                      } // Filter options
                                      noOptionsText="No countries found"
                                      ListboxProps={{
                                        sx: {
                                          borderRadius: '8px',
                                          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                          backgroundColor: '#fff',
                                          maxHeight: '200px',
                                          width: '100%',
                                          marginTop: -3,
                                          marginLeft: '-24px',
                                        },
                                      }}
                                      renderTags={() => null}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label={
                                            question.id === 'secondaryRegions'
                                              ? 'Select Country'
                                              : 'Select up to 3 Countries'
                                          }
                                          variant="outlined"
                                          fullWidth
                                        />
                                      )}
                                    />
                                  ) : (
                                    <Autocomplete
                                      multiple
                                      value={Object.keys(answers)
                                        .filter((key) => key.startsWith(`${question.id}Name`))
                                        .map((key) => answers[key])}
                                      onChange={(event, newValues) => {
                                        setAnswers((prev) => {
                                          const updatedAnswers = { ...prev };
                                          newValues.slice(0, 3).forEach((value, index) => {
                                            updatedAnswers[`${question.id}Name${index + 1}`] =
                                              value;
                                          });
                                          return updatedAnswers;
                                        });
                                      }}
                                      options={countryList.filter((country) =>
                                        answers['primaryRegionsName1'] &&
                                        answers['primaryRegionsName1'].trim() !== ''
                                          ? country !== answers['primaryRegionsName1']
                                          : true,
                                      )}
                                      disableClearable
                                      isOptionEqualToValue={(option, value) => option === value}
                                      getOptionLabel={(option) => option}
                                      filterOptions={(options, state) =>
                                        options.filter((option) =>
                                          option
                                            .toLowerCase()
                                            .includes(state.inputValue.toLowerCase()),
                                        )
                                      } // Filter options
                                      noOptionsText="No countries found"
                                      ListboxProps={{
                                        sx: {
                                          borderRadius: '8px',
                                          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                          backgroundColor: '#fff',
                                          maxHeight: '200px',
                                          width: '100%',
                                          marginTop: -3,
                                          marginLeft: '-24px',
                                        },
                                      }}
                                      renderTags={() => null}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label={
                                            question.id === 'primaryRegions'
                                              ? 'Select Country'
                                              : 'Select up to 3 Countries'
                                          }
                                          variant="outlined"
                                          fullWidth
                                        />
                                      )}
                                    />
                                  )}
                                </FormControl>
                              )}

                              {Object.keys(answers).some((key) =>
                                key.startsWith(`${question.id}Name`),
                              ) && (
                                <TableContainer
                                  sx={{ marginY: 2, border: '1px solid #ccc', borderRadius: '8px' }}
                                >
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell
                                          style={{
                                            fontWeight: 'bold',
                                            color: '#0D0D0D',
                                            width: '220px',
                                          }}
                                        >
                                          {/* {question.id} */}
                                          {question.id === 'primaryRegions' ||
                                          question.id === 'secondaryRegions'
                                            ? 'Primary Region'
                                            : 'Other Operating Region'}
                                        </TableCell>
                                        <TableCell
                                          style={{
                                            fontWeight: 'bold',
                                            color: '#0D0D0D',
                                            width: '220px',
                                          }}
                                        >
                                          Country Name
                                        </TableCell>
                                        <TableCell
                                          style={{
                                            fontWeight: 'bold',
                                            color: '#0D0D0D',
                                            textAlign: 'center',
                                            width: '240px',
                                          }}
                                        >
                                          {question.id === 'primaryRegions' ||
                                          question.id === 'secondaryRegions'
                                            ? ''
                                            : 'Average Revenue Contribution (%)'}
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {[...Array(3)].map((_, index) => {
                                        const regionName =
                                          answers[`${question.id}Name${index + 1}`] || '';
                                        const regionValue =
                                          answers[`${question.id}Value${index + 1}`] || '';

                                        return regionName ? (
                                          <TableRow
                                            key={index}
                                            className="border-t border-b border-gray-200"
                                          >
                                            <TableCell
                                              style={{
                                                width: '270px',
                                                color: '#0D0D0D',
                                                padding: '10px',
                                                borderRight: '1px solid #ccc',
                                              }}
                                            >
                                              {question.id === 'primaryRegions' ||
                                              question.id === 'secondaryRegions'
                                                ? 'Primary Region'
                                                : `Other Operating Region ${index + 1}`}
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                width: '270px',
                                                color: '#0D0D0D',
                                                padding: '10px',
                                              }}
                                            >
                                              {regionName}
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                width: '150px',
                                                padding: '2px',
                                                textAlign: 'center',
                                                color: '#0D0D0D',
                                                borderLeft: '1px solid #ccc',
                                              }}
                                            >
                                              {question.id === 'primaryRegions' ||
                                              question.id === 'secondaryRegions' ? (
                                                ''
                                              ) : (
                                                <TextField
                                                  variant="outlined"
                                                  fullWidth
                                                  value={regionValue}
                                                  onChange={(e) => {
                                                    const newValue = Number(e.target.value) || 0;
                                                    const fieldKey = `${question.id}Value${index + 1}`;

                                                    // Define category keys
                                                    let categoryFields = [];

                                                    if (question.id === 'secondaryBusiness') {
                                                      categoryFields = [
                                                        'otherOperatingRegionsSecondaryValue1',
                                                        'otherOperatingRegionsSecondaryValue2',
                                                        'otherOperatingRegionsSecondaryValue3',
                                                      ];
                                                    } else if (question.id === 'primaryBusiness') {
                                                      categoryFields = [
                                                        'otherRegionsValue1',
                                                        'otherRegionsValue2',
                                                        'otherRegionsValue3',
                                                      ];
                                                    }
                                                    // Calculate the sum excluding the current field
                                                    const currentSum = categoryFields.reduce(
                                                      (sum, key) => {
                                                        return (
                                                          sum +
                                                          (key === fieldKey
                                                            ? 0
                                                            : Number(answers[key]) || 0)
                                                        );
                                                      },
                                                      0,
                                                    );
                                                    console.log('currentSum', currentSum);
                                                    // Ensure the new sum is <= 100
                                                    if (currentSum + newValue <= 100) {
                                                      setAnswers((prev) => ({
                                                        ...prev,
                                                        [fieldKey]: newValue,
                                                      }));
                                                    }
                                                  }}
                                                  type="number"
                                                  sx={{
                                                    '& input[type=number]': {
                                                      '-moz-appearance': 'textfield',
                                                      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button':
                                                        {
                                                          '-webkit-appearance': 'none',
                                                          margin: 0,
                                                        },
                                                    },
                                                  }}
                                                />
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ) : null;
                                      })}
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
                                            answers[`${question.id}_year`]
                                              ? parseInt(answers[`${question.id}_year`])
                                              : undefined,
                                          )
                                        : new Date(
                                            new Date().getFullYear(),
                                            new Date().getMonth() + 1,
                                            0,
                                          ).getDate()
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
                                    value={
                                      answers[`${question.id}_month`] ||
                                      new Date().toLocaleString('default', { month: 'long' })
                                    }
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
                                    value={
                                      answers[`${question.id}_year`] || new Date().getFullYear()
                                    }
                                    onChange={(e) =>
                                      handleChange(`${question.id}_year`, e.target.value)
                                    }
                                  />
                                </Grid>
                              </Grid>
                            )}
                            {question.type === 'month' && (
                              <FormControl
                                fullWidth
                                variant="outlined"
                                sx={{ textAlign: 'center' }}
                              >
                                <InputLabel
                                  sx={{
                                    textAlign: 'center', marginBottom: '10px',
                                  }}
                                >
                                  Duration
                                </InputLabel>
                                <Select
                                  value={answers[question.id] || ''}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                  label="Duration"
                                  sx={{
                                    textAlign: 'center',
                                    '& .MuiSelect-select': {
                                      textAlign: 'center',
                                    },
                                  }}
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
                      )}
                    </Box>
                  ))}

                  <Grid container justifyContent="flex-end" mt={2}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        storeFormData();
                        handleNext(segmentIndex);
                      }} // Call storeSegmentData for the segment
                      disabled={!isSegmentCompleted(segment)} // Disable if not completed
                    >
                      Next
                    </Button>
                  </Grid>
                </AccordionDetails>
              </>
            }
          </Accordion>
        );
      })}
      {/* upload button  */}
      {/* {(!answers["existingBusinessCheck"] || answers["existingBusinessCheck"] === "No") ? <div></div>): <div><div> } */}
      {!answers['existingBusinessCheck'] || answers['existingBusinessCheck'] === 'No' ? (
        <div></div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            justifyContent: 'center',
            marginLeft: '-60px',
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleButtonClick}
            sx={{
              textTransform: 'none',
              fontSize: '16px',
              padding: '8px 24px',
              marginTop: '-160px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              borderColor: '#333',
              color: '#333',
              marginLeft: {
                xs: '0px',
                md: '360px',
              },
              justifyContent: {
                xs: 'flex-start',
                md: 'center',
              },
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
        </div>
      )}
      {/* download link */}
      {!answers['existingBusinessCheck'] || answers['existingBusinessCheck'] === 'No' ? (
        <div></div>
      ) : (
        <div
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
              onClick={handleDownload}
              style={{
                color: '#007BFF',
              }}
            >
              Click here to download Valfiy Historical Financial Template
            </span>
          </Typography>
        </div>
      )}
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
      {/* popup for concern */}
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
        <DialogTitle
          align="center"
          style={{
            fontWeight: 'bold',
            color: '#0D0D0D',
          }}
        >
          Notice
        </DialogTitle>
        <DialogContent>
          <Typography
            style={{
              color: '#0D0D0D',
            }}
          >
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
    </Box>
  ) : (
    <div className='text-center'>
      <CircularProgress />
    </div>
  );
};

export default General;
