import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useUser } from '@supabase/auth-helpers-react';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/db';
import TaskList from "./TaskList";
import TaskModal from "./TaskModal";
import { Task } from "@/types/task";
import { Button } from "./ui/button";
import { ClipboardList } from "lucide-react";

function Home() {
  const user = useUser();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  React.useEffect(() => {
    if (user) {
      getTasks(user.id).then(setTasks).catch(console.error);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleAddOrUpdateTask = async (taskData: {
    title: string;
    description: string;
    recurringSchedule: string | null;
  }) => {
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, {
          ...taskData,
          updated_at: new Date().toISOString(),
        });
        setTasks(tasks.map(t => t.id === editingTask.id ? updated : t));
      } else {
        const created = await createTask({
          ...taskData,
          user_id: user.id,
          isCompleted: false,
        });
        setTasks([created, ...tasks]);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditingTask(task);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskComplete = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const now = new Date().toISOString();
        await updateTask(id, {
          isCompleted: true,
          lastCompletedAt: now,
          nextDueAt: task.recurringSchedule ? getNextDueDate(task.recurringSchedule).toISOString() : undefined,
        });
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };
    {
      id: "1",
      title: "Complete project proposal",
      isCompleted: false,
      recurringSchedule: "daily",
    },
    {
      id: "2",
      title: "Team meeting",
      isCompleted: false,
      recurringSchedule: "weekly",
    },
  ]);

  const [completedTasks, setCompletedTasks] = React.useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [completionHistory, setCompletionHistory] = React.useState<
    CompletionHistory[]
  >([]);

  React.useEffect(() => {
    // Check for recurring tasks that need to be restored
    const now = new Date();
    const storedTasks = localStorage.getItem("recurringTasks");
    if (storedTasks) {
      const parsedTasks: Task[] = JSON.parse(storedTasks);
      const tasksToRestore = parsedTasks.filter((task) => {
        if (!task.nextDueAt) return false;
        const dueDate = new Date(task.nextDueAt);
        return dueDate <= now;
      });

      if (tasksToRestore.length > 0) {
        setTasks((current) => [
          ...current,
          ...tasksToRestore.map((task) => ({
            ...task,
            isCompleted: false,
            nextDueAt: undefined,
            lastCompletedAt: undefined,
          })),
        ]);
        // Remove restored tasks from storage
        localStorage.setItem(
          "recurringTasks",
          JSON.stringify(
            parsedTasks.filter(
              (t) => !tasksToRestore.find((rt) => rt.id === t.id),
            ),
          ),
        );
      }
    }
  }, []);

  const handleTaskComplete = (id: string) => {
    const taskToComplete = tasks.find((task) => task.id === id);
    if (taskToComplete) {
      const now = new Date();
      const completionRecord = {
        id: Date.now().toString(),
        taskId: id,
        completedAt: now.toISOString(),
      };

      setCompletionHistory([...completionHistory, completionRecord]);
      setTasks(tasks.filter((task) => task.id !== id));

      if (taskToComplete.recurringSchedule) {
        // Store recurring task with next due date
        const nextDueAt = getNextDueDate(taskToComplete.recurringSchedule);
        const recurringTask = {
          ...taskToComplete,
          lastCompletedAt: now.toISOString(),
          nextDueAt: nextDueAt.toISOString(),
        };

        const storedTasks = localStorage.getItem("recurringTasks");
        const parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
        localStorage.setItem(
          "recurringTasks",
          JSON.stringify([...parsedTasks, recurringTask]),
        );
      }

      // Store in completed tasks
      const storedCompletedTasks = localStorage.getItem("completedTasks");
      const parsedCompletedTasks: Task[] = storedCompletedTasks
        ? JSON.parse(storedCompletedTasks)
        : [];
      const updatedCompletedTasks = [
        ...parsedCompletedTasks,
        {
          ...taskToComplete,
          isCompleted: true,
          lastCompletedAt: now.toISOString(),
        },
      ];
      localStorage.setItem(
        "completedTasks",
        JSON.stringify(updatedCompletedTasks),
      );
    }
  };

  const getNextDueDate = (schedule: "daily" | "weekly" | "monthly") => {
    const now = new Date();
    switch (schedule) {
      case "daily":
        return new Date(now.setDate(now.getDate() + 1));
      case "weekly":
        return new Date(now.setDate(now.getDate() + 7));
      case "monthly":
        return new Date(now.setMonth(now.getMonth() + 1));
      default:
        return now;
    }
  };

  const handleAddTask = (taskData: {
    title: string;
    recurringSchedule: string | null;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      isCompleted: false,
      recurringSchedule: taskData.recurringSchedule as
        | "daily"
        | "weekly"
        | "monthly"
        | null,
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your daily tasks and recurring activities.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/completed" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Completed
          </Link>
        </Button>
      </div>
      <TaskList
        tasks={tasks}
        onComplete={handleTaskComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddTask={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
      />
      <TaskModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSave={handleAddOrUpdateTask}
        defaultValues={editingTask ?? undefined}
      />
    </div>
  );
}

export default Home;
