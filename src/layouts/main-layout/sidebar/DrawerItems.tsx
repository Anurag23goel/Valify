import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, signOut } from 'firebase.ts'; // Import auth and signOut from your firebase.ts
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import ListItem from './list-items/ListItem';
import CollapseListItem from './list-items/CollapseListItem';
import Image from 'components/base/Image';
import IconifyIcon from 'components/base/IconifyIcon';
import LogoImg from 'assets/images/logo.png';
import sitemap from 'routes/sitemap';
import { fontFamily } from 'theme/typography';

const DrawerItems = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [activeLink, setActiveLink] = useState('Dashboard'); // Default active link

  // Update active link based on current location
  useEffect(() => {
    // Handle both pathname and hash together to prevent conflicts
    if (location.pathname === '/') {
      if (location.hash === '#myprojects' && activeLink !== 'My Projects') {
        setActiveLink('My Projects');
      } else if (!location.hash && activeLink !== 'Dashboard') {
        setActiveLink('Dashboard');
      }
    }
  }, [location, activeLink]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User logged out successfully');
        navigate('/auth/signin'); // Redirect to signin page after logout
      })
      .catch((error) => {
        console.error('Error logging out: ', error);
      });
  };

  return (
    <>
      <Stack
        pt={5}
        pb={3.5}
        px={4.5}
        position="sticky"
        top={0}
        bgcolor="info.slate"
        alignItems="center"
        justifyContent="flex-start"
        zIndex={1000}
      >
        <ButtonBase component={Link} href="/" disableRipple>
          <Image src={LogoImg} alt="logo" height={52} width={52} sx={{ mr: 1.75 }} />
          <Box>
            <Typography
              mt={0.25}
              variant="h3"
              color="#FBAE17"
              textTransform="uppercase"
              letterSpacing={1}
              fontFamily={fontFamily.leelawadee}
            >
              VALIFY
            </Typography>
          </Box>
        </ButtonBase>
      </Stack>

      {/* Center-align and enlarge the Welcome text */}
      <Typography variant="h5" align="center" sx={{ mt: 2 }}>
        Welcome
      </Typography>

      <List component="nav" sx={{ mt: 2.5, mb: 10, px: 4.5 }}>
        {sitemap.map((route) =>
          route.items ? (
            <CollapseListItem
              key={route.id}
              {...route}
              activeLink={activeLink} // Pass activeLink
              setActiveLink={setActiveLink} // Pass the setter function
            />
          ) : (
            <ListItem
              key={route.id}
              {...route}
              activeLink={activeLink} // Pass activeLink
              setActiveLink={setActiveLink} // Pass the setter function
            />
          ),
        )}
      </List>

      <Box mt="auto" px={3} pb={2}>
        <Button
          variant="text"
          startIcon={<IconifyIcon icon="ic:baseline-logout" />}
          onClick={handleLogout}
          sx={{ color: 'black' }}
        >
          Log Out
        </Button>
      </Box>
    </>
  );
};

export default DrawerItems;
