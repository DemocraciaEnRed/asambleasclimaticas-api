# API documentation

* `POST /auth/register`
* `POST /auth/resend`
* `GET /auth/verify/:token`
* `POST /auth/forgot`
* `POST /auth/reset/:token`
* `POST /auth/login`
* `GET /auth/logged`
* `GET /user/me`
* `GET /user`
* `GET /country`

```
routes/auth.js
// POST 	/auth/register
// POST 	/auth/resend
// GET 		/auth/verify/:token
// POST 	/auth/forgot
// POST 	/auth/reset/:token
// POST 	/auth/login
// GET 		/auth/logged

routes/user.js
// GET 		/user/me
// GET 		/user/:userId

routes/misc.js
// GET 		/misc/countries

routes/admin/index.js
// GET 		/admin/users
// GET 		/admin/users/:userId

// GET 		/projects
// POST 	/projects
// GET 		/projects/:projectId
// PUT 		/projects/:projectId
// POST 	/projects/:projectId/publish
// POST 	/projects/:projectId/hide
// POST 	/projects/:projectId/like
// POST 	/projects/:projectId/dislike

routes/projects/events/index.js
// GET 		/projects/:projectId/events
// POST 	/projects/:projectId/events
// DELETE 	/projects/:projectId/events/:eventId

routes/projects/versions/index.js
// POST 	/projects/:projectId/versions
// GET 		/projects/:projectId/versions/:version
// GET		/projects/:projectId/versions/:version/comments
// GET		/projects/:projectId/versions/:version/comments/:commentId/replies
// GET 		/projects/:projectId/versions/:version/articles
// GET		/projects/:projectId/versions/:version/articles/:articleId/comments
// POST		/projects/:projectId/versions/:version/articles/:articleId/comments/:commentId/replies

routes/projects/comments/index.js
// GET 		/projects/:projectId/comments
// POST 	/projects/:projectId/comments
// DELETE 	/projects/:projectId/comments/:commentId
// POST 	/projects/:projectId/comments/:commentId/like
// POST 	/projects/:projectId/comments/:commentId/dislike
// GET		/projects/:projectId/comments/:commentId/replies
// POST 	/projects/:projectId/comments/:commentId/replies
// POST 	/projects/:projectId/comments/:commentId/replies/:replyId/like
// POST 	/projects/:projectId/comments/:commentId/replies/:replyId/dislike

routes/projects/articles/index.js
// GET 		/projects/:projectId/articles
// POST		/projects/:projectId/articles/:articleId/like
// POST		/projects/:projectId/articles/:articleId/dislike

routes/projects/articles/comments/index.js
// GET 		/projects/:projectId/articles/:articleId/comments
// POST 	/projects/:projectId/articles/:articleId/comments
// DELETE 	/projects/:projectId/articles/:articleId/comments/:commentId
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/like
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/dislike
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/resolve
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/highlight
// GET 		/projects/:projectId/articles/:articleId/comments/:commentId/replies
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/replies
// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/like
// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/dislike
// DELETE	/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/delete
```



## Endpoints

| Method | Path | Description | Status |
|--------|------|-------------| ------ |
| `POST` | `/auth/register` | Register a new user | OK |


```json
// Body example
{
	"email": "user1@democracyos.io",
	"name":	"Michael Tomasky",
	"password": "**************",
	"country": "xxxx" // ObjectID of a country
	"lang": "es",
}
```

| Method | Path | Description | Status |
|--------|------|-------------| ------ |
| `POST` | `/auth/resend` | Resend verification email | OK |
  
```json
// Body example
{
	"email": "user1@democracyos.io"
}
```
---

| Method | Path | Description | Status |
|--------|------|-------------| ------ |
| `GET` | `/auth/verify/:token` | Verify user email | OK |

---

| Method | Path | Description | Status |
|--------|------|-------------| ------ |
| `POST` | `/auth/forgot` | Send email to reset password | OK |

```json
// Body example
{
  "email": "user1@democracyos.io"
}
```
---

| Method | Path | Description | Status |
|--------|------|-------------| ------ |
| `POST` | `/auth/reset/:token` | Reset user password | OK |

```json
{
	"password": "************",
	"confirmPassword": "************",
}
```
---

| Method | Path | Description | Status |
|--------|------|-------------| ------ |
| `POST` | `/auth/login` | Login user | OK |

```json
{
	"email": "user1@democracyos.io",
	"password": "************"
}
```

---

| Method | Path | Description | Status | Auth |
|--------|------|-------------| ------ | ---- |
| `GET` | `/auth/logged` | Check if user is logged | OK | Required. |

If the user is logged in, it returns a 200 with the user data.
If it doesnt, it returns 200, but empty body.

---

| Method | Path | Description | Status | Auth |
|--------|------|-------------| ------ | ---- |
| `GET` | `/user/me` | Get "my" user data | OK | Required. |

If the user is logged in, it returns a 200 with the user data. If not, it returns 401.

---

| Method | Path | Description | Status | Auth |
|--------|------|-------------| ------ | ---- |
| `GET` | `/user` | Get paginated users | OK | Required. Roles: ADMIN |

It returns a list of users, paginated. If the user is not an admin, it returns 401.

---
| Method | Path | Description | Status | Auth |
|--------|------|-------------| ------ | ---- |
| `GET` | `/country` | Get all the available countries | OK | None |

It returns a list of countries, neccesary for the sign up process.