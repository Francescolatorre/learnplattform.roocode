# OpenAPI Specification Changes

This document outlines the required changes to the OpenAPI specification (`openapi.yaml`) to align it with the TypeScript type definitions in the frontend, as described in `memory_bank/Documentation/type_mitigation_plan.md`.

## 1. CourseEnrollment Discrepancies

* **1.1. `enrollment_date` and `progress_percentage` Nullability:**

    The OpenAPI spec doesn't explicitly mark `enrollment_date` and `progress_percentage` as nullable, but the TypeScript type (`IEnrollment`) makes them optional.

    **Action:** Update the OpenAPI specification (in the `definitions/CourseEnrollment` section) to explicitly mark `enrollment_date` and `progress_percentage` as nullable using the `x-nullable: true` extension.

    ```yaml
    enrollment_date:
      title: Enrollment date
      type: string
      format: date-time
      readOnly: true
      x-nullable: true  # Add this line

    progress_percentage:
      title: Progress percentage
      type: string
      readOnly: true
      x-nullable: true  # Add this line
    ```

* **1.2. Missing `id` in OpenAPI:**

    The `IEnrollment` interface has an `id` field, but it's not present in the OpenAPI definition for `CourseEnrollment`.

    **Action:** Add the `id` field to the OpenAPI definition for `CourseEnrollment`.

    ```yaml
    id:
      title: ID
      type: integer
      readOnly: true
    ```

## 2. User Discrepancies

* **2.1. Missing Constraints:**

    The OpenAPI spec defines constraints on `username` (pattern, maxLength, minLength) and `email` (format, maxLength, minLength) that are not present in the TypeScript type (`User`).

    **Action:** Ensure that the OpenAPI spec defines constraints on `username` (pattern, maxLength, minLength) and `email` (format, maxLength, minLength). These constraints are already defined in the `definitions/User` section, so no changes are needed.

## 3. Course Discrepancies

* **4.1. `status` and `visibility` Requiredness:**

    The OpenAPI spec requires `status` and `visibility`.

    **Action:** Ensure that the OpenAPI spec requires `status` and `visibility`. These properties are already required in the `definitions/Course` section, so no changes are needed.

* **4.2. `created_at` and `updated_at` Requiredness:**

    The OpenAPI spec defines `created_at` and `updated_at` as readOnly.

     **Action:** Ensure that the OpenAPI spec defines `created_at` and `updated_at` as readOnly. These properties are already defined as readOnly in the `definitions/Course` section, so no changes are needed.

## 4. CourseDetails Discrepancies

* **5.1. Redundant `version`:**

    The `CourseDetails` interface extends `Course` and redefines `version` as optional, which is redundant and potentially confusing.

    **Action:** No changes are needed in the OpenAPI spec at this time.

## 5. TaskProgress Discrepancies

* **5.1. Data Type Mismatch for IDs:**

    The TypeScript interface uses `taskId` and `moduleId` as strings, while the API definition uses `user` and `task` as integers (IDs).

    **Action:** Ensure that the OpenAPI spec uses integers (IDs) for `user` and `task` in the `definitions/TaskProgress` section. These properties are already defined as integers, so no changes are needed.

* **5.2. Missing and Additional Properties:**

    The TypeScript interface includes `title`, `taskType`, `score`, `maxScore`, `attempts`, `maxAttempts`, `timeSpent`, `dueDate`, and `submissionDate`, which are not present in the API definition. The API definition includes `id`, `user_details`, and `task_details`, which are not present in the TypeScript interface.

    **Action:** Ensure that the API definition includes `id`, `user_details`, and `task_details` in the `definitions/TaskProgress` section. Consider updating the API definition to include the additional properties from the TypeScript interface: `title`, `taskType`, `score`, `maxScore`, `attempts`, `maxAttempts`, `dueDate`, and `submissionDate`.

    ```yaml
    TaskProgress:
      type: object
      properties:
        id:
          title: ID
          type: integer
          readOnly: true
        user:
          title: User
          type: integer
        task:
          title: Task
          type: integer
        status:
          title: Status
          type: string
          enum:
            - not_started
            - in_progress
            - completed
        time_spent:
          title: Time spent
          type: string
        completion_date:
          title: Completion date
          type: string
          format: date-time
          x-nullable: true
        user_details:
          $ref: '#/definitions/User'
        task_details:
          $ref: '#/definitions/LearningTask'
        title:
          title: Title
          type: string
        taskType:
          title: Task Type
          type: string
        score:
          title: Score
          type: integer
        maxScore:
          title: Max Score
          type: integer
        attempts:
          title: Attempts
          type: integer
        maxAttempts:
          title: Max Attempts
          type: integer
        dueDate:
          title: Due Date
          type: string
          format: date-time
        submissionDate:
          title: Submission Date
          type: string
          format: date-time
    ```

