import React from 'react'
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SignUpPage = () => {

    const { signup, isSigningUp } = useAuthStore()

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        uniqueId: "" // Add uniqueId to formData
    });

    const validateForm = () => {
        if (!formData.fullName.trim()) return toast.error("Fullname is required")
        if (!formData.email.trim()) return toast.error("Email is required")
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required")
        if (formData.password.length < 6) return toast.error("Password must be atleast 6 characters")
        if (!formData.uniqueId.trim()) return toast.error("Unique ID is required") // Validate uniqueId

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
        if(success === true) signup(formData)
    };
    return (
        <div>
            <div className="flex justify-center items-center h-screen">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-80">
                    <h2 className="text-xl font-bold mb-4">Sign Up</h2>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full p-2 mb-3 border rounded"
                        required
                    />
                    <input
                        type="text"
                        name="uniqueId"
                        placeholder="Unique ID"
                        value={formData.uniqueId}
                        onChange={handleChange}
                        className="w-full p-2 mb-3 border rounded"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 mb-3 border rounded"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-2 mb-3 border rounded"
                        required
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={isSigningUp}>Sign In</button>
                    <button><Link to={"/login"}>Log In</Link></button>
                </form>
            </div>
        </div>
    )
}

export default SignUpPage