import React, { useState, useEffect } from 'react';
import { Users, Code, Sparkles } from 'lucide-react';

// Generate consistent userId
const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substr(2, 9);
};

const Login = ({ onJoinRoom }) => {
    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [hasExistingSession, setHasExistingSession] = useState(false);

    // Check for existing session on component mount
    useEffect(() => {
        const savedUser = localStorage.getItem('codecollab_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                if (userData.roomId && userData.userName && userData.userId) {
                    setHasExistingSession(true);
                    setRoomId(userData.roomId);
                    setUserName(userData.userName);
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('codecollab_user');
            }
        }
    }, []);

    const handleJoinRoom = (e) => {
        e.preventDefault();
        const trimmedRoomId = roomId.trim();
        const trimmedUserName = userName.trim();

        // Validate input
        if (!trimmedRoomId || !trimmedUserName) {
            alert('Please fill in all fields');
            return;
        }

        if (trimmedUserName.length < 2 || trimmedUserName.length > 50) {
            alert('Username must be between 2 and 50 characters');
            return;
        }

        if (trimmedRoomId.length < 3 || trimmedRoomId.length > 20) {
            alert('Room ID must be between 3 and 20 characters');
            return;
        }

        // ✅ Use persistent userId from localStorage or generate new one
        const persistentUserId = localStorage.getItem('codecollab_userId') || generateUserId();
        localStorage.setItem('codecollab_userId', persistentUserId);

        console.log("🚀 Joining room with userId:", persistentUserId);

        onJoinRoom({
            roomId: trimmedRoomId,
            userName: trimmedUserName,
            userId: persistentUserId // ✅ Use persistent userId
        });
    };

    const createNewRoom = () => {
        const newRoomId = Math.random().toString(36).substr(2, 8).toUpperCase();
        setRoomId(newRoomId);
        setIsCreatingNew(true);

        // ✅ Also ensure userId is set when creating new room
        const persistentUserId = localStorage.getItem('codecollab_userId') || generateUserId();
        localStorage.setItem('codecollab_userId', persistentUserId);
    };

    const clearExistingSession = () => {
        localStorage.removeItem('codecollab_user');
        setHasExistingSession(false);
        setRoomId('');
        setUserName('');
        // ✅ Don't remove userId as we want to keep it persistent
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-300 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white shadow-2xl ">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-500 p-3 rounded-full">
                            <img src="/codehire.png" alt="logo" className='invert brightness-100' />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">CodeCollab</h1>
                    <p className="text-blue-200">Real-time collaborative code editor</p>
                </div>

                {hasExistingSession && (
                    <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-sm font-medium">Resuming previous session</p>
                                <p className="text-blue-300 text-xs">Room: {roomId} • User: {userName}</p>
                            </div>
                            <button
                                onClick={clearExistingSession}
                                className="text-blue-300 hover:text-blue-200 text-xs underline"
                            >
                                Clear Session
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleJoinRoom} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your name"
                            required
                            minLength={2}
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                            Room ID
                        </label>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter room ID"
                            required
                            minLength={3}
                            maxLength={20}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                    >
                        <Users className="w-5 h-5" />
                        {hasExistingSession ? 'Resume Session' : (isCreatingNew ? 'Create Room' : 'Join Room')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={createNewRoom}
                        className="text-white hover:text-black cursor-pointer text-sm flex items-center justify-center gap-2 mx-auto transition duration-200"
                    >
                        <Sparkles className="w-4 h-4" />
                        Create new room with unique ID
                    </button>
                </div>

                {/* Debug info - remove in production */}
                {/* <div className="mt-4 p-2 bg-blue-500/10 rounded text-xs text-blue-300 text-center">
                    <p>User ID: {localStorage.getItem('codecollab_userId')?.substring(0, 8)}...</p>
                </div> */}
            </div>
        </div>
    );
};

export default Login;