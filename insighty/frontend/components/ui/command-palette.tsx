import * as React from "react";
import { cn } from "@/lib/utils";

export interface Command {
  label: string;
  description: string;
}

interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onSelect: (command: Command) => void;
  onClose: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
}

const CommandPalette = React.forwardRef<HTMLUListElement, CommandPaletteProps>(
  ({ commands, isOpen, onSelect, onClose, inputValue, onInputChange }, ref) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [filteredCommands, setFilteredCommands] = React.useState<Command[]>(
      []
    );
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Handle click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [isOpen, onClose]);

    // Filter commands based on input
    React.useEffect(() => {
      if (inputValue.startsWith("/")) {
        const typed = inputValue.slice(1).toLowerCase();
        const matches = commands.filter((cmd) =>
          cmd.label.toLowerCase().includes(typed)
        );
        setFilteredCommands(matches);
        setSelectedIndex(0);
      } else {
        setFilteredCommands([]);
      }
    }, [inputValue, commands]);

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || filteredCommands.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const chosen = filteredCommands[selectedIndex];
        if (chosen) {
          onSelect(chosen);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    // Add keyboard event listener
    React.useEffect(() => {
      if (isOpen) {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
        };
      }
    }, [isOpen, selectedIndex, filteredCommands]);

    if (!isOpen || filteredCommands.length === 0) return null;

    return (
      <div ref={containerRef} className="relative mb-10">
        <div className="relative">
          <ul
            ref={ref}
            className="absolute w-full bg-popover/95 backdrop-blur-sm border border-border/40 rounded-lg mb-2 shadow-lg z-50 overflow-hidden divide-y divide-border/40 bottom-full"
          >
            {filteredCommands.map((cmd, idx) => (
              <li
                key={cmd.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(cmd);
                  onClose();
                }}
                className={cn(
                  "cursor-pointer p-3 text-sm text-popover-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200",
                  "flex items-center gap-3 group",
                  idx === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : ""
                )}
              >
                <div className="flex flex-col flex-1">
                  <span className="font-medium flex items-center gap-2">
                    <span className="text-primary">{cmd.label}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="text-sm font-normal text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                      {cmd.description}
                    </span>
                  </span>
                </div>
                <span className="text-muted-foreground/50 text-xs group-hover:translate-x-0.5 transition-transform duration-200">
                  ↵
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

CommandPalette.displayName = "CommandPalette";

export { CommandPalette };