* **5.3. Data Type Mismatch for `timeSpent`:**

    The TypeScript interface uses `number | null` for `timeSpent`, while the API definition uses `string` for `time_spent`.

    **Action:** Ensure that the OpenAPI spec uses `string` for `time_spent` in the `definitions/TaskProgress` section. This property is already defined as a string, so no changes are needed.

* **5.4. Enum Consistency for `status`:**

    The TypeScript interface uses a specific enum for `status`, while the API definition only specifies that it's a string with a similar enum.

    **Action:** Ensure that the OpenAPI spec uses a string type for `status` in the `definitions/TaskProgress` section. This property is already defined as a string with an enum, so no changes are needed.

## 6. IPaginatedResponse Discrepancies

* **6.1. Missing Descriptions for `next` and `previous`:**

    The TypeScript interface includes comments for `next` and `previous`, which are not present in the API definition.

    **Action:** Add descriptions to the `next` and `previous` properties in the API definition (wherever `IPaginatedResponse` is used, e.g., in the responses for list endpoints). For example:

    ```yaml
    properties:
      count:
        type: integer
      next:
        type: string
        format: uri
        x-nullable: true
        description: URL to the next page of results.  # Add this line
      previous:
        type: string
        format: uri
        x-nullable: true
        description: URL to the previous page of results. # Add this line
      results:
        type: array
        items:
          $ref: '#/definitions/Course'
    ```

## 7. User Discrepancies

* **7.1. Missing Constraints on `username` and `email`:**

    The API definition includes constraints on `username` (pattern, maxLength, minLength) and `email` (format, maxLength, minLength) that are not present in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec includes constraints on `username` (pattern, maxLength, minLength) and `email` (format, maxLength, minLength). These constraints are already defined in the `definitions/User` section, so no changes are needed.

* **7.2. Missing `readonly` for `id`:**

    The API definition specifies `readOnly: true` for the `id` property, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id` property in the `definitions/User` section. This property is already defined as readOnly, so no changes are needed.

## 8. Course Discrepancies

* **8.1. Missing Constraints on `title`, `description`, `status`, and `visibility`:**

    The API definition includes constraints on `title` and `description` that are not present in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec includes constraints on `title` and `description` in the `definitions/Course` section. These constraints are already defined, so no changes are needed.

* **8.2. Missing `readonly` for `id`, `created_at`, and `updated_at`:**

    The API definition specifies `readOnly: true` for the `id`, `created_at`, and `updated_at` properties, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id`, `created_at`, and `updated_at` properties in the `definitions/Course` section. These properties are already defined as readOnly, so no changes are needed.

* **8.3. Optional Properties:**

    The TypeScript interface makes `version`, `learning_objectives`, `prerequisites`, `created_at`, and `updated_at` optional, while the API definition only makes `creator` nullable.

    **Action:** Ensure that the OpenAPI spec only makes `creator` nullable in the `definitions/Course` section.

    ```yaml
    creator:
      title: Creator
      type: integer
      x-nullable: true # Ensure only creator is nullable
    ```

## 9. LearningTask Discrepancies

* **9.1. Missing Constraints on `title` and `description`:**

    The API definition includes constraints on `title` and `description` that are not present in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec includes constraints on `title` and `description` in the `definitions/LearningTask` section. These constraints are already defined, so no changes are needed.

