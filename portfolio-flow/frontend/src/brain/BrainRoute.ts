import {
  BodyUploadGalleryMedia,
  BodyUploadProfilePicture,
  CheckHealthData,
  CheckHealthResult,
  CreateOrUpdateProfileData,
  GetMyProfileData,
  GetProfileByIdData,
  GetProfilePictureData,
  ListPublicProfilesData,
  ProfileData,
  UploadGalleryMediaData,
  UploadProfilePictureData,
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
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name upload_profile_picture
   * @summary Upload Profile Picture
   * @request POST:/routes/profile/picture
   */
  export namespace upload_profile_picture {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadProfilePicture;
    export type RequestHeaders = {};
    export type ResponseBody = UploadProfilePictureData;
  }

  /**
   * @description Public endpoint to retrieve a user's profile picture.
   * @tags stream, dbtn/module:profiles, dbtn/hasAuth
   * @name get_profile_picture
   * @summary Get Profile Picture
   * @request GET:/routes/profiles/{user_id}/picture
   */
  export namespace get_profile_picture {
    export type RequestParams = {
      /**
       * User Id
       * @format uuid
       */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProfilePictureData;
  }

  /**
   * No description
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name upload_gallery_media
   * @summary Upload Gallery Media
   * @request POST:/routes/profile/media
   */
  export namespace upload_gallery_media {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Title */
      title?: string | null;
      /** Description */
      description?: string | null;
    };
    export type RequestBody = BodyUploadGalleryMedia;
    export type RequestHeaders = {};
    export type ResponseBody = UploadGalleryMediaData;
  }

  /**
   * No description
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name create_or_update_profile
   * @summary Create Or Update Profile
   * @request POST:/routes/profile
   */
  export namespace create_or_update_profile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ProfileData;
    export type RequestHeaders = {};
    export type ResponseBody = CreateOrUpdateProfileData;
  }

  /**
   * No description
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name get_my_profile
   * @summary Get My Profile
   * @request GET:/routes/profile/me
   */
  export namespace get_my_profile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMyProfileData;
  }

  /**
   * No description
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name get_profile_by_id
   * @summary Get Profile By Id
   * @request GET:/routes/profile/{user_id}
   */
  export namespace get_profile_by_id {
    export type RequestParams = {
      /**
       * User Id
       * @format uuid
       */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProfileByIdData;
  }

  /**
   * No description
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name check_health
   * @summary Check Health
   * @request GET:/routes/health
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthResult;
  }

  /**
   * @description Lists all publicly available profiles. Can be filtered by a search term.
   * @tags dbtn/module:profiles, dbtn/hasAuth
   * @name list_public_profiles
   * @summary List Public Profiles
   * @request GET:/routes/profiles/public
   */
  export namespace list_public_profiles {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Search */
      search?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListPublicProfilesData;
  }
}
