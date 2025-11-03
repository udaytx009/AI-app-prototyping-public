/** CreateGoalRequest */
export interface CreateGoalRequest {
  /**
   * Type Id
   * @format uuid
   */
  type_id: string;
  /** Name */
  name: string;
  /** Summary */
  summary?: string | null;
  /** Description Markdown */
  description_markdown?: string | null;
  /**
   * Priority
   * @default "None"
   */
  priority?: string;
  /** Due Date */
  due_date?: string | null;
  /**
   * Notify
   * @default false
   */
  notify?: boolean;
}

/** CreateGoalTypeRequest */
export interface CreateGoalTypeRequest {
  /** Name */
  name: string;
  /** Color */
  color?: string | null;
}

/** GoalResponse */
export interface GoalResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Type Id
   * @format uuid
   */
  type_id: string;
  /** Name */
  name: string;
  /** Summary */
  summary?: string | null;
  /** Description Markdown */
  description_markdown?: string | null;
  /** Status */
  status: string;
  /** Priority */
  priority: string;
  /** Due Date */
  due_date?: string | null;
  /** Notify */
  notify: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** GoalTypeResponse */
export interface GoalTypeResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Color */
  color?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Is Deletable
   * @default true
   */
  is_deletable?: boolean;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** UpdateGoalRequest */
export interface UpdateGoalRequest {
  /** Name */
  name?: string | null;
  /** Summary */
  summary?: string | null;
  /** Description Markdown */
  description_markdown?: string | null;
  /** Status */
  status?: string | null;
  /** Priority */
  priority?: string | null;
  /** Due Date */
  due_date?: string | null;
  /** Notify */
  notify?: boolean | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

/** Response Get Goal Types */
export type GetGoalTypesData = GoalTypeResponse[];

export type CreateGoalTypeData = GoalTypeResponse;

export type CreateGoalTypeError = HTTPValidationError;

export interface UpdateGoalTypeParams {
  /**
   * Type Id
   * @format uuid
   */
  typeId: string;
}

export type UpdateGoalTypeData = GoalTypeResponse;

export type UpdateGoalTypeError = HTTPValidationError;

export interface DeleteGoalTypeParams {
  /**
   * Type Id
   * @format uuid
   */
  typeId: string;
}

export type DeleteGoalTypeData = any;

export type DeleteGoalTypeError = HTTPValidationError;

/** Response Get Goals */
export type GetGoalsData = GoalResponse[];

export type CreateGoalData = GoalResponse;

export type CreateGoalError = HTTPValidationError;

export interface UpdateGoalParams {
  /**
   * Goal Id
   * @format uuid
   */
  goalId: string;
}

export type UpdateGoalData = GoalResponse;

export type UpdateGoalError = HTTPValidationError;

export interface DeleteGoalParams {
  /**
   * Goal Id
   * @format uuid
   */
  goalId: string;
}

export type DeleteGoalData = any;

export type DeleteGoalError = HTTPValidationError;
