import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotCustomizationForm from './ChatbotCustomizationForm';
import { Button } from './ui/button';
import { Card } from './ui/card';

const CreateChatbot = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Chatbot</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
      <Card className="p-6">
        <ChatbotCustomizationForm onSuccess={handleSuccess} />
      </Card>
    </div>
  );
};

export default CreateChatbot;