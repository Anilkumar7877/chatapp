import { create } from "zustand"
import axiosInstance from "../lib/axios"
import { useAuthStore } from "./useAuthStore"
import toast from "react-hot-toast"
import { joinChannel } from "../../../backend/src/controllers/channel.controller"

export const useChannelStore = create((set, get) => ({
    allchannels: [],
    channels: [],
    // selectedChannel: null,
    isUpdatingChannelInfo: false,

    // setSelectedChannel: (selectedChannel) => {
    //     set({ selectedChannel })
    // },

    getChannels: async () => {
        try {
            const response = await axiosInstance.get('/channel/list');
            const { allChannels, followingChannels } = response.data;
            set({ allChannels, channels: followingChannels });
        } catch (error) {
            toast.error("Failed to fetch channels");
            throw error;
        }
    },

    createChannel: async (channelData) => {
        // console.log(channelData);
        try {
            const response = await axiosInstance.post('/channel/create', channelData);
            set(state => ({
                channels: [...state.channels, response.data]
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateChannelInfo: async ({ profilePic, description, channelId }) => {
        set({ isUpdatingChannelInfo: true })
        try {
            const res = await axiosInstance.put("/channel/update-group-info", { profilePic, description, channelId })
            // console.log(res)
            // set({ authUser: res.data })
            toast.success("Profile updated successfully")
        } catch (error) {
            console.log("error in updateProfile", error)
            toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingChannelInfo: false })
        }
    },

    joinChannel: async (channelId) => {
        try {
            const response = await axiosInstance.post(`/channel/join/${channelId}`);
            const { checkAuth } = useAuthStore.getState();
            checkAuth();
            toast.success("Channel followed successfully")
        } catch (error) {
            toast.error(error.response.data.message);
            throw error;
        }
    },

    leaveChannel: async (channelId) => {
        try {
            const response = await axiosInstance.post(`/channel/leave/${channelId}`);
            const { checkAuth } = useAuthStore.getState();
            checkAuth();
            toast.success("Channel left successfully")
        } catch (error) {
            toast.error(error.response.data.message);
            throw error;
        }
    }

    // updateChannelDescription: async (description, channelId) => {
    //     set({ isUpdatingChannelInfo: true})
    //     try {
            
    //     } catch (error) {
            
    //     }
    // }
}))