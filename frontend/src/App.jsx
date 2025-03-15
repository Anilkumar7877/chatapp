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
      
      <div className='w-full h-full flex flex-col'>
        <Navbar />

        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to={"/login"} />} />
          <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
          <Route path='/login' element={!authUser ? <LogInPage /> : <Navigate to={"/"} />} />
          <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Routes>

        <Toaster />
      </div>
    </div>
  )
}

export default App
