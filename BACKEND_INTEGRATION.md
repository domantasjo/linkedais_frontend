# Backend Integration Guide

This document describes the backend API endpoints required for each frontend feature. All endpoints expect a `Bearer` token in the `Authorization` header (obtained at login via `/api/auth/login`).

Base URL: `http://localhost:8080`

---

## 1. Feature: Post Comments (`feature/post-comments`)

### Endpoints Required

#### GET `/api/posts/{postId}/comments`
Fetch all comments for a specific post.

- **Auth:** Required (`Bearer` token)
- **Response:** `200 OK`
```json
[
  {
    "id": 1,
    "postId": 10,
    "authorId": 5,
    "authorName": "Jonas Jonaitis",
    "content": "Puikus įrašas!",
    "createdAt": "2025-03-19T10:30:00"
  }
]
```

#### POST `/api/posts/{postId}/comments`
Create a new comment on a post.

- **Auth:** Required
- **Request Body:**
```json
{
  "content": "Puikus įrašas!"
}
```
- **Response:** `201 Created` — returns the created comment object (same shape as above)
- **Side Effect:** The backend should send a notification to the post author and to any users who have previously commented on the same post (for reply notifications).

#### PUT `/api/posts/{postId}/comments/{commentId}`
Edit an existing comment. Only the comment author should be allowed to edit.

- **Auth:** Required
- **Request Body:**
```json
{
  "content": "Atnaujintas komentaras"
}
```
- **Response:** `200 OK` — returns the updated comment object
- **Validation:**
  - `content` must not be empty
  - Only the comment author can edit (return `403 Forbidden` otherwise)

#### DELETE `/api/posts/{postId}/comments/{commentId}`
Delete a comment. Only the comment author should be allowed to delete.

- **Auth:** Required
- **Response:** `204 No Content`
- **Validation:** Only the comment author can delete (return `403 Forbidden` otherwise)

### Notification System

When a comment is added to a post, the backend should:
1. Notify the **post author** that someone commented on their post.
2. Notify **other commenters** on the same post that there is a new reply.
3. Do NOT notify the comment author themselves.

Suggested notification model:
```json
{
  "id": 1,
  "userId": 5,
  "type": "COMMENT_REPLY",
  "message": "Jonas Jonaitis atsakė į jūsų komentarą",
  "postId": 10,
  "commentId": 22,
  "read": false,
  "createdAt": "2025-03-19T10:35:00"
}
```

---

## 2. Feature: Edit Profile (`feature/edit-profile`)

### Endpoints Required

#### GET `/api/user/profile`
Fetch the authenticated user's profile. **Already exists**, but needs to be extended to return additional fields.

- **Auth:** Required
- **Response:** `200 OK`
```json
{
  "id": 5,
  "name": "Petras Petraitis",
  "email": "petras@ktu.lt",
  "bio": "Stropus studentas besidomintis programavimu.",
  "university": "Kauno technologijos universitetas",
  "studyProgram": "Programų sistemos",
  "skills": ["Java", "React", "Python"]
}
```

#### PUT `/api/user/profile`
Update the authenticated user's profile. **Replaces** the old `PUT /api/user/profile/name` endpoint with a single comprehensive update.

- **Auth:** Required
- **Request Body:**
```json
{
  "name": "Petras Petraitis",
  "bio": "Atnaujinta biografija.",
  "university": "Kauno technologijos universitetas",
  "studyProgram": "Programų sistemos",
  "skills": ["Java", "React", "Python", "Docker"]
}
```
- **Response:** `200 OK` — returns the full updated profile object (same shape as GET response)
- **Validation:**
  - `name` is required, must not be empty, minimum 2 characters
  - `bio` is optional, max 500 characters
  - `university` is optional, max 200 characters
  - `studyProgram` is optional, max 200 characters
  - `skills` is optional, array of strings, max 20 items, each max 50 characters

### Database Changes

The `User` entity/table needs new columns:
- `bio` — `TEXT` or `VARCHAR(500)`, nullable
- `university` — `VARCHAR(200)`, nullable
- `study_program` — `VARCHAR(200)`, nullable
- `skills` — stored as a JSON array or in a separate `user_skills` join table

---

## 3. Feature: Search Users (`feature/search-users`)

### Endpoints Required

#### GET `/api/users/search?name={query}`
Search for users by name (partial, case-insensitive match).

- **Auth:** Required
- **Query Parameters:**
  - `name` (string, required) — the search query
- **Response:** `200 OK`
```json
[
  {
    "id": 5,
    "name": "Petras Petraitis",
    "studyProgram": "Programų sistemos"
  },
  {
    "id": 12,
    "name": "Petra Jonauskaitė",
    "studyProgram": "Informatika"
  }
]
```
- **Behavior:**
  - Return users whose `name` contains the query string (case-insensitive, e.g., SQL `ILIKE '%query%'`)
  - Limit results to 20 users max
  - Do NOT return the authenticated user themselves in results
  - Return an empty array if no matches

#### GET `/api/users/{userId}`
Fetch a specific user's public profile by their ID.

- **Auth:** Required
- **Response:** `200 OK`
```json
{
  "id": 5,
  "name": "Petras Petraitis",
  "email": "petras@ktu.lt",
  "bio": "Stropus studentas besidomintis programavimu.",
  "university": "Kauno technologijos universitetas",
  "studyProgram": "Programų sistemos",
  "skills": ["Java", "React", "Python"]
}
```
- **Error:** `404 Not Found` if user does not exist

---

## Summary of All New Backend Endpoints

| Method | Endpoint | Feature | Description |
|--------|----------|---------|-------------|
| GET | `/api/posts/{postId}/comments` | post-comments | List comments for a post |
| POST | `/api/posts/{postId}/comments` | post-comments | Create a comment |
| PUT | `/api/posts/{postId}/comments/{commentId}` | post-comments | Edit a comment |
| DELETE | `/api/posts/{postId}/comments/{commentId}` | post-comments | Delete a comment |
| GET | `/api/user/profile` | edit-profile | Get own profile (extend response) |
| PUT | `/api/user/profile` | edit-profile | Update own profile |
| GET | `/api/users/search?name={query}` | search-users | Search users by name |
| GET | `/api/users/{userId}` | search-users | Get a user's public profile |

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

The token is obtained from the existing `POST /api/auth/login` endpoint and stored in `localStorage` under the key `"token"`.
