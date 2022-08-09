import React from 'react';
import ReactDOM from 'react-dom/client';
import { Container } from './components';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Dashboard, Demo, Documentation, Home, NotFound } from './pages';
import CssBaseline from '@mui/material/CssBaseline';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Container />}>
              <Route index element={<Home />} />
              {/* uncessary syntatic sugar since react-router v6 doesnt support optional path params */}
              <Route path="dashboard">
                <Route index element={<Dashboard />} />
                <Route path=":dataID" element={<Dashboard />} />
              </Route>
              <Route path="demo" element={<Demo />} />
              <Route path="documentation" element={<Documentation />} />
              <Route path="*" element={<NotFound />}
              />
            </Route>
          </Routes>
        </HashRouter>
      </DndProvider>
    </Provider>
  </React.StrictMode>
);
