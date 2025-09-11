# Mitigation Plan: API Specification vs. TypeScript Type Discrepancies

This document outlines a plan to address discrepancies and inconsistencies identified between the API specification (`memory_bank/Documentation/openapi.yaml`) and the TypeScript type definitions in the frontend (`frontend/src/types/common/entities.ts` and `frontend/src/features/enrollments/types/enrollmentTypes.ts`).

## 1. CourseEnrollment Discrepancies

### 1.1. `enrollment_date` and `progress_percentage` Nullability

**Issue:** The OpenAPI spec doesn't explicitly mark `enrollment_date` and `progress_percentage` as nullable, but the TypeScript type (`IEnrollment`) makes them optional.

**Proposed Solution:** Update the OpenAPI specification to explicitly mark `enrollment_date` and `progress_percentage` as nullable using the `x-nullable: true` extension. This will ensure that the API contract accurately reflects the possibility of these fields being null.

**Rationale:** This change aligns the API specification with the existing TypeScript type, preventing potential runtime errors in the frontend when handling null values.

**Impact:** Minimal impact. This change only clarifies the API contract and doesn't require any code changes in the backend or frontend.

**Testing and Validation:** After updating the OpenAPI specification, verify that the generated client code (if any) correctly handles null values for `enrollment_date` and `progress_percentage`.

### 1.2. Missing `id` in OpenAPI

**Issue:** The `IEnrollment` interface has an `id` field, but it's not present in the OpenAPI definition for `CourseEnrollment`.

**Proposed Solution:** Add the `id` field to the OpenAPI definition for `CourseEnrollment`.

**Rationale:** This ensures that the API specification accurately reflects the structure of the `CourseEnrollment` object returned by the API.

**Impact:** Requires updating the OpenAPI specification. May require changes in the backend to ensure the `id` is always included in the API response.

**Testing and Validation:** After updating the OpenAPI specification and backend (if necessary), verify that the API response for `CourseEnrollment` includes the `id` field. Update the TypeScript type definition if necessary.

## 2. User Discrepancies

### 2.1. Missing Constraints

**Issue:** The OpenAPI spec defines constraints on `username` (pattern, maxLength, minLength) and `email` (format, maxLength, minLength) that are not present in the TypeScript type (`User`).

**Proposed Solution:** Add the constraints to the TypeScript type definition for `User`.

**Rationale:** This ensures that the frontend validates user input according to the API's requirements, preventing invalid data from being sent to the backend.

**Impact:** Requires updating the TypeScript type definition for `User`. May require changes to the frontend to implement the validation logic.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly validates user input for `username` and `email`.

## 3. Course Discrepancies

### 3.1. `status` and `visibility` Requiredness - DONE

**Issue:** The OpenAPI spec requires `status` and `visibility`, but the TypeScript type (`Course`) makes them optional in `frontend/src/features/courses/types/courseTypes.ts`.

**Proposed Solution:** Update the TypeScript type definition for `Course` to make `status` and `visibility` required.

**Rationale:** This ensures that the frontend always provides values for `status` and `visibility` when creating or updating a course, preventing potential errors in the backend.

**Impact:** Requires updating the TypeScript type definition for `Course`. May require changes to the frontend to ensure that values are always provided for `status` and `visibility`.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend always provides values for `status` and `visibility` when creating or updating a course.

### 3.2. `created_at` and `updated_at` Requiredness

**Issue:** The OpenAPI spec defines `created_at` and `updated_at` as readOnly, but the TypeScript type (`Course`) makes them optional.

**Proposed Solution:** Update the TypeScript type definition for `Course` to remove the optionality of `created_at` and `updated_at`.

**Rationale:** This ensures that the frontend correctly reflects the API's response, which always includes these fields.

**Impact:** Requires updating the TypeScript type definition for `Course`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend correctly handles the `created_at` and `updated_at` fields.

## 4. CourseDetails Discrepancies - DONE

### 4.1. Redundant `version` - DONE

**Issue:** The `CourseDetails` interface extends `Course` and redefines `version` as optional, which is redundant and potentially confusing.

**Proposed Solution:** Remove the redundant `version` property from the `CourseDetails` interface in `frontend/src/features/courses/types/courseTypes.ts`.

