import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ChatWindow from "@/components/ChatWindow";

export default function EmbedPage() {
  const { chatbotId } = useRouter().query;
  const [customization, setCustomization] = useState(null);

  useEffect(() => {
    if (!chatbotId) return;

    fetch(`/api/customization/${chatbotId}`)
      .then((res) => res.json())
      .then(setCustomization)
      .catch((err) => console.error("Error fetching customization", err));
  }, [chatbotId]);

  if (!customization) return <div>Loading chatbot...</div>;

  return (
    <div style={{ width: "100%", height: "100vh", background: "#f9f9f9" }}>
      <ChatWindow customization={customization} chatbotId={chatbotId} />
    </div>
  );
}
