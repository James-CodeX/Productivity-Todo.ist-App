import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";

interface TaskModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (task: { title: string; recurringSchedule: string | null }) => void;
  defaultValues?: {
    title?: string;
    recurringSchedule?: string | null;
  };
}

const TaskModal = ({
  open = true,
  onOpenChange,
  onSave,
  defaultValues = {},
}: TaskModalProps) => {
  const [title, setTitle] = React.useState(defaultValues.title || "");
  const [recurringSchedule, setRecurringSchedule] = React.useState<
    string | null
  >(defaultValues.recurringSchedule || null);

  const handleSave = () => {
    onSave?.({ title, recurringSchedule });
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurring">Recurring Schedule</Label>
            <Select
              value={recurringSchedule || "none"}
              onValueChange={(value) =>
                setRecurringSchedule(value === "none" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
