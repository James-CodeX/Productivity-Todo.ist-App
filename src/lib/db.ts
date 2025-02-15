import { supabase } from "./supabase";
import { Task } from "@/types/task";

export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("isCompleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCompletedTasks(userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("isCompleted", true)
    .order("lastCompletedAt", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTask(task: Partial<Task>) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
}
