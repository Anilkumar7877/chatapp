import React from 'react'
import Channel from '../components/Channel'
import ChatContainer from '../components/ChatContainer'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'

const ChannelPage = () => {
  const { selectedUser } = useChatStore()

  return (
    <div className='flex h-full'>
      <Channel />
      {selectedUser && <ChatContainer />}
    </div>
  )
}

export default ChannelPage
