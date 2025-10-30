import { useEffect, useState, useRef } from "react";
import { ChatStore } from "../store/ChatStore";
import { AuthStore } from "../store/AuthStore";
import { ImageIcon, Mic, Send, StopCircle, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const { selectedUser, sendMessage } = ChatStore();
  const { authUser } = AuthStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const audioChunks = useRef([]);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!text && !image) return;
    await sendMessage({ text, image });
    setText("");
    setImage(null);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setImage(reader.result);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunks.current = [];

    recorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const base64Audio = await blobToBase64(blob);
      await sendMessage({ audio: base64Audio });
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const onEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  if (!selectedUser) return null;

  return (
    <div className="border-t p-4 relative">
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-50">
          <EmojiPicker onEmojiClick={onEmojiClick} height={350} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          hidden
        />

        <input
          type="text"
          placeholder="Type your message..."
          className="input input-bordered flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button onClick={handleSend} className="btn btn-circle">
          <Send size={20} />
        </button>

        <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="btn btn-circle">
          <Smile size={20} />
        </button>

        <button onClick={() => fileInputRef.current.click()} className="btn btn-circle">
          <ImageIcon size={20} />
        </button>

        {!isRecording ? (
          <button onClick={startRecording} className="btn btn-circle" title="Start Recording">
            <Mic size={20} />
          </button>
        ) : (
          <button onClick={stopRecording} className="btn btn-circle btn-error" title="Stop Recording">
            <StopCircle size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
