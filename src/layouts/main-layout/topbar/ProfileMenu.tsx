import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconifyIcon from 'components/base/IconifyIcon';
import ProfileImage from 'assets/images/profile.png';
import { auth, signOut } from 'firebase.ts'; // Import auth and signOut from your firebase.ts

interface MenuItems {
  id: number;
  title: string;
  icon: string;
}

const menuItems: MenuItems[] = [
  // {
  //   id: 1,
  //   title: 'View Profile',
  //   icon: 'ic:outline-account-circle',
  // },
  // {
  //   id: 2,
  //   title: 'Notifications',
  //   icon: 'ic:outline-notifications-none',
  // },
  // {
  //   id: 5,
  //   title: 'Help Center',
  //   icon: 'ic:outline-contact-support',
  // },
  {
    id: 3,
    title: 'Logout',
    icon: 'ic:baseline-logout',
  },
];

const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<{ name: string | null; email: string | null }>({
    name: null,
    email: null,
  });
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser({
          name: authUser.displayName,
          email: authUser.email,
        });
      } else {
        setUser({
          name: null,
          email: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User logged out successfully');
        setUser({ name: null, email: null }); // Clear the user info
        navigate('/auth/signin');
      })
      .catch((error) => {
        console.error('Error logging out: ', error);
      });
  };

  return (
    <>
      <ButtonBase
        sx={{ ml: 1 }}
        onClick={handleProfileClick}
        aria-controls={open ? 'account-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        disableRipple
      >
        <Avatar
          src={ProfileImage}
          sx={{
            height: 44,
            width: 44,
            bgcolor: 'primary.main',
          }}
        />
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        sx={{
          mt: 1.5,
          '& .MuiList-root': {
            p: 0,
            width: 230,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box p={1}>
          <MenuItem onClick={handleProfileMenuClose} sx={{ '&:hover': { bgcolor: 'info.dark' } }}>
            <Avatar src={ProfileImage} sx={{ mr: 1, height: 42, width: 42 }} />
            <Stack direction="column">
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {user.name || 'Guest User'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={400}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100px', // Set a maximum width to control truncation
                }}
              >
                {user.email || 'No Email'}
              </Typography>
            </Stack>
          </MenuItem>
        </Box>

        <Divider sx={{ my: 0 }} />

        <Box p={1}>
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              onClick={item.title === 'Logout' ? handleLogout : handleProfileMenuClose}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 'h5.fontSize' }}>
                <IconifyIcon icon={item.icon} />
              </ListItemIcon>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {item.title}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </>
  );
};

export default ProfileMenu;
