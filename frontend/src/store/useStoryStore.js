import { create } from "zustand"
import axiosInstance from "../lib/axios"
import { useAuthStore } from "./useAuthStore"
import { useChannelStore } from "./useChannelStore"
import toast from "react-hot-toast"

export const useStoryStore = create((set, get) => ({
    showStories: false,
    showChats: true,
    showChannels: false,
    stories: [],
    isUploadingStory: false,
    isFetchingStories: false,

    setShowStories: (data) => set({
        showStories: data,
        showChats: false,
        showChannels: false
    }),
    setShowChats: (data) => set({
        showChats: data,
        showStories: false,
        showChannels: false
    }),
    setShowChannels: (data) => set({
        showChannels: data,
        showChats: false,
        showStories: false
    }),

    setIsUploadingStory: (data) => set({ isUploadingStory: data }),
    setIsFetchingStories: (data) => set({ isFetchingStories: data }),

    fetchStories: async () => {
        set({ isFetchingStories: true });
        try {
            const res = await axiosInstance.get('/stories');
            const { myStories, recentStories } = res.data;
            set({ stories: { myStories, recentStories } });
            console.log("fetched stories", get().stories);
        } catch (error) {
            console.log('Failed to fetch stories', error);
            toast.error('Failed to fetch stories');
        }
        set({ isFetchingStories: false })
    },

    uploadStory: async (formData) => {
        set({ isUploadingStory: true });
        try {
            const res = await axiosInstance.post('/stories/upload', formData);
            const updatedStory = res.data;
            console.log("updatedStory again", updatedStory);
            set((state) => {
                const userId = updatedStory.createdBy;
                const authUserId = useAuthStore.getState().authUser._id; // Get the current user's ID
                const updatedStories = { ...state.stories };

                if (userId === authUserId) {
                    // Add the story to `myStories`
                    console.log("updatedStory in mystories", updatedStory);
                    const existingStoryIndex = updatedStories.myStories.findIndex(story => story._id === updatedStory._id);
                    if (existingStoryIndex !== -1) {
                        updatedStories.myStories[existingStoryIndex] = updatedStory;
                    } else {
                        updatedStories.myStories.push(updatedStory);
                    }
                } else {
                    // Add the story to `recentStories`
                    console.log("updatedStory in recentstories", updatedStory);
                    const existingStoryIndex = updatedStories.recentStories.findIndex(story => story._id === updatedStory._id);
                    if (existingStoryIndex !== -1) {
                        updatedStories.recentStories[existingStoryIndex] = updatedStory;
                    } else {
                        updatedStories.recentStories.push(updatedStory);
                    }
                }
                return { stories: updatedStories };
            });
        } catch (error) {
            console.log('Failed to upload story', error);
            toast.error('Failed to upload story');
        }
        set({ isUploadingStory: false });
    },

    markStoryAsSeen: async (storyId) => {
        try {
            const res = await axiosInstance.post(`/stories/${storyId}/seen`);
            const updatedStory = res.data;
            set((state) => {
                const userId = updatedStory.createdBy._id;
                const updatedStories = { ...state.stories };
                if (userId === useAuthStore.getState().authUser._id) {
                    updatedStories.myStories = updatedStories.myStories.map(story =>
                        story._id === storyId ? updatedStory : story
                    );
                } else {
                    updatedStories.recentStories = updatedStories.recentStories.map(story =>
                        story._id === storyId ? updatedStory : story
                    );
                }
                return { stories: updatedStories };
            });
        } catch (error) {
            toast.error('Failed to mark story as seen');
        }
    },

    fetchStoryViewers: async (storyId) => {
        try {
            const res = await axiosInstance.get(`/stories/${storyId}/viewers`);
            return res.data;
        } catch (error) {
            toast.error('Failed to fetch story viewers');
            return [];
        }
    },
}));
