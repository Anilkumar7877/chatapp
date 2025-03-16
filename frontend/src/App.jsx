import React from 'react'
import { useAuthStore } from './store/useAuthStore'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LogInPage from './pages/LogInPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ChannelPage from './pages/ChannelPage'
import StoryPage from './pages/StoryPage'
import SidePanel from './components/SidePanel'

const App = () => {

  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // console.log(onlineUsers)

  if (isCheckingAuth && !authUser) {
    return (
      <div>Loading....</div>
    )
  }

  return (
    <div className='h-screen w-screen flex'>
      <div className='h-full w-full flex flex-col'>
        <Navbar />
        <div className='w-full h-11/12 flex'>
          <SidePanel />
          <div className='[width:calc(100%-48px)] h-full'>

            <Routes>
              <Route path='/' element={authUser ? <HomePage /> : <Navigate to={"/login"} />} />
              <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
              <Route path='/login' element={!authUser ? <LogInPage /> : <Navigate to={"/"} />} />
              <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />} />
              <Route path='/settings' element={<SettingsPage />} />
              <Route path='/story' element={authUser ? <StoryPage /> : <Navigate to={"/login"} />} />
              <Route path='/channel' element={authUser ? <ChannelPage /> : <Navigate to={"/login"} />} />
            </Routes>

            <Toaster />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
