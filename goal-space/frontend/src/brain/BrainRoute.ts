import {
  CheckHealthData,
  CreateGoalData,
  CreateGoalRequest,
  CreateGoalTypeData,
  CreateGoalTypeRequest,
  DeleteGoalData,
  DeleteGoalTypeData,
  GetGoalTypesData,
  GetGoalsData,
  UpdateGoalData,
  UpdateGoalRequest,
  UpdateGoalTypeData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * No description
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name get_goal_types
   * @summary Get Goal Types
   * @request GET:/routes/goals/types
   */
  export namespace get_goal_types {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetGoalTypesData;
  }

  /**
   * No description
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name create_goal_type
   * @summary Create Goal Type
   * @request POST:/routes/goals/types
   */
  export namespace create_goal_type {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateGoalTypeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateGoalTypeData;
  }

  /**
   * No description
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name update_goal_type
   * @summary Update Goal Type
   * @request PUT:/routes/goals/types/{type_id}
   */
  export namespace update_goal_type {
    export type RequestParams = {
      /**
       * Type Id
       * @format uuid
       */
      typeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CreateGoalTypeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateGoalTypeData;
  }

  /**
   * No description
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name delete_goal_type
   * @summary Delete Goal Type
   * @request DELETE:/routes/goals/types/{type_id}
   */
  export namespace delete_goal_type {
    export type RequestParams = {
      /**
       * Type Id
       * @format uuid
       */
      typeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteGoalTypeData;
  }

  /**
   * No description
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name get_goals
   * @summary Get Goals
   * @request GET:/routes/goals/
   */
  export namespace get_goals {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetGoalsData;
  }

  /**
   * No description
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name create_goal
   * @summary Create Goal
   * @request POST:/routes/goals/
   */
  export namespace create_goal {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateGoalRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateGoalData;
  }

  /**
   * No description
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name update_goal
   * @summary Update Goal
   * @request PUT:/routes/goals/{goal_id}
   */
  export namespace update_goal {
    export type RequestParams = {
      /**
       * Goal Id
       * @format uuid
       */
      goalId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateGoalRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateGoalData;
  }

  /**
   * No description
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name delete_goal
   * @summary Delete Goal
   * @request DELETE:/routes/goals/{goal_id}
   */
  export namespace delete_goal {
    export type RequestParams = {
      /**
       * Goal Id
       * @format uuid
       */
      goalId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteGoalData;
  }
}
