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
        if(success === true) login(formData)
    };

    return (
        <div>
            <div className="flex justify-center items-center h-screen">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md gap-1 flex flex-col w-80">
                    <h2 className="text-xl font-bold mb-4">Log In</h2>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:cursor-pointer" disabled={isLoginingIn}>Sign In</button>
                    <Link to={"/signup"}><button className="w-full text-blue-500 border-2 border-blue-500 p-2 rounded hover:cursor-pointer">Sign Up</button></Link>
                </form>
            </div>
        </div>
    )
}

export default LogInPage
