import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Questionnaire from './components/questionnaire';
import MarketAnalysis from './components/marketanalysis';
import ForecastsChecks from './components/forecastschecks';
import ReviewStage from './components/reviewstage';
import OutputStage from './components/outputstage';

interface AdminProjectWorkSpaceProps {
  pId?: string | null; // Allow projectId to be optional
  userId?: string | null; // Allow projectId to be optional
  isAdmin?: boolean; // Indicates if the user is an admin
}

const AdminProjectWorkSpace: React.FC<AdminProjectWorkSpaceProps> = ({ isAdmin = true, pId
                                                         
                                                                     }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);

  // Admin-only steps
  const adminSteps = [
    { number: 1, name: 'Questionnaire', path: 'questionnaire' },
    { number: 7, name: 'Market Analysis', path: 'marketAnalysis' },
    { number: 8, name: 'Forecasts Checks', path: 'forecastsChecks' },
    { number: 9, name: 'Review Stage', path: 'reviewStage' },
    { number: 10, name: 'Output Stage', path: 'outputStage' },
  ];

  // Map steps to estimated completion times
  const estimatedTimes = [
    { step: 1, time: '67 hours' },
    { step: 7, time: '31 hours' },
    { step: 8, time: '28 hours' },
    { step: 9, time: '1 hour' },
    { step: 10, time: '0 hour' },
  ];

  // Update current step based on URL hash
  useEffect(() => {
    const stepFromHash = location.hash.split('/')[4];
    if (stepFromHash) {
      const stepIndex = adminSteps.findIndex((step) => step.path === stepFromHash);
      if (stepIndex !== -1) {
        setCurrentStep(adminSteps[stepIndex].number);
      }
    }
  }, [location.hash]);

  const handleMyProjectsClick = () => {
    navigate('#myprojects');
  };

  // Component to display step content
  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return <Questionnaire pId={pId}/>;
      case 7:
        return <MarketAnalysis pId={pId} />;
      case 8:
        return <ForecastsChecks pId={pId}/>;
      case 9:
        return <ReviewStage pId={pId}/>;
      case 10:
        return <OutputStage pId={pId}/>;
      default:
        return null;
    }
  };

  // Get estimated time for the current step
  const currentEstimatedTime =
    estimatedTimes.find((time) => time.step === currentStep)?.time || 'N/A';

  // Redirect if user is not an admin
  if (!isAdmin) {
    navigate('/auth/signin');
    return null;
  }

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
            Admin Workspace
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

            <Grid container justifyContent="center" alignItems="center">
              {adminSteps.flatMap((step, index) => [
                <Grid item xs={2} key={step.number} textAlign="center">
                  <Grid>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: currentStep >= step.number ? 'normal' : 'normal',
                        marginBottom: '14px',
                        color: currentStep >= step.number ? '#0D0D0D' : '#565656',
                        fontSize: '14px',
                      }}
                    >
                      Step {step.number}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: currentStep >= step.number ? 'bold' : 'normal',
                        fontSize: '20px',
                        color: '#0D0D0D',
                      }}
                    >
                      {step.name}
                    </Typography>
                  </Grid>
                </Grid>,
                index < adminSteps.length - 1 ? (
                  <Grid item xs={0.5} key={`arrow-${index}`} textAlign="center" pt={3}>
                    <Typography variant="h6">{'>>'}</Typography>
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

export default AdminProjectWorkSpace;
