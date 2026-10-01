import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { io } from 'socket.io-client';
import { getApiBaseURL } from '../../config/apiConfig';
import RolePageTemplate from '../../components/RolePageTemplate';
import { Send, User } from 'lucide-react';

export default function TeacherCommunication() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    // Initialize socket connection
    const backendUrl = getApiBaseURL().replace('/api', '');
    socketRef.current = io(backendUrl);

    socketRef.current.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const messageData = {
      senderId: user?.id || 'unknown',
      senderName: user?.name || user?.username || 'Parent',
      role: user?.role || 'parent',
      text: inputValue.trim(),
    };

    socketRef.current.emit('chat_message', messageData);
    setInputValue('');
  };

  return (
    <RolePageTemplate role="Parent" title="Teacher Communication" description="Real-time chat with faculty members.">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="bg-light p-3 border-bottom d-flex align-items-center gap-3">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <User size={20} />
          </div>
          <div>
            <h6 className="mb-0 fw-bold">Homeroom Teacher - Mr. Smith</h6>
            <small className="text-success">● Online</small>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', background: '#f8f9fa' }}>
          {messages.length === 0 ? (
            <div className="text-center text-muted mt-5">
              <p>No messages yet.</p>
              <small>Send a message to start the conversation.</small>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={idx} className={`d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div style={{ maxWidth: '75%' }}>
                    {!isMine && <div className="small text-muted mb-1 ms-1">{msg.senderName}</div>}
                    <div className={`p-3 rounded-4 shadow-sm ${isMine ? 'bg-primary text-white' : 'bg-white text-dark'}`} style={{ borderBottomRightRadius: isMine ? '4px' : '16px', borderBottomLeftRadius: !isMine ? '4px' : '16px' }}>
                      {msg.text}
                    </div>
                    <div className={`small text-muted mt-1 ${isMine ? 'text-end me-1' : 'ms-1'}`}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-top">
          <form onSubmit={handleSend} className="d-flex gap-2">
            <input
              type="text"
              className="form-control rounded-pill px-4"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }} disabled={!inputValue.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </RolePageTemplate>
  );
}
