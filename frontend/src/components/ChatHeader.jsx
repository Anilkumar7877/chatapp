import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, showGroupInfo, setShowGroupInfo } = useChatStore();
//   const [showGroupInfo, setShowGroupInfo] = useState(false);

  const toggleGroupInfo = () => {
    if (selectedUser.members) {
      setShowGroupInfo(!showGroupInfo);
    }
  };

  useEffect(() => {
    setShowGroupInfo(false); // Hide group info whenever selectedUser changes
  }, [selectedUser]);
  

  return (
    <div className="relative">
      {/* Chat Header */}
      <div
        className="bg-zinc-700 h-16 flex items-center px-8 gap-4 w-full cursor-pointer"
        onClick={toggleGroupInfo}
      >
        <span className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            width={36}
            className="rounded-full object-cover w-10 h-10"
          />
        </span>
        <h2 className="font-semibold text-lg">
          {selectedUser.members ? selectedUser.name : selectedUser.fullName}
        </h2>
      </div>
    </div>
  );
};

export default ChatHeader;
