import React from 'react';
import ReactDOM from 'react-dom/client';
import { Container } from './components';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Expenses, Invoices, Invoice, NotFound } from './Pages';
import CssBaseline from '@mui/material/CssBaseline';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Container />}>
            <Route path="expenses" element={<Expenses />} />
            <Route path="invoices" element={<Invoices />}>
              <Route index element={
                <main style={{ padding: '1rem' }}>
                  <p>Select an invoice</p>
                </main>
              }
              />
              <Route path=":invoiceId" element={<Invoice />} />
            </Route>
            <Route path="*" element={NotFound}
            />
          </Route>
        </Routes>
      </HashRouter>
    </Provider>
  </React.StrictMode>
);
