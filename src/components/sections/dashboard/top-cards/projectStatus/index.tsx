import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { Icon } from '@iconify/react';

// Define a TypeScript interface for the props
interface ProjectStatusProps {
  projectId?: string | undefined | null;
  projectName: string;
  projectStatus: 'Completed' | 'Initial questionnaire';
  progressPercentage?: number;
  estimatedDuration?: string;
  dateOfCompletion?: string;
}

// Remove 'theme' since it's unused
const CircularProgressWithLabel = styled(CircularProgress)({
  position: 'relative',
  display: 'inline-flex',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
});

const ProjectStatus: React.FC<ProjectStatusProps> = ({
  projectId,
  projectName,
  projectStatus, // 'Completed' or 'Initial questionnaire'
  progressPercentage = 0, // Percentage of progress (if Initial questionnaire)
  estimatedDuration, // Time remaining if 'Initial questionnaire'
  dateOfCompletion, // Completion date if 'Completed'
}) => {
  const navigate = useNavigate();
  const isCompleted = projectStatus === 'Completed';

  const handleClick = () => {
    navigate(`#newproject/${projectId}`); // Navigate to the desired location
  };

  return (
    <Paper
      component={Stack}
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, py: 2.5, boxShadow: 3, cursor: 'pointer' }}
      onClick={handleClick}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
        {/* Left: Project Details */}
        <Stack alignItems="flex-start" spacing={1}>
          <Box>
            <Typography variant="body1" gutterBottom>{`Project: ${projectName}`}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {`Status: ${projectStatus}`}
            </Typography>

            <Typography variant="body2" color="text.secondary" display="inline">
              {isCompleted ? (
                `Completion Date: ${dateOfCompletion}`
              ) : (
                <>
                  {`Estimated time to completion: ${estimatedDuration}`}
                  <Tooltip
                    title="Our delivery date estimation assumes that the questionnaire is completed within specified duration, peer analysis and market-assessment flags are promptly responded by the user. Delays in user inputs or responses will lead to delays in completing your project."
                    arrow
                  >
                    <Icon
                      icon="mdi:information-outline"
                      width={16}
                      style={{ verticalAlign: 'middle', marginLeft: '5px' }}
                    />
                  </Tooltip>
                </>
              )}
            </Typography>
          </Box>
        </Stack>

        {/* Right: Circular Progress */}
        <Box position="relative" display="inline-flex">
          <CircularProgressWithLabel
            variant="determinate"
            value={isCompleted ? 100 : progressPercentage}
            size={60}
            thickness={4}
          />
          <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="caption" component="div" color="text.secondary">
              {isCompleted ? '100%' : `${Math.round(progressPercentage)}%`}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProjectStatus;
