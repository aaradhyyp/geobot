import { useState } from "react";
import TubesBackground from "./components/TubesBackground";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  // 1. This state acts as the "bridge" between your Sidebar and ChatWindow
  const [clickedQuestion, setClickedQuestion] = useState("");

  return (
    <div className="w-full h-screen font-sans overflow-hidden">
      <TubesBackground enableClickInteraction>
        <div className="flex h-full w-full">
          
          {/* 2. When a sidebar item is clicked, it saves the text into our bridge variable */}
          <Sidebar onSuggestionClick={(text) => setClickedQuestion(text)} />
          
          <main className="flex-1 h-full flex flex-col">
            {/* 3. We pass that saved text directly into the ChatWindow so it can search it! */}
            <ChatWindow incomingQuestion={clickedQuestion} />
          </main>

        </div>
      </TubesBackground>
    </div>
  );
}