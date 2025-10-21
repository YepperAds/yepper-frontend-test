// Wallet.js - Updated version with Withdraw functionality
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  ArrowLeft,
  Search,
  Download,
  History
} from 'lucide-react';
import axios from 'axios';
import { Button, Grid, Container, Badge } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';

const Wallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [walletType, setWalletType] = useState('webOwner');
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

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
    
    fetchUserInfo();
  }, [location]);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [walletType, user]);

  useEffect(() => {
    if (wallet) {
      fetchTransactions(currentPage);
    }
  }, [currentPage, wallet]);

  useEffect(() => {
    const performSearch = () => {
      const query = searchQuery.toLowerCase().trim();
      
      if (!query) {
        setFilteredTransactions(transactions);
        return;
      }

      const searched = transactions.filter(transaction => {
        const searchFields = [
          transaction.description?.toLowerCase(),
          transaction.type?.toLowerCase(),
          formatCurrency(transaction.amount).toLowerCase(),
        ];
        return searchFields.some(field => field?.includes(query));
      });
        
      setFilteredTransactions(searched);
    };

    performSearch();
  }, [searchQuery, transactions]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const fetchUserInfo = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: getAuthHeaders()
      });
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchWalletData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/ad-categories/wallet/${walletType}/balance`, {
        headers: getAuthHeaders()
      });

      setWallet(response.data.wallet);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      if (error.response?.status === 404) {
        setWallet({
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          totalRefunded: 0
        });
      } else {
        setError('Failed to load wallet information');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (page = 1) => {
    setTransactionsLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:5000/api/ad-categories/wallet/${walletType}/transactions?page=${page}&limit=10`, 
        {
          headers: getAuthHeaders()
        }
      );

      setTransactions(response.data.transactions || []);
      setFilteredTransactions(response.data.transactions || []);
      setPagination({
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1,
        total: response.data.total || 0
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        setError('Failed to load transaction history');
      }
    } finally {
      setTransactionsLoading(false);
    }
  };

  const getTransactionTypeDisplay = (transaction) => {
    const typeMap = {
      'refund_credit': 'Refund Received',
      'refund_debit': 'Refund Processed',
      'credit': 'Payment Received',
      'debit': 'Payment Sent'
    };
    return typeMap[transaction.type] || transaction.type;
  };

  const switchWalletType = () => {
    const newType = walletType === 'webOwner' ? 'advertiser' : 'webOwner';
    setWalletType(newType);
    setCurrentPage(1);
    setTransactions([]);
    setFilteredTransactions([]);
    setWallet(null);
    setLoading(true);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
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
              <Badge variant="default">Wallet</Badge>
            </div>
          </Container>
        </header>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error loading wallet</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => fetchWalletData()} variant="primary">
              Retry
            </Button>
          </div>
        </div>
      </>
    );
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
            <Badge variant="default">Wallet</Badge>
          </div>
        </Container>
      </header>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">

          <div className='flex justify-between items-center gap-4 mb-12'>
            {/* Search Section */}
            <div className="flex justify-start flex-1">
              <div className="relative w-full max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 transition-all duration-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-shrink-0">
              {/* Only show Withdraw button for webOwner */}
              {walletType === 'webOwner' && (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate(`/wallet/${walletType}/withdraw`)}
                    disabled={!wallet || wallet.balance <= 0}
                  >
                    <Download size={18} className="mr-2" />
                    Withdraw
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(`/wallet/${walletType}/withdrawals`)}
                  >
                    <History size={18} className="mr-2" />
                    Withdrawal History
                  </Button>
                </>
              )}
              
              <Button
                variant="secondary"
                size="lg"
                onClick={switchWalletType}
              >
                Switch to {walletType === 'webOwner' ? 'Advertiser' : 'Publisher'}
              </Button>
            </div>
          </div>

          {/* Wallet Overview Cards */}
          <Grid cols={4} gap={6} className="mb-12">
            <div className="border border-black bg-white p-6 transition-all duration-200 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Available Balance</h3>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-black">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
              </div>
            </div>

            <div className="border border-black bg-white p-6 transition-all duration-200 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">
                  {walletType === 'webOwner' ? 'Total Earned' : 'Total Spent'}
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-black">
                  {formatCurrency(walletType === 'webOwner' ? (wallet?.totalEarned || 0) : (wallet?.totalSpent || 0))}
                </p>
              </div>
            </div>

            <div className="border border-black bg-white p-6 transition-all duration-200 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Total Refunded</h3>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-black">
                  {formatCurrency(wallet?.totalRefunded || 0)}
                </p>
              </div>
            </div>

            <div className="border border-black bg-white p-6 transition-all duration-200 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Last Updated</h3>
              </div>

              <div className="mb-6">
                <p className="text-sm text-black">
                  {wallet?.lastUpdated ? formatDate(wallet.lastUpdated) : 'Never'}
                </p>
              </div>
            </div>
          </Grid>

          {/* Transaction History */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                Transaction History
              </h2>
              <Button
                variant="outline"
                onClick={() => fetchTransactions(currentPage)}
                disabled={transactionsLoading}
              >
                Refresh
              </Button>
            </div>

            {transactionsLoading ? (
              <div className="flex items-center justify-center min-h-64">
                <LoadingSpinner />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-gray-600">
                    {searchQuery ? 'No Transactions Found' : 'No Transactions Yet'}
                  </h3>
                </div>
              </div>
            ) : (
              <Grid cols={2} gap={6}>
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="border border-black bg-white p-6 transition-all duration-200 hover:bg-gray-50"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-black">
                          {getTransactionTypeDisplay(transaction)}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          transaction.amount > 0 ? 'text-black' : 'text-gray-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm">{transaction.description}</p>
                    </div>

                    {/* Date */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-700">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </Grid>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wallet;