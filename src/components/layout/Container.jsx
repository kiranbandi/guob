import * as React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import { Container } from "@mui/material";


export default function ContainerWrapper() {
  return (
    <div>
      <NavBar />
      <Container maxWidth="xl">
        <Outlet /> 
        <Footer />
      </Container>
     
    </div>
  );
}
