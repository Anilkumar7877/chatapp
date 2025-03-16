import React from 'react'

import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'

import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { useStoryStore } from '../store/useStoryStore'
import Stories from '../components/Stories'
import SidePanel from '../components/SidePanel'

import Channels from '../components/Channel'

const HomePage = () => {
  const { selectedUser } = useChatStore()
  const { authUser } = useAuthStore()

  if (!selectedUser) {
    return (
      <div className='flex w-full h-full'>
        <Sidebar />
        <div className='w-11/12 flex justify-center items-center'>
          <div className='flex flex-col justify-center items-center gap-4'>
            <span className=''>
              <img src={authUser.profilePic} alt="profile" className='size-40 rounded-full object-cover' />
            </span>
            <span className='text-4xl'>
              Welcome to Chatty, {authUser.fullName}!
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex w-full h-full'>
      <Sidebar />
      <ChatContainer />
    </div>
  )
}

export default HomePage
