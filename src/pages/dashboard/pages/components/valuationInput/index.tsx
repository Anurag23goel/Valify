import {
    Typography,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Box,
    Button,
    Radio,
    FormControlLabel,
    RadioGroup,
    FormLabel,
    TextField,
    SelectChangeEvent,
    Snackbar,
    Alert,
} from '@mui/material';
import Timeline from '../Timeline';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, firestore, doc, setDoc, getDoc } from 'firebase.ts';
import { User } from 'firebase/auth';

interface ValuationProps {
    pId?: string | null; // Allow projectId to be optional
}

const ValuationInputData = [

    {
        segmentTitle: '7. Valuation Input',
        questions: [
            {
                type: 'text',
                question: 'What is the available cash balance of the business on the Valuation Date? This should include bank balances and any cash-like items.',
                id: 'CashasatValuationDate',
                questionName: 'Cash as at Valuation Date',
                currency: "USD"
            },
            {
                type: 'dropdown',
                question: 'If the business has any related party balances (such as loans or other dues to & from related parties), please confirm whether these are trade or non-trade in nature.',
                id: 'RelatedPartyBalances',
                questionA: "Dues to Related Parties (liability)",
                questionANote: "Include these in NWC days under Other Payable Days",
                questionB: "Dues from Related Parties (asset)",
                questionBNote: "Include these in NWC days under Other Receivable Days",
                options: ['Trade', 'Non-trade'],
                questionName: 'Related Party Balances - trade/non-trade',
                explanation: `Trade balances are related to daily business operations and working capital. Non-trade balances are related to long-term investing and financing decisions or other non-operational reasons.`,
            },
            {
                type: 'text',
                question: 'If the business has any loans on their books, please confirm the exact outstanding amount of the loan as at the Valuation Date.',
                id: 'Loans',
                questionName: 'Loans',
                currency: "USD"
            },
        ]
    },
];