* **9.2. Missing `readonly` for `id`, `created_at`, and `updated_at`:**

    The API definition specifies `readOnly: true` for the `id`, `created_at`, and `updated_at` properties, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id`, `created_at`, and `updated_at` properties in the `definitions/LearningTask` section. These properties are already defined as readOnly, so no changes are needed.

* **9.3. Optional Properties:**

    The TypeScript interface makes `order` and `created_at`, `updated_at` optional, while the API definition requires them.

    **Action:** Ensure that the OpenAPI spec requires `order` and `created_at`, `updated_at` in the `definitions/LearningTask` section. These properties are already required, so no changes are needed.

## 10. CourseDetails Discrepancies

* **10.1. Redundant `version` Property:**

    The `CourseDetails` interface extends the `Course` interface and adds an optional `version` property. However, the `Course` interface already has a `version` property, so this is redundant.

    **Action:** No changes are needed in the OpenAPI spec at this time.

## 11. UserProgress Discrepancies

* **11.1. Missing API Definition:**

    There is no corresponding definition for the `UserProgress` interface in the `openapi.yaml`. This interface seems to be used internally in the frontend.

    **Action:** Consider adding the `UserProgress` interface to the API specification if it is intended to be returned by the API.

## 12. AuthTypes Discrepancies

* **12.1. Missing API Definition for Login Response:**

    The `LoginResponse` interface includes `access`, `refresh`, and `user`, while the `CustomTokenObtainPair` definition only includes `username` and `password`.

    **Action:** Add a schema definition for the login response to the API specification. This would improve the documentation and make the API easier to understand. The schema should include `access`, `refresh`, and `user`.

    ```yaml
    LoginResponse:
      type: object
      properties:
        access:
          type: string
        refresh:
          type: string
        user:
          $ref: '#/definitions/User'
    ```

    Update the `/auth/login/` path to reference this new definition in the response schema.

* **12.2. Missing API Definition for Token Refresh Response:**

    The `TokenRefreshResponse` interface includes `access`, `refresh`, and `user`, while the `TokenRefresh` definition only includes `refresh`.

    **Action:** Add a schema definition for the token refresh response to the API specification. This would improve the documentation and make the API easier to understand. The schema should include `access`, `refresh`, and `user`.

    ```yaml
    TokenRefreshResponse:
      type: object
      properties:
        access:
          type: string
        refresh:
          type: string
        user:
          $ref: '#/definitions/User'
    ```

    Update the `/auth/token/refresh/` path to reference this new definition in the response schema.

## 13. CourseEnrollment Discrepancies

* **13.1. Missing `readonly` for `id`, `enrollment_date`, and `responses`:**

    The API definition specifies `readOnly: true` for the `id`, `enrollment_date`, and `responses` properties, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id`, `enrollment_date`, and `responses` properties in the `definitions/CourseEnrollment` section. `id` and `enrollment_date` are already defined as readOnly. There is no `responses` property in the `CourseEnrollment` definition, so this is likely a mistake.

* **13.2. Optional Properties:**

    The TypeScript interface makes `enrollment_date`, `settings`, `user_details`, `course_details`, and `progress_percentage` optional, while the API definition only makes `settings` nullable.

    **Action:** Ensure that the OpenAPI spec only makes `settings` nullable in the `definitions/CourseEnrollment` section. `enrollment_date` and `progress_percentage` should be nullable as per 1.1.

    ```yaml
    settings:
      title: Settings
      type: object
      x-nullable: true # Ensure only settings is nullable
    ```

* **13.3. Missing Enum for `status`:**

    The API definition includes an enum for `status`, which is not enforced in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec includes an enum for `status` in the `definitions/CourseEnrollment` section. This enum is already defined, so no changes are needed.

## 14. CourseVersion Discrepancies

* **14.1. Missing `readonly` for `id` and `created_at`:**

    The API definition specifies `readOnly: true` for the `id` and `created_at` properties, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id` and `created_at` properties in the `definitions/CourseVersion` section. These properties are already defined as readOnly, so no changes are needed.

* **14.2. Optional Properties:**

    The TypeScript interface makes `created_at` and `notes` and `created_by` optional, while the API definition only makes `notes` and `created_by` optional (nullable).

    **Action:** Ensure that the OpenAPI spec only makes `notes` and `created_by` optional (nullable) in the `definitions/CourseVersion` section.

    ```yaml
    notes:
      title: Notes
      type: string
    created_by:
      title: Created by
      type: integer
      x-nullable: true # Ensure only notes and created_by are nullable
    ```

## 15. QuizOption Discrepancies

* **15.1. Missing `readonly` for `id`:**

    The API definition specifies `readOnly: true` for the `id` property, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id` property in the `definitions/QuizOption` section. This property is already defined as readOnly, so no changes are needed.

* **15.2. Missing Constraint on `text`:**

    The API definition requires `text` to have `minLength: 1`, which is not enforced in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec requires `text` to have `minLength: 1` in the `definitions/QuizOption` section. This constraint is already defined, so no changes are needed.

* **15.3. Optional Properties:**

    The TypeScript interface makes `is_correct` and `order` optional, while the API definition does not explicitly specify nullability.

    **Action:** Ensure that the OpenAPI spec does not explicitly specify nullability for `is_correct` and `order` in the `definitions/QuizOption` section. These properties are already not nullable, so no changes are needed.

## 16. QuizQuestion Discrepancies