**Rationale:** This simplifies the type definition and reduces the potential for confusion.

**Impact:** Requires updating the TypeScript type definition for `CourseDetails`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code that uses `CourseDetails` still works correctly.

## General Considerations

* **Backward Compatibility:** Prioritize solutions that minimize breaking changes and maintain backward compatibility.
* **Testing:** Implement thorough testing to ensure that all changes are working as expected and that no new issues have been introduced.
* **Documentation:** Update any relevant documentation to reflect the changes made to the API specification and TypeScript type definitions.

This mitigation plan provides a starting point for addressing the identified discrepancies. The specific steps and timelines for implementing these changes will need to be determined based on the project's priorities and resources.

## 5. TaskProgress Discrepancies

### 5.1. Data Type Mismatch for IDs

**Issue:** The TypeScript interface uses `taskId` and `moduleId` as strings, while the API definition uses `user` and `task` as integers (IDs).

**Proposed Solution:** Update the TypeScript interface to use IDs (integers) for `user` and `task` instead of `taskId` and `moduleId` (strings). This aligns the frontend with the backend data structure. This might require changes in the components that use this interface to fetch data using IDs instead of strings.

**Rationale:** This change ensures consistency between the frontend and backend data types and prevents potential errors when fetching or updating task progress data.

**Impact:** Requires updating the TypeScript type definition for `TaskProgress`. May require changes in the components that use this interface to fetch data using IDs instead of strings.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly fetches and updates task progress data using IDs.

### 5.2. Missing and Additional Properties

**Issue:** The TypeScript interface includes `title`, `taskType`, `score`, `maxScore`, `attempts`, `maxAttempts`, `timeSpent`, `dueDate`, and `submissionDate`, which are not present in the API definition. The API definition includes `id`, `user_details`, and `task_details`, which are not present in the TypeScript interface.

**Proposed Solution:** Add the missing properties from the API definition to the TypeScript interface: `id`, `user_details`, and `task_details`. Consider updating the API definition to include the additional properties from the TypeScript interface: `title`, `taskType`, `score`, `maxScore`, `attempts`, `maxAttempts`, `dueDate`, and `submissionDate`. However, this might be a breaking change for other clients of the API.

**Rationale:** Adding the missing properties ensures that the frontend can handle all the data provided by the API. Updating the API definition would make the API more comprehensive and reduce the need for the frontend to fetch additional data.

**Impact:** Requires updating the TypeScript type definition for `TaskProgress`. May require changes to the backend to include the additional properties in the API response.

**Testing and Validation:** After updating the TypeScript type definition and backend (if necessary), verify that the frontend correctly handles all the properties in the `TaskProgress` object.

### 5.3. Data Type Mismatch for `timeSpent`

**Issue:** The TypeScript interface uses `number | null` for `timeSpent`, while the API definition uses `string` for `time_spent`.

**Proposed Solution:** Update the TypeScript interface to use `string | null` for `timeSpent` to match the API definition.

**Rationale:** This change ensures consistency between the frontend and backend data types and prevents potential errors when handling time spent data.

**Impact:** Requires updating the TypeScript type definition for `TaskProgress`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend correctly handles the `timeSpent` property.

### 5.4. Enum Consistency for `status` - DONE

**Issue:** The TypeScript interface uses a specific enum for `status`, while the API definition only specifies that it's a string with a similar enum.

**Proposed Solution:** Ensure that the frontend and backend use the same enum values for `status` in `frontend/src/types/common/entities.ts`.

**Rationale:** This change ensures consistency between the frontend and backend data types and prevents potential errors when handling task status data.

**Impact:** May require changes to the frontend and backend to use a shared enum for `status`.

**Testing and Validation:** After updating the frontend and backend (if necessary), verify that the frontend and backend correctly handle the `status` property.

## 6. IPaginatedResponse Discrepancies

### 6.1. Missing Descriptions for `next` and `previous`

**Issue:** The TypeScript interface includes comments for `next` and `previous`, which are not present in the API definition.

**Proposed Solution:** Consider adding descriptions to the `next` and `previous` properties in the API definition.

**Rationale:** This would improve the documentation and make the API easier to understand.

**Impact:** Requires updating the OpenAPI specification.

