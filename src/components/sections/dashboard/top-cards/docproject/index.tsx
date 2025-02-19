import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const DocProject = ({ icon = "ic:folder", title = "Add a project" }) => {
  return (
    <Paper
      component={Stack}
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, py: 2.5, boxShadow: 3 }}
    >
      <Stack alignItems="center" justifyContent="flex-start" spacing={2}>
        <Stack
          alignItems="center"
          justifyContent="center"
          height={56}
          width={56}
          bgcolor="info.main"
          borderRadius="50%"
        >
          <IconifyIcon icon={icon} color="primary.main" fontSize="h1.fontSize" />
        </Stack>
        <Box>
          <Typography variant="h5">
            {title}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default DocProject;
