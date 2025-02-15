import React from "react";
import TaskItem from "./TaskItem";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/types/task";

interface TaskListProps {
  tasks?: Task[];
  onComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddTask?: () => void;
}

const TaskList = ({
  tasks = [],
  onComplete,
  onEdit,
  onDelete,
  onAddTask,
}: TaskListProps) => {
  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={onAddTask} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            {...task}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
