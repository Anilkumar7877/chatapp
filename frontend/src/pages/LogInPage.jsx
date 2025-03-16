import React from 'react'
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const LogInPage = () => {

    const { login, isLoginingIn } = useAuthStore()

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const validateForm = () => {
        if (!formData.email.trim()) return toast.error("Email is required")
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required")
        if (formData.password.length < 6) return toast.error("Password must be atleast 6 characters")

        return true;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let success = validateForm()
        if (success === true) login(formData)
    };

    return (
        <div className='w-full h-full'>
            <div className="flex justify-center items-center h-full">
                <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-lg shadow-md w-1/2 gap-4 flex flex-col">
                    <div>
                        <h2 className="text-xl font-bold">Log In</h2>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className="flex flex-col">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                Email
                            </div>
                            <div className="px-2 py-1 bg-base-200 rounded-lg border">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 outline-none rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                Password
                            </div>
                            <div className="px-2 py-1 bg-base-200 rounded-lg border">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-2 outline-none rounded"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:cursor-pointer" disabled={isLoginingIn}>
                            Log In
                        </button>
                        <Link to={"/signup"} className="w-full text-blue-500 border-2 border-blue-500 p-2 rounded hover:cursor-pointer">
                            <button className="text-center w-full hover:cursor-pointer">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LogInPage
