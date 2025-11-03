/** Body_upload_gallery_media */
export interface BodyUploadGalleryMedia {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_profile_picture */
export interface BodyUploadProfilePicture {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** CodeSnippet */
export interface CodeSnippet {
  /** Id */
  id?: string | null;
  /** Title */
  title: string;
  /** Code */
  code: string;
  /** Language */
  language: string;
}

/** Education */
export interface Education {
  /** Id */
  id?: string | null;
  /** Institution Name */
  institution_name: string;
  /** Degree */
  degree: string;
  /** Field Of Study */
  field_of_study: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /** End Date */
  end_date?: string | null;
  /** Description */
  description?: string | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthCheckResponse */
export interface HealthCheckResponse {
  /** Profile Exists */
  profile_exists: boolean;
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** Link */
export interface Link {
  /** Id */
  id?: string | null;
  /** Link Type */
  link_type: string;
  /** Url */
  url: string;
}

/** Media */
export interface Media {
  /** Id */
  id?: string | null;
  /** Media Type */
  media_type: string;
  /** Url */
  url: string;
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
}

/** ProfileData */
export interface ProfileData {
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  /** Bio */
  bio?: string | null;
  /** Elevator Pitch */
  elevator_pitch?: string | null;
  /** Business Email */
  business_email?: string | null;
  /** Phone Number */
  phone_number?: string | null;
  /**
   * Links
   * @default []
   */
  links?: Link[] | null;
  /**
   * Work Experiences
   * @default []
   */
  work_experiences?: WorkExperience[] | null;
  /**
   * Educations
   * @default []
   */
  educations?: Education[] | null;
  /**
   * Media
   * @default []
   */
  media?: Media[] | null;
  /**
   * Code Snippets
   * @default []
   */
  code_snippets?: CodeSnippet[] | null;
}

/** ProfileResponse */
export interface ProfileResponse {
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  /** Bio */
  bio?: string | null;
  /** Elevator Pitch */
  elevator_pitch?: string | null;
  /** Business Email */
  business_email?: string | null;
  /** Phone Number */
  phone_number?: string | null;
  /**
   * Links
   * @default []
   */
  links?: Link[] | null;
  /**
   * Work Experiences
   * @default []
   */
  work_experiences?: WorkExperience[] | null;
  /**
   * Educations
   * @default []
   */
  educations?: Education[] | null;
  /**
   * Media
   * @default []
   */
  media?: Media[] | null;
  /**
   * Code Snippets
   * @default []
   */
  code_snippets?: CodeSnippet[] | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
}

/** PublicProfile */
export interface PublicProfile {
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  /** First Name */
  first_name?: string | null;
  /** Last Name */
  last_name?: string | null;
  /** Bio */
  bio?: string | null;
  /** Elevator Pitch */
  elevator_pitch?: string | null;
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

/** WorkExperience */
export interface WorkExperience {
  /** Id */
  id?: string | null;
  /** Company Name */
  company_name: string;
  /** Role */
  role: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /** End Date */
  end_date?: string | null;
  /** Description */
  description?: string | null;
}

export type CheckHealthData = HealthResponse;

export type UploadProfilePictureData = ProfileResponse;

export type UploadProfilePictureError = HTTPValidationError;

export interface GetProfilePictureParams {
  /**
   * User Id
   * @format uuid
   */
  userId: string;
}

export type GetProfilePictureData = any;

export type GetProfilePictureError = HTTPValidationError;

export interface UploadGalleryMediaParams {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
}

export type UploadGalleryMediaData = ProfileResponse;

export type UploadGalleryMediaError = HTTPValidationError;

export type CreateOrUpdateProfileData = any;

export type CreateOrUpdateProfileError = HTTPValidationError;

export type GetMyProfileData = ProfileResponse;

export interface GetProfileByIdParams {
  /**
   * User Id
   * @format uuid
   */
  userId: string;
}

export type GetProfileByIdData = ProfileResponse;

export type GetProfileByIdError = HTTPValidationError;

export type CheckHealthResult = HealthCheckResponse;

export interface ListPublicProfilesParams {
  /** Search */
  search?: string | null;
}

/** Response List Public Profiles */
export type ListPublicProfilesData = PublicProfile[];

export type ListPublicProfilesError = HTTPValidationError;
