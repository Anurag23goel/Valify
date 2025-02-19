// import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import Toolbar from '@mui/material/Toolbar';
// import TextField from '@mui/material/TextField';
// import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
// import InputAdornment from '@mui/material/InputAdornment';
import IconifyIcon from 'components/base/IconifyIcon';
// import LanguageSelect from './LanguageSelect';
import ProfileMenu from './ProfileMenu';
// import Image from 'components/base/Image';
// import LogoImg from 'assets/images/logo.png';

interface TopbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar = ({ isClosing, mobileOpen, setMobileOpen }: TopbarProps) => {
  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Stack
      py={3.5}
      alignItems="center"
      justifyContent="space-between"
      bgcolor="transparent"
      zIndex={1200}
    >
      <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center">
        {/* <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{
            lineHeight: 0,
            display: { xs: 'none', sm: 'block', lg: 'none' },
          }}
        >
          <Image src={LogoImg} alt="logo" height={40} width={40} />
        </ButtonBase> */}

        <Toolbar
          sx={{
            display: { xm: 'flex', lg: 'none' }, // Use 'xs' instead of 'xm'
            backgroundColor: 'white',
            borderRadius: '50%',
            paddingX: 2,
            width: 60, // Set the width
            height: 60, // Set the height to make it a circle
            justifyContent: 'center', // Center horizontally
            alignItems: 'center', // Center vertically
          }}
        ><IconButton
          size="large"
          edge="start"
          aria-label="menu"
          onClick={handleDrawerToggle}
          sx={{ mx: 2 }}
        >
            <IconifyIcon icon="ic:baseline-menu" sx={{ color: 'black' }} /> {/* Set icon color to black */}
          </IconButton>
        </Toolbar>

        {/* <Toolbar sx={{ ml: -1.5, display: { xm: 'block', md: 'none' } }}>
          <IconButton size="large" edge="start" color="inherit" aria-label="search">
            <IconifyIcon icon="eva:search-fill" />
          </IconButton>
        </Toolbar> */}

        {/* <TextField
          variant="filled"
          placeholder="Search"
          sx={{ width: 340, display: { xs: 'none', md: 'flex' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
        /> */}
      </Stack>

      <Stack spacing={{ xs: 1, sm: 2 }} alignItems="center">
        {/* <LanguageSelect /> */}

        <ProfileMenu />
      </Stack>
    </Stack>
  );
};

export default Topbar;
