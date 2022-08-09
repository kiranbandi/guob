import React from "react";
import { AppBar, Toolbar, Typography, Container, Box, IconButton, Menu, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';

const pages = ['dashboard', 'documentation', 'demo'];


function Navbar() {

  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const StyledLink = styled(Link)(({ theme }) => ({
    color: 'white',
    margin: theme.spacing(2),
    textDecoration: 'none',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }));

  const StyledMenuLink = styled(Link)` 
margin: 10px;
text-decoration: none;
text-transform: uppercase;
font-weight: bold;
`;

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <ViewTimelineIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/#"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}>
            GUOB
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <StyledMenuLink
                    to={page}
                    onClick={handleCloseNavMenu}>
                    {page}
                  </StyledMenuLink>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <ViewTimelineIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/#"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            GUOB
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <StyledLink
                key={'link-' + page}
                to={page}
                onClick={handleCloseNavMenu}>
                {page}
              </StyledLink>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;