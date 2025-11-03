export const priorities = ["None", "Low", "Medium", "High"] as const;
export type Priority = (typeof priorities)[number];
