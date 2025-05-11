import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api from '../../utils/api';

const EmbedSettings = () => {
  const { chatbotId } = useParams();
  const [embedCode, setEmbedCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEmbedCode = async () => {
      try {
        const response = await api.get(`/embed/${chatbotId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch embed code');
        }
        
        const data = await response.json();
        setEmbedCode(data.embedCode);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmbedCode();
  }, [chatbotId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Embed Your Chatbot</h1>
      <Card className="p-6">
        <div className="mb-4">
          <Label htmlFor="embed-code">Embed Code</Label>
          <Input
            id="embed-code"
            value={embedCode}
            readOnly
            className="font-mono text-sm h-32 mb-4"
          />
        </div>
        <Button onClick={copyToClipboard} disabled={!embedCode}>
          {copied ? 'Copied!' : 'Copy Embed Code'}
        </Button>
      </Card>
    </div>
  );
};

export default EmbedSettings;