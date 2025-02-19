import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import DrawerItems from './DrawerItems';
import { Typography } from '@mui/material';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ mobileOpen, setMobileOpen, setIsClosing }: SidebarProps) => {
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  return (
    <Box
      component="nav"
      width={{ lg: 300 }}
      flexShrink={{ lg: 0 }}
      display={{ xs: 'none', lg: 'block' }}
    >
      <Typography>Welcome</Typography>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { backgroundColor: '#C1E5E9' } // Set background color for mobile drawer
        }}
      >
        <DrawerItems />
      </Drawer>

      {/* Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { backgroundColor: '#C1E5E9' } // Set background color for permanent drawer
        }}
        open
      >
        <DrawerItems />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
