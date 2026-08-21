import { useEffect, useRef, useState } from 'react';
import { Alert, Avatar, Button, Card, Empty, Flex, FloatButton, Grid, Input, Menu, Spin, Tooltip, Typography } from 'antd';
import { CloseOutlined, DeleteOutlined, HistoryOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import aiApi from '../api/aiApi';
import { GetUser } from '../api/axiosClient';

const { Text } = Typography;
const GUEST_MESSAGES_KEY = 'beautyBooking.ai.guestMessages';
const CONVERSATION_ID_KEY = 'beautyBooking.ai.conversationId';
const MAX_GUEST_MESSAGES = 20;

const readGuestMessages = () => {
  try {
    return (JSON.parse(sessionStorage.getItem(GUEST_MESSAGES_KEY)) ?? []).slice(-MAX_GUEST_MESSAGES);
  } catch {
    sessionStorage.removeItem(GUEST_MESSAGES_KEY);
    return [];
  }
};

const getErrorMessage = (error) => error.response?.data?.message
  ?? error.response?.data?.Message
  ?? 'Không thể kết nối trợ lý AI. Vui lòng thử lại.';

const AIChatPopup = () => {
  const screens = Grid.useBreakpoint();
  const compact = !screens.sm;
  const isLoggedIn = Boolean(GetUser());
  const [open, setOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(() => {
    if (!isLoggedIn) return null;
    const storedId = Number(sessionStorage.getItem(CONVERSATION_ID_KEY));
    return storedId > 0 ? storedId : null;
  });
  const [messages, setMessages] = useState(() => isLoggedIn ? [] : readGuestMessages());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!isLoggedIn || !conversationId) return;
    let cancelled = false;
    setLoadingHistory(true);
    aiApi.getMessages(conversationId)
      .then((data) => {
        if (!cancelled) {
          setMessages((data.messages ?? []).map((item) => ({ role: item.role, content: item.content })));
        }
      })
      .catch(() => {
        if (!cancelled) {
          sessionStorage.removeItem(CONVERSATION_ID_KEY);
          setConversationId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => { cancelled = true; };
  }, [conversationId, isLoggedIn]);

  const loadConversations = async () => {
    if (!isLoggedIn) return;
    setLoadingHistory(true);
    try {
      const data = await aiApi.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleToggleConversations = () => {
    const nextValue = !showConversations;
    setShowConversations(nextValue);
    if (nextValue) loadConversations();
  };

  const saveGuestMessages = (nextMessages) => {
    if (!isLoggedIn) sessionStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(nextMessages));
  };

  const handleSend = async () => {
    const content = prompt.trim();
    if (!content || loading) return;
    const previousMessages = messages;
    const pendingMessages = isLoggedIn
      ? [...previousMessages, { role: 'User', content }]
      : [...previousMessages, { role: 'User', content }].slice(-MAX_GUEST_MESSAGES);
    setMessages(pendingMessages);
    saveGuestMessages(pendingMessages);
    setPrompt('');
    setError('');
    setLoading(true);

    try {
      const response = await aiApi.chat({
        conversationId: isLoggedIn ? conversationId : null,
        prompt: content,
        guestMessages: isLoggedIn ? [] : previousMessages.slice(-MAX_GUEST_MESSAGES),
      });
      if (isLoggedIn && response.conversationId) {
        setConversationId(response.conversationId);
        sessionStorage.setItem(CONVERSATION_ID_KEY, String(response.conversationId));
      }
      let completedMessages = [...pendingMessages, { role: 'Assistant', content: response.message ?? '' }];
      if (!isLoggedIn) completedMessages = completedMessages.slice(-MAX_GUEST_MESSAGES);
      setMessages(completedMessages);
      saveGuestMessages(completedMessages);
      if (isLoggedIn) await loadConversations();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setPrompt('');
    setError('');
    sessionStorage.removeItem(CONVERSATION_ID_KEY);
    sessionStorage.removeItem(GUEST_MESSAGES_KEY);
  };

  const handleSelectConversation = (id) => {
    if (id === conversationId || loading) return;
    setError('');
    setMessages([]);
    setConversationId(id);
    sessionStorage.setItem(CONVERSATION_ID_KEY, String(id));
  };

  return <>
    {open && <div style={{
      position: 'fixed',
      right: compact ? 12 : 20,
      bottom: compact ? 82 : 92,
      width: isLoggedIn && showConversations
        ? 'min(540px, calc(100vw - 24px))'
        : 'min(350px, calc(100vw - 24px))',
      zIndex: 1000,
    }}>
      <Card
        style={{ overflow: 'hidden', boxShadow: '0 10px 32px rgba(0, 0, 0, 0.18)' }}
        title={<Flex align="center" gap={8}>
          <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#eb2f96' }} />
          <div>
            <div>{compact ? 'Trợ lý AI' : 'Trợ lý BeautyBooking'}</div>
            {!compact && <Text type="secondary" style={{ display: 'block', fontSize: 11, lineHeight: '14px' }}>Tư vấn dịch vụ và chính sách</Text>}
          </div>
        </Flex>}
        extra={<Flex gap={2}>
          <Tooltip title="Cuộc trò chuyện mới"><Button type="text" size="small" icon={<DeleteOutlined />} onClick={handleNewConversation} /></Tooltip>
          {isLoggedIn && <Tooltip title={showConversations ? 'Ẩn lịch sử' : 'Xem lịch sử'}>
            <Button
              type={showConversations ? 'primary' : 'text'}
              size="small"
              aria-label="Danh sách hội thoại"
              icon={<HistoryOutlined />}
              onClick={handleToggleConversations}
            />
          </Tooltip>}
          <Tooltip title="Đóng"><Button type="text" size="small" aria-label="Đóng cửa sổ chat" icon={<CloseOutlined />} onClick={() => setOpen(false)} /></Tooltip>
        </Flex>}
        styles={{ header: { minHeight: 52, padding: '0 12px' }, body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', height: compact ? 360 : 370, minHeight: 0 }}>
          <section style={{ display: 'flex', flex: 1, minWidth: 0, flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 12, background: '#fafafa' }}>
              {messages.length === 0 && !loading && !loadingHistory && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Hãy đặt câu hỏi cho trợ lý" />}
              {messages.map((item, index) => {
                const isUser = item.role === 'User';
                return <Flex key={`${item.role}-${index}`} justify={isUser ? 'flex-end' : 'flex-start'} align="flex-start" gap={6} style={{ marginBottom: 10 }}>
                  {!isUser && <Avatar size="small" icon={<RobotOutlined />} />}
                  <div style={{
                    maxWidth: '78%',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap',
                    padding: '8px 10px',
                    borderRadius: 12,
                    color: isUser ? '#fff' : '#262626',
                    background: isUser ? '#eb2f96' : '#fff',
                    boxShadow: isUser ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.08)',
                  }}>{item.content}</div>
                  {isUser && <Avatar size="small" icon={<UserOutlined />} />}
                </Flex>;
              })}
              {(loading || loadingHistory) && <Flex align="center" gap={8}><Spin size="small" /><Text type="secondary">Đang tải...</Text></Flex>}
              <div ref={messagesEndRef} />
            </div>
            {error && <Alert type="error" showIcon message={error} style={{ borderRadius: 0 }} />}
            <form style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: 10, borderTop: '1px solid #f0f0f0' }} onSubmit={(event) => { event.preventDefault(); handleSend(); }}>
              <Input.TextArea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onPressEnter={(event) => { if (!event.shiftKey) { event.preventDefault(); handleSend(); } }}
                placeholder="Nhập câu hỏi..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                maxLength={4000}
                disabled={loading}
              />
              <Button htmlType="submit" type="primary" shape="circle" aria-label="Gửi tin nhắn" icon={<SendOutlined />} loading={loading} disabled={!prompt.trim()} style={{ background: '#eb2f96' }} />
            </form>
          </section>
          {isLoggedIn && showConversations && <aside style={{ width: compact ? 125 : 170, padding: '10px 8px', borderLeft: '1px solid #f0f0f0', background: '#fff', flexShrink: 0 }}>
            <Flex align="center" gap={6} style={{ padding: '2px 4px 8px' }}><HistoryOutlined /><Text strong>Gần đây</Text></Flex>
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {conversations.length === 0 && !loadingHistory && <Text type="secondary">Chưa có hội thoại</Text>}
              {conversations.length > 0 && <Menu
                mode="inline"
                selectedKeys={conversationId ? [String(conversationId)] : []}
                onClick={({ key }) => handleSelectConversation(Number(key))}
                items={conversations.map((conversation) => ({
                  key: String(conversation.id),
                  label: conversation.lastMessage || `Hội thoại #${conversation.id}`,
                }))}
                style={{ borderInlineEnd: 0 }}
              />}
            </div>
          </aside>}
        </div>
      </Card>
    </div>}
    {!open && <FloatButton
      icon={<RobotOutlined />}
      tooltip="Chat với trợ lý AI"
      type="primary"
      onClick={handleOpen}
      style={{ right: compact ? 16 : 30, bottom: compact ? 90 : 100, width: 52, height: 52, background: '#eb2f96' }}
    />}
  </>;
};

export default AIChatPopup;
