// admin/WithdrawalDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { Button, Grid, Container, Badge } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';

const WithdrawalDashboard = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterOwnerType, setFilterOwnerType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [modalAction, setModalAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

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
    fetchWithdrawals();
  }, [filterStatus, filterOwnerType, currentPage]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (filterStatus) params.append('status', filterStatus);
      if (filterOwnerType) params.append('ownerType', filterOwnerType);

      const response = await axios.get(
        `http://localhost:5000/api/ad-categories/admin/withdrawal-requests?${params}`,
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
      setError('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const openProcessModal = (withdrawal, action) => {
    setSelectedWithdrawal(withdrawal);
    setModalAction(action);
    setAdminNotes('');
    setRejectionReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWithdrawal(null);
    setModalAction('');
    setAdminNotes('');
    setRejectionReason('');
  };

  const handleProcessWithdrawal = async () => {
    if (!selectedWithdrawal) return;

    if (modalAction === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setProcessing(selectedWithdrawal._id);
    setError('');
    setSuccess('');

    try {
      const payload = {
        action: modalAction,
        adminNotes: adminNotes || undefined,
        rejectionReason: modalAction === 'reject' ? rejectionReason : undefined
      };

      await axios.patch(
        `http://localhost:5000/api/ad-categories/admin/withdrawal-request/${selectedWithdrawal._id}/process`,
        payload,
        { headers: getAuthHeaders() }
      );

      setSuccess(`Withdrawal request ${modalAction}d successfully`);
      closeModal();
      fetchWithdrawals();
    } catch (error) {
      setError(error.response?.data?.error || `Failed to ${modalAction} withdrawal request`);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      approved: { text: 'Approved', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      completed: { text: 'Completed', className: 'bg-green-100 text-green-800 border-green-300' },
      rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800 border-red-300' },
      cancelled: { text: 'Cancelled', className: 'bg-gray-100 text-gray-800 border-gray-300' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 text-xs font-semibold border ${config.className}`}>
        {config.text}
      </span>
    );
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
            <Badge variant="default">Admin - Withdrawal Management</Badge>
          </div>
        </Container>
      </header>

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          {/* Success/Error Messages */}
          {success && (
            <div className="border border-green-600 bg-green-50 p-4 mb-6 flex items-start">
              <CheckCircle size={20} className="text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="border border-red-600 bg-red-50 p-4 mb-6 flex items-start">
              <AlertCircle size={20} className="text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 items-center">
            <div className="flex items-center gap-2">
              <Filter size={20} />
              <span className="font-semibold">Filters:</span>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-black bg-white text-black focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterOwnerType}
              onChange={(e) => {
                setFilterOwnerType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-black bg-white text-black focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="webOwner">Web Owner</option>
              <option value="advertiser">Advertiser</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setFilterStatus('pending');
                setFilterOwnerType('');
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>

          {/* Withdrawal Requests */}
          {withdrawals.length === 0 ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-600">
                  No Withdrawal Requests Found
                </h3>
                <p className="text-gray-500">
                  {filterStatus ? `No ${filterStatus} requests at the moment` : 'No withdrawal requests yet'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="border border-black bg-white p-6 hover:bg-gray-50 transition-all"
                >
                  <Grid cols={3} gap={6}>
                    {/* Left Column - User & Amount Info */}
                    <div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-600 mb-1">User Email</p>
                        <p className="text-black font-medium">{withdrawal.userEmail}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Type</p>
                        <p className="text-black font-medium capitalize">
                          {withdrawal.ownerType === 'webOwner' ? 'Web Owner' : 'Advertiser'}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Withdrawal Amount</p>
                        <p className="text-2xl font-bold text-black">{formatCurrency(withdrawal.amount)}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Wallet Balance at Request</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(withdrawal.walletBalanceAtRequest)}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Current Wallet Balance</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(withdrawal.walletId?.balance || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                    </div>

                    {/* Middle Column - Bank Details */}
                    <div>
                      <h4 className="text-lg font-bold text-black mb-4">Bank Details</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Bank Name</p>
                          <p className="text-black">{withdrawal.bankDetails.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Account Number</p>
                          <p className="text-black font-mono">{withdrawal.bankDetails.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Account Name</p>
                          <p className="text-black">{withdrawal.bankDetails.accountName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Country</p>
                          <p className="text-black">{withdrawal.bankDetails.country}</p>
                        </div>
                        {withdrawal.bankDetails.routingNumber && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Routing Number</p>
                            <p className="text-black font-mono">{withdrawal.bankDetails.routingNumber}</p>
                          </div>
                        )}
                        {withdrawal.bankDetails.swiftCode && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600">SWIFT Code</p>
                            <p className="text-black font-mono">{withdrawal.bankDetails.swiftCode}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Request Info & Actions */}
                    <div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Requested On</p>
                        <p className="text-black">{formatDate(withdrawal.createdAt)}</p>
                      </div>
                      {withdrawal.processedAt && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-600 mb-1">Processed On</p>
                          <p className="text-black">{formatDate(withdrawal.processedAt)}</p>
                        </div>
                      )}
                      {withdrawal.adminNotes && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-600 mb-1">Admin Notes</p>
                          <p className="text-black text-sm">{withdrawal.adminNotes}</p>
                        </div>
                      )}
                      {withdrawal.rejectionReason && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-600 mb-1">Rejection Reason</p>
                          <p className="text-red-600 text-sm">{withdrawal.rejectionReason}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-6 space-y-3">
                        {withdrawal.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openProcessModal(withdrawal, 'approve')}
                              disabled={processing === withdrawal._id}
                              className="w-full"
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openProcessModal(withdrawal, 'reject')}
                              disabled={processing === withdrawal._id}
                              className="w-full border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={16} className="mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        {withdrawal.status === 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openProcessModal(withdrawal, 'complete')}
                            disabled={processing === withdrawal._id}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <DollarSign size={16} className="mr-2" />
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </Grid>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-black font-medium">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Process Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold text-black mb-6">
              {modalAction === 'approve' && 'Approve Withdrawal'}
              {modalAction === 'reject' && 'Reject Withdrawal'}
              {modalAction === 'complete' && 'Complete Withdrawal'}
            </h3>

            <div className="mb-6">
              <p className="text-black mb-2">
                <span className="font-semibold">Amount:</span> {formatCurrency(selectedWithdrawal.amount)}
              </p>
              <p className="text-black mb-2">
                <span className="font-semibold">User:</span> {selectedWithdrawal.userEmail}
              </p>
              <p className="text-black mb-2">
                <span className="font-semibold">Current Balance:</span>{' '}
                <span className={selectedWithdrawal.walletId?.balance >= selectedWithdrawal.amount ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(selectedWithdrawal.walletId?.balance || 0)}
                </span>
              </p>
            </div>

            {modalAction === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for rejection"
                  className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this action"
                className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none"
              />
            </div>

            {modalAction === 'complete' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300">
                <p className="text-yellow-800 text-sm">
                  <strong>Warning:</strong> This will deduct {formatCurrency(selectedWithdrawal.amount)} from the user's wallet.
                  Make sure you have transferred the money to their bank account before completing.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={handleProcessWithdrawal}
                disabled={processing === selectedWithdrawal._id}
                className="flex-1"
              >
                {processing === selectedWithdrawal._id ? 'Processing...' : 'Confirm'}
              </Button>
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={processing === selectedWithdrawal._id}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WithdrawalDashboard;