import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AddProjectDialog from 'components/dialogs/AddProjectDialog';

const AddProject = ({ title = 'Add a project' }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Paper
        component={Stack}
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 2.5, cursor: 'pointer', boxShadow: 3 }} // Add cursor pointer for better UX
        onClick={handleOpen} // Open the modal when the Paper is clicked
      >
        <Stack alignItems="center" justifyContent="flex-start" spacing={2}>
          <Stack
            alignItems="center"
            justifyContent="center"
            height={56}
            width={56}
            borderRadius="50%"
          >
            {/* Use the image instead of the icon */}
            <img src='/addproject.png' alt="Add Project" style={{ height: '42px', width: '42px' }} />
          </Stack>
          <Box>
            <Typography variant="h5">{title}</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Use the new AddProjectDialog component */}
      <AddProjectDialog open={open} onClose={handleClose} />
    </>
  );
};

export default AddProject;
