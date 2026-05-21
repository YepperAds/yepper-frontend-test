// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';

import MarketingSection from './pages/MarketingSection';
import Dost from './Dost'

// User Auth
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AuthSuccess from './pages/AuthSuccess';
import VerifySuccess from './pages/VerifySuccess';
import VerifyError from './pages/VerifyError';
import EmailVerification from './pages/EmailVerificationPending';
import CheckEmail from './pages/CheckEmail';

// reset password
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// AdPromoter
import WebsiteCreation from './AdPromoter/pages/websiteCreation';
import CategoryCreation from './AdPromoter/pages/categoryCreation';
import Websites from './AdPromoter/pages/Websites'
import WebsiteDetails from './AdPromoter/pages/WebsiteDetails';
import PendingWebAds from './AdPromoter/pages/pendingWebAds';
import BusinessCategorySelection from './AdPromoter/pages/BusinessCategorySelection';
import Wallet from './AdPromoter/pages/Wallet';

import AdReports from './AdPromoter/pages/AdReports';
import AvailableAdsForWebOwners from './AdPromoter/pages/AvailableAdsForWebOwners';
import WithdrawalDashboard from './AdPromoter/pages/WithdrawalDashboard';
import WithdrawalAdmin from './AdPromoter/pages/WithdrawalAdmin';
import WithdrawalHistory from './AdPromoter/pages/WithdrawalHistory';
import UnifiedWebsiteCreation from './AdPromoter/pages/UnifiedWebsiteCreation';

// AdOwner
import UploadAdForWeb from './AdOwner/pages/UploadAdForWeb';
import InfoForm from './AdOwner/pages/InfoForm';
import WebsitesSelection from './AdOwner/pages/WebsitesSelection';
import CategoriesSelection from './AdOwner/pages/CategoriesSelection';
import PaymentCallback from './AdOwner/pages/PaymentCallback';
import PaymentCallback2 from './AdOwner/pages/PaymentCallback2';
import Ads from './AdOwner/pages/Ads';
import UpdateAdSelections from './AdOwner/pages/UpdateAdSelections';
import AdDetails from './AdOwner/pages/AdDetails';
import SelectWebsitesForExistingAd from './AdOwner/pages/SelectWebsitesForExistingAd';
import SelectCategoriesForExistingAd from './AdOwner/pages/SelectCategoriesForExistingAd';
import DirectAdvertise from './AdOwner/pages/DirectAdvertise';
import UnifiedAdUploadFlow from './AdOwner/pages/UnifiedAdUploadFlow';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about-yepper" element={<MarketingSection />} />

              <Route path="/dost" element={<Dost />} />

              {/* User Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/success" element={<AuthSuccess />} />
              <Route path="/verify-success" element={<VerifySuccess />} />
              <Route path="/verify-error" element={<VerifyError />} />
              <Route path="/email-verification" element={<EmailVerification />} />
              <Route path="/check-email" element={<CheckEmail />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/add-website" element={<UnifiedWebsiteCreation />} />
              <Route path="/advertise" element={<UnifiedAdUploadFlow />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* AdPromoter */}
              <Route path="/websites" element={
                <ProtectedRoute>
                  <Websites />
                </ProtectedRoute>
              } />

              <Route path="/create-website" element={
                <ProtectedRoute>
                  <WebsiteCreation />
                </ProtectedRoute>
              } />

              <Route path="/business-categories/:websiteId" element={
                <ProtectedRoute>
                  <BusinessCategorySelection />
                </ProtectedRoute>
              } />

              <Route path="/create-categories/:websiteId" element={
                <ProtectedRoute>
                  <CategoryCreation />
                </ProtectedRoute>
              } />

              <Route path="/website/:websiteId" element={
                <ProtectedRoute>
                  <WebsiteDetails />
                </ProtectedRoute>
              } />

              <Route path="/pending-ads" element={
                <ProtectedRoute>
                  <PendingWebAds />
                </ProtectedRoute>
              } />

              <Route path="/wallet" element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              } />

              <Route path="/ad-reports" element={
                <ProtectedRoute>
                  <AdReports />
                </ProtectedRoute>
              } />

              <Route path="/available-ads/:websiteId" element={
                <ProtectedRoute>
                  <AvailableAdsForWebOwners />
                </ProtectedRoute>
              } />

              <Route path="/wallet/:walletType/withdraw" element={
                <ProtectedRoute>
                  <WithdrawalDashboard />
                </ProtectedRoute>
              } />

              <Route path="/wallet/:walletType/withdrawals" element={
                <ProtectedRoute>
                  <WithdrawalHistory />
                </ProtectedRoute>
              } />

              <Route path="/admin/withdrawals" element={
                <ProtectedRoute>
                  <WithdrawalAdmin />
                </ProtectedRoute>
              } />

              {/* AdOwner */}
              <Route path="/upload-ad" element={
                <ProtectedRoute>
                  <UploadAdForWeb />
                </ProtectedRoute>
              } />

              <Route path="/insert-data" element={
                <ProtectedRoute>
                  <InfoForm />
                </ProtectedRoute>
              } />

              <Route path="/select-websites" element={
                <ProtectedRoute>
                  <WebsitesSelection />
                </ProtectedRoute>
              } />

              <Route path="/select-categories" element={
                <ProtectedRoute>
                  <CategoriesSelection />
                </ProtectedRoute>
              } />

              <Route path="/payment-callback2" element={
                <ProtectedRoute>
                  <PaymentCallback2 />
                </ProtectedRoute>
              } />

              <Route path="/ads" element={
                <ProtectedRoute>
                  <Ads />
                </ProtectedRoute>
              } />

              <Route path="/update-ad-selections" element={
                <ProtectedRoute>
                  <UpdateAdSelections />
                </ProtectedRoute>
              } />

              <Route path="/ad-details/:adId" element={
                <ProtectedRoute>
                  <AdDetails />
                </ProtectedRoute>
              } />

              <Route path="/select-websites-for-ad" element={
                <ProtectedRoute>
                  <SelectWebsitesForExistingAd />
                </ProtectedRoute>
              } />

              <Route path="/select-categories-for-ad" element={
                <ProtectedRoute>
                  <SelectCategoriesForExistingAd />
                </ProtectedRoute>
              } />

              <Route path="/direct-ad" element={
                <ProtectedRoute allowUnauthorized={true}>
                  <DirectAdvertise />
                </ProtectedRoute>
              } />

            </Routes>
          </div>
        </Router>
      </AuthProvider>
      
      {/* Add React Query DevTools for development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;