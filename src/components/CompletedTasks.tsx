import React from "react";
import TaskList from "./TaskList";
import { Task } from "@/types/task";

function CompletedTasks() {
  const [completedTasks, setCompletedTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    const storedCompletedTasks = localStorage.getItem("completedTasks");
    if (storedCompletedTasks) {
      setCompletedTasks(JSON.parse(storedCompletedTasks));
    }
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Completed Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Review your accomplished tasks and track your progress.
        </p>
      </div>
      <TaskList tasks={completedTasks} />
    </div>
  );
}

export default CompletedTasks;
