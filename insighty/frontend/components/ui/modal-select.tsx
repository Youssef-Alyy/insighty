import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ThreeDCardDemo } from "@/components/ui/card";
import { useEffect } from "react";

function hexToImageUrl(hexString: string): string {
  try {
    // Remove any 'data:image/png;base64,' prefix if it exists
    const cleanHex = hexString.replace(/^data:image\/\w+;base64,/, "");

    // Convert hex to base64
    const base64 = Buffer.from(cleanHex, "hex").toString("base64");

    // Create the complete data URL
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Error converting hex to image URL:", error);
    return ""; // Return empty string or a default image URL
  }
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

interface Card {
  id: string;
  title: string;
  thumbnail: string;
  topic: string;
  summary?: string;
  url: string;
  insight?: string;
}

interface ModalSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedCards: Card[]) => void;
}

export function ModalSelect({ isOpen, onClose, onSelect }: ModalSelectProps) {
  const [selectedCards, setSelectedCards] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("All");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cards, setCards] = React.useState<Card[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8080/graphs");
        if (!response.ok) {
          throw new Error("Failed to fetch cards");
        }
        const data: CategoryData = await response.json();

        // Transform categorized data into cards array and convert hex thumbnails
        const transformedCards: Card[] = Object.entries(data).flatMap(
          ([category, items]) =>
            items.map((item) => ({
              id: item.id.toString(),
              title: item.title,
              thumbnail: hexToImageUrl(item.thumbnail), // Convert hex to image URL
              topic: category,
              summary: item.summary,
              url: item.url,
              insight: item.insight,
            }))
        );

        setCards(transformedCards);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCards();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50">
        <div className="fixed left-[50%] top-[50%] z-50 grid w-[90%] h-[90%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-soft duration-200 sm:rounded-3xl">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50">
        <div className="fixed left-[50%] top-[50%] z-50 grid w-[90%] h-[90%] max-w-7xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-soft duration-200 sm:rounded-3xl">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-red-500">Error loading cards: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const toggleCard = (cardId: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSelect = () => {
    const selectedCardObjects = cards.filter((card) =>
      selectedCards.includes(card.id)
    );
    onSelect(selectedCardObjects);
    setSelectedCards([]);
    onClose();
  };

  // Get unique topics
  const topics = ["All", ...new Set(cards.map((card) => card.topic))];

  // Filter cards based on active tab
  const filteredCards =
    activeTab === "All"
      ? cards
      : cards.filter((card) => card.topic === activeTab);

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] z-50 w-[90%] h-[90%] translate-x-[-50%] translate-y-[-50%] border bg-background shadow-soft duration-200 sm:rounded-3xl flex flex-col">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedCards([]);
            onClose();
          }}
          className="absolute right-4 top-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </Button>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full overflow-auto custom-scrollbar p-10">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-2xl font-bold tracking-tight text-foreground/90">
                Select Datasets to Explore
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  Choose one or more datasets to analyze and visualize insights
                </p>
              </h2>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-2 w-full border-b mt-4">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setActiveTab(topic)}
                  className={cn(
                    "px-4 py-2 text-md font-medium transition-colors",
                    "hover:text-primary hover:border-primary",
                    activeTab === topic
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="w-full max-w-7xl mx-auto mt-4">
              <div className="flex flex-wrap gap-8 justify-start">
                {filteredCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => toggleCard(card.id)}
                    className="focus:outline-none"
                  >
                    <ThreeDCardDemo
                      src={card.thumbnail}
                      title={card.title}
                      isSelected={selectedCards.includes(card.id)}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar - Fixed at bottom */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>
                {selectedCards.length === 0
                  ? "No datasets selected"
                  : `${selectedCards.length} dataset${selectedCards.length > 1 ? "s" : ""} selected`}
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCards([]);
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelect}
                disabled={selectedCards.length === 0}
                className="min-w-[100px]"
              >
                {selectedCards.length === 0 ? (
                  "Select"
                ) : (
                  <div className="flex items-center gap-2">
                    Continue
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
