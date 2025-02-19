import { Box, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

// Step states: Incomplete, In Progress, Completed
const STEP_STATES = {
  INCOMPLETE: 'incomplete',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

// Define default substeps
const substeps = [
  { title: 'Valuation Approach Test' },
  { title: 'General' },
  { title: 'Revenue' },
  { title: 'Gross Margin' },
  { title: 'Operating Expenses' },
  { title: 'Assets & Depreciation' },
  { title: 'Net Working Capital' },
  { title: 'Valuation Input' },
  { title: 'Risk Assumptions' },
];

// Timeline component that takes a numeric value (1-) as a prop
const Timeline = ({ currentStep }: { currentStep: number }) => {
  // Generate step states based on the current step
  const stepsWithState = substeps.map((step, index) => {
    if (index < currentStep - 1) {
      return { ...step, state: STEP_STATES.COMPLETED }; // Steps before the current step
    } else if (index === currentStep - 1) {
      return { ...step, state: STEP_STATES.IN_PROGRESS }; // Current step
    } else {
      return { ...step, state: STEP_STATES.INCOMPLETE }; // Steps after the current step
    }
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {/* Horizontal Line */}
      <Box
        sx={{
          position: 'relative',
          width: '85%',
          height: '2px',
          backgroundColor: 'primary.main', // Line in primary.main color
          mb: 2,
        }}
      >
        {/* Dots positioned above the line */}
        {stepsWithState.map((step, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: '-12px', // Position dot above the line
              left: `${(index / (stepsWithState.length - 1)) * 100}%`, // Evenly distribute dots across the line
              transform: 'translateX(-50%)', // Center dot horizontally
            }}
          >
            <Box
              sx={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor:
                  step.state === STEP_STATES.COMPLETED
                    ? 'primary.main'
                    : step.state === STEP_STATES.IN_PROGRESS
                      ? 'primary.main'
                      : 'succes.main',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {step.state === STEP_STATES.COMPLETED ? (
                <IconifyIcon
                  icon="ic:round-check-circle"
                  style={{ fontSize: '16px', color: 'white' }}
                />
              ) : step.state === STEP_STATES.IN_PROGRESS ? (
                <IconifyIcon icon="ic:round-circle" style={{ fontSize: '16px', color: 'white' }} />
              ) : (
                <IconifyIcon icon="ic:round-circle" style={{ fontSize: '8px', color: '#003399' }} />
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Labels beneath each dot */}
      <Box display="flex" width="95%" justifyContent="space-between">
        {stepsWithState.map((step, index) => (
          <Box key={index} flex="1" textAlign="center">
            <Typography variant="body2" align="center" sx={{ display: { xs: 'none', md: 'block' } }}>
              {step.title}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Timeline;
