import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VATLanding from './pages/VATLanding';
import VATReporting from './pages/VATReporting';
import VATServices from './pages/VATServices';
import VATRefund from './pages/VATRefund';
import MyFilings from './pages/MyFilings';
import NewVATReturn from './pages/NewVATReturn';
import NewCorporateTaxReturn from './pages/NewCorporateTaxReturn';
import CorporateTax from './pages/CorporateTax';
import Correspondence from './pages/Correspondence';
import Payments from './pages/Payments';
import TaxablePerson from './pages/TaxablePerson';
import OtherServices from './pages/OtherServices';
import VATReturnDetail from './pages/VATReturnDetail';
import { ExciseTax, UserAuthorization, Audit, EInvoicing } from './pages/Placeholders';
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/vat" element={<VATLanding />} />
                    <Route path="/vat/my-filings" element={<MyFilings />} />
                    <Route path="/vat/services" element={<VATServices />} />
                    <Route path="/vat/refund" element={<VATRefund />} />
                    <Route path="/vat/reporting" element={<VATReporting />} />
                    <Route path="/vat/new" element={<NewVATReturn />} />
                    <Route path="/vat/:id" element={<VATReturnDetail />} />
                    <Route 
                      path="/corporate-tax" 
                      element={
                        <RoleGuard allowedRoles={['corporate', 'agent']}>
                          <CorporateTax />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/corporate-tax/new" 
                      element={
                        <RoleGuard allowedRoles={['corporate', 'agent']}>
                          <NewCorporateTaxReturn />
                        </RoleGuard>
                      } 
                    />
                    <Route path="/excise-tax" element={<ExciseTax />} />
                    <Route path="/user-authorization" element={<UserAuthorization />} />
                    <Route path="/audit" element={<Audit />} />
                    <Route path="/e-invoicing" element={<EInvoicing />} />
                    <Route path="/correspondence" element={<Correspondence />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/taxable-person" element={<TaxablePerson />} />
                    <Route path="/other-services" element={<OtherServices />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
