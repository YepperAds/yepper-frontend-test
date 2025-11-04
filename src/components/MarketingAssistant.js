import React, { useState, useEffect, useRef } from 'react';

const MarketingAssistant = ({ user, isAuthenticated }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [detectedIntent, setDetectedIntent] = useState(null);
  const [intentSuggestions, setIntentSuggestions] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const API_URL = 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputValue]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const generateAIResponse = async (prompt) => {
    try {
      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt
        })
      });

      const data = await response.json();
      
      if (data.success && data.response) {
        if (data.metadata) {
          setDetectedIntent(data.metadata.intent);
          setIntentSuggestions(data.metadata.suggestions || []);
        }
        return data.response;
      }
      
      throw new Error('Invalid response from AI service');
    } catch (error) {
      console.error('AI API Error:', error);
      return `Thank you for your marketing question! As your marketing mentor, I'd be happy to help you with: "${prompt}". 

Here are some strategic insights:

1. **Define Your Target Audience**: Understanding who you're speaking to is crucial for any marketing strategy.

2. **Set Clear Objectives**: Whether it's brand awareness, lead generation, or sales, having measurable goals keeps you focused.

3. **Multi-Channel Approach**: Don't rely on just one platform. Diversify across social media, email, content marketing, and paid advertising.

4. **Content is King**: Create valuable, engaging content that solves your audience's problems and positions you as an authority.

5. **Measure and Optimize**: Use analytics to track performance and continuously refine your approach.

Would you like me to dive deeper into any specific aspect of your marketing challenge?

*Note: Configure your backend AI service for enhanced responses.*`;
    }
  };

  const saveConversation = async (conversationData) => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conversationData)
      });
      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw error;
    }
  };

  const updateConversation = async (conversationId, messages) => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConversations(prev => prev.filter(conv => conv._id !== conversationId));
        
        if (currentConversation?._id === conversationId) {
          startNewConversation();
        }
        
        setDeleteModalOpen(false);
        setConversationToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  const openDeleteModal = (conversation) => {
    setConversationToDelete(conversation);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await generateAIResponse(userMessage.content);
      
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      if (isAuthenticated) {
        if (!currentConversation) {
          const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '');
          const newConversation = await saveConversation({
            title,
            messages: updatedMessages
          });
          setCurrentConversation(newConversation);
          setConversations(prev => [newConversation, ...prev]);
        } else {
          await updateConversation(currentConversation._id, updatedMessages);
          setConversations(prev => prev.map(conv => 
            conv._id === currentConversation._id 
              ? { ...conv, messages: updatedMessages, updatedAt: new Date() }
              : conv
          ));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  };

  const loadConversation = async (conversation) => {
    setCurrentConversation(conversation);
    setMessages(conversation.messages || []);
    setError(null);
  };

  const SparklesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"/>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );

  const MessageIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );

  const AlertIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );

  const MenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );

  const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-black mb-2">
                Delete Conversation?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "{conversationToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConversation(conversationToDelete._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Conversations */}
      {isAuthenticated && (
        <>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-4 left-4 z-50 lg:hidden bg-black text-white p-2 rounded-lg"
          >
            {isSidebarOpen ? <XIcon /> : <MenuIcon />}
          </button>

          <div className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:relative lg:translate-x-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300`}>
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={startNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <PlusIcon />
                New Strategy Session
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  My Strategy Sessions
                </h3>
                {conversations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No conversations yet. Start a new strategy session!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv._id}
                        className={`group relative rounded-lg transition-colors ${
                          currentConversation?._id === conv._id
                            ? 'bg-gray-100 border border-gray-300'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={() => loadConversation(conv)}
                          className="w-full text-left px-3 py-2 pr-10"
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-1 flex-shrink-0 text-gray-400"><MessageIcon /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-black truncate">
                                {conv.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(conv.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(conv);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete conversation"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-black mb-2">
                  Welcome to Yepper
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your AI-powered assistant for crafting winning marketing strategies. Ask me anything about marketing, branding, campaigns, or growth tactics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {[
                    'Help me grow my Instagram page',
                    'Create a product launch plan',
                    'Improve my email marketing strategy',
                    'Build a content calendar for Q1'
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputValue(suggestion)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, idx) => (
                  <div key={idx}>
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-xl bg-black text-white rounded-2xl px-5 py-3">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div 
                          className="prose prose-sm max-w-none"
                          style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif'
                          }}
                        >
                          {message.content.split('\n').map((line, pIdx) => {
                            const renderFormatted = (text) => {
                              const parts = [];
                              let lastIndex = 0;
                              const regex = /\*\*([^*]+?)\*\*/g;
                              let match;
                              
                              while ((match = regex.exec(text)) !== null) {
                                if (match.index > lastIndex) {
                                  parts.push(text.substring(lastIndex, match.index));
                                }
                                parts.push(<strong key={match.index}>{match[1]}</strong>);
                                lastIndex = regex.lastIndex;
                              }
                              
                              if (lastIndex < text.length) {
                                parts.push(text.substring(lastIndex));
                              }
                              
                              return parts.length > 0 ? parts : text;
                            };

                            const trimmedLine = line.trim();
                            
                            if (!trimmedLine) {
                              return <div key={pIdx} className="h-2"></div>;
                            }

                            if (trimmedLine.startsWith('* ')) {
                              return (
                                <div key={pIdx} className="mb-2 ml-4">
                                  <p className="text-black text-sm leading-relaxed">
                                    • {renderFormatted(trimmedLine.slice(2))}
                                  </p>
                                </div>
                              );
                            }
                            
                            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                              return (
                                <h3 key={pIdx} className="text-base font-bold mt-5 mb-3 text-black first:mt-0">
                                  {trimmedLine.slice(2, -2)}
                                </h3>
                              );
                            }
                            
                            if (/^\d+\./.test(trimmedLine)) {
                              return (
                                <div key={pIdx} className="mb-2">
                                  <p className="text-black text-sm leading-relaxed">
                                    {renderFormatted(trimmedLine)}
                                  </p>
                                </div>
                              );
                            }
                            
                            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                              return (
                                <div key={pIdx} className="mb-2 ml-4">
                                  <p className="text-black text-sm leading-relaxed">
                                    {renderFormatted(trimmedLine)}
                                  </p>
                                </div>
                              );
                            }
                            
                            return (
                              <p key={pIdx} className="text-black text-sm leading-relaxed mb-3">
                                {renderFormatted(trimmedLine)}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-sm ml-2">Analyzing your strategy...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <div className="max-w-5xl mx-auto flex items-center gap-2 text-red-700">
              <AlertIcon />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white border-t border-gray-200 px-6 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border-2 border-gray-300 rounded-xl focus-within:border-black transition-all">
              <div className="flex items-end gap-3 p-4">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your marketing challenge..."
                  className="flex-1 bg-transparent text-black placeholder-gray-400 outline-none resize-none leading-relaxed"
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '15px',
                    minHeight: '24px',
                    maxHeight: '200px'
                  }}
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 text-sm font-medium"
                >
                  Submit Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingAssistant;