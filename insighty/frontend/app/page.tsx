"use client";

import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import Image from "next/image";
import { CommandPalette, type Command } from "@/components/ui/command-palette";
import { ModalSelect } from "@/components/ui/modal-select";
import { motion, AnimatePresence } from "framer-motion";
import Chat from "@/components/Chat";
import SideCharts from "@/components/SideCharts";
import { Send } from "lucide-react";

import Stars from "@/components/Stars";

const translations = {
  en: {
    welcome: "Welcome to Insighty!",
    description:
      "Ask about trends, statistics, and more. Our AI-powered assistant is here to provide real-time insights!",
    placeholder: "Ask me anything...",
    question1: "How many traffic accidents occurred last month?",
    question2: "What is the most common cause of traffic accidents?",
    newQuestion: "New Question",
  },
  ar: {
    welcome: "مرحبًا بكم في دردشة سلامة المرور من Insighty!",
    description:
      "اسأل عن اتجاهات سلامة المرور وإحصائيات الحوادث والمزيد. مساعدنا المدعوم بالذكاء الاصطناعي هنا لتقديم رؤى في الوقت الفعلي!",
    placeholder: "اسألني أي شيء...",
    question1: "كم عدد حوادث المرور التي وقعت الشهر الماضي؟",
    question2: "ما هو السبب الأكثر شيوعًا لحوادث المرور؟",
    newQuestion: "سؤال جديد",
  },
};

interface Card {
  id: string;
  title: string;
  thumbnail: string;
  topic: string;
  summary?: string;
  url: string;
  insight?: string;
}
interface CardData {
  id: number;
  title: string;
  thumbnail: string;
  summary?: string;
  url: string;
  insight?: string;
}

interface CategoryData {
  [category: string]: CardData[];
}

export default function Home() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [chat, setChat] = useState<{ user: string; bot: string }[]>([]);
  const [chatActive, setChatActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [action, setAction] = useState<string>("");
  const [mapActive, setMapActive] = useState(false);
  const router = useRouter();

  const handleReorder = (reorderedCards: Card[]) => {
    setSelectedCards(reorderedCards);
  };

  const t = translations[language];
  const exampleQuestions = [t.question1, t.question2];

  const slashCommands: Command[] = [
    {
      label: "Predict",
      description: "Predict the number of patients in the emergency department",
    },
    { label: "Advise", description: "Show help message" },
    { label: "Describe", description: "Describe the data" },
    // { label: "visualize", description: "Visualize the data" },
    { label: "Analyze", description: "Analyze the data" },
  ];

  const handleCardSelect = (selectedCards: Card[]) => {
    setSelectedCards(selectedCards);
    const value =
      "/Analyze " + selectedCards.map((card) => card.title).join(", ");
    // setInput(value);
    setChatActive(true);
    handleSendMessage(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    setShowSuggestions(value.startsWith("/"));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const lastWord = input.split(" ").pop();
      if (!showSuggestions || !lastWord?.startsWith("/")) {
        handleSendMessage();
      }
    }
  };

  const generateLLMResponse = async (prompt: string, selectedCards: Card[]) => {
    try {
      const response = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "user1",
          action: action,
          prompt: prompt,
          graph_ids: selectedCards.map((card) => card.id),
        }),
        
      }

      
    
    );

    if (selectedCards.length === 0) {
      const graphs = await fetch("http://localhost:8080/suggest" , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "user1",
          action: action,
          prompt: prompt,
          graph_ids: selectedCards.map((card) => card.id),
        }),
      });
      if (graphs.ok) {

        const data: CategoryData = await graphs.json();

        // Transform categorized data into cards array and convert hex thumbnails
        const transformedCards: Card[] = Object.entries(data).flatMap(
          ([category, items]) =>
            items.map((item) => ({
              id: item.id.toString(),
              title: item.title,
              thumbnail: item.thumbnail, // Convert hex to image URL
              topic: category,
              summary: item.summary,
              url: item.url,
              insight: item.insight,
            }))
        );
        setSelectedCards([...selectedCards, ...transformedCards]);
        setChatActive(true);
    }
  }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.text();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error calling chat API:", error);
      return `I apologize, but I'm having trouble analyzing the charts right now. Please try again in a moment.`;
    }
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    // Add user message immediately
    setChat((prev) => [...prev, { user: messageToSend, bot: "Thinking..." }]);
    setChatActive(true);
    if (!message) setInput("");

    // Get response from backend API
    const botResponse = await generateLLMResponse(messageToSend, selectedCards);

    // Update chat with actual response
    setChat((prev) => {
      const newChat = [...prev];
      newChat[newChat.length - 1].bot = botResponse;
      return newChat;
    });
  };

  const resetChat = () => {
    setChat([]);
    setChatActive(false);
  };

  const handleCommandSelect = (command: Command) => {
    setInput("/" + command.label + " ");
    setAction(command.label);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Client-side only code
    }
  }, []);

  return (
    <main className="h-screen bg-background text-foreground">
      <div>{/* <Stars /> */}</div>
      <header>
        <nav className="flex sticky top-0 z-10 bg-primary border border-[#882a46] backdrop-blur shadow-soft items-center justify-between px-8 py-2">
          <div className="p-2 flex items-center gap-4">
            <button
              onClick={() => {
                setChatActive(false);
                setInput("");
                setSelectedCards([]);
                setChat([]);
              }}
            >
              <Image src="/logo.png" alt="Logo" width={200} height={200} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher onLanguageChange={setLanguage} />
            <ThemeToggle />
            <Button
              onClick={() => setMapActive(!mapActive)}
              className="px-4 py-2 rounded-lg hover:bg-primary hover:text-white bg-white text-primary shadow-soft"
            >
              <div className="flex items-center gap-2">
                {mapActive ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    <span>Hide Map</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                      <line x1="8" y1="2" x2="8" y2="18" />
                      <line x1="16" y1="6" x2="16" y2="22" />
                    </svg>
                    <span>Show Map</span>
                  </>
                )}
              </div>
            </Button>
          </div>
        </nav>
      </header>

      <ModalSelect
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleCardSelect}
      />

      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4">
        <div
          className={`w-full max-w-[1800px] ${language === "ar" ? "lang-ar" : "lang-en"}`}
        >
          <AnimatePresence>
            {!chatActive && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-center space-y-7 my-10"
              >
                <h1 className="text-4xl w-[900px] font-extrabold sm:text-6xl">
                  {t.welcome}
                </h1>
                <p className="text-primary text-xl w-[600px]">
                  {t.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`flex items-center gap-10 w-full justify-between bg-background rounded-xl mt-5 ${selectedCards.length === 0 ? "justify-center" : ""}`}
          >
            <motion.div
              layout
              initial={false}
              animate={{
                width: chatActive && selectedCards.length > 0 ? "45%" : "100%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="space-y-4 "
            >
              <div
                className={`relative w-full flex flex-col items-center justify-end gap-2 rounded-lg ${
                  chatActive ? "h-[80vh] " : ""
                }`}
              >
                {chatActive && <Chat chat={chat} />}
                <div className="relative w-full max-w-4xl mb-2">
                  <div className="absolute  w-full">
                    <CommandPalette
                      commands={slashCommands}
                      isOpen={showSuggestions}
                      onSelect={handleCommandSelect}
                      onClose={() => setShowSuggestions(false)}
                      inputValue={input}
                      onInputChange={setInput}
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder={t.placeholder}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="w-full bg-white pl-4 pr-20 py-7 rounded-md shadow-soft2 text-foreground"
                  />

                  <div
                    className={`absolute   top-2 flex gap-2 ${language === "ar" ? "left-4" : "right-4"}`}
                  >
                    <Button
                      size="icon"
                      onClick={() => handleSendMessage()}
                      variant="link"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z"
                          clipRule="evenodd"
                        />
                      </svg>

                      <span className="sr-only">Send message</span>
                    </Button>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      size="icon"
                      className="px-0 "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
                      </svg>

                      <span className="sr-only">Show charts</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {chatActive && selectedCards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-[60%] w-full mb-4"
              >
                <SideCharts
                  selectedCards={selectedCards}
                  onReorder={handleReorder}
                  isMapActive={mapActive}
                />
              </motion.div>
            )}
            {/* {chatActive && mapActive && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-[40%] w-full mb-4"
              >
                <Map />
              </motion.div>
            )} */}
          </div>
        </div>
      </section>
    </main>
  );
}
