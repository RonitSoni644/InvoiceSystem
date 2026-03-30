import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Invoices } from './pages/Invoices';
import { InvoiceForm } from './pages/InvoiceForm';
import { InvoiceView } from './pages/InvoiceView';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: '/invoices',
    element: <Layout><Invoices /></Layout>,
  },
  {
    path: '/invoices/new',
    element: <Layout><InvoiceForm /></Layout>,
  },
  {
    path: '/invoices/:id',
    element: <Layout><InvoiceView /></Layout>,
  },
  {
    path: '/invoices/:id/edit',
    element: <Layout><InvoiceForm /></Layout>,
  },
  {
    path: '/customers',
    element: <Layout><Customers /></Layout>,
  },
  {
    path: '/products',
    element: <Layout><Products /></Layout>,
  },
  {
    path: '/reports',
    element: <Layout><Reports /></Layout>,
  },
  {
    path: '/settings',
    element: <Layout><Settings /></Layout>,
  },
]);
