import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useChatStore } from "../store/useChatStore";
import { useChannelStore } from "../store/useChannelStore";
import toast from "react-hot-toast";
import { Camera, Mail, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";

const GroupInfoPage = () => {
    // const { groupId } = useParams(); // Get group ID from URL params
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImg, setSelectedImg] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { updateGroupInfo, isUpdatingGroupInfo, leaveGroup, groupInfo, getGroupInfo } = useGroupStore();
    const { selectedUser, users, addUserToGroup, messages } = useChatStore()
    const { authUser } = useAuthStore()
    const [showAllImages, setShowAllImages] = useState(false);
    const { updateChannelInfo, isUpdatingChannelInfo, leaveChannel } = useChannelStore()
    const [showAllDocuments, setShowAllDocuments] = useState(false);

    const isChannel = selectedUser?.description;
    const isGroup = selectedUser?.isGroup;
    const isAdmin = isChannel
        ? selectedUser?.admin._id === authUser._id  // Channel case
        : selectedUser?.admin.includes(authUser._id);

    let groupId;
    if (selectedUser?.members) {
        groupId = selectedUser._id;
    }

    const handleAddUser = (userId) => {
        addUserToGroup(selectedUser._id, userId);
        setIsDropdownOpen(false); // Close dropdown after selection
    };

    // console.log(messages)

    const imageMessages = messages.filter((message) => message.image);
    const documentMessages = messages.filter((message) => message.file);

    // console.log(imageMessages)
    // console.log(documentMessages)
    // Add these new state variables after the existing useState declarations
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [newDescription, setNewDescription] = useState(selectedUser?.description || '');

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
            if (isChannel) {
                await updateChannelInfo({
                    profilePic: base64Image,
                    description: selectedUser.description,
                    channelId: selectedUser._id
                });
            } else {
                await updateGroupInfo({
                    profilePic: base64Image,
                    groupId
                });
            }
        };
    };

    // Add this new handler function
    const handleUpdateDescription = async () => {
        try {
            await updateChannelInfo({
                profilePic: selectedUser.profilePic,
                description: newDescription,
                channelId: selectedUser._id
            });
            setIsEditingDescription(false);
        } catch (error) {
            toast.error("Failed to update description");
        }
    };

    useEffect(() => {
        getGroupInfo(groupId);
    }, [getGroupInfo]);

    const handleLeaveGroup = async () => {
        try {
            await leaveGroup(selectedUser._id);
            // navigate('/');
        } catch (error) {
            toast.error("Failed to leave group");
        }
    };

    const handleLeaveChannel = async () => {
        try {
            await leaveChannel(selectedUser._id);
            // navigate('/');
        } catch (error) {

        }
    };

    const getFileIcon = (fileUrl) => {
        if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return <img src="/jpg.png" alt="" />;
        if (fileUrl.match(/\.(pdf)$/i)) return <img src="/pdf.png" alt="" />;
        if (fileUrl.match(/\.(doc|docx)$/i)) return <img src="/doc.png" alt="" />;
        if (fileUrl.match(/\.(xls|xlsx)$/i)) return <img src="/xls.png" alt="" />;
        if (fileUrl.match(/\.(ppt|pptx)$/i)) return <img src="/pptx.png" alt="" />;
        if (fileUrl.match(/\.(mp4|mov|avi|webm)$/i)) return <img src="/mp4.png" alt="" />;
        if (fileUrl.match(/\.(mp3|wav|ogg)$/i)) return <img src="/mp3.png" alt="" />;
        if (fileUrl.match(/\.(zip|rar)$/i)) return <img src="/zip.png" alt="" />;
        return '📎';
    };

    // if (loading) return <p>Loading group information...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    if (showAllImages) {
        return (
            <div className="mx-auto p-6 bg-zinc-800 text-white h-full relative flex flex-col overflow-y-scroll border-1 border-zinc-400 border-collapse">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => setShowAllImages(false)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded-full"
                    >
                        <img src="/back-icon.svg" alt="" />
                    </button>
                    <span className="flex items-center text-xl font-bold">All Images</span>
                </div>
                <div className="h-0 border-white border-1"></div>
                <div className="grid grid-cols-3 grid-rows-1 gap-2 py-4">
                    {imageMessages.map((message) => (
                        <img
                            key={message._id}
                            src={message.image}
                            alt="shared media"
                            className="w-full h-24 object-cover rounded-lg"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (showAllDocuments) {
        return (
            <div className="mx-auto p-6 bg-zinc-800 text-white h-full relative flex flex-col overflow-y-scroll border-1 border-zinc-400 border-collapse">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => setShowAllDocuments(false)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded-full"
                    >
                        <img src="/back-icon.svg" alt="" />
                    </button>
                    <span className="flex items-center text-xl font-bold">All Documents</span>
                </div>
                <div className="h-0 border-white border-1"></div>
                <div className="flex flex-col gap-2">
                    {documentMessages.map((message) => (
                        <a
                            key={message._id}
                            href={message.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:bg-zinc-600 p-2 rounded-lg"
                        >
                            <span className="file-icon w-10">{getFileIcon(message.file)}</span>
                            <span className="w-full truncate">{message.text || 'Document'}</span>
                        </a>
                    ))}
                </div>
            </div>
        );
    }
    
    // console.log("selectedUser", selectedUser)
    // console.log("groupInfo", groupInfo)

    return (
        <div className="mx-auto p-6 bg-zinc-800 text-white h-full relative flex flex-col overflow-y-scroll border-1 border-zinc-400 border-collapse">
            <div className="flex justify-center items-center">
                <div className="relative w-full flex items-center flex-col">
                    <div className="relative">
                        <img src={selectedImg || groupInfo.profilePic || "/avatar.png"} alt="groupProfile" className="size-48 object-cover rounded-full" />
                    </div>
                    {isAdmin && (
                        <label
                            htmlFor="avatar-upload"
                            className={`
                            absolute bottom-0 right-1/4 
                            bg-base-content hover:scale-105
                            p-2 rounded-full cursor-pointer 
                            transition-all duration-200
                            bg-emerald-700
                            ${(isUpdatingGroupInfo || isUpdatingChannelInfo) ? "animate-pulse pointer-events-none" : ""}
                            `}
                        >
                            <Camera className="w-5 h-5 text-base-200" />
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUpdatingGroupInfo || isUpdatingChannelInfo}
                            />
                        </label>
                    )}
                    {(<p className="text-sm text-zinc-400">
                        {(isUpdatingGroupInfo || isUpdatingChannelInfo) ? "Uploading..." : ""}
                    </p>)}
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-center">{groupInfo.name}</h1>
            {/* <p className="text-gray-300">Group ID: {selectedUser._id}</p> */}

            {/* {isChannel && (<p>{selectedUser.description}</p>)} */}
            {/* // Replace the existing description section with this new code */}
            {isChannel && (
                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold mb-2">Channel Description:</h2>
                        {isAdmin && (
                            <button
                                onClick={() => setIsEditingDescription(!isEditingDescription)}
                                className="text-emerald-500 hover:text-emerald-400"
                            >
                                {isEditingDescription ? 'Cancel' : 'Edit'}
                            </button>
                        )}
                    </div>
                    {isEditingDescription ? (
                        <div className="flex flex-col gap-2">
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className="bg-zinc-700 p-2 rounded-lg text-white resize-none"
                                rows={3}
                            />
                            <button
                                onClick={handleUpdateDescription}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg"
                                disabled={isUpdatingChannelInfo}
                            >
                                {isUpdatingChannelInfo ? 'Saving...' : 'Save Description'}
                            </button>
                        </div>
                    ) : (
                        <p className="bg-zinc-700 p-4 rounded-lg">{groupInfo.description}</p>
                    )}
                </div>
            )}

            <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Media</h2>
                <div className="bg-zinc-700 p-4 rounded-lg">
                    {imageMessages.length > 0 ? (
                        <div className="grid grid-cols-3 grid-rows-1 gap-2">
                            {imageMessages.slice(0, 3).map((message) => (
                                <img
                                    key={message._id}
                                    src={message.image}
                                    alt="shared media"
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-400 text-center">No images shared yet</p>
                    )}
                    {imageMessages.length > 3 && (
                        <button
                            onClick={() => setShowAllImages(true)}
                            className="text-blue-400 hover:cursor-pointer"
                        >
                            show more..
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Documents</h2>
                <div className="bg-zinc-700 p-4 rounded-lg">
                    {documentMessages.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {documentMessages.slice(0, 3).map((message) => (
                                <a
                                    key={message._id}
                                    href={message.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:bg-zinc-600 p-2 rounded-lg"
                                >
                                    <span className="file-icon w-10">{getFileIcon(message.file)}</span>
                                    <span className="w-full truncate">{message.text || 'Document'}</span>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-400 text-center">No documents shared yet</p>
                    )}
                    {documentMessages.length > 3 && (
                        <button
                            onClick={() => setShowAllDocuments(true)}
                            className="text-blue-400 hover:cursor-pointer"
                        >
                            show more..
                        </button>
                    )}
                </div>
            </div>

            {!isChannel && (<h2 className="text-xl font-semibold mt-4 mb-2">Group Members:</h2>)}
            {!isChannel && (<ul className="bg-zinc-700 p-4 rounded-lg">
                {groupInfo.members?.map((member) => (
                    <li key={member._id} className="py-2 flex items-center gap-2">
                        <img src={member.profilePic || "/avatar.png"} alt="" className="w-8 h-8 rounded-full" />
                        <span className="flex gap-2">
                            {member.fullName}
                            {groupInfo.admin.includes(member._id) && (
                                <span className="bg-blue-800 text-blue-200 rounded-full px-2 flex justify-center items-center">
                                    Admin
                                </span>
                            )}
                        </span>
                    </li>
                ))}
            </ul>)}
            <div className="mt-4 flex flex-col gap-4">
                {!isChannel && (<button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 bg-blue-500 rounded-md w-full hover:bg-blue-600 text-white cursor-pointer"
                >
                    {isDropdownOpen ? "Cancel" : "Add Member"}
                </button>)}

                {isDropdownOpen && (
                    <div className="mt-2 bg-zinc-800 p-2 rounded-md max-h-40 overflow-y-auto">
                        {users.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center justify-between p-2 hover:bg-zinc-700 cursor-pointer"
                                onClick={() => handleAddUser(user._id)}
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src={user.profilePic || "/avatar.png"}
                                        alt={user.fullName}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span>{user.fullName}</span>
                                </div>
                                <span className="">
                                    <img src="/plus-icon.svg" alt="" />
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                {/* {console.log(authUser?.channelsJoined.includes(groupId))} */}
                {/* {console.log(groupId)} */}
                {isGroup && (<button
                    onClick={() => handleLeaveGroup(groupId)}
                    className=" bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg w-full hover:cursor-pointer"
                >
                    Leave {'Group'}
                </button>)}
                {isChannel && (authUser?.channelsJoined.includes(groupId)) && (<button
                    onClick={() => handleLeaveChannel(groupId)}
                    className=" bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg w-full hover:cursor-pointer"
                >
                    Leave {'Channel'}
                </button>)}
            </div>
        </div>
    );
};

export default GroupInfoPage;
