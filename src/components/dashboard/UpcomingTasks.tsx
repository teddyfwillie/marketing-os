import { Calendar, Clock, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTasks, useToggleTask } from "@/hooks/useTasks";
import { format } from "date-fns";
import { EmptyState } from "@/components/common/EmptyState";

export function UpcomingTasks() {
  const { data: tasks, isLoading } = useTasks();
  const toggleTask = useToggleTask();

  const upcomingTasks = tasks?.filter((task) => !task.completed).slice(0, 4) || [];

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "No date";
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return format(date, "MMM d");
  };

  const formatDueTime = (dueTime: string | null) => {
    if (!dueTime) return "";
    const [hours, minutes] = dueTime.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));
    return format(date, "h:mm a");
  };

  return (
    <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle className="text-xl">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading tasks...</p>
        ) : upcomingTasks.length > 0 ? (
          upcomingTasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`task-${task.id}`}
                  className="mt-0.5"
                  checked={task.completed}
                  onCheckedChange={(checked) => toggleTask.mutate({ id: task.id, completed: !!checked })}
                />
                <div className="min-w-0 flex-1">
                  <label htmlFor={`task-${task.id}`} className="cursor-pointer text-sm font-semibold text-foreground">
                    {task.title}
                  </label>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    {task.due_date ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDueDate(task.due_date)}
                      </span>
                    ) : null}
                    {task.due_time ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDueTime(task.due_time)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon={ListTodo} title="No active tasks" description="Create a task to keep campaigns on schedule." />
        )}
      </CardContent>
    </Card>
  );
}
