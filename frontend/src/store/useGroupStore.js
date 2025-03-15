import { create } from "zustand"
import axiosInstance from "../lib/axios"
import { useAuthStore } from "./useAuthStore"
import toast from "react-hot-toast"

export const useGroupStore = create((set, get) => ({
    allGroups: [],
    isUpdatingGroupInfo: false,

    getGroups: async () => {
        try {

        } catch (error) {

        }
    },

    createGroup: async (groupName, selectedUsers) => {
        try {
            // console.log({ groupName, selectedUsers });
            const res = await axiosInstance.post("/group/create", { groupName, selectedUsers });
            set((state) => ({ allGroups: [...state.allGroups, res.data] }));
            toast.success("Group created successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
            console.error("Create Group Error:", error);
        }
    },

    leaveGroup: async (groupId) => {
        try {
            await axiosInstance.post("/group/leave", { groupId });
            set((state) => ({
                allGroups: state.allGroups.filter(group => group._id !== groupId),
                selectedUser: null,
                messages: []
            }));
            toast.success("Left group successfully in useGroupStore");
        } catch (error) {
            console.log("Error in leaveGroup: ", error);
            toast.error("Failed to leave group in useGroupStore");
        }
    },

    updateGroupInfo: async ({ profilePic, groupId }) => {
        set({ isUpdatingGroupInfo: true })
        try {
            const res = await axiosInstance.put("/group/update-group-info", { profilePic, groupId })
            // console.log(res)
            // set({ authUser: res.data })
            toast.success("Profile updated successfully")
        } catch (error) {
            console.log("error in updateProfile", error)
            toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingGroupInfo: false })
        }
    },
}))