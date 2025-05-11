import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatWindow from "../components/ChatWindow";
import { Card } from "../components/ui/card";
import api from '../../utils/api';

export default function EmbedPage() {
  const { chatbotId } = useParams();
  const [customization, setCustomization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatbotId) return;

    const fetchCustomization = async () => {
      try {
        const res = await api.get(`/customization/${chatbotId}`)
        setCustomization(res.data);
      } catch (err) {
        console.error("Error fetching customization:", err);
        setError("Failed to load chatbot");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomization();
  }, [chatbotId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <p>Loading chatbot...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center text-red-500">
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  if (!customization) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <p>Chatbot not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <ChatWindow 
        customization={customization} 
        chatbotId={chatbotId} 
        embedded={true}
      />
    </div>
  );
}