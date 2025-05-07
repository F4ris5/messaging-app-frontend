import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Chatpage.css';

const socket = io('http://localhost:3001');

function Chatpage() {
    const location = useLocation();
    const userId = location.state?.userId;
    const adminId = 1;

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        if (!userId) return;
    
        socket.emit('join', userId);
    
        // For admin: fetch list of users
        if (userId === 1) {
            fetch('http://localhost:3001/')
                .then(res => res.json())
                .then(data => {
                    const nonAdminUsers = data.filter(user => user.id !== 1);
                    setUserList(nonAdminUsers);
                })
                .catch(err => console.error('Failed to fetch users:', err));
        }
    
        socket.on('receive_message', (data) => {
            console.log('Received:', data);
            setMessages((prev) => [...prev, {
                message: data.message,
                fromSelf: data.senderId === userId // verify this field exists
            }]);
        });
        
    
        return () => {
            socket.off('receive_message');
        };
    }, [userId]);
    
    

    const handleSend = () => {
        if (message.trim()) {
            const isAdmin = userId === 1;
            const receiverId = isAdmin ? selectedUserId : 1;
    
            if (isAdmin && !selectedUserId) {
                alert("Select a user to chat with.");
                return;
            }
    
            socket.emit('send_message', {
                senderId: userId,
                receiverId,
                message
            });
    
            setMessage('');
        }
    };
    
    useEffect(() => {
        const fetchMessages = async () => {
            if (userId === 1 && selectedUserId) {
                try {
                    const res = await fetch(`http://localhost:3001/messages/conversation/${userId}/${selectedUserId}`);
                    const data = await res.json();
                    setMessages(data.map(msg => ({
                        message: msg.content,
                        fromSelf: msg.sender_id === userId
                    })));
                } catch (err) {
                    console.error('Error fetching conversation:', err);
                }
            }
        };
    
        fetchMessages();
    }, [selectedUserId, userId]);
    
    useEffect(() => {
        const fetchUserMessages = async () => {
            if (userId && userId !== 1) {
                try {
                    const res = await fetch(`http://localhost:3001/messages/conversation/${userId}/1`);
                    const data = await res.json();
                    setMessages(data.map(msg => ({
                        message: msg.content,
                        fromSelf: msg.sender_id === userId
                    })));
                } catch (err) {
                    console.error('Error fetching user messages:', err);
                }
            }
        };
    
        fetchUserMessages();
    }, [userId]);
    

    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!userId) return;
    
        const handleTyping = (data) => {
            if (data.senderId !== userId) {
                setIsTyping(true);
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000); // hides after 2s
            }
        };
    
        socket.on('typing', handleTyping);
    
        return () => {
            socket.off('typing', handleTyping);
        };
    }, [userId]);
    

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
       
        <div style={{ display: 'flex', height: '100vh', backgroundImage: 'linear-gradient(#080808, #212121)', }}>
            {/* Sidebar (only for userId === 1) */}
            {userId === 1 && (
                <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '1rem' }}>
                    <h3 style={{ color: 'white' }}>Select User</h3>
                    <label htmlFor="userSelect" style={{ color: 'white' }}>Chat with:</label>
                    <select
                        id="userSelect"
                        onChange={(e) => setSelectedUserId(Number(e.target.value))}
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px' }}
                    >
                        <option value="">-- Select User --</option>
                        {userList.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username || `User ${user.id}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
    
            {/* Main Chat Area */}
            <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: 'white'}}>Chat</h2>
                <div className='chat-scroll-area' style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ textAlign: msg.fromSelf ? 'right' : 'left', marginBottom: '0.5rem' }}>
                            <span
                                style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '1rem',
                                    background: msg.fromSelf ? '#dcf8c6' : '#f1f0f0',
                                    maxWidth: '60%',
                                }}
                            >
                                {msg.message}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {isTyping && (
                    <div style={{ marginBottom: '0.5rem', fontStyle: 'italic', color: '#ccc' }}>
                        {userId === 1 ? 'User is typing...' : 'Admin is typing...'}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem' }}
                        placeholder="Type your message..."
                    /> */}
                    <input
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            const isAdmin = userId === 1;
                            const receiverId = isAdmin ? selectedUserId : 1;
                            if (receiverId) {
                                socket.emit('typing', { senderId: userId, receiverId });
                            }
                        }}
                        style={{ flex: 1, padding: '0.5rem' }}
                        placeholder="Type your message..."
                    />

                    <button onClick={handleSend}>Send</button>
                </div>
            </div>
        </div>
    );
    
}


export default Chatpage;