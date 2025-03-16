import { create } from "zustand"
import axiosInstance from "../lib/axios"
import { useAuthStore } from "./useAuthStore"
import { useChannelStore } from "./useChannelStore"
import toast from "react-hot-toast"

export const useChatStore = create((set, get) => ({
    allChatMessages: [],
    messages: [],
    users: [],
    groups: [],
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading: false,
    showGroupInfo: false,

    getUsers: async () => {
        set({ isUserLoading: true })
        try {
            const res = await axiosInstance.get("/message/users")
            set({ users: res.data })
            // set({ groups: res.data["groups"] })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUserLoading: false })
        }
    },

    searchUserByUniqueId: async (uniqueId) => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get(`/message/search-Id/${uniqueId}`);
            return res.data;
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUserLoading: false });
        }
    },

    getGroups: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get("/group/getGroups");
            if (res && res.data) {
                set({ groups: res.data });
                // console.log("groups: ", res.data);
            } else {
                toast.error("Failed to fetch groups");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch groups");
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({ messages: res.data });
            // console.log("messages in the usechatstore: ", messages);
        } catch (error) {
            console.log("error in getMessages", error);
            // toast.error(error.response?.data?.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    fetchAllMessages: async () => {
        const { users, groups } = get();
        const channels = useChannelStore.getState().channels;
        const usersAndGroups = [...users, ...groups, ...channels];

        try {
            const messagePromises = usersAndGroups.map(user =>
                axiosInstance.get(`/message/${user._id}`)
            );

            const results = await Promise.all(messagePromises);
            const messagesMap = {};

            results.forEach((result, index) => {
                messagesMap[usersAndGroups[index]._id] = result.data;
            });

            set({ allChatMessages: messagesMap });
        } catch (error) {
            toast.error("Failed to fetch messages");
        }
    },

    sendMessage: async (data) => {
        // console.log("inside the useChatStore")
        const { selectedUser, messages } = get()
        try {
            // console.log("message data ", data)
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, data)
            set({ messages: [...messages, res.data] })
            set({
                allChatMessages: {
                    ...get().allChatMessages,
                    [selectedUser._id]: [...get().allChatMessages[selectedUser._id], res.data]
                }
            })
        } catch (error) {
            // toast.error(error.response.data.message);
            console.log("error in sendMessages ", error);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        const authUser = useAuthStore.getState().authUser; // Get authUser from useAuthStore

        socket.on('newMessage', (newMessage) => {
            const { allChatMessages, messages } = get();
            // const isChannelMessage = selectedUser?.description && newMessage.receiverId === selectedUser._id;

            // Check if the message is for the selected user
            const isMessageForSelectedUser =
                newMessage.senderId._id === selectedUser._id ||
                newMessage.receiverId === selectedUser._id;

            const isChannelMessage = newMessage.isChannelMessage;
            if (isChannelMessage) {
                // console.log("received a channel newMessage event", newMessage);
                const isMessageSentFromSelectedUser = newMessage.receiverId === selectedUser._id;
                if (!isMessageSentFromSelectedUser) return;
                const isTargetChannel = newMessage.receiverId === selectedUser._id;
                set((state) => ({
                    messages: isTargetChannel ? [...state.messages, newMessage] : state.messages,
                    // Also update allChatMessages to reflect unread status
                    allChatMessages: {
                        ...state.allChatMessages,
                        [newMessage.receiverId]: [
                            ...(state.allChatMessages[newMessage.receiverId] || []),
                            { ...newMessage, read: selectedUser?._id === newMessage.receiverId ? [...newMessage.read, authUser._id] : newMessage.read }
                        ]
                    }
                }));
                return;
            }
            if (!newMessage.isGroupMessage) {
                // console.log("received a newMessage event1", newMessage);
                const isMessageSentFromSelectedUser = newMessage.senderId._id === selectedUser._id ||
                    newMessage.receiverId === selectedUser._id; //only in case of DM
                // console.log("isMessageSentFromSelectedUser: ", isMessageSentFromSelectedUser);
                if (!isMessageSentFromSelectedUser) return;
            }
            else {
                // console.log("received a newMessage event", newMessage);
                const isMessageSentFromSelectedUser = newMessage.receiverId === selectedUser._id;
                if (!isMessageSentFromSelectedUser) return;
                const isTargetGroup = newMessage.receiverId === selectedUser._id;

                set((state) => ({
                    messages: isTargetGroup ? [...state.messages, newMessage] : state.messages,
                    allChatMessages: {
                        ...state.allChatMessages,
                        [newMessage.receiverId]: [
                            ...(state.allChatMessages[newMessage.receiverId] || []),
                            { ...newMessage, read: selectedUser?._id === newMessage.receiverId ? [...newMessage.read, authUser._id] : newMessage.read }
                        ]
                    }
                }));
                return;
                // console.log("user is in the group");
            }

            if (isMessageForSelectedUser) {
                // Update the `messages` array
                set((state) => ({
                    messages: [...state.messages, newMessage],
                }));
            }

            const chatMessages = allChatMessages[newMessage.senderId._id] || [];
            const updatedMessages = [...chatMessages, {
                ...newMessage,
                read: selectedUser?._id === newMessage.receiverId ? [...newMessage.read, authUser._id] : newMessage.read
            }];

            set(state => ({
                allChatMessages: {
                    ...state.allChatMessages,
                    [newMessage.senderId._id]: updatedMessages
                }
            }));
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off('newMessage')
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser })
    },

    setShowGroupInfo: (showGroupInfo) => set({ showGroupInfo }),

    addUserToGroup: async (groupId, userId) => {
        try {
            const res = await axiosInstance.post(`/group/addUser`, { groupId, userId });
            set((state) => ({
                groups: state.groups.map(group =>
                    group._id === groupId ? res.data.group : group
                )
            }));
            toast.success("User added to group!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add user");
        }
    },

    leaveGroup: async (groupId) => {
        try {
            const res = await axiosInstance.post(`/group/leave`, { groupId });
            set((state) => ({
                groups: state.groups.filter(group => group._id !== groupId)
            }));
            toast.success("Left group successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to leave group");
        }
    },

    documentUpload: async (formData) => {
        try {
            const response = await axiosInstance.post("/message/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                // toast.success("File uploaded successfully");
                return response.data;
            }
        } catch (error) {
            // toast.error("Error uploading file");
            throw error;
        }
    },

    markMessagesAsRead: async (chatId) => {
        try {
            const authUser = useAuthStore.getState().authUser; // Get authUser from useAuthStore
            await axiosInstance.put(`/message/read/${chatId}`);
            set((state) => {
                const chatMessages = state.allChatMessages[chatId] || [];
                return {
                    allChatMessages: {
                        ...state.allChatMessages,
                        [chatId]: chatMessages.map(msg => ({
                            ...msg,
                            read: [...msg.read, authUser._id] // Add authUser._id to the read array
                        }))
                    }
                };
            });
        } catch (error) {
            console.log("Error marking messages as read:", error);
            toast.error("Failed to mark messages as read");
        }
    }

}))