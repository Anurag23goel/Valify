import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

const OpenProject = ({length}) => {
  const navigate = useNavigate(); // Initialize navigate

  const handleNavigation = () => {
    navigate('/#myprojects'); // Navigate to /#myprojects on click
  };
  return (
    <Paper
      component={Stack}
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, py: 2.5, cursor: 'pointer', boxShadow: 3 }}
      onClick={handleNavigation}
    >
      <Stack alignItems="center" justifyContent="flex-start" spacing={2}>
        <Stack
          alignItems="center"
          justifyContent="center"
          height={56}
          width={56}
          borderRadius="50%"
        >
          <img src='/openproject.png' alt="Add Project" style={{ height: '42px', width: '42px' }} />
        </Stack>
        <Box>
          <Typography variant="body2" color="text.disabled" fontWeight={500}>
            Open Projects
          </Typography>
          <Typography mt={0.5} variant="h4">
            {length}
          </Typography>
        </Box>
      </Stack>

      {/* <ClientChart data={[15, 12, 50, 45, 60]} sx={{ width: 75, height: '68px !important' }} /> */}
    </Paper>
  );
};

export default OpenProject;
