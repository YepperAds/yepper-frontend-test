// WithdrawalHistory.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  ArrowLeft,
} from 'lucide-react';
import axios from 'axios';
import { Button, Container, Badge } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';

const WithdrawalHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [walletType, setWalletType] = useState('webOwner');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments.includes('advertiser')) {
      setWalletType('advertiser');
    } else {
      setWalletType('webOwner');
    }
  }, [location]);

  useEffect(() => {
    fetchWithdrawals();
  }, [walletType, currentPage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/ad-categories/wallet/${walletType}/withdrawal-requests?page=${currentPage}&limit=10`,
        { headers: getAuthHeaders() }
      );

      setWithdrawals(response.data.withdrawalRequests || []);
      setPagination({
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1,
        total: response.data.total || 0
      });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      if (error.response?.status !== 404) {
        setError('Failed to load withdrawal history');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithdrawal = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this withdrawal request?')) {
      return;
    }

    setCancellingId(requestId);
    setError('');

    try {
      await axios.patch(
        `http://localhost:5000/api/ad-categories/wallet/withdrawal-request/${requestId}/cancel`,
        {},
        { headers: getAuthHeaders() }
      );

      setSuccessMessage('Withdrawal request cancelled successfully');
      fetchWithdrawals();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to cancel withdrawal request');
    } finally {
      setCancellingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && withdrawals.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
          <Container>
            <div className="h-16 flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                <span className="font-medium">Back</span>
              </button>
              <Badge variant="default">Withdrawal History</Badge>
            </div>
          </Container>
        </header>

      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          
          {/* Error Message */}
          {error && (
            <div className="border border-red-600 bg-white p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Header with New Request Button */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-black">
            <h2 className="text-2xl font-bold text-black">Withdrawal Requests</h2>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/wallet/${walletType}/withdraw`)}
            >
              New Request
            </Button>
          </div>

          {/* Withdrawal Requests List */}
          {withdrawals.length === 0 ? (
            <div className="flex items-center justify-center min-h-64 border border-black">
              <div className="text-center p-8">
                <h3 className="text-lg font-semibold mb-2 text-black">
                  No Withdrawal Requests
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  You haven't made any withdrawal requests yet.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/wallet/${walletType}/withdraw`)}
                >
                  Create Request
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="border border-black bg-white p-6 hover:bg-gray-50 transition-colors"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <div className="text-3xl font-bold text-black mb-1">
                        {formatCurrency(withdrawal.amount)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(withdrawal.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-3 py-1 border border-black text-xs font-medium text-black mb-2">
                        {withdrawal.status.toUpperCase()}
                      </div>
                      {withdrawal.processedAt && (
                        <div className="text-xs text-gray-600">
                          Processed {formatDate(withdrawal.processedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Bank Details */}
                    <div>
                      <h4 className="text-xs font-semibold text-black mb-3 uppercase tracking-wide">
                        Bank Details
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Bank Name</p>
                          <p className="text-sm text-black font-medium">{withdrawal.bankDetails.bankName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Account Number</p>
                          <p className="text-sm text-black font-mono">
                            ****{withdrawal.bankDetails.accountNumber.slice(-4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Account Name</p>
                          <p className="text-sm text-black">{withdrawal.bankDetails.accountName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Country</p>
                          <p className="text-sm text-black">{withdrawal.bankDetails.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Balance Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-black mb-3 uppercase tracking-wide">
                        Balance Info
                      </h4>
                      <div>
                        <p className="text-xs text-gray-600">Balance at Request</p>
                        <p className="text-lg font-semibold text-black">
                          {formatCurrency(withdrawal.walletBalanceAtRequest)}
                        </p>
                      </div>
                    </div>

                    {/* Notes & Actions */}
                    <div>
                      {withdrawal.adminNotes && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-black mb-2 uppercase tracking-wide">
                            Admin Notes
                          </h4>
                          <p className="text-sm text-black bg-gray-50 p-3 border border-gray-200">
                            {withdrawal.adminNotes}
                          </p>
                        </div>
                      )}

                      {withdrawal.rejectionReason && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">
                            Rejection Reason
                          </h4>
                          <p className="text-sm text-red-600 bg-white p-3 border border-red-600">
                            {withdrawal.rejectionReason}
                          </p>
                        </div>
                      )}

                      {withdrawal.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelWithdrawal(withdrawal._id)}
                          disabled={cancellingId === withdrawal._id}
                          className="w-full"
                        >
                          {cancellingId === withdrawal._id ? 'Cancelling...' : 'Cancel Request'}
                        </Button>
                      )}

                      {withdrawal.status === 'completed' && (
                        <div className="p-3 bg-white border border-black">
                          <p className="text-xs text-black font-medium">
                            Payment sent to your bank account
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-black">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-black font-medium">
                {currentPage} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 border border-black bg-white p-4 shadow-lg animate-slide-up max-w-sm">
          <p className="text-sm text-black font-medium">{successMessage}</p>
        </div>
      )}
    </>
  );
};

export default WithdrawalHistory;