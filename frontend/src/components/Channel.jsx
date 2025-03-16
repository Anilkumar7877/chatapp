import React, { useState, useEffect } from 'react';
import axiosInstance from '../lib/axios';
import { useChannelStore } from '../store/useChannelStore';
import { useChatStore } from '../store/useChatStore';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const Channel = () => {
    const { channels, allChannels, getChannels, joinChannel, createChannel } = useChannelStore();
    const { selectedUser, setSelectedUser } = useChatStore();
    const [searchTerm, setSearchTerm] = useState('');
    const { authUser } = useAuthStore();
    const [channelName, setChannelName] = useState('');
    const [channelDescription, setChannelDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [showCreateChannel, setShowCreateChannel] = useState(false)

    useEffect(() => {
        const fetchChannels = async () => {
            setIsLoading(true);
            await getChannels();
            setIsLoading(false);
        };
        fetchChannels();
    }, [getChannels]);

    if (isLoading) {
        return (
            <div className="w-1/4 flex flex-col gap-6 text-white bg-zinc-600 py-4 overflow-y-scroll">Loading channels...</div>
        );
    }

    const filteredChannels = channels.filter(channel =>
        channel.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exploreChannels = allChannels?.filter(channel =>
        !channels.some(followingChannel => followingChannel._id === channel._id) &&
        channel.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFollowChannel = async (channelId) => {
        try {
            await joinChannel(channelId);
            setSelectedUser(channels.find(channel => channel._id === channelId));
            // toast.success('Channel followed successfully');
        } catch (error) {
            // toast.error(error.response.data.message);
            console.log('error in follow channel', error);
        }
    };

    const handleCreateChannel = async (e) => {
        e.preventDefault();
        try {
            await createChannel({ channelName, channelDescription });
            setShowCreateChannel(false);
            toast.success('Channel created successfully!');
        } catch (error) {
            toast.error('Failed to create channel');
        }
    };

    console.log('allChannels', allChannels);
    console.log('channels', channels);
    console.log('filteredChannels', filteredChannels);
    console.log('exploreChannels', exploreChannels);

    return (
        <div className='w-1/4 flex flex-col gap-6 text-white bg-zinc-600 py-4 overflow-y-scroll'>
            {showCreateChannel && (
                <div className='modal w-full h-full fixed inset-0 flex justify-center items-center z-50'>
                    <div className="w-full h-full fixed inset-0 bg-gray-400/20 backdrop-blur-sm"></div>
                    <div className="modal-content bg-zinc-800 text-white p-4 rounded-lg relative w-1/2 border-blue-400 border-1">
                        <button onClick={() => setShowCreateChannel(false)} className="close-button absolute top-2 right-2 text-black text-2xl p-2 rounded-full hover:bg-zinc-600">
                            <img src="/cross-icon.svg" alt="" />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Create Channel</h2>
                        {/* <CreateChannel
                            onClose={() => setShowCreateChannel(false)}
                        /> */}
                        <form onSubmit={handleCreateChannel} className="space-y-4">
                            <input
                                type="text"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                placeholder="Channel Name"
                                className="w-full p-2 border rounded"
                                required
                            />
                            <textarea
                                value={channelDescription}
                                onChange={(e) => setChannelDescription(e.target.value)}
                                placeholder="Channel Description"
                                className="w-full h-60 p-2 border rounded resize-none"
                            />
                            {/* <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label>Public Channel</label>
            </div> */}
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">
                                Create Channel
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <div className='flex justify-between px-4 '>
                <h1 className='text-2xl text-white font-bold text-start'>Channels</h1>
                <button
                    onClick={() => setShowCreateChannel(true)}
                    className="bg-blue-500 text-white px-2 py-2 rounded-full hover:bg-blue-600"
                >
                    <img src="/plus-icon.svg" alt="" className='w-5 h-5' />
                </button>
            </div>
            <div className='flex justify-start px-4'>
                <input
                    type='text'
                    placeholder='Search channels...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full p-2 border rounded outline-none'
                />
            </div>
            <div className='w-full text-black flex flex-col gap-4'>
                <h1 className='text-lg text-white font-bold text-start px-4'>Following Channels</h1>
                {filteredChannels.map(channel => (
                    <button
                        key={channel._id}
                        className={`
                        flex py-2 hover:bg-zinc-700 px-4 text-white w-full items-center gap-2
                        `}
                        onClick={() => setSelectedUser(channel)}
                    >
                        <div className='relative min-w-1/7 flex justify-center items-center'>
                            <span className="w-full flex justify-center items-center overflow-hidden">
                                <img src={channel.profilePic || "/channel-icon.svg"} alt="" className="w-10 h-10 object-cover rounded-sm" />
                            </span>
                        </div>
                        <div className="flex min-w-6/7 gap-2 justify-between items-center">
                            <span className="font-medium flex flex-col w-1/2">
                                <span className='w-full truncate font-medium text-md flex'>
                                    {channel.name || 'Channel Name'}
                                </span>
                                <span className='w-full truncate text-sm font-semibold text-zinc-400 flex'>
                                    {channel.members?.length || 0} followers
                                </span>
                            </span>
                            <span className='w-1/3'>
                                <button
                                    className={`
                                        rounded-full px-4 py-1 text-sm hover:cursor-pointer
                                        ${authUser?.channelsJoined?.includes(channel._id) ? 'border-1 border-blue-500' : 'bg-blue-500 hover:bg-blue-400'}
                                        `}
                                    onClick={() => handleFollowChannel(channel._id)}
                                    disabled={authUser?.channelsJoined?.includes(channel._id)}
                                >
                                    {authUser?.channelsJoined?.includes(channel._id) ? 'Following' : 'Follow'}
                                </button>
                            </span>
                        </div>
                    </button>
                ))}
            </div>
            <div className='w-full text-black flex flex-col gap-4'>
                <h1 className='text-lg text-white font-bold px-4 text-start'>Explore more Channels</h1>
                {exploreChannels.map(channel => (
                    <button
                        key={channel._id}
                        className={`
                        flex py-2 px-4 hover:bg-zinc-700 text-white w-full items-center gap-4
                        `}
                        onClick={() => setSelectedUser(channel)}
                    >
                        <div className='relative min-w-1/7 flex justify-center items-center'>
                            <span className="w-full flex justify-center items-center overflow-hidden">
                                <img src={channel.profilePic || "/channel-icon.svg"} alt="" className="w-10 h-10 object-cover rounded-sm" />
                            </span>
                        </div>
                        <div className="flex min-w-6/7 gap-2 justify-between items-center">
                            <span className="font-medium flex flex-col w-1/2">
                                <span className='w-full truncate font-medium text-md flex'>
                                    {channel.name || 'Channel Name'}
                                </span>
                                <span className='w-full truncate text-sm font-semibold text-zinc-400 flex'>
                                    {channel.members?.length || 0} followers
                                </span>
                            </span>
                            <span className='w-1/3'>
                                <button
                                    className={`
                                        rounded-full px-4 py-1 text-sm hover:cursor-pointer
                                        ${authUser?.channelsJoined?.includes(channel._id) ? 'border-1 border-blue-500' : 'bg-blue-500 hover:bg-blue-400'}
                                        `}
                                    onClick={() => handleFollowChannel(channel._id)}
                                    disabled={authUser?.channelsJoined?.includes(channel._id)}
                                >
                                    {authUser?.channelsJoined?.includes(channel._id) ? 'Following' : 'Follow'}
                                </button>
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Channel;