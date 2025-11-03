

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import brain from 'brain';
import { GoalTypeResponse } from 'types';

interface Props {
  children: React.ReactNode;
  onTypeAdded: () => void;
  existingType?: GoalTypeResponse;
}

export function AddTypeDialog({ children, onTypeAdded, existingType }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#cccccc');
  
  const isEditing = !!existingType;

  useEffect(() => {
    if (isEditing && open) {
      setName(existingType.name);
      setColor(existingType.color || '#cccccc');
    } else if (!open) {
      // Reset form when dialog closes
      setName('');
      setColor('#cccccc');
    }
  }, [existingType, isEditing, open]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      if (isEditing) {
        await brain.update_goal_type({ typeId: existingType.id }, { name, color });
      } else {
        await brain.create_goal_type({ name, color });
      }
      onTypeAdded();
      setOpen(false);
    } catch(error) {
      console.error(`Failed to ${isEditing ? 'update' : 'add'} type:`, error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add New'} Goal Type</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for your goal type.' : 'Create a new category to organize your goals.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Career Development"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Color
            </Label>
            <Input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="col-span-3 h-10 p-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>{isEditing ? 'Save Changes' : 'Add Type'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
