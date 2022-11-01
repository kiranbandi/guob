import * as React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import { Container } from "@mui/material";
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { selectTheme } from 'themeSlice';
import { useSelector } from 'react-redux';

// const darkTheme = createTheme({
//   palette: {
//     mode: 'dark',
//   },
// });

export default function ContainerWrapper({toggleTheme}) {

  // const [ isDark, setIsDark ] = useState(false)

  return (
    <div>
      <NavBar toggleTheme={toggleTheme}/>
      <Container maxWidth="xl">
        <Outlet/> 
        <Footer />
      </Container>

     
    </div>
  );
}
