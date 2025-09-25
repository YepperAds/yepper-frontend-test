// WithdrawalDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Bitcoin,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';

const WithdrawalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [walletInfo, setWalletInfo] = useState(null);
  const [withdrawalMethods, setWithdrawalMethods] = useState({});
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    fetchWalletInfo();
    fetchWithdrawalMethods();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://yepper-backend.onrender.com/api/withdrawals/wallet-info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setWalletInfo(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch wallet information');
    }
  };

  const fetchWithdrawalMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://yepper-backend.onrender.com/api/withdrawals/methods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setWithdrawalMethods(data.methods);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal methods');
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://yepper-backend.onrender.com/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          method: selectedMethod,
          accountDetails
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Withdrawal request submitted successfully!');
        setShowWithdrawalForm(false);
        setWithdrawalAmount('');
        setAccountDetails({});
        setSelectedMethod('');
        fetchWalletInfo(); // Refresh wallet info
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const cancelWithdrawal = async (withdrawalId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://yepper-backend.onrender.com/api/withdrawals/${withdrawalId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Withdrawal cancelled successfully');
        fetchWalletInfo();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to cancel withdrawal');
    }
  };

  const renderAccountDetailsForm = () => {
    if (!selectedMethod || !withdrawalMethods[selectedMethod]) return null;

    const method = withdrawalMethods[selectedMethod];
    
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Account Details</h4>
        {method.requiredFields.map((field) => (
          <div key={field.field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                value={accountDetails[field.field] || ''}
                onChange={(e) => setAccountDetails(prev => ({
                  ...prev,
                  [field.field]: e.target.value
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={accountDetails[field.field] || ''}
                onChange={(e) => setAccountDetails(prev => ({
                  ...prev,
                  [field.field]: e.target.value
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'bank_transfer':
        return <Building2 className="w-5 h-5" />;
      case 'mobile_money':
        return <Smartphone className="w-5 h-5" />;
      case 'paypal':
        return <CreditCard className="w-5 h-5" />;
      case 'crypto':
        return <Bitcoin className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  if (!walletInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet & Withdrawals</h1>
        <p className="text-gray-600">Manage your earnings and withdraw funds</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Total Balance</h3>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {showBalance ? `${walletInfo.wallet.balance.toFixed(2)}` : '••••'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Download className="w-8 h-8 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Available</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${walletInfo.wallet.availableForWithdrawal.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Pending</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            ${walletInfo.wallet.pendingWithdrawals.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Total Earned</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            ${walletInfo.wallet.totalEarned.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'withdraw', label: 'Withdraw', icon: Download },
            { id: 'history', label: 'History', icon: Calendar }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {walletInfo.recentTransactions && walletInfo.recentTransactions.length > 0 ? (
                walletInfo.recentTransactions.map((transaction, index) => (
                  <div key={index} className="p-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`w-4 h-4 ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="space-y-6">
          {!showWithdrawalForm ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Withdraw Funds</h3>
                <p className="text-gray-600">Available for withdrawal: <span className="font-semibold text-green-600">${walletInfo.wallet.availableForWithdrawal.toFixed(2)}</span></p>
              </div>

              {walletInfo.wallet.availableForWithdrawal > 0 ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Object.entries(withdrawalMethods).map(([method, details]) => (
                      <button
                        key={method}
                        onClick={() => {
                          setSelectedMethod(method);
                          setShowWithdrawalForm(true);
                        }}
                        className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="p-3 bg-gray-100 rounded-full group-hover:bg-blue-100 mb-4">
                            {getMethodIcon(method)}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{details.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">Fee: {details.fee}</p>
                          <p className="text-xs text-gray-400">{details.processingTime}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>No funds available for withdrawal</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Withdraw via {withdrawalMethods[selectedMethod]?.name}
                </h3>
                <button
                  onClick={() => {
                    setShowWithdrawalForm(false);
                    setSelectedMethod('');
                    setWithdrawalAmount('');
                    setAccountDetails({});
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Withdrawal Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max={walletInfo.wallet.availableForWithdrawal}
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Fee: {withdrawalMethods[selectedMethod]?.fee} | 
                    Processing Time: {withdrawalMethods[selectedMethod]?.processingTime}
                  </p>
                </div>

                {renderAccountDetailsForm()}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawalForm(false);
                      setSelectedMethod('');
                      setWithdrawalAmount('');
                      setAccountDetails({});
                    }}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Withdrawal History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {walletInfo.withdrawals && walletInfo.withdrawals.length > 0 ? (
              walletInfo.withdrawals.map((withdrawal) => (
                <div key={withdrawal._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-full mr-4">
                        {getMethodIcon(withdrawal.method)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          ${withdrawal.amount.toFixed(2)} via {withdrawalMethods[withdrawal.method]?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Requested on {new Date(withdrawal.requestedAt).toLocaleDateString()}
                        </p>
                        {withdrawal.failureReason && (
                          <p className="text-sm text-red-600">
                            Reason: {withdrawal.failureReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(withdrawal.status)}
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </div>
                      </span>
                      {withdrawal.status === 'pending' && (
                        <button
                          onClick={() => cancelWithdrawal(withdrawal._id)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No withdrawal history
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalDashboard;