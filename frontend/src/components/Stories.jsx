import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStoryStore } from '../store/useStoryStore';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/useChatStore';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper modules
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Stories = () => {
    const { authUser, updateUserStoryPrivacy } = useAuthStore();
    const { stories, fetchStories, uploadStory, markStoryAsSeen, fetchStoryViewers, isUploadingStory, setIsUploadingStory, isFetchingStories, setIsFetchingStories } = useStoryStore();
    const [storyPreview, setStoryPreview] = useState(null);
    const { users, getUsers } = useChatStore();
    const [storyFile, setStoryFile] = useState(null);
    const [selectedStory, setSelectedStory] = useState(null);
    const [viewers, setViewers] = useState([]);
    const [showViewersModal, setShowViewersModal] = useState(false);
    const [storyText, setStoryText] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
    const fileInputRef = useRef(null);
    const [expanded, setExpanded] = useState({});
    const MAX_CHAR_COUNT = 900;

    useEffect(() => {
        fetchStories();
        getUsers();
    }, [fetchStories, getUsers]);

    const handleStoryChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setStoryPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setStoryFile(file);
    };

    const handleUploadStory = async () => {
        setIsUploadingStory(true);
        if (!storyFile) return;

        const formData = new FormData();
        formData.append('file', storyFile);
        formData.append('text', storyText);
        formData.append('mediaType', storyFile.type.split('/')[0]); // Send media type (image/video)

        try {
            await uploadStory(formData);
            setStoryPreview(null);
            setStoryFile(null);
            setStoryText('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            toast.success('Story uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload story');
        }
    };

    const handleUpdateStoryPrivacy = async () => {
        setShowUserSelectionModal(true);
    };

    const handleSaveStoryPrivacy = async () => {
        try {
            await updateUserStoryPrivacy(selectedUsers);
            setShowUserSelectionModal(false);
        } catch (error) {
            toast.error('Failed to update story privacy');
        }
    };

    const handleStoryClick = async (story) => {
        setSelectedStory(story);
        if (story.createdBy._id !== authUser._id && !story.seenBy.includes(authUser._id)) {
            await markStoryAsSeen(story._id);
        }
    };

    const handleShowViewers = async (storyId) => {
        const fetchedViewers = await fetchStoryViewers(storyId);
        setViewers(fetchedViewers);
        setShowViewersModal(true);
    };

    const handleCloseModal = () => {
        setSelectedStory(null);
    };

    const toggleExpanded = (index) => {
        setExpanded((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const userStories = stories.myStories || [];
    const recentStories = stories.recentStories || [];

    console.log(userStories, recentStories);

    return (
        <div className="stories-container w-1/4 bg-zinc-600 py-4 flex flex-col gap-4 text-white">
            <div className="upload-story">
                <input
                    type="file"
                    accept="image/*,video/*"
                    ref={fileInputRef}
                    onChange={handleStoryChange}
                    className="hidden"
                />
                <div className='flex justify-between items-center mb-2 px-4'>
                    <h2 className="font-semibold flex items-center text-2xl">Story</h2>
                    <button onClick={handleUpdateStoryPrivacy} className="update-privacy-button">
                        <span className='flex items-center justify-center p-2 rounded-full hover:bg-zinc-500'>
                            <img src="/settings-icon.svg" alt="w-6" />
                        </span>
                    </button>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="add-story-button w-full">
                    <div className="story h-16 w-full flex items-center gap-4 px-4 hover:bg-zinc-700 cursor-pointer">
                        <div className='w-12 h-12 overflow-hidden relative'>
                            <img src={authUser.profilePic} alt="story" className="story-image w-12 h-12 object-cover rounded-full" />
                            <span className='w-5 h-5 bg-green-500 rounded-md flex justify-center items-center absolute bottom-0 right-0'>
                                <img src="/plus-icon.svg" alt="" className='' />
                            </span>
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-start'>
                                My Story
                            </span>
                            <span className='text-sm text-zinc-500'>
                                Click to add story
                            </span>
                        </div>
                    </div>
                </button>
            </div>
            <div className="stories w-full">
                <h2 className="text-lg font-semibold mb-2 px-4">My Stories</h2>
                {isFetchingStories && <p className="no-stories-message">Fetching stories...</p>}
                {userStories.length === 0 ? (
                    <p className="no-stories-message">You have no stories.</p>
                ) : (
                    userStories.map((story) => (
                        <div key={story._id} className="story h-16 w-full flex items-center gap-4 px-4 hover:bg-zinc-700 cursor-pointer" onClick={() => handleStoryClick(story)}>
                            <div className='w-12 h-12 rounded-full bg-green-500 overflow-hidden ring-3 ring-green-400'>
                                <img src={story.media[0].url} alt="story" className="story-image w-12 h-12 object-cover" />
                            </div>
                            <div className='flex flex-col w-2/3'>
                                <span>
                                    {story.createdBy.fullName}
                                </span>
                                <span className='text-sm text-zinc-500'>
                                    {new Date(story.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleShowViewers(story._id); }} className="viewers-button">
                                <span className='flex items-center justify-center p-2 rounded-full hover:bg-zinc-500'>
                                    <img src="/eye-icon.svg" alt="" className='w-6' />
                                </span>
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div className="stories w-full">
                <h2 className="text-lg font-semibold mb-2 px-4">Recent Stories</h2>
                {isFetchingStories && <p className="no-stories-message">Fetching stories...</p>}
                {recentStories.length === 0 ? (
                    <p className="no-stories-message">There are no recent stories.</p>
                ) : (
                    recentStories.map((story) => (
                        <div key={story._id} className="story h-16 w-full flex items-center gap-6 px-4 hover:bg-zinc-700 cursor-pointer" onClick={() => handleStoryClick(story)}>
                            <div className='w-12 h-12 rounded-full bg-green-500 overflow-hidden ring-3 ring-green-400'>
                                <img src={story.media[0].url} alt="story" className="story-image w-12 h-12 object-cover" />
                            </div>
                            <div className='flex flex-col'>
                                <span>
                                    {story.createdBy.fullName}
                                </span>
                                <span className='text-sm text-zinc-500'>
                                    {new Date(story.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* to upload the story */}
            {storyPreview && (
                <div className='w-full h-full'>
                    <div className="w-full h-full fixed inset-0 flex justify-center items-center">
                        <div className="w-full h-full fixed inset-0 bg-gray-400/20 backdrop-blur-sm"></div>

                        <div className="modal fixed z-10 bg-zinc-900 w-1/2 h-full text-white">
                            <div className='flex justify-between items-center px-4 h-20 bg-zinc-800'>
                                <div className="flex gap-4 items-center">
                                    <div>
                                        <img src={authUser.profilePic} alt="" className='w-12 h-12 object-cover rounded-full' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='text-lg'>{authUser.fullName}</p>
                                        {/* <p className='text-zinc-400 text-sm'>{new Date(selectedStory.createdAt).toLocaleString()}</p> */}
                                    </div>
                                </div>
                                <button onClick={() => { setStoryPreview(null) }} className="absolute top-2 right-2 text-black text-2xl">
                                    <img src="/cross-icon.svg" alt="" />
                                </button>
                            </div>
                            <div className='h-9/10 flex flex-col justify-between items-center py-4'>
                                <div className="w-full h-full flex flex-col justify-between items-center relative">
                                    <div className='w-full h-3/4 relative overflow-hidden flex justify-center items-center'>
                                        <img src={storyPreview} alt="story" className="max-h-full object-contain" />
                                    </div>
                                    {/* <span className='w-full absolute bg-black/50 max-h-1/3 bottom-0 text-white p-4 flex items-center justify-center text-lg'>
                                        {storyText}
                                    </span> */}
                                    <div className='w-full h-1/4 flex justify-center items-end gap-4 px-4 py-4'>
                                        {/* <span className='w-full flex'> */}
                                        <textarea
                                            value={storyText}
                                            onChange={(e) => setStoryText(e.target.value)}
                                            placeholder="Add a caption..."
                                            className="story-textarea bg-zinc-600 px-4 py-1 rounded-md w-full h-full resize-none"
                                            maxLength={MAX_CHAR_COUNT}
                                        />
                                        <button onClick={handleUploadStory} className="upload-button bg-blue-500 rounded-full p-2 flex justify-center items-center hover:bg-blue-400">
                                            <img src="/send-icon.svg" alt="" />
                                        </button>
                                        {/* </span> */}
                                    </div>
                                    <div className="w-full text-right pr-4 text-sm text-zinc-400">
                                        {storyText.length}/{MAX_CHAR_COUNT}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* to view the stories */}
            {selectedStory && (
                <div className='w-full h-full'>
                    <div className="w-full h-full fixed inset-0 flex justify-center items-center">
                        <div className="w-full h-full fixed inset-0 bg-gray-400/20 backdrop-blur-sm"></div>

                        <div className="modal fixed z-10 bg-zinc-900 py-4 w-1/2 h-full text-white">
                            <div className='flex justify-between items-center px-4 h-20'>
                                <div className="flex gap-4 items-center">
                                    <div>
                                        <img src={selectedStory.createdBy.profilePic} alt="" className='w-12 h-12 object-cover rounded-full' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='text-lg'>{selectedStory.createdBy.fullName}</p>
                                        <p className='text-zinc-400 text-sm'>{new Date(selectedStory.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} className="close-button absolute top-2 right-2 text-2xl p-2 rounded-full hover:bg-zinc-600">
                                    <img src="/cross-icon.svg" alt="" />
                                </button>
                            </div>
                            <div className='w-full h-8/9 flex flex-col justify-center items-center '>
                                <Swiper modules={[Navigation, Pagination]} navigation pagination className='h-full w-full'>
                                    {selectedStory.media.map((mediaItem, index) => {
                                        console.log(mediaItem);
                                        return (
                                            <SwiperSlide key={index} className="h-full w-full">
                                                <div className="h-full flex flex-col justify-start items-center relative">
                                                    <div className="w-full h-full flex justify-center items-center">
                                                        <img src={mediaItem.url} alt="story" className="max-h-full w-full object-contain" />
                                                    </div>
                                                    <div className="w-full overflow-hidden flex justify-center z-50 bg-zinc-500/5 absolute bottom-10">
                                                        <div className="w-full break-words text-wrap bg-black/50 text-white p-4 text-sm text-center">
                                                            {expanded[index] ? mediaItem.text : `${mediaItem.text.slice(0, 400)}${mediaItem.text.length > 400 ? "..." : ""}`}
                                                            {/* {console.log(expanded)} */}
                                                            {mediaItem.text.length > 400 && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleExpanded(index);
                                                                        // console.log(expanded)
                                                                    }}
                                                                    className="text-blue-400 ml-2 underline hover:cursor-pointer"
                                                                >
                                                                    {expanded[index] ? "Read Less" : "Read More"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showViewersModal && (
                <div className="modal w-full h-full fixed inset-0 flex justify-center items-center z-50">
                    <div className="w-full h-full fixed inset-0 bg-gray-400/20 backdrop-blur-sm"></div>

                    <div className="modal-content flex flex-col justify-start bg-zinc-800 text-white p-4 rounded-lg relative w-1/2 h-1/2 border-blue-400 border-1">
                        {/* <button onClick={() => setShowViewersModal(false)} className="close-button absolute top-2 right-2 text-black text-2xl">
                            &times;
                        </button> */}
                        <button onClick={() => setShowViewersModal(false)} className="close-button absolute top-2 right-2 text-2xl p-2 rounded-full hover:bg-zinc-600">
                            <img src="/cross-icon.svg" alt="" />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Story Viewers</h2>
                        <ul className=''>
                            {viewers.map(viewer => (
                                <li key={viewer._id} className="viewer-item flex items-center gap-4 mb-2">
                                    <img src={viewer.profilePic} alt={viewer.fullName} className="w-10 h-10 object-cover rounded-full" />
                                    <span>{viewer.fullName}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {showUserSelectionModal && (
                <div className="modal w-full h-full fixed inset-0 flex justify-center items-center z-50">
                    <div className="w-full h-full fixed inset-0 bg-gray-400/20 backdrop-blur-sm"></div>

                    <div className="modal-content flex flex-col justify-between bg-zinc-800 text-white p-4 rounded-lg relative w-1/2 h-1/2 border-blue-400 border-1">
                        {/* <button onClick={() => setShowUserSelectionModal(false)} className="close-button absolute top-2 right-2 text-black text-2xl">
                            &times;
                        </button> */}
                        <button onClick={() => setShowUserSelectionModal(false)} className="close-button absolute top-2 right-2 text-black text-2xl p-2 rounded-full hover:bg-zinc-600">
                            <img src="/cross-icon.svg" alt="" />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Hide Story from</h2>
                        <ul className='h-2/3 overflow-y-scroll'>
                            {users.map(user => (
                                <li key={user._id} className="user-item flex items-center gap-4 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => {
                                            if (selectedUsers.includes(user._id)) {
                                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                                            } else {
                                                setSelectedUsers([...selectedUsers, user._id]);
                                            }
                                        }}
                                    />
                                    <img src={user.profilePic} alt={user.fullName} className="w-10 h-10 object-cover rounded-full" />
                                    <span>{user.fullName}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={handleSaveStoryPrivacy} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stories;