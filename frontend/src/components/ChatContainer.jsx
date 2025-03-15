import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import GroupInfoPage from './GroupInfo';

const ChatContainer = () => {
  const { selectedUser, messages, getMessages, subscribeToMessages, unsubscribeFromMessages, showGroupInfo } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const isChannel = selectedUser?.hasOwnProperty('description'); // Only channels have descriptions
  const isChannelAdmin = isChannel && selectedUser?.admin?._id === authUser?._id;

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleFileDownload = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const getFileIcon = (fileUrl) => {
    if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return <img src="/jpg.png" alt="" />;
    if (fileUrl.match(/\.(pdf)$/i)) return <img src="/pdf.png" alt="" />;
    if (fileUrl.match(/\.(doc|docx)$/i)) return <img src="/doc.png" alt="" />;
    if (fileUrl.match(/\.(xls|xlsx)$/i)) return <img src="/xls.png" alt="" />;
    if (fileUrl.match(/\.(ppt|pptx)$/i)) return <img src="/pptx.png" alt="" />;
    if (fileUrl.match(/\.(mp4|mov|avi|webm)$/i)) return <img src="/mp4.png" alt="" />;
    if (fileUrl.match(/\.(mp3|wav|ogg)$/i)) return <img src="/mp3.png" alt="" />;
    if (fileUrl.match(/\.(zip|rar)$/i)) return <img src="/zip.png" alt="" />;
    return '📎';
  };

  const getMessageDay = (date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    const day = messageDate.getDate();
    const month = messageDate.toLocaleDateString('en-US', { month: 'long' });
    const year = messageDate.getFullYear();

    return `${day} ${month} ${year}`;
  };

  console.log(selectedUser)
  return (
    <div className='flex w-3/4'>
      <div className={`max-h-screen overflow-hidden bg-zinc-800 text-white ${showGroupInfo ? 'w-2/3' : 'w-full'} relative`}>
        <ChatHeader />

        <div className='max-h-4/5 w-full overflow-y-scroll flex gap-4 '>
          <div className='flex flex-col gap-4 p-4 w-full'>
            {messages.reduce((elements, message, index) => {
              if (index === 0 || getMessageDay(message.createdAt) !== getMessageDay(messages[index - 1].createdAt)) {
                elements.push(
                  <div key={`date-${message._id}`} className="sticky top-0 z-10 flex items-center justify-center py-2 bg-zinc-800">
                    <div className="bg-blue-300 px-4 py-1 rounded-full text-sm text-zinc-900">
                      {getMessageDay(message.createdAt)}
                    </div>
                  </div>
                );
              }

              elements.push(
                <div
                  key={message._id}
                  className={`chat flex items-center gap-4 ${message.senderId._id === authUser._id ? 'flex-row-reverse' : ''}`}
                  ref={messageEndRef}
                >
                  <div>
                    <span className='w-8 h-8 rounded-full overflow-hidden'>
                      <img
                        src={message.senderId.profilePic || '/avatar.png'}
                        alt=""
                        width={32}
                        className='w-8 h-8 rounded-full object-cover'
                      />
                    </span>
                  </div>

                  <div className="max-w-1/2 chat-bubble bg-zinc-900 rounded-xl px-4 py-2">
                    {message.file && !message.image && (
                      <div className="file-attachment flex gap-4 items-center">
                        <span className="file-icon w-10">{getFileIcon(message.file)}</span>
                        <span>
                          {message.text && <p>{message.text}</p>}
                        </span>
                        <button
                          onClick={() => handleFileDownload(message.file)}
                          className="download-button bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          <span className='cursor-pointer'>
                            <img src="/download-icon.svg" alt="download-icon" className='w-5' />
                          </span>
                        </button>
                      </div>
                    )}
                    {message.image && (
                      <a href={message.image} target="_blank" rel="noopener noreferrer" className='hover:opacity-60'>
                        <img src={message.image} className='w-[250px] my-2 rounded-md' alt="message" />
                      </a>
                    )}                    {!message.file && message.text && <p>{message.text}</p>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.createdAt && new Date(message.createdAt).toLocaleTimeString([], {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              );

              return elements;
            }, [])}
          </div>
        </div>

        {(!isChannel || isChannelAdmin) && (
          <ChatInput />
        )}
      </div>
      {showGroupInfo && (
        <div className='w-2/6 h-full'>
          <GroupInfoPage />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;