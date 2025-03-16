import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Settings, LogOut } from 'lucide-react'

const Navbar = () => {
    const { authUser, logout } = useAuthStore()
    return (
        <div className='bg-zinc-900 h-1/12 text-white flex items-center px-32 justify-between w-full'>
            <Link to={"/"}>
                <div className='text-2xl font-bold'>
                    Chatoms
                </div>
            </Link>
            <div className='flex gap-2'>
                <Link to={"/settings"}>
                    <span className='hover:cursor-pointer hover:bg-zinc-700 rounded-md flex justify-center items-center gap-1 p-2 hover:transition-all duration-400'>
                        <Settings className='w-5'/>
                        <span>Settings</span>
                    </span>
                </Link>

                {authUser && (
                    // <div className='flex gap-4'>
                    <button onClick={logout}>
                        <span className='hover:cursor-pointer hover:bg-zinc-700 rounded-md flex justify-center items-center gap-1 p-2 hover:transition-all duration-400'>
                            <LogOut className='w-5'/>
                            Logout
                        </span>
                    </button>
                    // </div>
                )}
            </div>
        </div>
    )
}

export default Navbar
