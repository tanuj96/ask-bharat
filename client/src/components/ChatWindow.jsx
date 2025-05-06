import { useState, useEffect } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import { Card } from "./ui/card";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5001/api/messages")
      .then(res => setMessages(res.data))
      .catch(err => console.error("Error fetching messages:", err));
  }, []);

  const sendMessage = async () => {
    if (!input) return;

    try {
      const userMsg = { sender: "Me", content: input, timeStamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);

      setInput('');
      const res = await axios.post("http://localhost:5001/api/chat", { message: input });

      const botMsg = {
        sender: res.data.sender,
        content: res.data.content,
        timeStamp: res.data.timeStamp
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMsg = { sender: "BharatBot", content: "Sorry, something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    }

    setInput("");
  };

  return (
    <Card>
      <div className="flex flex-col h-screen p-4">
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto space-y-2">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} isOwn={msg.sender === "Me"} />
          ))}
        </div>
        <div className="flex mt-2 gap-2">
          <input
            className="flex-1 border p-2 rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded">
            Send
          </button>
        </div>
      </div>
    </Card>
  );
}
