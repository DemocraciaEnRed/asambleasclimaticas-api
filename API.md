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