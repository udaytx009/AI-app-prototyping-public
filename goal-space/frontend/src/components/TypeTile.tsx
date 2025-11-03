

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { GoalTypeResponse } from "types";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import brain from 'brain';
import { AddTypeDialog } from './AddTypeDialog';


interface Props {
  type: GoalTypeResponse;
  isDeletable: boolean;
  goalCount: number;
  completedGoalCount: number;
  onClick: () => void;
  onRefresh: () => void;
}

export function TypeTile({ type, isDeletable, goalCount, completedGoalCount, onClick, onRefresh }: Props) {
  const completionPercentage = goalCount > 0 ? (completedGoalCount / goalCount) * 100 : 0;
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await brain.delete_goal_type({ typeId: type.id });
      onRefresh();
    } catch (error) {
      console.error("Failed to delete type:", error);
    }
    setShowDeleteConfirm(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
  };

  return (
    <>
      <Card 
        onClick={onClick}
        className="cursor-pointer group hover:shadow-xl transition-all duration-300 ease-in-out h-full flex flex-col rounded-lg overflow-hidden border-t-4"
        style={{ borderTopColor: type.color || '#cccccc' }}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white truncate">
            {type.name}
          </CardTitle>
          {isDeletable && (
             <AddTypeDialog
                existingType={type}
                onTypeAdded={onRefresh}
             >
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button onClick={handleEdit} className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={20} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-500 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </AddTypeDialog>
          )}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center p-4">
          <div style={{ width: 100, height: 100 }}>
             <CircularProgressbar
                value={completionPercentage}
                text={`${Math.round(completionPercentage)}%`}
                strokeWidth={8}
                styles={buildStyles({
                    pathColor: type.color || '#3b82f6',
                    textColor: 'currentColor',
                    trailColor: '#e5e7eb',
                })}
                className="text-gray-700 dark:text-gray-300 font-bold"
             />
          </div>
          <div className="text-center mt-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {completedGoalCount} / {goalCount} goals completed
            </p>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the "{type.name}" goal type and all associated goals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function TypeTileSkeleton() {
    return (
        <Card className="h-full flex flex-col rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center p-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="text-center mt-4 w-full">
                  <Skeleton className="h-4 w-4/5 mx-auto" />
                </div>
            </CardContent>
        </Card>
    );
}
