import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import { Card } from "./ui/card";

export default function ChatWindow({
  customization,
  chatbotId,
  embedded = false,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const {
    logoPath,
    primaryColor = "#2563EB",
    businessName = "Chatbot",
    welcomeMessage = "Hi! How can I assist you today?",
    fontFamily = "Arial",
    position = "bottom-right",
  } = customization || {};

  const fetchMessages = useCallback(async () => {
    if (!chatbotId) return;

    try {
      const res = await axios.get(`http://localhost:5001/api/messages`, {
        params: { chatbotId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [chatbotId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // useEffect(() => {
  //   if (!chatbotId) return;

  //   const fetchMessages = async () => {
  //     try {
  //       const res = await axios.get(`http://localhost:5001/api/messages`, {
  //         params: { chatbotId },
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`
  //         }
  //       });
  //       setMessages(res.data);
  //     } catch (err) {
  //       console.error('Error fetching messages:', err);
  //     }
  //   };

  //   fetchMessages();
  // }, [chatbotId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "Me", content: input, timeStamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/chat",
        {
          message: input,
          chatbotId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const botMsg = {
        sender: res.data.sender || businessName,
        content: res.data.content,
        timeStamp: res.data.timeStamp || Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMsg = {
        sender: businessName,
        content: "Sorry, something went wrong. Please try again.",
        timeStamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set new timeout
    setTypingTimeout(
      setTimeout(() => {
        // Optional: Send typing indicator to server
      }, 1000)
    );
  };

  const chatStyle = {
    fontFamily,
    backgroundColor: primaryColor,
    color: "white",
  };

  const chatContainerStyle = embedded
    ? {
        position: "fixed",
        [position.includes("right") ? "right" : "left"]: "20px",
        bottom: "20px",
        width: customization?.chatWidth || "350px",
        height: customization?.chatHeight || "500px",
        zIndex: 1000,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }
    : {};

  return (
    <Card style={chatContainerStyle} className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 p-3 rounded-t-xl"
        style={chatStyle}
      >
        {logoPath && (
          <img
            src={logoPath}
            alt="Logo"
            className="h-8 w-8 rounded-full object-cover"
          />
        )}
        <h2 className="text-lg font-semibold">{businessName}</h2>
      </div>

      <div className="p-2 text-gray-600 italic" style={{ fontFamily }}>
        {welcomeMessage}
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto p-2 space-y-2">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            isOwn={msg.sender === "Me"}
            primaryColor={primaryColor}
          />
        ))}
        {isLoading && (
          <div className="p-2 my-1 rounded-xl bg-gray-200 self-start max-w-xs">
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <div className="flex mt-2 gap-2 p-2">
        <input
          className="flex-1 border p-2 rounded"
          style={{ fontFamily }}
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="text-white p-2 rounded"
          style={{ backgroundColor: primaryColor }}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </Card>
  );
}
