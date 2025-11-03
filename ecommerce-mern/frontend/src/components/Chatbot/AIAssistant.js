import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  Button,
  Fab,
  Badge,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
  Zoom,
  Fade
} from '@mui/material';
import {
  SmartToy,
  Close,
  Send,
  Psychology,
  ShoppingBag,
  SupportAgent,
  LocalShipping,
  Help,
  ExpandMore,
  ExpandLess,
  Minimize
} from '@mui/icons-material';
import useAIChat from '../../hooks/useAIChat';

const AIAssistant = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);

  const {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    clearMessages,
    getQuickActions,
    messagesEndRef
  } = useAIChat();

  const inputRef = useRef(null);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Handle window event to open chatbot
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => window.removeEventListener('openChatbot', handleOpenChatbot);
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    if (typeof action === 'string') {
      sendMessage(action);
    } else if (action.text) {
      sendMessage(action.text);
      // If it's an action, we'll let the hook handle it
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const unreadCount = messages.filter(m => m.sender === 'bot' && !m.read).length;

  // Quick action icons
  const getActionIcon = (action) => {
    const actionStr = typeof action === 'string' ? action.toLowerCase() : action.action;

    if (actionStr.includes('product') || actionStr.includes('shop')) return <ShoppingBag />;
    if (actionStr.includes('support') || actionStr.includes('help')) return <SupportAgent />;
    if (actionStr.includes('track') || actionStr.includes('order')) return <LocalShipping />;
    return <Help />;
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Fade in={!isOpen}>
          <Fab
            color="primary"
            aria-label="AI Assistant"
            onClick={toggleChat}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <SmartToy />
            </Badge>
          </Fab>
        </Fade>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Zoom in={isOpen}>
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: isMobile ? 0 : 24,
              right: isMobile ? 0 : 24,
              width: isMobile ? '100%' : 380,
              height: isMobile ? '100%' : isMinimized ? 60 : 600,
              maxHeight: isMobile ? '100%' : '80vh',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: isMobile ? 0 : 2,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={toggleMinimize}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
                  <Psychology sx={{ color: 'primary.main' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    AI Shopping Assistant
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {isTyping ? 'Typing...' : 'Always here to help'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize();
                  }}
                  sx={{ color: 'white' }}
                >
                  {isMinimized ? <ExpandMore /> : <ExpandLess />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  sx={{ color: 'white' }}
                >
                  <Close />
                </IconButton>
              </Box>
            </Box>

            {/* Chat Content */}
            <Collapse in={!isMinimized} orientation="vertical">
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Messages Area */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    backgroundColor: 'grey.50',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          p: 2,
                          borderRadius: 2,
                          boxShadow: 1
                        }}
                      >
                        <Typography variant="body2">
                          {message.text}
                        </Typography>

                        {/* Action buttons from bot responses */}
                        {message.actions && message.actions.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {message.actions.map((action, index) => (
                              <Chip
                                key={index}
                                label={action.text || action}
                                size="small"
                                clickable
                                onClick={() => handleQuickAction(action)}
                                variant="outlined"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            ))}
                          </Box>
                        )}

                        <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'white',
                          p: 2,
                          borderRadius: 2,
                          boxShadow: 1
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          <SmartToy sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                          AI is thinking...
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <div ref={messagesEndRef} />
                </Box>

                {/* Quick Actions */}
                {showQuickActions && messages.length <= 2 && (
                  <Box sx={{ p: 2, backgroundColor: 'white', borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Quick actions:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {getQuickActions().slice(0, 4).map((action, index) => (
                        <Chip
                          key={index}
                          label={action.text || action}
                          size="small"
                          icon={getActionIcon(action)}
                          clickable
                          onClick={() => handleQuickAction(action)}
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            height: 28
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Input Area */}
                <Box sx={{ p: 2, backgroundColor: 'white', borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      multiline
                      maxRows={3}
                      inputRef={inputRef}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3
                        }
                      }}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'action.disabledBackground',
                          color: 'action.disabled'
                        }
                      }}
                    >
                      {isLoading ? <SmartToy /> : <Send />}
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Powered by AI
                    </Typography>
                    <Button
                      size="small"
                      onClick={clearMessages}
                      sx={{ fontSize: '0.7rem', textTransform: 'none' }}
                    >
                      Clear Chat
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        </Zoom>
      )}
    </>
  );
};

export default AIAssistant;