**Testing and Validation:** After updating the OpenAPI specification, verify that the generated client code (if any) includes the descriptions for `next` and `previous`.

## 7. User Discrepancies

### 7.1. Missing Constraints on `username` and `email`

**Issue:** The API definition includes constraints on `username` (pattern, maxLength, minLength) and `email` (format, maxLength, minLength) that are not present in the TypeScript interface.

**Proposed Solution:** Add the constraints to the TypeScript type definition for `User`.

**Rationale:** This ensures that the frontend validates user input according to the API's requirements, preventing invalid data from being sent to the backend.

**Impact:** Requires updating the TypeScript type definition for `User`. May require changes to the frontend to implement the validation logic.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly validates user input for `username` and `email`.

### 7.2. Missing `readonly` for `id`

**Issue:** The API definition specifies `readOnly: true` for the `id` property, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id` property as `readonly` in the TypeScript interface.

**Rationale:** This clarifies that this property should not be modified by the frontend.

**Impact:** Requires updating the TypeScript type definition for `User`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id` property.

## 8. Course Discrepancies

### 8.1. Missing Constraints on `title` and `description` - DONE

**Issue:** The API definition includes constraints on `title` and `description` in `frontend/src/features/courses/types/courseTypes.ts` that are not present in the TypeScript interface.

**Proposed Solution:** Add the constraints to the TypeScript type definition for `Course`.

**Rationale:** This ensures that the frontend validates user input according to the API's requirements, preventing invalid data from being sent to the backend.

**Impact:** Requires updating the TypeScript type definition for `Course`. May require changes to the frontend to implement the validation logic.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly validates user input for `title` and `description`.
**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly validates user input for `title`, `description`, `status`, and `visibility`.

### 8.2. Missing `readonly` for `id`, `created_at`, and `updated_at` - DONE

**Issue:** The API definition specifies `readOnly: true` for the `id`, `created_at`, and `updated_at` properties in `frontend/src/features/courses/types/courseTypes.ts`, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id`, `created_at`, and `updated_at` properties as `readonly` in the TypeScript interface.

**Rationale:** This clarifies that these properties should not be modified by the frontend.

**Impact:** Requires updating the TypeScript type definition for `Course`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id`, `created_at`, and `updated_at` properties.

### 8.3. Optional Properties - DONE

**Issue:** The TypeScript interface makes `version`, `learning_objectives`, `prerequisites`, `created_at`, and `updated_at` optional in `frontend/src/features/courses/types/courseTypes.ts`, while the API definition only makes `creator` nullable.

**Proposed Solution:** Update the TypeScript type definition for `Course` to make `version`, `learning_objectives`, `prerequisites`, `created_at`, and `updated_at` required.

**Rationale:** This aligns the TypeScript interface with the API definition.

**Impact:** Requires updating the TypeScript type definition for `Course`. May require changes to the frontend to ensure that values are always provided for these properties.
**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend always provides values for `version`, `learning_objectives`, `prerequisites`, `created_at`, and `updated_at`.
**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend always provides values for `version`, `learning_objectives`, `prerequisites`, `created_at`, and `updated_at`.

## 9. LearningTask Discrepancies

### 9.1. Missing Constraints on `title` and `description` - DONE

**Issue:** The API definition includes constraints on `title` and `description` that are not present in the TypeScript interface.

**Proposed Solution:** Add the constraints to the TypeScript type definition for `LearningTask`.

**Rationale:** This ensures that the frontend validates user input according to the API's requirements, preventing invalid data from being sent to the backend.

**Impact:** Requires updating the TypeScript type definition for `LearningTask`. May require changes to the frontend to implement the validation logic.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly validates user input for `title` and `description`.

**File:** `frontend/src/types/common/entities.ts`
**Lines:** 32, 33
**Existing Code:**

```typescript
  title: string & {maxLength: 200; minLength: 3};
  description: string & {maxLength: 500; minLength: 10};
```

**Replacement Code:**

```typescript
  title: string & {maxLength: 200; minLength: 3};
  description: string & {maxLength: 500; minLength: 10};
```

### 9.2. Missing `readonly` for `id`, `created_at`, and `updated_at` - DONE

