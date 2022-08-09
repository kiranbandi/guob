import * as React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function Container() {
  return (
    <div>
      <NavBar />
      <Outlet />
      {/* Footer in Future Development */}
    </div>
  );
}
