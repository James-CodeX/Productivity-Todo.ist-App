import React from "react";
import { Link, Navigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { getTasks, createTask, updateTask, deleteTask } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { CompletionHistory } from "@/types/task";
import TaskList from "./TaskList";
import TaskModal from "./TaskModal";
import { Task } from "@/types/task";
import { Button } from "./ui/button";
import { ClipboardList } from "lucide-react";

function Home() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [completionHistory, setCompletionHistory] = React.useState<
    CompletionHistory[]
  >([]);

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
        setTasks(tasks.map((t) => (t.id === editingTask.id ? updated : t)));
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
      console.error("Error saving task:", error);
    }
  };

  const handleEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setEditingTask(task);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleTaskComplete = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        const now = new Date().toISOString();
        const completionRecord = {
          id: Date.now().toString(),
          taskId: id,
          completedAt: now,
        };

        await updateTask(id, {
          isCompleted: true,
          lastCompletedAt: now,
          nextDueAt: task.recurringSchedule
            ? getNextDueDate(task.recurringSchedule).toISOString()
            : undefined,
        });

        setCompletionHistory([...completionHistory, completionRecord]);
        setTasks(tasks.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Error completing task:", error);
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
