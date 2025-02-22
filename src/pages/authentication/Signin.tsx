import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';
import { sendPasswordResetEmail, auth, signInWithEmailAndPassword } from '../../firebase'; // Import auth
import { onAuthStateChanged } from 'firebase/auth';

interface User {
  email: string;
  password: string;
}

const Signin = () => {
  const [user, setUser] = useState<User>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is logged in, redirect to a different page
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
      console.log('User signed in:', userCredential.user);
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setResetEmailSent(true);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Error sending reset email:', error);
    }
  };

  const openForgotPasswordDialogHandler = () => {
    setOpenForgotPasswordDialog(true);
  };

  const closeForgotPasswordDialogHandler = () => {
    setOpenForgotPasswordDialog(false);
    setResetEmailSent(false);
  };

  return (
    <>
      <Typography align="center" variant="h4">
        Sign In
      </Typography>
      <Typography mt={1.5} align="center" variant="body2">
        Welcome back! Let's continue with,
      </Typography>

      <Stack component="form" mt={3} onSubmit={handleSubmit} direction="column" gap={2}>
        <TextField
          id="email"
          name="email"
          type="email"
          value={user.email}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Your Email"
          autoComplete="email"
          fullWidth
          autoFocus
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="ic:baseline-alternate-email" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={user.password}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Your Password"
          autoComplete="current-password"
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="ic:outline-lock" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  <IconifyIcon
                    icon={showPassword ? 'ic:outline-visibility' : 'ic:outline-visibility-off'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack mt={-1.25} alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={<Checkbox id="checkbox" name="checkbox" size="medium" color="primary" />}
            label="Remember me"
            sx={{ ml: -0.75 }}
          />
          <Link href="#!" fontSize="body2.fontSize" onClick={openForgotPasswordDialogHandler}>
            Forgot password?
          </Link>
        </Stack>

        <Button type="submit" variant="contained" size="medium" fullWidth disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Stack>

      <Typography mt={5} variant="body2" color="text.secondary" align="center" letterSpacing={0.25}>
        Don't have an account? <Link component="button" onClick={() => navigate("/auth/signup")} sx={{ cursor: "pointer" }}>
    Signup
  </Link>
      </Typography>

      {/* Forgot Password Dialog */}
      <Dialog
        open={openForgotPasswordDialog}
        onClose={closeForgotPasswordDialogHandler}
        sx={{ '& .MuiDialog-paper': { width: '400px', maxWidth: '90%' } }} // Adjust width as needed
      >
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="forgot-password-email"
            type="email"
            fullWidth
            variant="filled"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            placeholder="Enter your email" // Use placeholder instead of label
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="ic:baseline-alternate-email" />
                </InputAdornment>
              ),
            }}
          />
          {resetEmailSent && (
            <Typography mt={2} color="success.main">
              Password reset email has been sent.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForgotPasswordDialogHandler}>Cancel</Button>
          <Button
            onClick={handleForgotPassword}
            variant="contained"
            disabled={!forgotPasswordEmail}
          >
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Signin;
