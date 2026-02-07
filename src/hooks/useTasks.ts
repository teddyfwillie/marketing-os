import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useTasks() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["tasks", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("due_date", { ascending: true })
        .order("due_time", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      title,
      dueDate,
      dueTime,
    }: {
      title: string;
      dueDate?: string;
      dueTime?: string;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          organization_id: profile.organization_id,
          created_by: user?.id,
          title,
          due_date: dueDate || null,
          due_time: dueTime || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task created" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task deleted" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