**Issue:** The API definition specifies `readOnly: true` for the `id`, `created_at`, and `updated_at` properties, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id`, `created_at`, and `updated_at` properties as `readonly` in the TypeScript interface.

**Rationale:** This clarifies that these properties should not be modified by the frontend.

**Impact:** Requires updating the TypeScript type definition for `LearningTask`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id`, `created_at`, and `updated_at` properties.

**File:** `frontend/src/types/common/entities.ts`
**Lines:** 30
**Existing Code:**

```typescript
  readonly id: number;
```

**Replacement Code:**

```typescript
  readonly id: number;
```

### 9.3. Optional Properties - DONE

**Issue:** The TypeScript interface makes `order` and `created_at`, `updated_at` optional, while the API definition requires them.

**Proposed Solution:** Update the TypeScript type definition for `LearningTask` to make `order` and `created_at`, `updated_at` required.

**Rationale:** This aligns the TypeScript interface with the API definition.

**Impact:** Requires updating the TypeScript type definition for `LearningTask`. May require changes to the frontend to ensure that values are always provided for these properties.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend always provides values for `order` and `created_at`, `updated_at`.

**File:** `frontend/src/types/common/entities.ts`
**Lines:** 34, 35, 36
**Existing Code:**

```typescript
  order: number;
  created_at: string;
  updated_at: string;
```

**Replacement Code:**

```typescript
  order: number;
  created_at: string;
  updated_at: string;
```

## 10. CourseDetails Discrepancies

### 10.1. Redundant `version` Property

**Issue:** The `CourseDetails` interface extends the `Course` interface and adds an optional `version` property. However, the `Course` interface already has a `version` property, so this is redundant.

**Proposed Solution:** Remove the `version` property from the `CourseDetails` interface.

**Rationale:** This simplifies the type definition and reduces the potential for confusion.

**Impact:** Requires updating the TypeScript type definition for `CourseDetails`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code that uses `CourseDetails` still works correctly.

## 11. UserProgress Discrepancies

### 11.1. Missing API Definition

**Issue:** There is no corresponding definition for the `UserProgress` interface in the `openapi.yaml`. This interface seems to be used internally in the frontend.

**Proposed Solution:** Document the `UserProgress` interface. Add a comment to the interface explaining its purpose and usage. Consider adding the `UserProgress` interface to the API specification if it is intended to be returned by the API. This would make the API more comprehensive and reduce the need for the frontend to define its own types.

**Rationale:** Documentation improves code maintainability. Adding the interface to the API specification would improve API discoverability and consistency.

**Impact:** Requires documenting the `UserProgress` interface. May require updating the API specification and backend to include the `UserProgress` object in API responses.

**Testing and Validation:** After documenting the `UserProgress` interface and updating the API specification (if necessary), verify that the frontend and backend code correctly handle the `UserProgress` object.

## 12. AuthTypes Discrepancies

### 12.1. Missing API Definition for Login Response

**Issue:** The `LoginResponse` interface includes `access`, `refresh`, and `user`, while the `CustomTokenObtainPair` definition only includes `username` and `password`. The API specification does not explicitly define the structure of the login response.

**Proposed Solution:** Add a schema definition for the login response to the API specification. This would improve the documentation and make the API easier to understand. The schema should include `access`, `refresh`, and `user`. Update the `LoginResponse` interface to match the new schema definition. This ensures that the frontend is using the correct type definition for the login response.

**Rationale:** Documentation improves code maintainability. Adding the interface to the API specification would improve API discoverability and consistency.

**Impact:** Requires updating the API specification and the TypeScript type definition for `LoginResponse`.

**Testing and Validation:** After updating the API specification and the TypeScript type definition, verify that the frontend and backend code correctly handle the `LoginResponse` object.

### 12.2. Missing API Definition for Token Refresh Response

**Issue:** The `TokenRefreshResponse` interface includes `access`, `refresh`, and `user`, while the `TokenRefresh` definition only includes `refresh`. The API specification does not explicitly define the structure of the token refresh response.

**Proposed Solution:** Add a schema definition for the token refresh response to the API specification. This would improve the documentation and make the API easier to understand. The schema should include `access`, `refresh`, and `user`. Update the `TokenRefreshResponse` interface to match the new schema definition. This ensures that the frontend is using the correct type definition for the token refresh response.

