
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import brain from "brain";
import { GoalResponse, CreateGoalRequest, UpdateGoalRequest } from 'types';
import { priorities, Priority } from "utils/enums";

interface Props {
  open: boolean;
  onOpenChange: (needsRefresh: boolean) => void;
  goalToEdit?: GoalResponse | null;
  typeId: string;
}

const emptyGoal: Partial<CreateGoalRequest> = {
    name: '',
    summary: '',
    description_markdown: '',
    due_date: '',
    notify: false,
    priority: 'None' as Priority,
};

export function GoalForm({ open, onOpenChange, goalToEdit, typeId }: Props) {
  const [goal, setGoal] = useState(emptyGoal);

  useEffect(() => {
    if (goalToEdit) {
      setGoal({
        name: goalToEdit.name,
        summary: goalToEdit.summary || '',
        description_markdown: goalToEdit.description_markdown || '',
        due_date: goalToEdit.due_date?.split('T')[0] || '',
        notify: goalToEdit.notify,
        priority: goalToEdit.priority as Priority,
      });
    } else {
      setGoal(emptyGoal);
    }
  }, [goalToEdit, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setGoal({ ...goal, [id]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setGoal({ ...goal, notify: checked });
  };

  const handlePriorityChange = (value: Priority) => {
    setGoal({ ...goal, priority: value });
  };

  const onSubmit = async () => {
    try {
      const payload = {
        ...goal,
        due_date: goal.due_date ? new Date(goal.due_date).toISOString() : undefined,
      };

      if (goalToEdit) {
        await brain.update_goal({ goalId: goalToEdit.id }, payload as UpdateGoalRequest);
      } else {
        await brain.create_goal({ ...payload, type_id: typeId } as CreateGoalRequest);
      }
      onOpenChange(true);
    } catch (error) {
      console.error("Failed to save goal:", error);
      // Optionally show an error to the user
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goalToEdit ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          <DialogDescription>
            {goalToEdit ? 'Update the details of your goal.' : 'Fill in the details for your new goal.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={goal.name} onChange={handleChange} placeholder="e.g., Read 12 books" />

          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" value={goal.summary} onChange={handleChange} placeholder="A short summary of the goal" />

          <Label htmlFor="description_markdown">Description (Markdown supported)</Label>
          <Textarea id="description_markdown" value={goal.description_markdown} onChange={handleChange} placeholder="*   Book 1
*   Book 2" rows={5} />

          <Label htmlFor="due_date">Due Date</Label>
          <Input id="due_date" type="date" value={goal.due_date} onChange={handleChange} />

          <Label htmlFor="priority">Priority</Label>
          <Select value={goal.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox id="notify" checked={goal.notify} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="notify" className="font-normal">
              Enable Notifications
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>{goalToEdit ? 'Save Changes' : 'Create Goal'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
