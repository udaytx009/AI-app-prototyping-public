import {
  CheckHealthData,
  CreateGoalData,
  CreateGoalError,
  CreateGoalRequest,
  CreateGoalTypeData,
  CreateGoalTypeError,
  CreateGoalTypeRequest,
  DeleteGoalData,
  DeleteGoalError,
  DeleteGoalParams,
  DeleteGoalTypeData,
  DeleteGoalTypeError,
  DeleteGoalTypeParams,
  GetGoalTypesData,
  GetGoalsData,
  UpdateGoalData,
  UpdateGoalError,
  UpdateGoalParams,
  UpdateGoalRequest,
  UpdateGoalTypeData,
  UpdateGoalTypeError,
  UpdateGoalTypeParams,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name get_goal_types
   * @summary Get Goal Types
   * @request GET:/routes/goals/types
   */
  get_goal_types = (params: RequestParams = {}) =>
    this.request<GetGoalTypesData, any>({
      path: `/routes/goals/types`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name create_goal_type
   * @summary Create Goal Type
   * @request POST:/routes/goals/types
   */
  create_goal_type = (data: CreateGoalTypeRequest, params: RequestParams = {}) =>
    this.request<CreateGoalTypeData, CreateGoalTypeError>({
      path: `/routes/goals/types`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name update_goal_type
   * @summary Update Goal Type
   * @request PUT:/routes/goals/types/{type_id}
   */
  update_goal_type = (
    { typeId, ...query }: UpdateGoalTypeParams,
    data: CreateGoalTypeRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateGoalTypeData, UpdateGoalTypeError>({
      path: `/routes/goals/types/${typeId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name delete_goal_type
   * @summary Delete Goal Type
   * @request DELETE:/routes/goals/types/{type_id}
   */
  delete_goal_type = ({ typeId, ...query }: DeleteGoalTypeParams, params: RequestParams = {}) =>
    this.request<DeleteGoalTypeData, DeleteGoalTypeError>({
      path: `/routes/goals/types/${typeId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * No description
   *
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name get_goals
   * @summary Get Goals
   * @request GET:/routes/goals/
   */
  get_goals = (params: RequestParams = {}) =>
    this.request<GetGoalsData, any>({
      path: `/routes/goals/`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name create_goal
   * @summary Create Goal
   * @request POST:/routes/goals/
   */
  create_goal = (data: CreateGoalRequest, params: RequestParams = {}) =>
    this.request<CreateGoalData, CreateGoalError>({
      path: `/routes/goals/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name update_goal
   * @summary Update Goal
   * @request PUT:/routes/goals/{goal_id}
   */
  update_goal = ({ goalId, ...query }: UpdateGoalParams, data: UpdateGoalRequest, params: RequestParams = {}) =>
    this.request<UpdateGoalData, UpdateGoalError>({
      path: `/routes/goals/${goalId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Goals, dbtn/module:goals, dbtn/hasAuth
   * @name delete_goal
   * @summary Delete Goal
   * @request DELETE:/routes/goals/{goal_id}
   */
  delete_goal = ({ goalId, ...query }: DeleteGoalParams, params: RequestParams = {}) =>
    this.request<DeleteGoalData, DeleteGoalError>({
      path: `/routes/goals/${goalId}`,
      method: "DELETE",
      ...params,
    });
}
