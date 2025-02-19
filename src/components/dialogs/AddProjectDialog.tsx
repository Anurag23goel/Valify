import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import LogoImg from 'assets/images/logo.png';
import Image from 'components/base/Image';
import IconifyIcon from 'components/base/IconifyIcon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface AddProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [isELChecked, setIsELChecked] = useState(false);
  const [isNDAChecked, setIsNDAChecked] = useState(false);

  const handleStartQuestionnaire = () => {
    onClose(); // Close the dialog
    navigate('/#newproject'); // Change the route to "/#newproject"
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          padding: 0,
        },
      }}
    >
      <Box sx={{ backgroundColor: '#F6FEFF' }} p-0>
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: '100%', textAlign: 'center' }}
          >
            <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', padding: 0 }}>
              Let us start a new project!
            </Typography>
            <Box>
              <Image src={LogoImg} alt="logo" height={64} width={64} />
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: '#F6FEFF' }}>
          <Box sx={{}}>
            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
              We understand that you seek a fair valuation of a business. At Valify, we are
              committed to providing a swift & efficient self-valuation tool.
            </Typography>
            <Typography variant="body1" gutterBottom fontWeight="bold" sx={{ mb: 1 }}>
              We would like to emphasize that valuation estimates through Valify do not qualify as
              independent valuation advisory.
            </Typography>

            {/* Arrow Point 1 */}
            <Box display="flex" alignItems="flex-start" sx={{ mb: 1 }}>
              <IconifyIcon
                icon="solar:arrow-right-broken"
                sx={{ fontSize: '20px', mr: 1, lineHeight: 1.5 }}
              />
              <Box>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  Independent valuation advisory comprises independent appraisees conducting bespoke
                  business analysis and providing unbiased and accurate representation of an asset's
                  value.
                </Typography>
              </Box>
            </Box>

            {/* Arrow Point 2 */}
            <Box display="flex" alignItems="flex-start" sx={{ mb: 1 }}>
              <IconifyIcon
                icon="solar:arrow-right-broken"
                sx={{ fontSize: '20px', mr: 1, lineHeight: 1.5 }}
              />
              <Box>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  While our systems and methods are thorough and cover all major aspects of business
                  valuation analysis, we do not appoint independent appraisees to conduct bespoke
                  analysis of the subject business.
                </Typography>
              </Box>
            </Box>

            {/* Checkboxes for EL and NDA */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isELChecked}
                  onChange={(e) => setIsELChecked(e.target.checked)}
                  // color="primary"
                />
              }
              label={
                <>
                  I acknowledge and agree to the Engagement Letter (EL).{' '}
                  <a
                    href="https://docs.google.com/document/d/1U6ZH2o3NDPp3FrKQc-1ReQttTNEdtyNb/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: 'blue' }}
                  >
                    Click here to read more.
                  </a>
                </>
              }
              sx={{ fontSize: '14px' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isNDAChecked}
                  onChange={(e) => setIsNDAChecked(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <>
                  I have read and agree to the Non-Disclosure Agreement (NDA).{' '}
                  <a
                    href="https://docs.google.com/document/d/1RCiEriL3eJXqtoQL8lGiP3YfIAED5NL1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: 'blue' }}
                  >
                    Click here to read more.
                  </a>
                </>
              }
              sx={{ mb: 2, fontSize: '14px' }}
            />

            <Typography variant="body1" fontWeight="bold">
              By completing the below-set questionnaire, you consent to receive a valuation estimate
              on the subject company through our above-described self-valuation tool.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#F6FEFF' }}>
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartQuestionnaire}
              disabled={!isELChecked || !isNDAChecked}
            >
              Start Questionnaire
            </Button>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddProjectDialog;