const ValuationInput: React.FC<ValuationProps> = ({ pId }) => {
    const [selectedOptionA, setSelectedOptionA] = useState("");
    const [selectedOptionB, setSelectedOptionB] = useState("");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [user, setUser] = useState<User | null>(null);
    const [projectId, setProjectId] = useState<string | null | undefined>(pId);
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
        const fetchExistingData = async () => {
            if (user && projectId) {
                const projectRef = doc(firestore, 'users', user.uid, 'projects', projectId);
                try {
                    const docSnap = await getDoc(projectRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.answers) {
                            setAnswers(data.answers);
                            if (data.answers.RelatedPartyBalancesA) {
                                setSelectedOptionA(data.answers.RelatedPartyBalancesA);
                            }
                            if (data.answers.RelatedPartyBalancesB) {
                                setSelectedOptionB(data.answers.RelatedPartyBalancesB);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };
        fetchExistingData();
    }, [user, projectId]);

    const handleDropdownChangeA = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setSelectedOptionA(value);
        setAnswers(prev => ({
            ...prev,
            RelatedPartyBalancesA: value
        }));
    };

    const handleDropdownChangeB = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setSelectedOptionB(value);
        setAnswers(prev => ({
            ...prev,
            RelatedPartyBalancesB: value
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
                },
                { merge: true },
            );
            console.log('Form data saved successfully');
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    };

    return (
        <Box padding={0}>
            <Timeline currentStep={8} />
            {ValuationInputData.map((segment, index) => (
                <Box key={index} marginBottom={8} sx={{
                    marginX: 5
                }}>

                   

                    <Grid container spacing={4} sx={{
                           
                            marginTop: 4,
                        }}>
                        {segment.questions.map((question) => (
                            <Grid container item xs={12} alignItems="flex-start" key={question.id} marginRight={4}>
                                {/* Question Name on the Left */}
                                <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Typography variant="body1" color="primary" sx={{ marginBottom: 1 }}>
                                        {question.questionName}
                                    </Typography>
                                </Grid>
                                {/* Question and Options on the Right */}
                                <Grid item xs={12} md={9}>
                                    <FormControl component="fieldset" fullWidth>
                                        <FormLabel component="legend" sx={{ color: '#333', paddingBottom: '8px' }}>
                                            {question.question}
                                        </FormLabel>
                                        {question.type === 'dropdown' ? (
                                            <Grid container spacing={2} alignItems="center">
                                                {/* Question A Text, Dropdown, and Input Box */}
                                                <Grid item xs={12} md={5}>
                                                    <Typography variant="body2" sx={{ marginBottom: 1, color: '#0D0D0D' }}>
                                                        {question.questionA}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={7} container alignItems="center" spacing={2}>
                                                    <Grid item xs={6}>
                                                        <FormControl
                                                            fullWidth
                                                            sx={{
                                                                display: 'flex',
                                                                paddingBottom: 1,
                                                                borderRadius: 1,
                                                            }}
                                                        >
                                                            <Select
                                                                labelId={`${question.id}-A`}
                                                                defaultValue=""
                                                                size="small"
                                                                sx={{
                                                                    padding: 0,
                                                                    color: '#0D0D0D',
                                                                    height: '36px',
                                                                    '& .MuiSelect-select': {
                                                                        padding: '4px',
                                                                        fontSize: '14px',
                                                                        marginTop: '5px',
                                                                    },

                                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                        borderColor: 'primary.main',
                                                                    },
                                                                    '& .MuiSelect-icon': {
                                                                        color: '#0D0D0D',
                                                                    },
                                                                }}
                                                                value={selectedOptionA}
                                                                onChange={handleDropdownChangeA}
                                                            >
                                                                {question.options?.map((option, idx) => (
                                                                    <MenuItem key={idx} value={option}>
                                                                        {option}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>

                                                    {/* Input Box next to Dropdown */}
                                                    <Grid item xs={6}>
                                                        {selectedOptionA === 'Non-trade' ? (
                                                            <TextField
                                                                variant="outlined"
                                                                fullWidth
                                                                size="small"
                                                                value={answers[`${question.id}_nonTradeAmount${selectedOptionA === 'Non-trade' ? 'A' : 'B'}`] || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    // Only allow numbers
                                                                    if (/^\d*\.?\d*$/.test(value)) {
                                                                        setAnswers(prev => ({
                                                                            ...prev,
                                                                            [`${question.id}_nonTradeAmount${selectedOptionA === 'Non-trade' ? 'A' : 'B'}`]: value
                                                                        }));
                                                                    }
                                                                }}
                                                                sx={{
                                                                    padding: 0,
                                                                    color: '#0D0D0D',
                                                                    height: '48px',
                                                                    width: 'auto',
                                                                    '& .MuiInputBase-root': {
                                                                        padding: '6px',
                                                                        fontSize: '14px',
                                                                    },
                                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                        borderColor: 'primary.main',
                                                                    },
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', color: '#0D0D0D' }}>
                                                                {question.questionANote}
                                                            </Typography>
                                                        )}
                                                    </Grid>
                                                </Grid>

                                                {/* Question B Text, Dropdown, and Input Box */}
                                                <Grid item xs={12} md={5}>
                                                    <Typography variant="body2" sx={{ marginBottom: 1, color: '#0D0D0D' }}>
                                                        {question.questionB}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={7} container alignItems="center" spacing={2}>
                                                    <Grid item xs={6}>
                                                        <FormControl
                                                            fullWidth
                                                            sx={{
                                                                display: 'flex',
                                                                paddingBottom: 2,
                                                            }}
                                                        >
                                                            <Select
                                                                labelId={`${question.id}-B`}
                                                                defaultValue=""
                                                                size="small"
                                                                sx={{
                                                                    padding: 0,
                                                                    color: '#0D0D0D',
                                                                    height: '36px',
                                                                    '& .MuiSelect-select': {
                                                                        padding: '4px',
                                                                        marginTop: '5px',
                                                                        fontSize: '14px',
                                                                        alignItems: 'center',
                                                                        lineHeight: 'normal',

                                                                    },

                                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                        borderColor: 'primary.main',
                                                                    },
                                                                }}
                                                                value={selectedOptionB}
                                                                onChange={handleDropdownChangeB}
                                                            >
                                                                {question.options?.map((option, idx) => (
                                                                    <MenuItem key={idx} value={option}>
                                                                        {option}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>


                                                    {/* Input Box next to Dropdown */}
                                                    <Grid item xs={6}>
                                                        {selectedOptionB === 'Non-trade' ? (
                                                            <TextField
                                                                variant="outlined"
                                                                fullWidth
                                                                size="small"
                                                                sx={{
                                                                    padding: 0,
                                                                    color: '#0D0D0D',
                                                                    height: '48px',
                                                                    width: 'auto',
                                                                    '& .MuiInputBase-root': {
                                                                        padding: '6px',
                                                                        fontSize: '14px',
                                                                    },

                                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                        borderColor: 'primary.main',
                                                                    },
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', color: '#0D0D0D' }}>
                                                                {question.questionBNote}
                                                            </Typography>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        ) : question.type === 'text' ? (
                                            <Grid container alignItems="center" spacing={1}>
                                                {/* Input Box next to the button */}
                                                <Grid item xs={12} md={8}>
                                                    <TextField
                                                        variant="outlined"
                                                        fullWidth
                                                        size="small"
                                                        value={answers[`${question.id}`] || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Only allow numbers
                                                            if (/^\d*\.?\d*$/.test(value)) {
                                                                setAnswers(prev => ({
                                                                    ...prev,
                                                                    [`${question.id}`]: value
                                                                }));
                                                            }
                                                        }}
                                                        sx={{
                                                            padding: 0,
                                                            color: '#0D0D0D',
                                                            height: '48px',
                                                            width: 'auto',
                                                            '& .MuiInputBase-root': {
                                                                padding: '6px',
                                                                fontSize: '14px',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'primary.main',
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <Typography
                                                        sx={{
                                                            color: 'black',
                                                            marginRight: 1,
                                                            padding: '4px 12px',
                                                            textTransform: 'none',
                                                            fontSize: '14px',
                                                            height: '34px',
                                                        }}
                                                    >
                                                        millions
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography
                                                        sx={{
                                                            color: 'black',
                                                            marginRight: 1,
                                                            padding: '4px 12px',
                                                            textTransform: 'none',
                                                            fontSize: '14px',
                                                            height: '34px',
                                                        }}
                                                    >
                                                        {question.currency}
                                                    </Typography>
                                                </Grid>
                                            </Grid>


                                        ) : (
                                            <RadioGroup row name={question.id}>
                                                {question.options?.map((option, idx) => (
                                                    <FormControlLabel
                                                        key={idx}
                                                        value={option}
                                                        control={
                                                            <Radio
                                                                disableRipple
                                                                sx={{
                                                                    '&:hover': { backgroundColor: 'transparent' },
                                                                    padding: '4px',
                                                                }}
                                                            />
                                                        }
                                                        label={option.charAt(0).toUpperCase() + option.slice(1)}
                                                        style={{ marginRight: '16px' }}
                                                    />
                                                ))}
                                            </RadioGroup>
                                        )}

                                        {question.explanation && (
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ fontStyle: 'italic', color: '#0D0D0D' }}
                                            >
                                                {question.explanation}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Box >
            ))}
            <Grid container justifyContent="space-evenly" spacing={2} mt={2}>
                {/* Previous Button */}
                <Grid item>
                    <Button
                        onClick={async () => {
                            navigate(`#newproject/${projectId}/networkingCapital`);
                            // navigate(`${location.hash.replace('valuationInput', 'networkingCapital')}`);
                        }}
                        variant="outlined"
                        sx={{ color: 'black', paddingX: 8, border: 1, borderColor: 'primary.main' }}
                    >
                        Previous
                    </Button>
                </Grid>

                {/* Save and Next Button */}
                <Grid item>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            await storeFormData();
                            navigate(`#newproject/${projectId}/riskAssumptions`);
                            // navigate(`${location.hash.replace('valuationInput', 'riskAssumptions')}`);
                        }}
                    >
                        Save and Next
                    </Button>
                </Grid>
            </Grid>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="success">
                    Data saved successfully!
                </Alert>
            </Snackbar>
        </Box >
    );
};

export default ValuationInput;