**Rationale:** Documentation improves code maintainability. Adding the interface to the API specification would improve API discoverability and consistency.

**Impact:** Requires updating the API specification and the TypeScript type definition for `TokenRefreshResponse`.

**Testing and Validation:** After updating the API specification and the TypeScript type definition, verify that the frontend and backend code correctly handle the `TokenRefreshResponse` object.

## 13. CourseEnrollment Discrepancies

### 13.1. Missing `readonly` for `id`, `enrollment_date`, and `progress_percentage` - DONE

**Issue:** The API definition specifies `readOnly: true` for the `id`, `enrollment_date`, and `responses` properties, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id`, `enrollment_date`, and `progress_percentage` properties as `readonly` in the TypeScript interface.

**Rationale:** This clarifies that these properties should not be modified by the frontend.

**File:** `frontend/src/features/enrollments/types/enrollmentTypes.ts`
**Lines:** 13, 17, 19
**Existing Code:**

```typescript
  id: number;
  enrollment_date: string;
  progress_percentage: string;
```

**Replacement Code:**

```typescript
  readonly id: number;
  readonly enrollment_date: string;
  readonly progress_percentage: string;
```

**Impact:** Requires updating the TypeScript type definition for `CourseEnrollment`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id`, `enrollment_date`, and `progress_percentage` properties.

### 13.2. Optional Properties - DONE

**Issue:** The TypeScript interface makes `enrollment_date`, `settings`, `user_details`, `course_details`, and `progress_percentage` optional, while the API definition only makes `settings` nullable.

**Proposed Solution:** Update the TypeScript type definition for `CourseEnrollment` to make `enrollment_date`, `user_details`, `course_details`, and `progress_percentage` required.

**Rationale:** This aligns the TypeScript interface with the API definition.

**File:** `frontend/src/features/enrollments/types/enrollmentTypes.ts`
**Lines:** 15, 17, 20
**Existing Code:**

```typescript
  course_details: CourseDetails;
  enrollment_date: string;
  user_details: User;
  progress_percentage: string;
```

**Replacement Code:**

```typescript
  course_details: CourseDetails;
  enrollment_date: string;
  user_details: User;
  progress_percentage: string;
```

**Impact:** Requires updating the TypeScript type definition for `CourseEnrollment`. May require changes to the frontend to ensure that values are always provided for these properties.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend always provides values for `enrollment_date`, `user_details`, `course_details`, and `progress_percentage`.

### 13.3. Missing Enum for `status` - DONE

**Issue:** The API definition includes an enum for `status`, which is not enforced in the TypeScript interface.

**Proposed Solution:** Enforce the enum for `completion_status` in the TypeScript interface.

**Rationale:** This ensures that the frontend only uses valid status values.

**File:** `frontend/src/features/enrollments/types/enrollmentTypes.ts`
**Lines:** 3, 18
**Existing Code:**

```typescript
export enum CompletionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}
status: CompletionStatusType;
```

**Replacement Code:**

```typescript
export enum CompletionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}
status: CompletionStatus;
```

**Impact:** Requires updating the TypeScript type definition for `CourseEnrollment`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code only uses valid status values.

## 14. CourseVersion Discrepancies

### 14.1. Missing `readonly` for `id` and `created_at`

**Issue:** The API definition specifies `readOnly: true` for the `id` and `created_at` properties, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id` and `created_at` properties as `readonly` in the TypeScript interface.

**Rationale:** This clarifies that these properties should not be modified by the frontend.

**Impact:** Requires updating the TypeScript type definition for `CourseVersion`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id` and `created_at` properties.

### 14.2. Optional Properties

**Issue:** The TypeScript interface makes `created_at` and `notes` and `created_by` optional, while the API definition only makes `notes` and `created_by` optional (nullable).

**Proposed Solution:** Update the TypeScript type definition for `CourseVersion` to make `created_at` required.

**Rationale:** This aligns the TypeScript interface with the API definition.

**Impact:** Requires updating the TypeScript type definition for `CourseVersion`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code always provides values for `created_at`.

## 15. QuizOption Discrepancies

### 15.1. Missing `readonly` for `id` - DONE

