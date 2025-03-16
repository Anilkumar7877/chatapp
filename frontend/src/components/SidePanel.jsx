import React from 'react'
import { Link } from 'react-router-dom'
import { useStoryStore } from '../store/useStoryStore';
import { useAuthStore } from '../store/useAuthStore';

const SidePanel = () => {
    const { showStories, setShowStories, showChats, setShowChats, showChannels, setShowChannels } = useStoryStore();
    // console.log(showChats, showStories, showChannels)
    const { authUser } = useAuthStore()
    return (
        <div className='w-12 h-full bg-blue-500 py-2 text-white flex flex-col justify-between'>
            {authUser && <div className='flex flex-col items-center'>
                <Link to={"/"}>
                    <button
                        className="bg-blue-500 text-white px-2 py-2 hover:bg-blue-600"
                        onClick={() => {
                            setShowChats(true)
                        }}
                    >
                        <img src="/chat-icon.svg" alt="" width={40} />
                    </button>
                </Link>
                <Link to={"/story"}>
                    <button
                        className="bg-blue-500 text-white px-2 py-2 hover:bg-blue-600"
                        onClick={() => {
                            setShowStories(true)
                        }}
                    >
                        <img src="/story-icon.svg" alt="" width={40} />
                    </button>
                </Link>
                <Link to={"/channel"}>
                    <button
                        className="bg-blue-500 text-white px-2 py-2 hover:bg-blue-600"
                        onClick={() => {
                            setShowChannels(true)
                        }}
                    >
                        <img src="/channel-icon.svg" alt="" width={40} />
                    </button>
                </Link>
            </div>}
            {authUser && <div className='flex flex-col items-center'>
                <Link to={"/profile"}>
                    <button className='hover:cursor-pointer'>
                        <img
                            src={authUser.profilePic}
                            alt=""
                            className='size-10 rounded-full object-cover hover:ring-2 hover:ring-white-500 hover:ring-opacity-50 hover:transition-all duration-200'
                        />
                    </button>
                </Link>
            </div>}
        </div>
    )
}

export default SidePanel;
