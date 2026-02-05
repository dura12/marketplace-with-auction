"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";

const statusOptions = [
  { id: "all", name: "All Auctions" },
  { id: "active", name: "Active" },
  { id: "ending-soon", name: "Ending Soon" },
  { id: "completed", name: "Completed" },
];

export function StatusFilter({ onStatusChange }) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    onStatusChange(status);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-primary">Status</Label>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-primary">
            <span className="sr-only">{isOpen ? "Close" : "Open"}</span>
            <span className={`text-xs ${isOpen ? "rotate-180 transform" : ""}`}>▼</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        {statusOptions.map((status) => (
          <div key={status.id} className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={`h-7 w-7 p-0 border-primary/20 ${
                selectedStatus === status.id ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleStatusChange(status.id)}
            >
              {selectedStatus === status.id && <span className="h-4 w-4">✓</span>}
            </Button>
            <Label
              htmlFor={`status-${status.id}`}
              className="text-sm cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleStatusChange(status.id)}
            >
              {status.name}
            </Label>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
