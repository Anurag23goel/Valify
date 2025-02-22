import {
    Typography,
    Grid,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, firestore, doc, setDoc, getDoc } from 'firebase.ts';
import { User } from 'firebase/auth';
import Timeline from '../Timeline';

const RiskAssumptionsData = [
    {
        segmentTitle: '9. Risk Assumptions',
        questions: [
            {
                type: 'mcq',
                question: 'Is there high market uncertainty/volatility in the specific business niche? Select "Yes" if it is difficult to make business predictions in the company\'s niche.',
                id: 'NicheRisk',
                options: ['yes', 'no'],
                questionName: 'Niche Risk',
            },
            {
                type: 'mcq',
                question: 'Is the subject company exploring new ventures, products, or locations over the next 5 years?',
                id: 'PenetrationRisk',
                options: ['yes', 'no'],
                questionName: 'Penetration Risk',
            },
            {
                type: 'mcq',
                question: 'Does the business contain large or long-term contracts of risky nature?',
                id: 'RiskyContracts1',
                options: ['yes', 'no'],
                questionName: 'Risky Contracts',
                explanation: 'Note: For example, an annual master agreement without any order forecasts for a high-value client.',
            },
            {
                type: 'mcq',
                question: 'Is there dependency on a single supplier? Select yes if the company does not have alternative suppliers to support their operations.',
                id: 'VendorRisk',
                options: ['yes', 'no'],
                questionName: 'Vendor Risk',
            },
            {
                type: 'mcq',
                question: 'On average, does more than 50% of business source from less than 3 major customers?',
                id: 'KeyCustomerRisk',
                options: ['yes', 'no'],
                questionName: 'Key Customer Risk',
            },
            {
                type: 'mcq',
                question: 'Is the business cyclical in nature?',
                id: 'Cyclicality',
                options: ['yes', 'no'],
                questionName: 'Cyclicality',
            },
        ],
    },
]

interface RiskProps {
    pId?: string | null;
}

const RiskAssumptions: React.FC<RiskProps> = ({ pId }) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [user, setUser] = useState<User | null>(null);
    const [projectId, setProjectId] = useState<string | null | undefined>(null);
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Authentication effect
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

    // Load existing data effect
    useEffect(() => {
        const loadExistingData = async () => {
            if (user && projectId) {
                const projectRef = doc(firestore, 'users', user.uid, 'projects', projectId);
                try {
                    const projectSnapshot = await getDoc(projectRef);
                    if (projectSnapshot.exists()) {
                        const projectData = projectSnapshot.data();
                        if (projectData.answers) {
                            setAnswers(projectData.answers);
                        }
                    }
                } catch (error) {
                    console.error('Error loading existing data:', error);
                }
            }
        };

        loadExistingData();
    }, [user, projectId]);

    const handleChange = (questionId: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
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
                    userId: user.uid,
                    Status: 'Risk Assumptions',
                    route: 'riskAssumptions',
                    estimatedTime: '6 Days',
                    Percentage: '90',
                },
                { merge: true }
            );
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    };

    const handlePrevious = () => {
        navigate(`#newproject/${projectId}/valuationInput`);
        // navigate(`${location.hash.replace('riskAssumptions', 'valuationInput')}`);
    };

    const saveAndNext = async () => {
        await storeFormData();
        navigate(`#newproject/${projectId}/marketAnalysis`);
        // navigate(`${location.hash.replace('riskAssumptions', 'marketAnalysis')}`);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Box padding={0}>
            <Timeline currentStep={9} />
            {RiskAssumptionsData.map((segment, index) => (
                <Box key={index} marginBottom={4} marginX={5}>
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
                            marginTop: 4,
                        }}
                    >
                        {segment.segmentTitle}
                    </Typography> */}
                    <Grid container spacing={3}>
                        {segment.questions.map((question) => (
                            <Grid container item xs={12} alignItems="flex-start" key={question.id}>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body1" sx={{ color: 'primary.main', marginBottom: 1 }}>
                                        {question.questionName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={9}>
                                    <FormControl component="fieldset" fullWidth>
                                        <FormLabel
                                            component="legend"
                                            sx={{
                                                color: '#0D0D0D',
                                                '&.Mui-focused': { color: '#0D0D0D' },
                                                '&.MuiFormLabel-filled': { color: '#0D0D0D' },
                                            }}
                                        >
                                            {question.question}
                                        </FormLabel>
                                        <RadioGroup
                                            row
                                            name={question.id}
                                            value={answers[question.id] || 'no'}
                                            onChange={(e) => handleChange(question.id, e.target.value)}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                            }}
                                        >
                                            {question.options.map((option, idx) => (
                                                <FormControlLabel
                                                    key={idx}
                                                    value={option}
                                                    control={<Radio />}
                                                    label={option.charAt(0).toUpperCase() + option.slice(1)}
                                                    sx={{
                                                        textAlign: 'center',
                                                        width: 'auto',
                                                        marginRight: 3,
                                                    }}
                                                />
                                            ))}
                                        </RadioGroup>
                                        {question.explanation && (
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                                {question.explanation}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ))}
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
                        Save and Next
                    </Button>
                </Grid>
            </Grid>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success">
                    Your data has been saved successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RiskAssumptions;

/* const RiskAssumptionsData = [
    {
        segmentTitle: '9. Risk Assumptions',
        questions: [
            {
                type: 'mcq',
                question: 'Is there high market uncertainty/volatility in the specific business niche? Select "Yes" if it is difficult to make business predictions in the company\'s niche.',
                id: 'NicheRisk',
                options: ['yes', 'no'],
                questionName: 'Niche Risk',
            },
            {
                type: 'mcq',
                question: 'Is the subject company exploring new ventures, products, or locations over the next 5 years?',
                id: 'PenetrationRisk',
                options: ['yes', 'no'],
                questionName: 'Penetration Risk',
            },
            {
                type: 'mcq',
                question: 'Does the business contain large or long-term contracts of risky nature?',
                id: 'RiskyContracts1',
                options: ['yes', 'no'],
                questionName: 'Risky Contracts',
                explanation: 'Note: For example, an annual master agreement without any order forecasts for a high-value client.',
            },
            {
                type: 'mcq',
                question: 'Is there dependency on a single supplier? Select yes if the company does not have alternative suppliers to support their operations.',
                id: 'VendorRisk',
                options: ['yes', 'no'],
                questionName: 'Vendor Risk',
            },
            {
                type: 'mcq',
                question: 'On average, does more than 50% of business source from less than 3 major customers?',
                id: 'KeyCustomerRisk',
                options: ['yes', 'no'],
                questionName: 'Key Customer Risk',
            },
            {
                type: 'mcq',
                question: 'Is the business cyclical in nature?',
                id: 'Cyclicality',
                options: ['yes', 'no'],
                questionName: 'Cyclicality',
            },
        ],
    },
]; */
