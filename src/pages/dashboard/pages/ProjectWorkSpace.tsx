import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Questionnaire from './components/questionnaire';
import MarketAnalysis from './components/marketAnalysis';
import ReviewStage from './components/reviewStage';
import Revenue from './components/revenue';
import GrossMargin from './components/grossMargin';
import OperatingExpenses from './components/operatingExpenses';
import AssestsDepreciation from './components/assetsDepreciation';
import NetworkCapital from './components/netWorkingCapital';
import OutputStage from './components/outputStage';
import ForecastsChecks from './components/forecastsChecks';
import ValuationInput from './components/valuationInput';
import General from './components/general';
import RiskAssumptions from './components/riskAssumptions';

interface ProjectWorkSpaceProps {
  projectID?: string | null;
}

const ProjectWorkSpace: React.FC<ProjectWorkSpaceProps> = ({ projectID }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);

  // Array mapping step numbers to estimated completion times
  const estimatedTimes = [
    { step: 1, time: '67 hours' },
    { step: 2, time: '67 hours' },
    { step: 3, time: '67 hours' },
    { step: 4, time: '67 hours' },
    { step: 5, time: '67 hours' },
    { step: 6, time: '67 hours' },
    { step: 7, time: '67 hours' },
    { step: 8, time: '67 hours' },
    { step: 9, time: '67 hours' },
    { step: 10, time: '31 hours' },
    { step: 11, time: '28 hours' },
    { step: 12, time: '1 hour' },
    { step: 13, time: '0 hours' },
  ];

  // Set the initial step based on the URL hash
  useEffect(() => {
    const hashParts = location.hash.split('/'); // Split the hash
    if (hashParts.length > 2) {
      const stepFromHash = hashParts[2];
      console.log('hash here:', stepFromHash);
      const stepIndex = [
        'questionnaire',
        'general',
        'revenue',
        'grossMargin',
        'operatingExpenses',
        'assetsAndDepreciation',
        'networkingCapital',
        'valuationInput',
        'riskAssumptions',
        'marketAnalysis',
        'forecastsChecks',
        'reviewStage',
        'outputStage',
      ].indexOf(stepFromHash);

      // Set currentStep only if the stepIndex is valid and different
      if (stepIndex !== -1) {
        console.log('current Step', currentStep);
        setCurrentStep(stepIndex + 1);
        console.log(currentStep);
      } else {
        setCurrentStep(1);
      }
    }
  }, [location.hash]); // Add currentStep to dependencies

  const handleMyProjectsClick = () => {
    navigate('#myprojects');
  };

  // Define the steps to be displayed
  const steps = [
    { number: 1, name: 'Questionnaire', path: 'questionnaire' },
    { number: 2, name: 'General', path: 'general' },
    { number: 3, name: 'Revenue', path: 'revenue' },
    { number: 4, name: 'Gross Margin', path: 'grossMargin' },
    { number: 5, name: 'Operating Expenses', path: 'operatingExpenses' },
    { number: 6, name: 'Assets & Depreciation', path: 'assetsAndDepreciation' },
    { number: 7, name: 'Networking Capital', path: 'networkingCapital' },
    { number: 8, name: 'Valuation Input', path: 'valuationInput' },
    { number: 9, name: 'Risk Assumptions', path: 'riskAssumptions' },
    { number: 10, name: 'Market Analysis', path: 'marketAnalysis' },
    { number: 11, name: 'Forecasts Checks', path: 'forecastsChecks' },
    { number: 12, name: 'Review Stage', path: 'reviewStage' },
    { number: 13, name: 'Output Stage', path: 'outputStage' },
  ];

  // Component that displays content based on the current step
  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return <Questionnaire pId={projectID} />;
      case 2:
        console.log('Revenue');
        return <General pId={projectID} />;
      case 3:
        console.log('General');
        return <Revenue pId={projectID} />;
      case 4:
        console.log('Gross Margin');
        return <GrossMargin pId={projectID} />;
      case 5:
        return <OperatingExpenses pId={projectID} />;
      case 6:
        return <AssestsDepreciation pId={projectID} />;
      case 7:
        return <NetworkCapital pId={projectID} />;
      case 8:
        return <ValuationInput pId={projectID} />;
      case 9:
        return <RiskAssumptions pId={projectID} />;
      case 10:
        return <MarketAnalysis pId={projectID} />;
      case 11:
        return <ForecastsChecks pId={projectID} />;
      case 12:
        return <ReviewStage pId={projectID} />;
      case 13:
        return <OutputStage pId={projectID} />;
      default:
        return null;
    }
  };

  // Get the estimated time for the current step
  const currentEstimatedTime =
    estimatedTimes.find((time) => time.step === currentStep)?.time || 'N/A';

  // Define how many steps to show at a time
  const windowSize = 5; // Display 4-5 steps at a time

  // Find the index of the current step
  const currentStepIndex = steps.findIndex((step) => step.number === currentStep);

  // Ensure we get a valid range (handle cases when currentStep is at the beginning or end)
  const startIndex = Math.max(0, currentStepIndex - Math.floor(windowSize / 2));
  const endIndex = Math.min(steps.length, startIndex + windowSize);

  // Slice the steps to show only 4-5 at a time
  const visibleSteps = steps.slice(startIndex, endIndex);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} mb={3} container justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="h3"
            onClick={handleMyProjectsClick}
            sx={{
              color: '#000000',
              fontSize: '22px',
              fontWeight: '400',
            }}
            style={{ cursor: 'pointer' }}
          >
            My Project
          </Typography>
          <Typography variant="h3"> &gt; </Typography>
          <Typography
            variant="h3"
            sx={{
              color: '#000000',
              fontSize: '22px',
              fontWeight: '400',
            }}
          >
            Project Workspace
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12} mb={3} container justifyContent="space-between" alignItems="center">
        <Card variant="outlined" sx={{ width: '100%' }}>
          <CardContent>
            <Grid item xs={12} mb={5} container justifyContent="space-between" alignItems="center">
              <Typography
                variant="h5"
                component="div"
                sx={{
                  color: '#000000',
                  fontSize: '22px',
                  fontWeight: '400',
                  '@media (max-width: 800px)': {
                    marginBottom: '16px',
                  },
                }}
              >
                Let&apos;s start your project
              </Typography>

              <Button
                variant="contained"
                disabled
                sx={{
                  backgroundColor: '#F4F4F4',
                  color: '#0D0D0D',
                  width: '340px',
                  height: '50px',
                  fontSize: '16px',
                  whiteSpace: 'nowrap',
                }}
              >
                Estimated time to complete: {currentEstimatedTime}
              </Button>
            </Grid>

            <Grid container justifyContent="center" alignItems="center" spacing={2}>
              {visibleSteps.flatMap((step, index) => [
                <Grid item xs={2} key={step.number} textAlign="center">
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: currentStep >= step.number ? 'bold' : 'normal',
                        fontSize: { xs: '14px', md: '20px' },
                        color: '#0D0D0D',
                      }}
                    >
                      Step {step.number}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: currentStep >= step.number ? 'bold' : 'normal',
                        fontSize: { xs: '14px', md: '20px' },
                        color: '#0D0D0D',
                      }}
                    >
                      {step.name}
                    </Typography>
                  </Box>
                </Grid>,

                index < visibleSteps.length - 1 ? (
                  <Grid item xs={3} md={0.5} key={`arrow-${index}`} textAlign="center" pt={3}>
                    <img
                      src="/dashboardarrow.svg"
                      alt="Arrow broken-up"
                      style={{
                        margin: '10px auto',
                        width: '24px',
                        height: '24px',
                        display: 'block',
                      }}
                    />
                  </Grid>
                ) : null,
              ])}
            </Grid>

            <hr
              style={{
                margin: '20px -50px',
                backgroundColor: '#E8E8E8',
                height: '1px',
                border: 'none',
              }}
            />

            <Grid mt={5}>
              <StepContent />
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProjectWorkSpace;
