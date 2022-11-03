
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Container } from './components';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Dashboard, Demo, Documentation, Home, NotFound, AgricultureDemo } from './pages';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { selectTheme } from 'themeSlice';
import { useSelector } from 'react-redux';
import { useState } from 'react';




export default function App() {

    // const themeSelector = useSelector(selectTheme)

    const [ isDark, setIsDark ] = useState(false)

    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });


    const lightTheme = createTheme({
        palette: {
          mode: 'light',
        },
      });

    return (
<>

        {/* // <React.StrictMode> */}
<ThemeProvider theme={isDark ? darkTheme : lightTheme}>
<CssBaseline />
<Provider store={store}>
  <DndProvider backend={HTML5Backend}>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Container toggleTheme={() => setIsDark(!isDark)} isDark={isDark}/>}>
          <Route index element={<Home />} />
          {/* uncessary syntatic sugar since react-router v6 doesnt support optional path params */}
          <Route path="dashboard">
            <Route index element={<Dashboard isDark={isDark}/>} />
            <Route path=":dataID" element={<Dashboard isDark={isDark}/>} />
          </Route>
          <Route path="demo" element={<Demo isDark={isDark}/>} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="*" element={<NotFound />}
          />
        </Route>
      </Routes>
    </HashRouter>
  </DndProvider>
</Provider>
</ThemeProvider>
{/* // </React.StrictMode> */}
</>
);
}