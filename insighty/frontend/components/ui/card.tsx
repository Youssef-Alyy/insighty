"use client";

import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { cn } from "@/lib/utils";

export function ThreeDCardDemo({
  src,
  title,
  isSelected,
}: {
  src: string;
  title: string;
  isSelected?: boolean;
}) {
  return (
    <CardContainer className="inter-var">
      <CardBody
        className={cn(
          "bg-background relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/20",
          "border-border/40 w-auto sm:w-[24rem] h-auto rounded-xl p-4 border border-transparent",
          "",
          "dark:shadow-[0_8px_16px_rgb(0_0_0/0.25)]",
          "transition-all duration-300",
          "hover:shadow-[0_12px_24px_rgb(0_0_0/0.1)]",
          "dark:hover:shadow-[0_12px_24px_rgb(0_0_0/0.3)]",
          isSelected &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        <CardItem translateZ="50" className="absolute top-4 right-4 z-10">
          {isSelected && (
            <div className="w-8 h-8 rounded-full bg-primary backdrop-blur-sm flex items-center justify-center ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </CardItem>

        <CardItem translateZ="25" rotateX={0} rotateZ={0} className="w-full">
          <div className="relative w-full h-48 overflow-hidden  border-primary border-2 rounded-lg">
            <Image
              src={src}
              fill
              className="w-full h-full  object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
              alt="thumbnail"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-black/2" />
          </div>
        </CardItem>

        <CardItem translateZ="40" className="mt-4">
          <div className="px-2 text-start">
            <h3 className="text-xl font-semibold text-foreground/90 tracking-wide">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click to select this dataset and explore insights
            </p>
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
