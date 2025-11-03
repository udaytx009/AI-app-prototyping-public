

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypeTile, TypeTileSkeleton } from "components/TypeTile";
import { AddTypeDialog } from "components/AddTypeDialog";
import brain from "brain";
import { GoalTypeResponse, GoalResponse } from "types";

export default function App() {
  const navigate = useNavigate();
  const [types, setTypes] = useState<GoalTypeResponse[]>([]);
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesResponse, goalsResponse] = await Promise.all([
        brain.get_goal_types(),
        brain.get_goals(),
      ]);
      const typesData = await typesResponse.json();
      const goalsData = await goalsResponse.json();
      setTypes(typesData);
      setGoals(goalsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTypeClick = (typeId: string) => {
    navigate(`/goals?type=${typeId}`);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                GoalSpace Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Your command center for tracking and conquering your goals.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4">
                <AddTypeDialog onTypeAdded={fetchData}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Type
                    </Button>
                </AddTypeDialog>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300">Goal Categories</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <TypeTileSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {types.map((type) => {
                const typeGoals = goals.filter((g) => g.type_id === type.id);
                const completedGoals = typeGoals.filter((g) => g.status === 'done').length;
                return (
                  <TypeTile
                    key={type.id}
                    type={type}
                    isDeletable={type.is_deletable}
                    goalCount={typeGoals.length}
                    completedGoalCount={completedGoals}
                    onClick={() => handleTypeClick(type.id)}
                    onRefresh={fetchData}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
