import React from 'react'
import { useStoryStore } from '../store/useStoryStore';

const SidePanel = () => {
    const { showStories, setShowStories, showChats, setShowChats, showChannels, setShowChannels } = useStoryStore();
    console.log(showChats, showStories, showChannels)
    return (
        <div className='w-12 h-full bg-blue-500 text-white'>
            <div className='flex flex-col items-center h-full'>
                <button
                    className="bg-blue-500 text-white px-2 py-2 hover:bg-blue-600"
                    onClick={() => {
                        setShowChats(true)
                    }}
                >
                    <img src="/chat-icon.svg" alt="" width={40}/>
                </button>
                <button
                    className="bg-blue-500 text-white px-2 py-2 hover:bg-blue-600"
                    onClick={() => {
                        setShowStories(true)
                    }}
                >
                    <img src="/channel-icon.svg" alt="" width={40}/>
                </button>
                <button
                    className="bg-blue-500 text-white px-2 py-2 hover:bg-blue-600"
                    onClick={() => {
                        setShowChannels(true)
                    }}
                >
                    <img src="/story-icon.svg" alt="" width={40}/>
                </button>
            </div>
        </div>
    )
}

export default SidePanel;
