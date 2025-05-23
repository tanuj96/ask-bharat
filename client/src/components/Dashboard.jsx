import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import ChatbotCard from './ChatbotCard';
import api from '../../utils/api';

const Dashboard = () => {
  const [chatbots, setChatbots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatbots = async () => {

      try {
        const response = await api.get('/customization')
        const data = await response.data;

        if (data) {
          setChatbots(data);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching chatbots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatbots();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end mb-8">
        <Button onClick={() => navigate('/create-chatbot')}>
          Create New Chatbot
        </Button>
      </div>

      {chatbots.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-lg">You haven't created any chatbots yet.</p>
          <Button onClick={() => navigate('/create-chatbot')} className="mt-4">
            Create Your First Chatbot
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map(chatbot => (
            <ChatbotCard key={chatbot._id} chatbot={chatbot} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;