import React from "react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface TaskItemProps {
  id?: string;
  title?: string;
  isCompleted?: boolean;
  recurringSchedule?: "daily" | "weekly" | "monthly" | null;
  lastCompletedAt?: string;
  nextDueAt?: string;
  onComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TaskItem = ({
  id = "",
  title = "Untitled Task",
  isCompleted = false,
  recurringSchedule = null,
  onComplete,
  onEdit,
  onDelete,
}: TaskItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onComplete?.(id)}
        />
        <div>
          <p
            className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}
          >
            {title}
          </p>
          {recurringSchedule && (
            <p className="text-sm text-muted-foreground">
              Repeats: {recurringSchedule}
            </p>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit?.(id)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete?.(id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
