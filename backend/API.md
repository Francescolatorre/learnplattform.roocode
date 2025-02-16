# Authentication API Documentation

## Base URL
```
/api/v1/auth/
```

## Authentication
Most endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Register
Create a new user account.

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
- **Error Response**: `400 Bad Request`
```json
{
    "username": ["Username is already taken"],
    "email": ["Invalid email format"],
    "password": ["Passwords do not match"]
}
```

### 2. Login
Authenticate a user and receive tokens.

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
- **Error Response**: `401 Unauthorized`
```json
{
    "detail": "Invalid credentials"
}
```

### 3. Logout
Invalidate a refresh token.

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
- **Error Response**: `400 Bad Request`
```json
{
    "detail": "Invalid token"
}
```

### 4. Password Reset
Request a password reset email.

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
- **Error Response**: `400 Bad Request`
```json
{
    "email": ["User with this email does not exist"]
}
```

### 5. Profile
Manage user profile information.

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
- **Error Response**: `401 Unauthorized`
```json
{
    "detail": "Authentication credentials were not provided"
}
```

### 6. Token Refresh
Get a new access token using a refresh token.

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
- **Error Response**: `401 Unauthorized`
```json
{
    "detail": "Token is invalid or expired"
}
```

## Implementation Guide

### Authentication Flow

1. **Initial Authentication**:
   - Register a new user or login with existing credentials
   - Store received tokens securely (e.g., in localStorage or secure cookie)
   - Use access token for subsequent requests

2. **Making Authenticated Requests**:
   ```javascript
   const headers = {
     'Authorization': `Bearer ${accessToken}`,
     'Content-Type': 'application/json'
   };
   
   fetch('/api/v1/auth/profile/', {
     headers: headers
   });
   ```

3. **Token Refresh Flow**:
   ```javascript
   async function refreshToken() {
     const response = await fetch('/api/v1/auth/token/refresh/', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         refresh: refreshToken
       })
     });
     
     if (response.ok) {
       const data = await response.json();
       // Store new access token
       return data.access;
     } else {
       // Token refresh failed, redirect to login
       window.location.href = '/login';
     }
   }
   ```

4. **Logout Flow**:
   ```javascript
   async function logout() {
     await fetch('/api/v1/auth/logout/', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         refresh_token: refreshToken
       })
     });
     
     // Clear stored tokens
     localStorage.removeItem('accessToken');
     localStorage.removeItem('refreshToken');
   }
   ```

### Error Handling

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Token Lifetimes
- Access Token: 60 minutes
- Refresh Token: 24 hours

### Security Considerations

1. Store tokens securely
2. Implement token refresh before expiration
3. Clear tokens on logout
4. Use HTTPS for all requests
5. Validate token expiration
6. Handle authentication errors gracefully