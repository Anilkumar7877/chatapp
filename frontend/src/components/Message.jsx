const getFileIcon = (fileUrl) => {
    if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return '📷';
    if (fileUrl.match(/\.(pdf)$/i)) return '📄';
    if (fileUrl.match(/\.(doc|docx)$/i)) return '📝';
    if (fileUrl.match(/\.(xls|xlsx)$/i)) return '📊';
    if (fileUrl.match(/\.(ppt|pptx)$/i)) return '📽️';
    if (fileUrl.match(/\.(mp4|mov|avi|webm)$/i)) return '🎥';
    if (fileUrl.match(/\.(mp3|wav|ogg)$/i)) return '🎵';
    if (fileUrl.match(/\.(zip|rar)$/i)) return '📦';
    return '📎';
};

// In your render method:
{message.file && (
    <div className="file-attachment">
        <span className="file-icon">{getFileIcon(message.file)}</span>
        <button onClick={() => handleFileDownload(message.file)}>
            Download {message.fileName || 'File'}
        </button>
    </div>
)}
