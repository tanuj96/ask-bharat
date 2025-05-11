import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';

const ChatbotCard = ({ chatbot }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        {chatbot.logoPath && (
          <img 
            src={chatbot.logoPath} 
            alt="Chatbot Logo" 
            className="h-10 w-10 rounded-full object-cover"
          />
        )}
        <h3 className="text-lg font-semibold">{chatbot.businessName}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        Custom chatbot for {chatbot.businessName}
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate(`/embed/${chatbot.chatbotId}`)}
        >
          Preview
        </Button>
        <Button 
          className="flex-1"
          onClick={() => navigate(`/embed-settings/${chatbot.chatbotId}`)}
        >
          Embed
        </Button>
      </div>
    </Card>
  );
};

export default ChatbotCard;