# Settyl Assignment API

API developed for real time bidding web application. 

## Table of Contents

- [Introduction](#introduction)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [WebSocket](#websocket)
- [Authentication](#authentication)
- [Examples](#examples)

## Introduction
A real time auction app with API integration.
The deployed link is : [https://settylapi.onrender.com/](https://settylapi.onrender.com/)

## Technologies

List the main technologies or libraries used in your project.

- Node.js
- Express.js
- MongoDB
- WebSocket
- Mongoose
- Bcrypt.js
- JWT

## Getting Started

Instructions to setup for the server

### Installation

Clone the repository:

   ```bash
   https://github.com/mank-423/settylapi
   ```

### Runing the server

```bash
cd settylapi
npm install
npm start
```

## API Endpoints
- POST /api/register : Register a new user.
- POST /api/login : Log in an existing user.
- POST /api/items : Add a new item.
- GET /api/items/:id : Get items associated with a specific user.
- PUT /api/items/:id/close-bidding : Close bidding for a specific item.
- POST /api/items/:itemId/bid : Place a bid on a specific item.
- GET /api/transactions/:username : Get transactions for a specific user.
- GET /api/items : Get all items.

## WebSocket
Web sockets used for the chat purpose for every product, and is broadcasted to every user.

## Authentication
Using JWT token, for login purpose and the user is stored in localStorage. And the token is fetched to use for login purpose.

## Examples
- Only API which is accessible without token and username
<img width="960" alt="image" src="https://github.com/mank-423/settylapi/assets/96490105/0dda477b-e86c-458d-891a-7b91de3056ff">

- Other API endpoints need the JWT token, and username for the item.
