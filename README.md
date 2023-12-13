# USOF BACKEND _DOOR IS FORUM API_

[Postman collection for testing API](https://documenter.getpostman.com/view/27994867/2s9YkjANjN)

# How to run:

> To run API , firstly clone my repository with API using `git clone https://github.com/BigTako/USOF-Back-End.git`.
> Then run command `npm install` in cloned project root directory to install all necessary packages.
> Next it's required to configure a database, for that install latest version of PostgreSQL(http://postgresql.org/download/) to your computer.
> When it's done, use comfortable DB working program(i use https://dbeaver-io.translate.goog/?_x_tr_sl=en&_x_tr_tl=uk&_x_tr_hl=uk&_x_tr_pto=sc) and create new PostgreSQL connection.
> Be attentive to set DB name to `usof-backed-db` and password to `root` as it's writen in `config/db.config.js` file. If you want to change settings, just remember also to change them in config file.
> Finally, run command `npm run start:dev` which will launch project in DEV mode.

# Endpoints:

> [Auth Module](#Auth-Module)
>
> [User Module](#User-Module)
>
> [Me](#Current-User-Module)
>
> [Post Module](#Post-Module)
>
> [Categories Module](#Categories-Module)
>
> [Comments Module](#Comments-Module)

# Auth Module

### Sign Up

POST`http://127.0.0.1:3000/api/v1/auth/signup`

Body parameters:

- fullName
- login
- email
- password
- passwordConfirm

### Login

POST`http://127.0.0.1:3000/api/v1/auth/login`

Body parameters:

- email
- password

### Logout

POST`http://127.0.0.1:3000/api/v1/auth/logout`

Logout from current session

### Send Password Reset

POST`http://127.0.0.1:3000/api/v1/auth/forgotPassword`

Body parameters:

- email - which account is signed up on(link will be sent there)

### Password Reset Confirm

POST`http://127.0.0.1:3000/api/v1/auth/resetPassword/:token`

Body parameters:

- password
- passwordConfirm

Rest password to new one

# User Module

### Get All Users (some routes ADMIN only protected)

GET `http://127.0.0.1:3000/api/v1/users`
**This feature only for users with admin role**

Simply returns all users data, and also you can search among them, using query.

For example:

- get user with login 'aaa123' : GET`http://localhost:3001/api/users?login=aaa123`, you can set any user field you want
- sort users by createdAt field desc GET`http://localhost:3001/api/users?sort=createdAt&order=desc`
- limit count of documents in responce to 4 GET`http://localhost:3001/api/users?limit=4`
- receive documents from server by groups(paginate) GET`http://localhost:3001/api/users?limit=4&page=1`

### Get User By ID

GET`http://127.0.0.1:3000/api/v1/users/:id`
**This feature only for users with admin role**

Where id is user_id

### Create User

POST`http://127.0.0.1:3000/api/v1/users`
**This feature only for users with admin role**

Body parameters:

- profilePicture (optional)
- fullName
- login
- email
- password
- passwordConfirm

### Update User

PATCH`http://127.0.0.1:3000/api/v1/users/:id`
**This feature only for users with admin role**

Body parameters(all fields are optional):

- profilePicture (optional)
- fullName
- login
- email

Password updates are not allowed here

### Delete User

DELETE`http://127.0.0.1:3000/api/v1/users`
**This feature only for users with admin role**

Delete user account(Hard delete)

### Get user rating

GET`http://127.0.0.1:3000/api/v1/users/rating/:id`

Get rating of user by id

# Current user(me) Module

**For authenticated users only**

### Get current user data

GET`http://127.0.0.1:3000/api/v1/users/me`

### Update current user data

PATCH`http://127.0.0.1:3000/api/v1/users/me`

Body parameters(all fields are optional):

- profilePicture (optional)
- fullName
- login
- email

### Update current user password

PATCH`http://127.0.0.1:3000/api/v1/users/updatePassword`

Body parameters:

- passwordCurrent
- password
- passwordConfirm

### Deactivate current user account

DELETE`http://127.0.0.1:3000/api/v1/users/me`

Delete current user account(Soft delete)

### Get posts, published by current user

GET`http://127.0.0.1:3000/api/v1/posts/me`

Get posts, published by current user (supports query selection)

# Post Module

### Get All Posts

GET`http://127.0.0.1:3000/api/v1/posts/`

Supports query selection fiels:

- example `http://127.0.0.1:3000/api/v1/posts/?sort=title&order=desc&limit=2&fields=id,likesCount&page=2&likesCount[gt]=-1&categories[cont]=1&title=How to use bootstrap with reactjs`

Here:

> fields = use `fields` parameter to select only defined fields in each of returned documents.
> sort - use `sort` parameter to sort by any field of Post model `sort=field`.
> order - use `order` parameter to change order of sorting `order=asc|desc`, `asc` by default.
> limit - use `limit` parameter to limit the number of posts to be returned.
> page - use `page` to divide returned docs into groups(size of group defined by `limit`).
> Any other fields will be considered as 'filters' , you can user them by passing `field[operator]=value`.
> Operators are:
> `[gt]` - greater than value(Number fields)
> `[lt]` - less than value(Number fields)
> `[gte]` - greater that or equal to value(Number fields)
> `[lte]` - less than or equal to value(Number fields)
> `[cont]` - `field` as it Array, contains every element from `value`(also Array).

### Get Post By ID

GET`http://127.0.0.1:3000/api/v1/posts/:id`

Where id is post_id

### Get All Comments Under Post

GET`http://127.0.0.1:3000/api/v1/comments/post/:id`

Where id is post_id

### Get All Likes Under Post

GET`http://127.0.0.1:3000/api/v1/likes/post/:id`

Where id is post_id

### Create Post

POST`http://127.0.0.1:3000/api/v1/posts`

You can create new post, body parameters:

- title - title of post
- content - content of post
- categories - categories of post, passing by number of category_id, you can pass one category and also array of categories, like `"categories": [1, 4]`

### Create Like Under Post

POST`http://127.0.0.1:3000/api/v1/likes`

- type - like or dislike
- entity - can be 'post' or 'comment'(now 'post')
- entity_id - id or post wanted to be liked

> Remember, to delete like from post, just create like with same type on same post twice.

### Create Comment Under Post

POST`http://127.0.0.1:3000/api/v1/comments`

Body parameters:

- content
- entity_id: `postId`
- entity: post

### Update Post

PATCH`http://127.0.0.1:3000/api/v1/posts/:id`

Body parameters(all are optional)

- title - title of post
- content - content of post
- categories - categories of post, passing by number of category_id, you can pass one category and also array of categories, like `"categories": [1, 4]`

### Delete Post

DELETE`http://127.0.0.1:3000/api/v1/posts/:id`

Where id is post_id

# Categories Module

### Get All Categories

GET`http://127.0.0.1:3000/api/v1/categories`

### Get Category By ID

GET`http://127.0.0.1:3000/api/v1/categories/:id`

Where id is category_id

### Get All Posts By Category

GET`http://127.0.0.1:3000/api/v1/posts/?categories[cont]=category`

Query parameters:

- category - id of the category

### Create Category

POST`http://127.0.0.1:3000/api/v1/categories`

Body parameters:

- title
- description(optional)

### Update Category

POST`http://127.0.0.1:3000/api/v1/categories/:id`

Where id is category_id
Body parameters(all are optional):

- title
- description

### Delete Category

DELETE`http://127.0.0.1:3000/api/v1/categories/:id`

Where id is category_id

# Comments Module

### Get Comment By ID

GET`http://127.0.0.1:3000/api/v1/comments/:id`

Where id is comment_id

### Get Likes Under Comment

GET`http://localhost:3001/api/comments/:id/like`

Where id is comment_id

### Create Like Under Comment

POST`http://127.0.0.1:3000/api/v1/likes/comment/:id`

Where id is comment_id

### Update Comment

PATCH`http://127.0.0.1:3000/api/v1/comments/:id`

Where id is comment_id
Body parameters:

- status: active|unactive|locked

### Delete Comment

DELETE`http://127.0.0.1:3000/api/v1/comments/:id`

Where id is comment_id

### Delete Like Under Comment

POST`http://127.0.0.1:3000/api/v1/likes/comment/:id`

Where id is comment_id

> Made by @BigTako
