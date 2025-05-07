import ChatbotCustomizationForm from "./components/ChatbotCustomizationForm";
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <div className="bg-gray-100 h-screen">
      <ChatWindow />
      <ChatbotCustomizationForm />
    </div>
  );
}

export default App;
