

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { GoalListItem } from 'components/GoalListItem';
import { GoalForm } from 'components/GoalForm';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import brain from 'brain';
import { GoalResponse, GoalTypeResponse } from 'types';
import { Priority } from 'utils/enums';
import { Skeleton } from '@/components/ui/skeleton';

export default function Goals() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [types, setTypes] = useState<GoalTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<GoalResponse | null>(null);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('priority-desc');

  const typeId = searchParams.get('type');
  const selectedType = types.find((t) => t.id === typeId);

  const fetchData = async () => {
    if (!typeId) return;
    setLoading(true);
    try {
        const [goalsResponse, typesResponse] = await Promise.all([
            brain.get_goals(),
            brain.get_goal_types()
        ]);
        const allGoals = await goalsResponse.json();
        const allTypes = await typesResponse.json();

        setGoals(allGoals.filter(g => g.type_id === typeId));
        setTypes(allTypes);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeId]);

  
  const filteredGoals = useMemo(() => {
    const priorityOrder: Record<Priority, number> = { High: 3, Medium: 2, Low: 1, None: 0 };
    
    return goals
      .filter((g) => g.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'priority-desc') {
            return priorityOrder[b.priority as Priority] - priorityOrder[a.priority as Priority];
        }
        if (sort === 'priority-asc') {
            return priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority];
        }
        return 0;
      });
  }, [goals, filter, sort]);


  const handleEdit = (goal: GoalResponse) => {
    setGoalToEdit(goal);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setGoalToEdit(null);
    setIsFormOpen(true);
  };
  
  const handleFormClose = (needsRefresh: boolean) => {
    setIsFormOpen(false);
    if (needsRefresh) {
        fetchData();
    }
  };

  const handleDelete = async (goalId: string) => {
      try {
          await brain.delete_goal({ goalId: goalId });
          fetchData();
      } catch(error) {
          console.error("Failed to delete goal:", error);
      }
  };


  if (loading) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-6 w-64 mb-8" />
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{selectedType?.name || 'Goals'}</h1>
          <p className="text-muted-foreground mt-2">
            A list of your goals for this type.
          </p>
        </div>
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Goal
        </Button>
      </header>
      
      <div className="flex justify-between items-center mb-6">
        <Input 
            placeholder="Filter by title..." 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
        />
        <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="priority-desc">Priority: High to Low</SelectItem>
                <SelectItem value="priority-asc">Priority: Low to High</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {filteredGoals.length > 0 ? (
        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <GoalListItem 
                key={goal.id} 
                goal={goal} 
                onEdit={() => handleEdit(goal)} 
                onDelete={() => handleDelete(goal.id)}
                onStatusChange={fetchData}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No goals yet!</h3>
          <p className="text-muted-foreground mt-2">
            Click "Add New Goal" to create your first one.
          </p>
        </div>
      )}

      <GoalForm 
        open={isFormOpen}
        onOpenChange={handleFormClose}
        goalToEdit={goalToEdit}
        typeId={typeId || ''}
      />
    </div>
  );
}
