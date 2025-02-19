import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconifyIcon from 'components/base/IconifyIcon';
import { MenuItem } from 'routes/sitemap';

interface ListItemProps extends MenuItem {
  activeLink: string;
  setActiveLink: (subheader: string) => void;
}

const ListItem = ({ subheader, icon, path, activeLink, setActiveLink }: ListItemProps) => {
  const location = useLocation();

  // Effect to update the active link based on the current route
  useEffect(() => {
    if (location.hash === '#myprojects' && subheader === 'My Projects') {
      setActiveLink('My Projects');
    } else if (location.pathname === '/' && subheader === 'Dashboard') {
      setActiveLink('Dashboard');
    }
  }, [location, setActiveLink, subheader]);

  const handleClick = () => {
    setActiveLink(subheader); // Set the clicked link as active
  };

  return (
    <ListItemButton
      component={Link}
      href={path}
      onClick={handleClick}
      sx={{
        mb: 2.5,
        bgcolor: activeLink === subheader ? 'primary.main' : null,
        '&:hover': {
          bgcolor: 'primary.main',
        },
      }}
    >
      <ListItemIcon>
        {icon && (
          <IconifyIcon
            icon={icon}
            fontSize="h4.fontSize"
            sx={{
              // color: activeLink === subheader ? 'black' : null,
              color: 'black',
            }}
          />
        )}
      </ListItemIcon>
      <ListItemText
        primary={subheader}
        sx={{
          '& .MuiListItemText-primary': {
            // color: activeLink === subheader ? 'info.light' : null,
            color: 'black',
          },
          '&:hover': {
            bgcolor: 'primary.main', // Background color on hover
          },
        }}
      />
    </ListItemButton>
  );
};

export default ListItem;
