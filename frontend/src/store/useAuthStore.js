import { create } from 'zustand'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import axiosInstance from '../lib/axios'

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoginingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    // updateAuthUser: (newData) => {
    //     set({ authUser: newData });
    // },

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data })
            get().connectSocket()

        } catch (error) {
            console.log("error in checkauth");
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({ authUser: res.data })
            toast.success("Account created")
            get().connectSocket()

        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isSigningUp: false })
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true })
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("Logged in successfully")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoggindIn: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({ authUser: null })
            toast.success("Logged out successfully")
            get().disconnectSocket()

        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const res = await axiosInstance.put("/auth/update-profile", data)
            // console.log(res)
            set({ authUser: res.data })
            // toast.success("Profile updated successfully")
        } catch (error) {
            console.log("error in updateProfile", error)
            // toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    updateUserStoryPrivacy: async (selectedUsers) => {
        try {
            // console.log("selectedUsers", selectedUsers)
            const res = await axiosInstance.put('/auth/update-story-privacy', { selectedUsers });
            set({ authUser: res.data });
            toast.success('Story privacy settings updated successfully');
        } catch (error) {
            // console.log("error in updateStoryPrivacy", error)
            toast.error('Failed to update story privacy settings');
        }
    },

    connectSocket: async () => {
        const { authUser } = get()
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        })
        socket.connect()

        set({ socket: socket })

        socket.on("getOnlineUsers", (onlineUserIds) => {
            set({ onlineUsers: onlineUserIds });
        })
    },

    disconnectSocket: async () => {
        if (get().socket?.connected) get().socket.disconnect()
    }
}))