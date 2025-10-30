import { useEffect, useRef, useState } from "react";
import { ChatStore } from "../store/ChatStore";
import { AuthStore } from "../store/AuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./ss/MessageSkeleton";
import { formatMessageTime } from "../../lib/util";
import { Trash2 } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = ChatStore();
  const { authUser } = AuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageInput />
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isSender = message.senderId === authUser._id;
          const isLast = index === messages.length - 1;

          return (
            <div
              key={message._id}
              className={`chat ${isSender ? "chat-end" : "chat-start"}`}
              ref={isLast ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isSender
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col relative group">
                {message.isDeletedForEveryone ? (
                  <p className="italic text-zinc-500 text-sm">This message was deleted</p>
                ) : (
                  <>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    {message.audio && (
                      <audio controls className="w-full mt-2">
                        <source src={message.audio} type="audio/webm" />
                        Your browser does not support the audio tag.
                      </audio>
                    )}
                    {message.text && <p>{message.text}</p>}
                  </>
                )}

                {isSender && !message.isDeletedForEveryone && (
                  <div className="absolute top-1 right-1 p-1 hidden group-hover:flex gap-1">
                    <button
                      onClick={() => deleteMessageForMe(message._id)}
                      className="bg-white/30 hover:bg-white/60 rounded-full p-1"
                      title="Delete for me"
                    >
                      <Trash2 size={14} className="text-gray-700" />
                    </button>
                    <button
                      onClick={() => deleteMessageForEveryone(message._id)}
                      className="bg-white/30 hover:bg-white/60 rounded-full p-1"
                      title="Delete for everyone"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                )}

                {!isSender && (
                  <div className="absolute top-1 right-1 p-1 hidden group-hover:block">
                    <button
                      onClick={() => deleteMessageForMe(message._id)}
                      className="bg-white/30 hover:bg-white/60 rounded-full p-1"
                      title="Delete for me"
                    >
                      <Trash2 size={14} className="text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
