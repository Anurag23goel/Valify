import { useState } from 'react';
import { MenuItem } from 'routes/sitemap';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import IconifyIcon from 'components/base/IconifyIcon';

const CollapseListItem = ({ subheader, items, icon, activeLink, setActiveLink }: MenuItem & { activeLink: string; setActiveLink: (link: string) => void }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleLinkClick = (routeName: string) => {
    setActiveLink(routeName); // Set the clicked link as the active one
  };

  return (
    <Box sx={{ pb: 1.5 }}>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          {icon && (
            <IconifyIcon
              icon={icon}
              sx={{
                color: activeLink === subheader ? 'text.primary' : null,
              }}
            />
          )}
        </ListItemIcon>
        <ListItemText
          primary={subheader}
          sx={{
            '& .MuiListItemText-primary': {
              color: activeLink === subheader ? 'text.primary' : null,
            },
          }}
        />
        <IconifyIcon
          icon="iconamoon:arrow-down-2-duotone"
          sx={{
            color: activeLink === subheader ? 'text.primary' : 'text.disabled',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items?.map((route) => {
            const isActive = activeLink === route.name; // Check if the link is the active one

            return (
              <ListItemButton
                key={route.pathName}
                component={Link}
                href={route.path}
                sx={{
                  ml: 2.25,
                  bgcolor: isActive ? 'info.main' : null, // Active background color
                  '&:hover': {
                    bgcolor: 'primary.main', // Background color on hover
                  },
                }}
                onClick={() => handleLinkClick(route.name)} // Set active link on click
              >
                <ListItemText
                  primary={route.name}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: 'text.primary',
                      fontWeight: isActive ? 'bold' : 'normal', // Make active button bold
                    },
                    '&:hover': {
                      bgcolor: 'primary.main', // Background color on hover
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
};

export default CollapseListItem;
