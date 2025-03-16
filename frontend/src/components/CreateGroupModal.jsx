import React, { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { users, getUsers } = useChatStore();
    const { createGroup } = useGroupStore();
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]); 

    useEffect(() => {
        if (isOpen && users.length === 0) {
            // console.log("Fetching users...");
            getUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        // console.log("Updated selectedUsers:", selectedUsers);
    }, [selectedUsers]);

    const handleUserSelect = (userId) => {
        setSelectedUsers((prevSelectedUsers) => {
            const isSelected = prevSelectedUsers.includes(userId);
            return isSelected
                ? prevSelectedUsers.filter((id) => id !== userId) // Remove if already selected
                : [...prevSelectedUsers, userId]; // Add if not selected
        });
    };

    const handleSubmit = () => {
        // console.log("Group Name:", groupName);
        // console.log("Selected Users:", selectedUsers);
        if (!groupName || selectedUsers.length === 0) {
            alert("Please enter a group name and select at least one user.");
            return;
        }

        createGroup(groupName, selectedUsers);
        onClose();  // Close the modal after submission
    };

    if (!isOpen) return null;

    return (
        <div className="w-full h-full fixed inset-0 flex justify-center items-center z-50">
            <div className="w-full h-full fixed inset-0 bg-gray-400/20 backdrop-blur-sm"></div>

            <div className="modal-content flex flex-col bg-zinc-800 text-white p-4 rounded-lg relative w-1/2 h-1/2 gap-2 border-blue-400 border-1">
                <button onClick={onClose} className="close-button absolute top-2 right-2 text-black text-2xl p-2 rounded-full hover:bg-zinc-600">
                    <img src="/cross-icon.svg" alt="" />
                </button>

                <h2 className="text-lg font-semibold">Create a Group</h2>

                <input
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full border p-2 rounded-md"
                />

                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold">Select Users:</h3>
                    <div className="max-h-40 overflow-y-auto border rounded p-2 flex flex-col gap-2">
                        {users?.map((user) => (
                            <div key={user._id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={user._id}
                                    checked={selectedUsers.includes(user._id)}
                                    onChange={() => handleUserSelect(user._id)}
                                />
                                <label htmlFor={user._id}>{user.fullName}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
