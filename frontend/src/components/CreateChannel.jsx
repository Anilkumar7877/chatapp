import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { useChannelStore } from '../store/useChannelStore';

const CreateChannel = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // const [isPublic, setIsPublic] = useState(true);

    const { createChannel } = useChannelStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createChannel({name, description});
            toast.success('Channel created successfully!');
        } catch (error) {
            toast.error('Failed to create channel');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Channel Name"
                className="w-full p-2 border rounded"
                required
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Channel Description"
                className="w-full h-60 p-2 border rounded resize-none"
            />
            {/* <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label>Public Channel</label>
            </div> */}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">
                Create Channel
            </button>
        </form>
    );
};

export default CreateChannel;