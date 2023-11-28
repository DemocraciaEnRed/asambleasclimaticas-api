# Asambleas Climaticas API
--

Requires:

- NodeJS +16
- ExpressJS 4+
- Mongo3.6 **(tested)**
- Mongoose ORM 7+
- AgendaJs
- Nodemailer
- PassportJs with JWT

## Install

Before doing anything, make a copy of the `env.dist` file and rename it to `.env`. Then, fill in the values with the correct ones. Here is an example:

```bash
MONGODB_URL=mongodb://localhost:27017/ac_dev #make changes here as you need
JWT_SECRET=THisIsMySecretKey!
PORT=3000
MAILER_FROM=organization@MAIL.com
MAILER_HOST=sandbox.smtp.mailtrap.io
MAILER_PORT=2525
MAILER_USER=#user
MAILER_PASSWORD=#pass
```
After that just run:

```bash
npm install
```

## Start dev server

The dev server will watch for changes in the code and restart the server automatically. You can start the server like this:

```bash
npm run dev
```
Some function inside the app are scheduled to run at specific times, thanks to Agenda.js. Because we would like to run the agenda outside the main thread, we need to run it in a separate process. To do so, we need to open another terminal and run the agenda process:


##### Run the queue process
  
```bash
npm run queue
```

## Authentication and User Roles

There are 4 roles for users
- `user`
- `moderator`
- `author`
- `admin`

## API documentation

Check out the API documentation by clicking [here](API.md).

We will be updating the documentation as we go.