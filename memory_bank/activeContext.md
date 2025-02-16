# Active Context

## Current Task Status
- ✅ Authentication API tests passing
- ✅ JWT authentication configured
- ✅ Token validation implemented
- ✅ API documentation created

## Recent Changes
1. Fixed authentication configuration in settings.py:
   - Added proper JWT settings
   - Configured default authentication classes
   - Set up token blacklist support
2. Updated UserViewSet with proper authentication:
   - Added JWTAuthentication class
   - Improved permission handling
   - Fixed logout endpoint response

## Authentication API Documentation

### Base URL
```
/api/v1/auth/
```

### Endpoints

#### 1. Register
- **URL**: `register/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password2": "string",
    "display_name": "string",
    "role": "string"
}
```
- **Success Response**: `201 Created`
```json
{
    "user": {
        "username": "string",
        "email": "string",
        "display_name": "string"
    },
    "refresh": "string",
    "access": "string"
}
```

#### 2. Login
- **URL**: `login/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
    "username_or_email": "string",
    "password": "string"
}
```
- **Success Response**: `200 OK`
```json
{
    "user": {
        "username": "string",
        "email": "string"
    },
    "refresh": "string",
    "access": "string"
}
```

#### 3. Logout
- **URL**: `logout/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
    "refresh_token": "string"
}
```
- **Success Response**: `205 Reset Content`

#### 4. Password Reset
- **URL**: `password-reset/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
    "email": "string"
}
```
- **Success Response**: `200 OK`
```json
{
    "message": "Password reset link sent"
}
```

#### 5. Profile
- **URL**: `profile/`
- **Methods**: `GET`, `PATCH`
- **Auth Required**: Yes
- **Headers**:
```
Authorization: Bearer <access_token>
```
- **GET Response**: `200 OK`
```json
{
    "username": "string",
    "email": "string",
    "display_name": "string"
}
```
- **PATCH Request Body**:
```json
{
    "display_name": "string"
}
```
- **PATCH Response**: `200 OK`
```json
{
    "username": "string",
    "email": "string",
    "display_name": "string"
}
```

#### 6. Token Refresh
- **URL**: `token/refresh/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
    "refresh": "string"
}
```
- **Success Response**: `200 OK`
```json
{
    "access": "string"
}
```

### Authentication Flow

1. **Registration/Login**:
   - Call register or login endpoint
   - Store received tokens (refresh & access)

2. **Making Authenticated Requests**:
   - Add access token to Authorization header:
   ```
   Authorization: Bearer <access_token>
   ```

3. **Token Refresh**:
   - When access token expires, use refresh token to get new access token
   - If refresh fails, redirect to login

4. **Logout**:
   - Call logout endpoint with refresh token
   - Clear stored tokens

### Error Responses

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Token Lifetimes
- Access Token: 60 minutes
- Refresh Token: 24 hours

## Next Steps
1. Implement frontend authentication flow using the API
2. Add error handling and token refresh logic
3. Create protected route wrapper components
4. Implement user session management