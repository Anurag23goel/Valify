import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const Footer = () => {
  return (
    <Typography
      mt={0.5}
      px={1}
      py={3}
      color="text.secondary"
      variant="body2"
      sx={{ textAlign: { xs: 'center', md: 'right' } }}
      letterSpacing={0.5}
      fontWeight={500}
    >
      © 2024{' '}
      <Link href="https://technorthstar.com/" target="_blank" rel="noreferrer">
        {'Northstar'}
      </Link>
      . All Rights Reserved.
    </Typography>
  );
};

export default Footer;
