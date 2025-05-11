import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import api from '../../utils/api';

const ChatbotCustomizationForm = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    primaryColor: '#2563EB',
    secondaryColor: '#FFFFFF',
    fontFamily: 'Arial',
    chatHeight: '500px',
    chatWidth: '350px',
    position: 'bottom-right',
    welcomeMessage: 'Hi! How can I help you today?'
  });
  const [businessDocument, setBusinessDocument] = useState(null);
  const [logo, setLogo] = useState(null);
  const [icon, setIcon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('businessName', formData.businessName);
    formDataToSend.append('primaryColor', formData.primaryColor);
    formDataToSend.append('secondaryColor', formData.secondaryColor);
    formDataToSend.append('fontFamily', formData.fontFamily);
    formDataToSend.append('chatHeight', formData.chatHeight);
    formDataToSend.append('chatWidth', formData.chatWidth);
    formDataToSend.append('position', formData.position);
    formDataToSend.append('welcomeMessage', formData.welcomeMessage);
    if (businessDocument) formDataToSend.append('businessDocument', businessDocument);
    if (logo) formDataToSend.append('logo', logo);
    if (icon) formDataToSend.append('icon', icon);

    try {
     const response = await api.post('/customize-chatbot', formDataToSend);

      const data = await response.json();
      if (response.ok) {
        navigate(`/dashboard`);
      } else {
        alert(data.error || 'Error creating chatbot');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Customize Your Chatbot</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Input
              id="welcomeMessage"
              name="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="businessDocument">Business Document (PDF)</Label>
            <Input
              type="file"
              id="businessDocument"
              accept=".pdf"
              onChange={(e) => setBusinessDocument(e.target.files[0])}
              required
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo</Label>
            <Input
              type="file"
              id="logo"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files[0])}
            />
          </div>

          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              type="color"
              id="primaryColor"
              name="primaryColor"
              value={formData.primaryColor}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <Input
              type="color"
              id="secondaryColor"
              name="secondaryColor"
              value={formData.secondaryColor}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select
              name="fontFamily"
              value={formData.fontFamily}
              onValueChange={(value) => setFormData(prev => ({ ...prev, fontFamily: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="position">Chat Position</Label>
            <Select
              name="position"
              value={formData.position}
              onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Creating...' : 'Create Chatbot'}
        </Button>
      </form>
    </Card>
  );
};

export default ChatbotCustomizationForm;