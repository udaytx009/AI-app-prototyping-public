import {
  BodyUploadGalleryMedia,
  BodyUploadProfilePicture,
  CheckHealthData,
  CheckHealthResult,
  CreateOrUpdateProfileData,
  CreateOrUpdateProfileError,
  GetMyProfileData,
  GetProfileByIdData,
  GetProfileByIdError,
  GetProfileByIdParams,
  GetProfilePictureData,
  GetProfilePictureError,
  GetProfilePictureParams,
  ListPublicProfilesData,
  ListPublicProfilesError,
  ListPublicProfilesParams,
  ProfileData,
  UploadGalleryMediaData,
  UploadGalleryMediaError,
  UploadGalleryMediaParams,
  UploadProfilePictureData,
  UploadProfilePictureError,
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
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name upload_profile_picture
   * @summary Upload Profile Picture
   * @request POST:/routes/profile/picture
   */
  upload_profile_picture = (data: BodyUploadProfilePicture, params: RequestParams = {}) =>
    this.request<UploadProfilePictureData, UploadProfilePictureError>({
      path: `/routes/profile/picture`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Public endpoint to retrieve a user's profile picture.
   *
   * @tags stream, dbtn/module:profiles, dbtn/hasAuth
   * @name get_profile_picture
   * @summary Get Profile Picture
   * @request GET:/routes/profiles/{user_id}/picture
   */
  get_profile_picture = ({ userId, ...query }: GetProfilePictureParams, params: RequestParams = {}) =>
    this.requestStream<GetProfilePictureData, GetProfilePictureError>({
      path: `/routes/profiles/${userId}/picture`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name upload_gallery_media
   * @summary Upload Gallery Media
   * @request POST:/routes/profile/media
   */
  upload_gallery_media = (query: UploadGalleryMediaParams, data: BodyUploadGalleryMedia, params: RequestParams = {}) =>
    this.request<UploadGalleryMediaData, UploadGalleryMediaError>({
      path: `/routes/profile/media`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name create_or_update_profile
   * @summary Create Or Update Profile
   * @request POST:/routes/profile
   */
  create_or_update_profile = (data: ProfileData, params: RequestParams = {}) =>
    this.request<CreateOrUpdateProfileData, CreateOrUpdateProfileError>({
      path: `/routes/profile`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name get_my_profile
   * @summary Get My Profile
   * @request GET:/routes/profile/me
   */
  get_my_profile = (params: RequestParams = {}) =>
    this.request<GetMyProfileData, any>({
      path: `/routes/profile/me`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name get_profile_by_id
   * @summary Get Profile By Id
   * @request GET:/routes/profile/{user_id}
   */
  get_profile_by_id = ({ userId, ...query }: GetProfileByIdParams, params: RequestParams = {}) =>
    this.request<GetProfileByIdData, GetProfileByIdError>({
      path: `/routes/profile/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name check_health
   * @summary Check Health
   * @request GET:/routes/health
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthResult, any>({
      path: `/routes/health`,
      method: "GET",
      ...params,
    });

  /**
   * @description Lists all publicly available profiles. Can be filtered by a search term.
   *
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name list_public_profiles
   * @summary List Public Profiles
   * @request GET:/routes/profiles/public
   */
  list_public_profiles = (query: ListPublicProfilesParams, params: RequestParams = {}) =>
    this.request<ListPublicProfilesData, ListPublicProfilesError>({
      path: `/routes/profiles/public`,
      method: "GET",
      query: query,
      ...params,
    });
}
