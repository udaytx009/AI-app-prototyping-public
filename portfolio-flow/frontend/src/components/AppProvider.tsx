import React from "react";
import { Toaster } from "@/components/ui/sonner";

interface Props {
  children: React.ReactNode;
}

export function AppProvider({ children }: Props) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