**Issue:** The API definition specifies `readOnly: true` for the `id` property, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id` property as `readonly` in the TypeScript interface.

**Rationale:** This clarifies that this property should not be modified by the frontend.

**Impact:** Requires updating the TypeScript type definition for `QuizOption`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id` property.

**File:** `frontend/src/types/common/entities.ts`
**Lines:** 110
**Existing Code:**

```typescript
  id: number;
```

**Replacement Code:**

```typescript
  readonly id: number;
```

### 15.2. Missing Constraint on `text` - DONE

**Issue:** The API definition requires `text` to have `minLength: 1`, which is not enforced in the TypeScript interface.

**Proposed Solution:** Add a constraint to the TypeScript type definition for `text` to enforce `minLength: 1`.

**Rationale:** This ensures that the frontend validates user input according to the API's requirements, preventing invalid data from being sent to the backend.

**Impact:** Requires updating the TypeScript type definition for `QuizOption`. May require changes to the frontend to implement the validation logic.

**File:** `frontend/src/types/common/entities.ts`
**Lines:** 111
**Existing Code:**

```typescript
  text: string;
```

**Replacement Code:**

```typescript
  text: string & { minLength: 1 };
```

### 15.3. Optional Properties - DONE

**Issue:** The TypeScript interface makes `is_correct` and `order` optional, while the API definition does not explicitly specify nullability.

**Proposed Solution:** Update the TypeScript type definition for `QuizOption` to make `is_correct` and `order` required.

**Rationale:** This aligns the TypeScript interface with the API definition.

**Impact:** Requires updating the TypeScript type definition for `QuizOption`. May require changes to the frontend to ensure that values are always provided for these properties.

**File:** `frontend/src/types/common/entities.ts`
**Lines:** 112-113
**Existing Code:**

```typescript
  is_correct?: boolean;
  order?: number;
```

**Replacement Code:**

```typescript
  is_correct: boolean;
  order: number;
```

## 16. QuizQuestion Discrepancies

### 16.1. Missing `readonly` for `id` and `options` - DONE

**Issue:** The API definition specifies `readOnly: true` for the `id` and `options` properties, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id` and `options` properties as `readonly` in the TypeScript interface. - DONE

**Rationale:** This clarifies that these properties should not be modified by the frontend.

**Impact:** Requires updating the TypeScript type definition for `QuizQuestion`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id` and `options` properties.

### 16.2. Missing Constraint on `text` - DONE

**Issue:** The API definition requires `text` to have `minLength: 1`, which is not enforced in the TypeScript interface.

**Proposed Solution:** Add a constraint to the TypeScript type definition for `text` to enforce `minLength: 1`. - DONE

**Rationale:** This ensures that the frontend validates user input according to the API's requirements, preventing invalid data from being sent to the backend.

**Impact:** Requires updating the TypeScript type definition for `QuizQuestion`. May require changes to the frontend to implement the validation logic.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly validates user input for `text`.

### 16.3. Optional Properties - DONE

**Issue:** The TypeScript interface makes `explanation`, `points`, and `order` optional, while the API definition does not explicitly specify nullability.

**Proposed Solution:** Update the TypeScript type definition for `QuizQuestion` to make `explanation`, `points`, and `order` required. - DONE

**Rationale:** This aligns the TypeScript interface with the API definition.

**Impact:** Requires updating the TypeScript type definition for `QuizQuestion`. May require changes to the frontend to ensure that values are always provided for these properties.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend always provides values for `explanation`, `points`, and `order`.

## 17. QuizTask Discrepancies

### 17.1. Missing `readonly` for `id`, `created_at`, `updated_at`, and `questions` - DONE

**Issue:** The API definition specifies `readOnly: true` for the `id`, `created_at`, `updated_at`, and `questions` properties, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id`, `created_at`, `updated_at`, and `questions` properties as `readonly` in the TypeScript interface. - DONE

**Rationale:** This clarifies that these properties should not be modified by the frontend.

**Impact:** Requires updating the TypeScript type definition for `QuizTask`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id`, `created_at`, `updated_at`, and `questions` properties.

### 17.2. Missing Constraints on `title` and `description` - DONE

**Issue:** The API definition includes constraints on `title` and `description` that are not present in the TypeScript interface.

**Proposed Solution:** Add the constraints to the TypeScript type definition for `title` and `description`. - DONE

**Rationale:** This ensures that the frontend validates user input according to the API's requirements, preventing invalid data from being sent to the backend.

## 19. QuizAttempt Discrepancies

### 19.1. Mark `id`, `attempt_date`, and `responses` as `readonly` - DONE

**Issue:** The API definition specifies `readOnly: true` for the `id`, `attempt_date`, and `responses` properties, which is not explicitly stated in the TypeScript interface.

**Proposed Solution:** Explicitly mark the `id`, `attempt_date`, and `responses` properties as `readonly` in the TypeScript interface. - **DONE**

**Rationale:** This clarifies that these properties should not be modified by the frontend, aligning with the API definition.

**Impact:** Requires updating the TypeScript type definition for `QuizAttempt`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code does not attempt to modify the `id`, `attempt_date`, and `responses` properties.

---

### 19.2. Make `attempt_date`, `user_details`, `quiz_details`, and `responses` required - DONE

**Issue:** The TypeScript interface makes `attempt_date`, `user_details`, `quiz_details`, and `responses` optional, while the API definition does not explicitly specify nullability.

**Proposed Solution:** Update the TypeScript type definition for `QuizAttempt` to make `attempt_date`, `user_details`, `quiz_details`, and `responses` required. - **DONE**

**Rationale:** This aligns the TypeScript interface with the API definition.

**Impact:** Requires updating the TypeScript type definition for `QuizAttempt`. May require changes to the frontend to ensure that values are always provided for these properties.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend always provides values for `attempt_date`, `user_details`, `quiz_details`, and `responses`.

---

### 19.3. Enforce the enum for `completion_status` - DONE

**Issue:** The API definition includes an enum for `completion_status`, which is not enforced in the TypeScript interface.

**Proposed Solution:** Enforce the enum for `completion_status` in the TypeScript interface. - **DONE**

**Rationale:** This ensures that the frontend only uses valid status values, aligning with the API definition.

**Impact:** Requires updating the TypeScript type definition for `QuizAttempt`.

**Testing and Validation:** After updating the TypeScript type definition, verify that the frontend code only uses valid status values.

## 20. Task (apiTypes) Discrepancies

### 20.1. Data Type Mismatch for `id` - DONE

**Issue:** The TypeScript interface uses `string` for `id`, while the API definition uses `integer` and specifies `readOnly: true`.

**Proposed Solution:** Update the TypeScript interface to use `number` for `id` and explicitly mark it as `readonly`. - **DONE**

**Rationale:** This aligns the frontend with the backend data structure.

**Impact:** Requires updating the TypeScript type definition for `Task`. May require changes to the frontend to ensure that components that use this interface fetch data using IDs instead of strings.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly fetches and updates task data using IDs.

---

### 20.2. Missing Constraints on `title` and `description` - DONE

**Issue:** The API definition includes constraints on `title` and `description` that are not present in the TypeScript interface.

**Proposed Solution:** Add the constraints to the TypeScript type definition for `title` and `description`. - **DONE**

**Rationale:** This ensures that the frontend validates user input according to the API's requirements, preventing invalid data from being sent to the backend.

**Impact:** Requires updating the TypeScript type definition for `Task`. May require changes to the frontend to implement the validation logic.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly validates user input for `title` and `description`.

---

### 20.3. Missing and Additional Properties - DONE

**Issue:** The TypeScript interface includes `status`, which is not present in the API definition. The API definition includes `course`, `order`, `is_published`, `created_at`, and `updated_at`, which are not present in the TypeScript interface.

**Proposed Solution:** Remove the `status` property from the TypeScript interface. Add the missing properties from the API definition to the TypeScript interface: `course`, `order`, `is_published`, `created_at`, and `updated_at`. - **DONE**

**Rationale:** This aligns the TypeScript interface with the API definition.

**Impact:** Requires updating the TypeScript type definition for `Task`. May require changes to the frontend to ensure that all required properties are handled correctly.

**Testing and Validation:** After updating the TypeScript type definition and frontend (if necessary), verify that the frontend correctly handles all the properties in the `Task` object.
