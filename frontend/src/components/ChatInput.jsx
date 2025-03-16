import React, { useRef, useState, useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import toast from 'react-hot-toast'

const ChatInput = () => {
    const [text, setText] = useState("")
    const [imagePreview, setImagePreview] = useState(null)
    const [documentPreview, setDocumentPreview] = useState(null)
    const [document, setDocument] = useState(null);
    const [documentPath, setDocumentPath] = useState("");
    const fileInputRef = useRef(null)
    const textInputRef = useRef(null);
    const documentInputRef = useRef(null)
    const { sendMessage, documentUpload } = useChatStore()

    useEffect(() => {
        // Focus the text input when the component mounts
        if (textInputRef.current) {
            textInputRef.current.focus();
        }
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!text.trim() && !imagePreview && !document) return;

        let toastId = null; // Initialize toastId for tracking the toast
        try {
            let fileUrl = null;
            let messageText = text.trim();

            // Handle file upload if file is selected
            if (document) {
                const formData = new FormData();
                formData.append("file", document);

                // Show a loading toast while the file is uploading
                toastId = toast.loading("Uploading file...");

                const uploadResponse = await documentUpload(formData);
                // console.log("uploadResponse: ", uploadResponse);
                fileUrl = uploadResponse.path;
                messageText = document.name;

                // Update the toast to success after the file is uploaded
                toast.success("File uploaded successfully", { id: toastId });
            }

            await sendMessage({
                text: messageText,
                image: imagePreview,
                file: fileUrl,
            })

            setText("")
            setImagePreview(null);
            setDocument(null);
            setDocumentPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (documentInputRef.current) documentInputRef.current.value = "";
        } catch (error) {
            // console.log("Failed to send Message: ", error)

            // Update the toast to error if the upload fails
            if (toastId) {
                toast.error("Failed to upload file", { id: toastId });
            }
        }
    }

    const handleImageChange = (e) => {
        // console.log("e.target of handleImageChange ", e)
        const file = e.target.files[0]
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
        // console.log("file size: ", file.size)
    }

    const handleDocumentChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setDocument(file);
        setDocumentPreview(file);
        // { name: file.name, file: URL.createObjectURL(file) }

        // const formData = new FormData();
        // formData.append("file", file);

        // try {
        //     const uploadResponse = await documentUpload(formData);
        //     // Create and send message with the file URL
        //     await sendMessage({
        //         text: file.name, // Optional: include filename as message text
        //         file: uploadResponse.path
        //     });

        //     setDocumentPreview(file)
        //     // Clear input after successful upload and message creation
        //     if (documentInputRef.current) {
        //         documentInputRef.current.value = "";
        //     }
        //     toast.success("File uploaded and sent successfully");
        // } catch (error) {
        //     toast.error("Failed to upload and send file");
        // }
    }

    const handleRemoveImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleRemoveDocument = () => {
        setDocumentPreview(null);
        setDocument(null);
        if (documentInputRef.current) {
            documentInputRef.current.value = "";
        }
    };

    const handleDocumentClick = () => {
        // Clear the input value first
        if (documentInputRef.current) {
            documentInputRef.current.value = "";
        }
        // Then trigger the file selection
        documentInputRef.current?.click();
    };

    const getFileIcon = (fileName) => {
        if (fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return (
            <img src="/jpg.png" alt="" />
        );
        if (fileName?.match(/\.(pdf)$/i)) return (
            <img src="/pdf.png" alt="" />
        );
        if (fileName?.match(/\.(doc|docx)$/i)) return (
            <img src="/doc.png" alt="" />
        );
        if (fileName?.match(/\.(xls|xlsx)$/i)) return (
            <img src="/xls.png" alt="" />
        );
        if (fileName?.match(/\.(ppt|pptx)$/i)) return (
            <img src="/pptx.png" alt="" />
        );
        if (fileName?.match(/\.(mp4|mov|avi|webm)$/i)) return (
            <img src="/mp4.png" alt="" />
        );
        if (fileName?.match(/\.(mp3|wav|ogg)$/i)) return (
            <img src="/mp3.png" alt="" />
        );
        if (fileName?.match(/\.(zip|rar)$/i)) return (
            <img src="/zip.png" alt="" />
        );
        return '📎';
    };

    return (
        <div className='w-full flex flex-col items-center px-8 py-2 bg-zinc-700 absolute bottom-0'>
            <div className='w-full'>
                {imagePreview && (
                    <div className='flex items-center justify-start relative w-20 mb-2'>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className='w-20 h-20 object-cover rounded-md'
                        />
                        <button
                            onClick={handleRemoveImage}
                            className='bg-zinc-900 rounded-full w-4 h-4 absolute -right-1 -top-1 flex items-center justify-center'
                        >
                            <img src="/x.svg" alt="" className='w-[12px]' />
                        </button>
                    </div>
                )}
                {documentPreview && (
                    <div className='flex items-center justify-start relative mb-2'>
                        <div className='flex items-center justify-center max-w-1/6 h-16 bg-zinc-800 rounded-md px-4 py-2'>
                            <div className="file-attachment flex items-center relative w-full">
                                <span className="file-icon w-10 flex justify-center items-center">{getFileIcon(documentPreview.name)}</span>
                                <span className='w-3/4 text-over overflow-hidden'>
                                    {<p className=' truncate'>{documentPreview.name}</p>}
                                </span>
                                <button
                                    onClick={handleRemoveDocument}
                                    className='bg-zinc-900 rounded-full w-4 h-4 absolute -right-5 -top-4 flex items-center justify-center ring-1'
                                >
                                    <img src="/x.svg" alt="" className='w-[12px]' />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSendMessage} className='flex items-center w-full gap-4' method="post" encType="multipart/form-data">
                <span
                    className='bg-blue-500 rounded-full px-2.5 py-2.5 hover:bg-blue-600'
                    onClick={() => fileInputRef.current?.click()}
                >
                    <img src="/image-icon.svg" alt="image" className='w-6' />
                </span>
                <span
                    className='bg-blue-500 rounded-full py-2.5 px-2.5 hover:bg-blue-600'
                    onClick={handleDocumentClick}
                >
                    <img src="/paperclip-icon.svg" alt="attachment" className='w-6' />
                </span>
                <input
                    type="file"
                    accept='image/*'
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className='hidden w-full outline-2 outline-zinc-500 rounded-full px-4 py-2'
                />
                <input
                    type="file"
                    name="file"
                    ref={documentInputRef}
                    onChange={handleDocumentChange}
                    className='hidden w-full outline-2 outline-zinc-500 rounded-full px-4 py-2'
                />
                <input
                    type="text"
                    value={text}
                    ref={textInputRef}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault(); // Prevent the default form submission
                            if (text.trim() || imagePreview || document) {
                                handleSendMessage(e); // Call the message sending function
                            }
                        }
                    }}
                    className='w-full outline-2 outline-zinc-500 rounded-full px-4 py-2'
                    placeholder='Type a message...'
                />
                <button className='bg-blue-500 rounded-full py-2.5 px-2.5 hover:bg-blue-600 flex justify-center items-center' type='submit'>
                    <img src="/send-icon.svg" alt="send" className='w-6' />
                </button>
            </form>

        </div>
    )
}

export default ChatInput
