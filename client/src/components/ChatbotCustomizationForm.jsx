import React, { useState } from "react";

const ChatbotCustomizationForm = () => {
  const [businessDocument, setBusinessDocument] = useState(null);
  const [logo, setLogo] = useState(null);
  const [icon, setIcon] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF");

  const handleDocumentUpload = (e) => {
    setBusinessDocument(e.target.files[0]);
  };

  const handleLogoUpload = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleIconUpload = (e) => {
    setIcon(e.target.files[0]);
  };

  const handleSubmit = async () => {
    // Create FormData to send to the server
    const formData = new FormData();
    formData.append("businessDocument", businessDocument);
    formData.append("logo", logo);
    formData.append("icon", icon);
    formData.append("primaryColor", primaryColor);
    formData.append("secondaryColor", secondaryColor);

    // Send the data to the backend
    try {
      const response = await fetch(
        "http://localhost:5001/api/customize-chatbot",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Customization successful!");
      } else {
        alert("Error in customization.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-xl font-semibold">Customize Your Chatbot</h2>

      <div>
        <label htmlFor="businessDocument" className="block text-gray-700">
          Upload Business Document
        </label>
        <input
          type="file"
          id="businessDocument"
          onChange={handleDocumentUpload}
          className="border p-2 mt-2 w-full rounded"
        />
      </div>

      <div>
        <label htmlFor="logo" className="block text-gray-700">
          Upload Logo
        </label>
        <input
          type="file"
          id="logo"
          onChange={handleLogoUpload}
          className="border p-2 mt-2 w-full rounded"
        />
      </div>

      <div>
        <label htmlFor="icon" className="block text-gray-700">
          Upload Icon
        </label>
        <input
          type="file"
          id="icon"
          onChange={handleIconUpload}
          className="border p-2 mt-2 w-full rounded"
        />
      </div>

      <div>
        <label htmlFor="primaryColor" className="block text-gray-700">
          Primary Color
        </label>
        <input
          type="color"
          id="primaryColor"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="border p-2 mt-2 w-full rounded"
        />
      </div>

      <div>
        <label htmlFor="secondaryColor" className="block text-gray-700">
          Secondary Color
        </label>
        <input
          type="color"
          id="secondaryColor"
          value={secondaryColor}
          onChange={(e) => setSecondaryColor(e.target.value)}
          className="border p-2 mt-2 w-full rounded"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white p-2 rounded mt-4 w-full"
      >
        Submit
      </button>
    </div>
  );
};

export default ChatbotCustomizationForm;
