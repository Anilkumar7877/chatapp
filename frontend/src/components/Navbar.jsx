import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

const Navbar = () => {
    const { authUser, logout } = useAuthStore()
    return (
        <div className='bg-zinc-900 h-1/12 text-white flex items-center px-32 justify-between w-full'>
            <div><Link to={"/"}>Chatty</Link></div>
            <div className='flex gap-4'>
                <span><Link to={"/settings"}>settings</Link></span>

                {authUser && (
                    <div className='flex gap-4'>
                        <span><button onClick={logout}>logout</button></span>
                        <span><Link to={"/profile"}>profile</Link></span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar
