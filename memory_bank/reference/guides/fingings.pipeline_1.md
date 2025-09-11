Run npm run lint

> learnplatform-frontend@1.0.0 lint
> eslint . --ext .ts,.tsx,.js,.jsx

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/App.tsx
Error:   6:27  error  Unexpected use of file extension "tsx" for "@components/navigation/NavigationBar.tsx"  import/extensions

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/ForgotPasswordForm.tsx
Error:   54:42  error  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/Notifications/NotificationDemo.test.tsx
Error:   7:15  error  'NotificationContextType' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/Notifications/NotificationProvider.test.tsx
Error:    75:21  error  Component definition is missing display name  react/display-name
Error:   108:21  error  Component definition is missing display name  react/display-name
Error:   132:21  error  Component definition is missing display name  react/display-name

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/Notifications/NotificationProvider.tsx
Error:   83:9  error  'queue' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/Notifications/NotificationSystem.integration.test.tsx
Error:   1:31  error  'fireEvent' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/Notifications/NotificationSystem.test.tsx
Warning:   161:10  warning  React Hook React.useEffect has a missing dependency: 'notifyError'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/Notifications/NotificationToast.test.tsx
Error:   116:5  error  Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free  @typescript-eslint/ban-ts-comment

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/Notifications/NotificationToast.tsx
Warning:   38:23  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   39:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/__tests__/DashboardCourseCard.test.tsx
Error:   1:18  error  'fireEvent' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/common/NoCoursesMessage.tsx
Error:    9:16  error  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities
Error:   12:47  error  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/courses/CourseCard.tsx
Error:   37:59  error  'isInstructorView' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/courses/CourseCreation.tsx
Error:    15:8   error    'useNotification' is defined but never used  @typescript-eslint/no-unused-vars
Error:    16:10  error    'courseService' is defined but never used    @typescript-eslint/no-unused-vars
Warning:   148:20  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
Warning:   217:24  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/courses/CourseEnrollment.test.tsx
Error:   46:1  error  `@tanstack/react-query` import should occur before import of `@testing-library/react`  import/order

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/courses/CourseEnrollment.tsx
Error:   188:52  error  `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`  react/no-unescaped-entities
Error:   188:67  error  `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`  react/no-unescaped-entities

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/courses/CourseList.tsx
Warning:   284:65  warning  Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
Error:   457:56  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`  react/no-unescaped-entities
Error:   457:80  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`  react/no-unescaped-entities

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/courses/CourseListView.test.tsx
Error:   3:10  error  'BrowserRouter' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/courses/FilterableCourseList.tsx
Error:   41:3  error  'initialCourses' is defined but never used              @typescript-eslint/no-unused-vars
Error:   44:3  error  'filterPredicate' is assigned a value but never used    @typescript-eslint/no-unused-vars
Error:   49:3  error  'showCreatorFilter' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/dashboards/StudentDashboard.tsx
Error:   48:9  error  'courseProgress' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/navigation/NavigationBar.tsx
Error:   20:27  error  'useEffect' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/shared/InfoCard.tsx
Error:   18:46  error  'title' is missing in props validation     react/prop-types
Error:   18:53  error  'children' is missing in props validation  react/prop-types

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/shared/MarkdownEditor.tsx
Error:   267:22  error  Comments inside children section of tag should be placed inside braces  react/jsx-no-comment-textnodes
Error:   270:20  error  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`         react/no-unescaped-entities
Error:   270:32  error  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`         react/no-unescaped-entities

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/components/shared/MarkdownRenderer.tsx
Error:     7:1   error    `@mui/material` import should occur before import of `react`                   import/order
Error:     8:1   error    `@mui/system` import should occur before import of `react`                     import/order
Error:     9:1   error    `react-markdown` type import should occur before import of `rehype-highlight`  import/order
Warning:    42:10  warning  Unexpected any. Specify a different type                                       @typescript-eslint/no-explicit-any
Warning:    46:18  warning  Unexpected any. Specify a different type                                       @typescript-eslint/no-explicit-any
Error:   229:27  error    'href' is defined but never used                                               @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/config/menuConfig.ts
Error:   10:16  error    'ExitToAppIcon' is defined but never used  @typescript-eslint/no-unused-vars
Warning:   23:9   warning  Unexpected any. Specify a different type   @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/context/auth/AuthContext.tsx
Warning:    41:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   240:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   269:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/context/auth/AuthInterceptor.tsx
Error:    6:10  error  'AUTH_CONFIG' is defined but never used     @typescript-eslint/no-unused-vars
Error:   32:3   error  'onRefreshToken' is defined but never used  @typescript-eslint/no-unused-vars
Error:   33:3   error  'getAccessToken' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/hooks/useApiErrors.ts
Warning:   89:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/auth/LoginPage.tsx
Error:    6:10  error  'TUserRole' is defined but never used             @typescript-eslint/no-unused-vars
Error:   34:39  error  'getUserRole' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/auth/ResetPasswordForm/ResetPasswordForm.tsx
Error:   34:5  error  'watch' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/courses/InstructorCourseDetailsPage.test.tsx
Error:   16:1   error  `@tanstack/react-query` import should occur before import of `@testing-library/react`  import/order
Error:   63:30  error  'courseId' is defined but never used                                                   @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/courses/InstructorCourseDetailsPage.tsx
Error:   52:9  error  'navigate' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/courses/InstructorCoursesPage.test.tsx
Error:   2:26  error  'act' is defined but never used                        @typescript-eslint/no-unused-vars
Error:   2:31  error  'waitFor' is defined but never used                    @typescript-eslint/no-unused-vars
Error:   2:40  error  'waitForElementToBeRemoved' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/courses/InstructorEditCoursePage.tsx
Error:    57:26  error    'isValid' is assigned a value but never used  @typescript-eslint/no-unused-vars
Warning:    83:22  warning  Unexpected any. Specify a different type      @typescript-eslint/no-explicit-any
Warning:   142:22  warning  Unexpected any. Specify a different type      @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/courses/StudentCourseDetailsPage.test.tsx
Error:    9:10  error  'MemoryRouter' is defined but never used                   @typescript-eslint/no-unused-vars
Error:   15:10  error  'IUser' is defined but never used                          @typescript-eslint/no-unused-vars
Error:   15:17  error  'UserRoleEnum' is defined but never used                   @typescript-eslint/no-unused-vars
Error:   67:7   error  'mockEnrollmentStatus' is assigned a value but never used  @typescript-eslint/no-unused-vars
Error:   72:67  error  'id' is defined but never used                             @typescript-eslint/no-unused-vars
Error:   75:65  error  'id' is defined but never used                             @typescript-eslint/no-unused-vars
Error:   83:74  error  'id' is defined but never used                             @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/courses/StudentCourseDetailsPage.tsx
Error:    57:16  error    'isEnrollmentLoading' is assigned a value but never used                                                        @typescript-eslint/no-unused-vars
Error:    58:12  error    'enrollmentError' is assigned a value but never used                                                            @typescript-eslint/no-unused-vars
Warning:   101:6   warning  React Hook useMemo has an unnecessary dependency: 'courseId'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/instructor/InstructorDashboardPage.tsx
Error:    12:3   error  'Divider' is defined but never used                              @typescript-eslint/no-unused-vars
Error:   186:24  error  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/learningTasks/CourseLearningTasksPage.tsx
Error:   264:17  error  'id' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/pages/learningTasks/TaskListPage.tsx
Error:   5:1   error  There should be at least one empty line between import groups                                       import/order
Error:   6:1   error  `src/types/task` import should occur before import of `src/services/resources/learningTaskService`  import/order
Error:   6:31  error  Unable to resolve path to module 'src/types/task'                                                   import/no-unresolved

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/routes/AppRoutes.tsx
Error:   24:1  error  There should be no empty line within import group  import/order

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/api/apiService.test.ts
Error:   1:8  error  'axios' is defined but never used                  @typescript-eslint/no-unused-vars
Error:   4:1  error  There should be no empty line within import group  import/order

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/api/apiService.ts
Warning:     9:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:    10:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:    12:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:    62:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:    95:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   132:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/api/axiosConfig.ts
Warning:   25:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   33:52  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/auth/authService.test.ts
Error:   35:1  error  `axios` import should occur before import of `vitest`  import/order

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/auth/authService.ts
Error:    12:11  error    'LoginResponse' is defined but never used  @typescript-eslint/no-unused-vars
Error:    20:11  error    'RegisterData' is defined but never used   @typescript-eslint/no-unused-vars
Error:   176:16  error    'error' is defined but never used          @typescript-eslint/no-unused-vars
Warning:   205:78  warning  Unexpected any. Specify a different type   @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/resources/courseService.ts
Warning:    55:76  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   241:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   250:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   251:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   252:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   253:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/resources/enrollmentService.int.test.ts
Error:   136:12  error  'useInstructorAuth' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/resources/enrollmentService.test.ts
Error:   77:50  error  'mockDelete' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/resources/enrollmentService.ts
Warning:    37:18  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:    64:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   280:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   308:23  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   309:23  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/resources/learningTaskService.int.test.ts
Error:   24:7  error  'userId' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/resources/learningTaskService.ts
Error:   70:16  error  'err' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/resources/progressService.int.test.ts
Error:   23:7  error  'userId' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/services/resources/progressService.ts
Warning:   374:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   377:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/test-utils/factories/progressFactory.ts
Error:   12:6  error  'sequence' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/test-utils/setupTests.ts
Error:     2:1   error    There should be no empty line within import group                                                                                                                                                                                                                                                                                                                                          import/order
Error:    24:1   error    Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free                                                                                                                                                                                                                                                                        @typescript-eslint/ban-ts-comment
Error:    30:1   error    `react` import should occur before import of `vitest`                                                                                                                                                                                                                                                                                                                                      import/order
Error:    31:1   error    `@testing-library/react` import should occur before import of `vitest`                                                                                                                                                                                                                                                                                                                     import/order
Error:    36:1   error    Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free                                                                                                                                                                                                                                                                        @typescript-eslint/ban-ts-comment
Error:    58:26  error    A `require()` style import is forbidden                                                                                                                                                                                                                                                                                                                                                    @typescript-eslint/no-require-imports
Warning:    98:44  warning  Unexpected any. Specify a different type                                                                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-explicit-any
  104:72  error    The `{}` ("empty object") type allows any non-nullish value, including literals like `0` and `""`.

- If that's what you want, disable this lint rule with an inline comment or configure the 'allowObjectTypes' rule option.
- If you want a type meaning "any object", you probably want `object` instead.
- If you want a type meaning "any value", you probably want `unknown` instead  @typescript-eslint/no-empty-object-type
Warning:   114:27  warning  Unexpected any. Specify a different type                                                                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/types/progress.ts
Warning:   140:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   148:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/utils/debug.ts
Warning:   1:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/utils/errorHandling.test.ts
Error:   202:16  error  'e' is defined but never used  @typescript-eslint/no-unused-vars
Error:   247:16  error  'e' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/learnplattform.roocode/learnplattform.roocode/frontend/src/utils/errorHandling.ts
Warning:   170:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Warning:   170:77  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 131 problems (86 errors, 45 warnings)
  2 errors and 0 warnings potentially fixable with the `--fix` option.

Error: Process completed with exit code 1.
