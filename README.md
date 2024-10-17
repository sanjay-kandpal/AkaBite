# Akabite

Akabite is a food ordering application built using the MERN stack (MongoDB, Express.js, React, Node.js) with Tailwind CSS for styling.

## Features

- User Registration and Login
- JWT Authentication
- Home Screen with Food Items
- Item Details Page
- Shopping Cart
- Checkout Process
- Order History

## Tech Stack

- MongoDB: Database
- Express.js: Node.js Framework
- React: Frontend Library
- Node.js: Backend Runtime
- Tailwind CSS: Styling Framework
- JWT: Authentication and Authorization

## Installation and Setup

1. Clone the repository:
   git clone <repository-url>
2. Navigate to the client directory and install dependencies:
   cd client
   npm install
3. Navigate to the server directory and install dependencies:
   cd ../server
   npm install
4. Set up environment variables:
  - Client (.env file in client directory):
    ```
    REACT_APP_API_URL=<backend-url>
    ```
  - Server (.env file in server directory):
    ```
    MONGODB_URI=<your-mongodb-uri>
    FRONTEND_URL=<your-frontend-url>
    REFRESH_TOKEN=<your-refresh-token>
    PORT=<port-number>
    JWT_SECRET=<your-jwt-secret>
    ```
5. Start the server:
6. Start the client:
   cd client
   npm start
## Note

The application includes a dummy item automation file for fetching food items. Please note that the photos may not align perfectly with the food items.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
   
