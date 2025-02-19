// pages/Landing.ts

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TopCards from 'components/sections/dashboard/top-cards';
import DocProject from 'components/sections/dashboard/top-cards/docproject';

const Landing = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Typography variant="h3">Dashoard</Typography>
      </Grid>
      <Grid item xs={12} mb={3}>
        <TopCards />
      </Grid>
      {/* <Grid item xs={12}>
        <Typography variant="h4">You may also want to check other products</Typography>
      </Grid>
      <Grid item xs={12} mb={3}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4} xl={3}>
            <DocProject icon="vscode-icons:file-type-word" title="Lorem Ipsum" />
          </Grid>
          <Grid item xs={12} sm={4} xl={3}>
            <DocProject icon="vscode-icons:file-type-word" title="Lorem Ipsum" />
          </Grid>
          <Grid item xs={12} sm={4} xl={3}>
            <DocProject icon="vscode-icons:file-type-word" title="Lorem Ipsum" />
          </Grid>
        </Grid>
      </Grid> */}
    </Grid>
  );
};

export default Landing;
