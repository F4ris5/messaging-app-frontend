import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Chatpage.css';
const socket = io(`${process.env.REACT_APP_HOST}`);

function Chatpage() {
    const location = useLocation();
    const userId = location.state?.userId;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userList, setUserList] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    // check if userId is present
    useEffect(() => {
        if (!userId) return;
    
        socket.emit('join', userId);
    
        // fetches list of users
        if (userId === 1) {
            fetch(`${process.env.REACT_APP_HOST}`)
                .then(res => res.json())
                .then(data => {
                    const nonAdminUsers = data.filter(user => user.id !== 1);
                    setUserList(nonAdminUsers);
                })
                .catch(err => console.error('Failed to fetch users:', err));
        }
    
        // fetches messages for the user
        socket.on('receive_message', (data) => {
            console.log('Received:', data);
            setMessages((prev) => [...prev, {
                message: data.message,
                fromSelf: data.senderId === userId
            }]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [userId]);
    
    // handle sent messages
    const handleSend = () => {
        if (message.trim()) {
            // check if userId is present or admin
            const isAdmin = userId === 1;
            const receiverId = isAdmin ? selectedUserId : 1;
    
            // check if receiverId is present (for admin)
            if (isAdmin && !selectedUserId) {
                alert("Select a user to chat with.");
                return;
            }

            // send message to the backend
            socket.emit('send_message', {
                senderId: userId,
                receiverId,
                message
            });
    
            setMessage('');
        }
    };
    
    // fetches messages for the selected user (only for admin)
    useEffect(() => {
        const fetchMessages = async () => {
            if (userId === 1 && selectedUserId) {
                try {
                    const res = await fetch(`${process.env.REACT_APP_HOST}/messages/conversation/${userId}/${selectedUserId}`);
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
    
    // fetches messages for the user
    useEffect(() => {
        const fetchUserMessages = async () => {
            if (userId && userId !== 1) {
                try {
                    const res = await fetch(`${process.env.REACT_APP_HOST}/messages/conversation/${userId}/1`);
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

    // handle typing indicator
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
    
    //  below is the part that auto-scrolls to the bottom of the chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
       
        <div style={{ display: 'flex', height: '100vh', backgroundImage: 'linear-gradient(#080808, #212121)', }}>
            {/* sidebar for admin only */}
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
    
            {/* main chat area */}
            <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: 'white'}}>Chat</h2>

                {/* chat messages */}
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

                {/* typing indicator */}
                {isTyping && (
                    <div style={{ marginBottom: '0.5rem', fontStyle: 'italic', color: '#ccc' }}>
                        {userId === 1 ? 'User is typing...' : 'Admin is typing...'}
                    </div>
                )}

                {/* message input */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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