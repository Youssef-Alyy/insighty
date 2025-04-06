import React, { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";
import { Tooltip } from "@/components/ui/tooltip";
import Map from "@/components/ui/Map";

interface Card {
  id: string;
  title: string;
  thumbnail: string;
  topic: string;
  summary?: string;
  url: string;
  insight?: string;
}

interface SideChartsProps {
  selectedCards: Card[];
  isMapActive: boolean;
  onReorder: (reorderedCards: Card[]) => void;
}

const MemoizedIframe = React.memo(
  ({ url, title }: { url: string; title: string }) => (
    <iframe src={url} title={title} className="rounded-lg w-full h-full" />
  ),
  (prevProps, nextProps) => prevProps.url === nextProps.url
);

const SideCharts: React.FC<SideChartsProps> = ({
  selectedCards,
  onReorder,
  isMapActive,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = selectedCards.findIndex((card) => card.id === active.id);
      const newIndex = selectedCards.findIndex((card) => card.id === over.id);
      const reorderedCards = arrayMove(selectedCards, oldIndex, newIndex);
      onReorder(reorderedCards);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={selectedCards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="max-h-[88vh] overflow-y-auto  backdrop-blur-sm rounded-2xl  ">
          {!isMapActive && (
            <div className="grid  gap-6 p-6">
              {selectedCards.map((card) => (
                <SortableItem key={card.id} id={card.id}>
                  <div className="group relative bg-white rounded-xl  border border-gray-100 transition-all duration-200 hover:shadow-md">
                    {/* <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                  </div> */}

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {card.title}
                        </h4>
                        {card.insight && <Tooltip content={card.insight} />}
                      </div>
                      <div className="aspect-[9/4] w-full  rounded-lg ">
                        <MemoizedIframe
                          url={card.url}
                          title={card.title}
                          // className="w-full h-full rounded-lg transition-transform duration-200 group-hover:scale-[1.01]"
                        />
                      </div>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          )}
          {isMapActive && (
            <div className="     p-6  bg-transparent ">
              <Map />
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SideCharts;
