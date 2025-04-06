import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatProps {
  chat: { user: string; bot: string }[];
}

const Chat: React.FC<ChatProps> = ({ chat }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [streamingText, setStreamingText] = useState<{ [key: number]: string }>(
    {}
  );

  // Add function to format user message with colored commands
  const formatUserMessage = (message: string) => {
    const commandRegex = /\/\w+/g;
    const parts = message.split(commandRegex);
    const commands = message.match(commandRegex) || [];

    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {commands[index] && (
              <span className="bg-white px-2 py-1 rounded-sm  text-primary font-semibold">
                {commands[index]}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  // Function to simulate streaming text
  const streamText = async (text: string, index: number) => {
    if (text.includes("Thinking")) {
      setStreamingText((prev) => ({ ...prev, [index]: text }));
      return;
    }

    try {
      const parsedText = JSON.parse(text);
      let currentText = "";
      const words = parsedText.split(" ");

      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + " ";
        setStreamingText((prev) => ({ ...prev, [index]: currentText }));
        await new Promise((resolve) => setTimeout(resolve, 20)); // Adjust speed here
      }
    } catch (error) {
      setStreamingText((prev) => ({ ...prev, [index]: text }));
    }
  };

  // Start streaming when chat updates
  useEffect(() => {
    const lastIndex = chat.length - 1;
    if (lastIndex >= 0) {
      streamText(chat[lastIndex].bot, lastIndex);
    }
  }, [chat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamingText]);

  return (
    <div className="h-full w-full border-xl flex flex-col overflow-y-auto p-4 mb-2 custom-scrollbar">
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <AnimatePresence>
          {chat.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col "
            >
              {/* User Message */}
              <div className="self-end max-w-[80%]">
                <div className="text-sm font-medium text-foreground/80 mb-4 ">
                  You
                </div>
                <div className="bg-primary  border  shadow-soft3 prose prose-md text-primary-foreground p-3 rounded-lg rounded-tr-none space-y-2">
                  {formatUserMessage(message.user)}
                </div>
              </div>

              {/* Bot Message */}
              <div className="self-start max-w-[80%] mt-2">
                <div className="text-sm font-medium text-foreground/80 mb-4 flex items-center">
                  <img
                    src="/bot-image.png"
                    alt="Bot Avatar"
                    className="w-8 h-8 rounded-lg mx-2"
                  />
                  Insighty
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-white border shadow-soft3 text-foreground p-3 rounded-lg rounded-tl-none overflow-x-auto"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose">
                    {streamingText[index] || ""}
                  </ReactMarkdown>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default Chat;
