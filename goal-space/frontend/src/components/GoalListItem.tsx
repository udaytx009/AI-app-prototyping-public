



import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Edit, Trash2, Bell } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import brain from 'brain';
import { GoalResponse } from 'types';
import { priorities, Priority } from 'utils/enums';

const priorityColors: Record<Priority, string> = {
    None: 'bg-gray-400',
    Low: 'bg-blue-500',
    Medium: 'bg-yellow-500',
    High: 'bg-red-500',
};

interface Props {
  goal: GoalResponse;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
}

export function GoalListItem({ goal, onEdit, onDelete, onStatusChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = async (checked: boolean) => {
    try {
        await brain.update_goal({ goalId: goal.id }, { status: checked ? 'done' : 'active' });
        onStatusChange();
    } catch(error) {
        console.error("Failed to update goal status:", error);
    }
  };

  return (
    <Card 
        className="w-full transition-shadow hover:shadow-md"
        style={{ borderLeft: `4px solid ${priorityColors[goal.priority as Priority] || '#ccc'}` }}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start space-x-4">
           <Checkbox 
                checked={goal.status === 'done'} 
                onCheckedChange={handleStatusChange}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
            />
            <div>
                <CardTitle className={`text-lg font-semibold ${goal.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                    {goal.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{goal.summary}</p>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                    {goal.due_date && <Badge variant="outline">Due: {new Date(goal.due_date).toLocaleDateString()}</Badge>}
                    <Badge variant={goal.status === 'active' ? 'secondary' : 'default'}>{goal.status}</Badge>
                    {goal.priority && goal.priority !== 'None' && (
                        <Badge className={`${priorityColors[goal.priority as Priority]}`}>{goal.priority}</Badge>
                    )}
                    {goal.notify && (
                        <Badge variant="destructive" className="flex items-center">
                            <Bell className="h-3 w-3 mr-1" />
                        </Badge>
                    )}
                </div>
            </div>
        </div>
        <div className="flex items-center ml-4">
            <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); onEdit();}}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); onDelete();}}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 pt-0">
          <div className="prose dark:prose-invert max-w-none border-t mt-4 pt-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {goal.description_markdown || ''}
            </ReactMarkdown>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
