import React, { useEffect, useState } from 'react'

import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import CreateChannel from './CreateChannel'
import CreateGroupModal from './CreateGroupModal'
import { useChannelStore } from '../store/useChannelStore'
import { useStoryStore } from '../store/useStoryStore'
import { all } from 'axios'
import { use } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import User from '../../../backend/src/models/user.model.js'

const Sidebar = () => {
    const { users, groups, getGroups, getUsers, isUserLoading, selectedUser, setSelectedUser, messages, allChatMessages, fetchAllMessages, markMessagesAsRead, searchUserByUniqueId } = useChatStore()
    const { authUser, onlineUsers, socket } = useAuthStore()
    const { channels, getChannels, createChannel } = useChannelStore()
    const isChannel = selectedUser?.hasOwnProperty('description');
    // const [showCreateChannel, setShowCreateChannel] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [channelName, setChannelName] = useState('');
    // const [channelDescription, setChannelDescription] = useState('');
    const { showStories, setShowStories } = useStoryStore()
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchId, setSearchId] = useState('');
    const [searchUserInput, setSearchUserInput] = useState(false);
    const [searchChats, setSearchChats] = useState(false);

    useEffect(() => {
        getUsers();
        getGroups();
        fetchAllMessages();
        getChannels();
    }, [getUsers, getGroups, getChannels, fetchAllMessages]);

    useEffect(() => {
        if (users.length > 0 || groups.length > 0 || channels.length > 0) {
            fetchAllMessages();
        }
    }, [users, groups, channels, fetchAllMessages]);

    //join room and leave room
    // Add this new useEffect for joining all group rooms
    useEffect(() => {
        if (groups.length > 0 || channels.length > 0) {
            // Join all group rooms
            groups.forEach(group => {
                socket.emit("joinGroup", group._id);
            });

            // Join all channels
            channels.forEach(channel => {
                socket.emit("joinGroup", channel._id);
            });

            // Cleanup when component unmounts
            return () => {
                groups.forEach(group => {
                    socket.emit("leaveGroup", group._id);
                });

                channels.forEach(channel => {
                    socket.emit("leaveGroup", channel._id);
                });
            };
        }
    }, [groups, channels, socket]);

    const set = useChatStore.setState;
    useEffect(() => {
        const handleNewMessage = (newMessage) => {
            const isMessageForSelectedUser = selectedUser && (newMessage.receiverId === selectedUser._id || newMessage.senderId._id === selectedUser._id);

            if (newMessage.isChannelMessage) {
                console.log("newMessage is a channel message", newMessage)
                // Get existing messages for this group
                const channelMessages = allChatMessages[newMessage.receiverId] || [];
                console.log("channelMessages are", channelMessages)

                // Create updated messages array with read status
                const updatedMessages = [
                    ...channelMessages,
                    {
                        ...newMessage,
                        // Mark as unread if group is not currently selected
                        read: isMessageForSelectedUser ? [...newMessage.read, authUser._id] : newMessage.read
                    }
                ];

                // Update store with new messages
                set((state) => ({
                    allChatMessages: {
                        ...state.allChatMessages,
                        [newMessage.receiverId]: updatedMessages
                    }
                }));
                console.log("updatedChannelMessages are", updatedMessages)
            }
            else if (newMessage.isGroupMessage) {
                console.log("newMessage is a group message", newMessage)
                // Get existing messages for this group
                const groupMessages = allChatMessages[newMessage.receiverId] || [];
                console.log("groupMessages are", groupMessages)

                // Create updated messages array with read status
                const updatedMessages = [
                    ...groupMessages,
                    {
                        ...newMessage,
                        // Mark as unread if group is not currently selected
                        read: isMessageForSelectedUser ? [...newMessage.read, authUser._id] : newMessage.read
                    }
                ];

                // Update store with new messages
                set((state) => ({
                    allChatMessages: {
                        ...state.allChatMessages,
                        [newMessage.receiverId]: updatedMessages
                    }
                }));
                console.log("updatedMessages are", updatedMessages)
            } else {
                // Existing direct message handling
                console.log("newMessage is a direct message", newMessage)

                const chatMessages = allChatMessages[newMessage.senderId._id] || [];

                const updatedMessages = [
                    ...chatMessages,
                    {
                        ...newMessage,
                        read: isMessageForSelectedUser ? [...newMessage.read, authUser._id] : newMessage.read
                    }
                ];

                set((state) => ({
                    allChatMessages: {
                        ...state.allChatMessages,
                        [newMessage.senderId._id]: updatedMessages
                    }
                }));
            }
            if (isMessageForSelectedUser) {
                markMessagesAsRead(selectedUser._id);
            }
        };

        socket.on('newMessage', handleNewMessage);
        return () => socket.off('newMessage', handleNewMessage);
    }, [selectedUser, socket, allChatMessages]);

    if (isUserLoading) return (
        <div className='w-1/4 bg-zinc-600 py-4 flex flex-col gap-4'>Loading....</div>
    )
    const usersAndGroups = [...users, ...groups, ...channels];

    const filteredChats = usersAndGroups.filter(chat => {
        if (filter === 'All') return true;
        if (filter === 'Groups') return chat.members && !chat.isChannel;
        if (filter === 'Channels') return chat.isChannel;
        return false;
    }).filter(chat => chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) || chat.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Sort chats based on last message timestamp
    const sortedChats = filteredChats.sort((a, b) => {
        const aMessages = allChatMessages[a._id] || [];
        const bMessages = allChatMessages[b._id] || [];

        const aLastMessage = aMessages[aMessages.length - 1];
        const bLastMessage = bMessages[bMessages.length - 1];

        // If no messages, put at bottom
        if (!aLastMessage) return 1;
        if (!bLastMessage) return -1;

        // Sort by timestamp, newest first
        return new Date(bLastMessage.createdAt) - new Date(aLastMessage.createdAt);
    });

    // const handleCreateChannel = async (e) => {
    //     e.preventDefault();
    //     try {
    //         await createChannel({ channelName, channelDescription });
    //         setShowCreateChannel(false);
    //         toast.success('Channel created successfully!');
    //     } catch (error) {
    //         toast.error('Failed to create channel');
    //     }
    // };

    const handleSearchById = async (e) => {
        e.preventDefault();
        try {
            const user = await searchUserByUniqueId(searchId);
            if (user) {
                setSelectedUser(user);
            }
        } catch (error) {
            console.log('error in search by id', error);
        }
    };

    // console.log("groups", groups)
    // console.log("chats", users)

    // console.log("channels", channels)
    console.log("messages", messages)
    console.log("allChatMessages", allChatMessages)
    return (
        <div className='w-1/4 bg-zinc-600 py-4 flex flex-col gap-4'>
            <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            
            <div className='flex justify-between'>
                <h1 className='text-2xl text-white font-bold px-8'>Chats</h1>
                <span className='flex gap-2 mx-4'>
                    <button className='bg-blue-500 px-2 py-2 rounded-full hover:bg-blue-600'
                        onClick={() => setIsModalOpen(true)}
                    >
                        <img src="/create-group-icon.svg" alt="" className='w-5 h-5' />
                    </button>
                    {/* <button className='bg-blue-500 px-2 py-2 rounded-full hover:bg-blue-600'
                        onClick={() => setSearchChats(!searchChats)}
                    >
                        <img src="/search-icon.svg" alt="" className='w-5 h-5' />
                    </button> */}
                    <button className='bg-blue-500 px-2 py-2 rounded-full hover:bg-blue-600'
                        onClick={() => setSearchUserInput(!searchUserInput)}
                    >
                        <img src="/search-user-icon.svg" alt="" className='w-5 h-5' />
                    </button>
                    {/* <button
                        onClick={() => setShowCreateChannel(true)}
                        className="bg-blue-500 text-white px-2 py-2 rounded-full hover:bg-blue-600"
                    >
                        <img src="/channel-icon.svg" alt="" className='w-5 h-5' />
                    </button> */}
                    {/* <Link to="/api/story" onClick={() => set({ showStories: true })}> */}
                    {/* <button
                        className="bg-blue-500 text-white px-2 py-2 rounded-full hover:bg-blue-600"
                        onClick={() => setShowStories(!showStories)}
                    >
                        story
                    </button> */}
                    {/* </Link> */}
                </span>
            </div>
            {searchUserInput && (<div className='flex justify-start px-4 gap-2'>
                <input
                    type='text'
                    placeholder='Search users by Id...'
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className='w-full py-1 px-2 border rounded-md border-blue-50 outline-none text-white font-semibold'
                />
                <button className='bg-blue-500 text-white px-2 rounded-md hover:bg-blue-600'
                    onClick={handleSearchById}
                >
                    {/* <img src="/search-icon.svg" alt="" /> */}
                    Search
                </button>
            </div>)}
            <div className='flex justify-start px-4'>
                <input
                    type='text'
                    placeholder='Search chats...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full py-1 px-2 border rounded-md border-blue-50 outline-none text-white font-semibold'
                />
            </div>
            <div className='flex gap-4 px-8'>
                <div className='border-1 border-blue-500 hover:bg-blue-500 hover: cursor-pointer rounded-lg px-2 text-white' onClick={() => setFilter('All')}>All</div>
                <div className='border-1 border-blue-500 hover:bg-blue-500 hover: cursor-pointer rounded-lg px-2 text-white' onClick={() => setFilter('Groups')}>Groups</div>
                <div className='border-1 border-blue-500 hover:bg-blue-500 hover: cursor-pointer rounded-lg px-2 text-white' onClick={() => setFilter('Channels')}>Channels</div>
            </div>
            <div className='text-white overflow-y-scroll'>
                {sortedChats.map((user) => {
                    // Get last message for this chat
                    const userMessages = allChatMessages[user._id] || [];
                    const lastMessage = userMessages[userMessages.length - 1];
                    // console.log("lastMessage", lastMessage)
                    const unreadCount = selectedUser?._id !== user._id ?
                        userMessages.filter(msg =>
                            (msg.hasOwnProperty('read') && !msg.read.includes(authUser._id) && msg.senderId._id !== authUser._id)
                        ).length : 0;

                    // console.log("unreadCount", userMessages.filter(msg =>
                    //     (msg.hasOwnProperty('read') && !msg.read && msg.senderId._id !== authUser._id)
                    // ))
                    return (
                        <button
                            key={user._id}
                            className={`
                              flex px-8 py-2 hover:bg-zinc-700 w-full items-center gap-4
                              ${selectedUser?._id === user._id ? "bg-zinc-700 ring-1 ring-base-300" : ""}
                          `}
                            onClick={() => {
                                setSelectedUser(user)
                                markMessagesAsRead(user._id);
                            }}
                        >
                            <div className='relative w-1/7'>
                                <span className={`overflow-hidden`}>
                                    <img src={user.profilePic || (user.isChannel ? "/channel-icon.svg" : (user.members ? "/group-avatar.png" : "/avatar.png"))} alt="" className={`w-10 h-10 object-cover ${user.isChannel ? "rounded-sm" : "rounded-full"}`} />
                                </span>
                                {onlineUsers.includes(user._id) && (
                                    <span
                                        className='absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900'
                                    />
                                )}
                            </div>
                            <div className="flex flex-col items-start flex-1 w-1/7">
                                <span className="font-medium flex justify-between w-full">
                                    <span className='w-5/6 truncate font-medium flex justify-between'>
                                        {user.fullName || user.name}
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                                            {unreadCount}
                                        </span>
                                    )}
                                </span>
                                <span className="text-sm text-zinc-400 truncate w-full text-start flex justify-between">
                                    <span className={`
                                        truncate font-semibold
                                        ${unreadCount > 0 ? "text-blue-300 font-semibold" : ""}
                                    `}>
                                        {lastMessage?.text || 'No messages yet'}
                                    </span>
                                    <span className='text-xs text-zinc-400 font-semibold'>
                                        {lastMessage?.createdAt && new Date(lastMessage?.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </span>
                                </span>
                            </div>
                        </button>
                    )
                }
                )}
            </div>
        </div>
    )
}

export default Sidebar