* **16.1. Missing `readonly` for `id` and `options`:**

    The API definition specifies `readOnly: true` for the `id` and `options` properties, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id` and `options` properties in the `definitions/QuizQuestion` section. These properties are already defined as readOnly, so no changes are needed.

* **16.2. Missing Constraint on `text`:**

    The API definition requires `text` to have `minLength: 1`, which is not enforced in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec requires `text` to have `minLength: 1` in the `definitions/QuizQuestion` section. This constraint is already defined, so no changes are needed.

* **16.3. Optional Properties:**

    The TypeScript interface makes `explanation`, `points`, and `order` optional, while the API definition does not explicitly specify nullability.

    **Action:** Ensure that the OpenAPI spec does not explicitly specify nullability for `explanation`, `points`, and `order` in the `definitions/QuizQuestion` section. These properties are already not nullable, so no changes are needed.

## 17. QuizTask Discrepancies

* **17.1. Missing `readonly` for `id`, `created_at`, `updated_at`, and `questions`:**

    The API definition specifies `readOnly: true` for the `id`, `created_at`, `updated_at`, and `questions` properties, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id`, `created_at`, `updated_at`, and `questions` properties in the `definitions/QuizTask` section. These properties are already defined as readOnly, so no changes are needed.

* **17.2. Missing Constraints on `title` and `description`:**

    The API definition includes constraints on `title` and `description` that are not present in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec includes constraints on `title` and `description` in the `definitions/QuizTask` section. These constraints are already defined, so no changes are needed.

* **17.3. Optional Properties:**

    The TypeScript interface makes `order`, `created_at`, `updated_at`, `time_limit_minutes`, `pass_threshold`, `max_attempts`, `randomize_questions`, and `questions` optional, while the API definition does not explicitly specify nullability.

    **Action:** Ensure that the OpenAPI spec does not explicitly specify nullability for `order`, `created_at`, `updated_at`, `time_limit_minutes`, `pass_threshold`, `max_attempts`, `randomize_questions`, and `questions` in the `definitions/QuizTask` section. These properties are already not nullable, so no changes are needed.

## 18. QuizResponse Discrepancies

* **18.1. Missing `readonly` for `id`:**

    The API definition specifies `readOnly: true` for the `id` property, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id` property in the `definitions/QuizResponse` section. This property is already defined as readOnly, so no changes are needed.

* **18.2. Optional Properties:**

    The TypeScript interface makes `question_details` and `selected_option_details` optional, while the API definition does not explicitly specify nullability.

    **Action:** Ensure that the OpenAPI spec does not explicitly specify nullability for `question_details` and `selected_option_details` in the `definitions/QuizResponse` section. These properties are already not nullable, so no changes are needed.

## 19. QuizAttempt Discrepancies

* **19.1. Missing `readonly` for `id`, `attempt_date`, and `responses`:**

    The API definition specifies `readOnly: true` for the `id`, `attempt_date`, and `responses` properties, which is not explicitly stated in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec specifies `readOnly: true` for the `id`, `attempt_date`, and `responses` properties in the `definitions/QuizAttempt` section. These properties are already defined as readOnly, so no changes are needed.

* **19.2. Optional Properties:**

    The TypeScript interface makes `attempt_date`, `user_details`, `quiz_details`, and `responses` optional, while the API definition does not explicitly specify nullability.

    **Action:** Ensure that the OpenAPI spec does not explicitly specify nullability for `attempt_date`, `user_details`, `quiz_details`, and `responses` in the `definitions/QuizAttempt` section. These properties are already not nullable, so no changes are needed.

* **19.3. Missing Enum for `completion_status`:**

    The API definition includes an enum for `completion_status`, which is not enforced in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec includes an enum for `completion_status` in the `definitions/QuizAttempt` section. This enum is already defined, so no changes are needed.

## 20. Task (apiTypes) Discrepancies

* **20.1. Data Type Mismatch for `id`:**

    The TypeScript interface uses `string` for `id`, while the API definition uses `integer` and specifies `readOnly: true`.

    **Action:** Ensure that the OpenAPI spec uses `integer` for `id` and specifies `readOnly: true` in the `definitions/LearningTask` section. This is already the case, so no changes are needed.

* **20.2. Missing Constraints on `title` and `description`:**

    The API definition includes constraints on `title` and `description` that are not present in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec includes constraints on `title` and `description` in the `definitions/LearningTask` section. These constraints are already defined, so no changes are needed.

* **20.3. Missing and Additional Properties:**

    The TypeScript interface includes `status`, which is not present in the API definition. The API definition includes `course`, `order`, `is_published`, `created_at`, and `updated_at`, which are not present in the TypeScript interface.

    **Action:** Ensure that the OpenAPI spec includes `course`, `order`, `is_published`, `created_at`, and `updated_at` in the `definitions/LearningTask` section.

## 21. TaskCreationData Discrepancies

* **21.1. Missing API Definition:**

    There is no corresponding definition for the `TaskCreationData` interface in the `openapi.yaml`.

    **Action:** Consider adding the `TaskCreationData` interface to the API specification if it is intended to be used as a request body for creating tasks.
