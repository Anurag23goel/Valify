import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
// import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth'; // Import updateProfile from Firebase

const Signup = () => {
  const [user, setUser] = useState({ name: '', email: '', password: '' }); // Include name field
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null); // Store the Firebase user
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle input changes for the signup form
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle form submission for email/password signup
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      setFirebaseUser(userCredential.user); // Store the authenticated user

      // Update the user profile with the name
      await updateProfile(userCredential.user, {
        displayName: user.name,
      });

      console.log('User signed up successfully:', userCredential.user);
      navigate('/'); // Redirect to homepage after successful signup
    } catch (error) {
      console.error('Error during email/password signup:', error);
    }
  };

  // Handle Google sign-in when the Google button is clicked
  // const handleGoogleSignup = async () => {
  //   try {
  //     const userCredential = await signInWithPopup(auth, googleProvider);
  //     setFirebaseUser(userCredential.user); // Store the authenticated user
  //     console.log('User signed in with Google:', userCredential.user);
  //     navigate('/'); // Redirect to homepage after successful Google sign-in
  //   } catch (error) {
  //     console.error('Error during Google sign-in:', error);
  //   }
  // };

  return (
    <>
      <Typography align="center" variant="h4">
        Sign Up
      </Typography>
      <Typography mt={1.5} align="center" variant="body2">
        Let's Join us! create account with,
      </Typography>

      {/* <Stack mt={3} spacing={1.75} width={1}>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<IconifyIcon icon="logos:google-icon" />}
          onClick={handleGoogleSignup} // Call Google signup function
          sx={{ bgcolor: 'info.main', '&:hover': { bgcolor: 'info.main' } }}
        >
          Google
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<IconifyIcon icon="logos:apple" sx={{ mb: 0.5 }} />}
          sx={{ bgcolor: 'info.main', '&:hover': { bgcolor: 'info.main' } }}
        >
          Apple
        </Button>
      </Stack>

      <Divider sx={{ my: 4 }}>or Signup with</Divider> */}

      <Stack component="form" mt={3} onSubmit={handleSubmit} direction="column" gap={2}>
        <TextField
          id="name"
          name="name"
          type="text"
          value={user.name}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Your Name"
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="ic:outline-person" />
              </InputAdornment>
            ),
          }}
        />
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
              <InputAdornment
                position="end"
                sx={{
                  opacity: user.password ? 1 : 0,
                  pointerEvents: user.password ? 'auto' : 'none',
                }}
              >
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ border: 'none', bgcolor: 'transparent !important' }}
                  edge="end"
                >
                  <IconifyIcon
                    icon={showPassword ? 'ic:outline-visibility' : 'ic:outline-visibility-off'}
                    color="neutral.light"
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" variant="contained" size="medium" fullWidth sx={{ mt: 1.5 }}>
          Sign Up
        </Button>
      </Stack>

      {firebaseUser && (
        <Typography mt={3} variant="body2" align="center" color="success.main">
          Welcome, {firebaseUser.displayName || firebaseUser.email}! You have successfully signed up.
        </Typography>
      )}

      <Typography mt={5} variant="body2" color="text.secondary" align="center" letterSpacing={0.25}>
        Already have an account? <Link href={paths.signin}>Signin</Link>
      </Typography>
    </>
  );
};

export default Signup;
