# UTI — Unified Transport Interface

A MERN-stack transportation and logistics platform designed to connect senders, receivers, drivers, and truck owners through a unified digital interface.

UTI aims to simplify goods transportation by bringing shipment creation, shipment discovery, driver assignment, delivery tracking, and fleet management into one platform.

## Overview

Traditional goods transportation often involves disconnected communication between customers, drivers, and truck owners. UTI addresses this problem by providing a centralized platform where different stakeholders can manage their transportation activities.

Senders can create shipment requests, drivers can discover and accept eligible shipments, receivers can track their deliveries, and truck owners can manage their vehicles and monitor transportation activities.

## Stakeholders

UTI supports four types of users, each with a role-specific dashboard.

### 1. Sender

The sender is responsible for creating and managing shipment requests.

Features:
- Register and log in securely.
- Create shipment requests with pickup and delivery locations.
- Specify package type, weight, and required vehicle type.
- Associate a shipment with a registered receiver.
- View previously created shipments.
- Monitor shipment status.
- Cancel eligible shipments according to their current status.

### 2. Driver

The driver discovers available shipment requests and manages assigned deliveries.

Features:
- Register and log in as a driver.
- Browse eligible, available shipments.
- Search shipments by pickup, delivery, package type, and vehicle type.
- View shipment details before acceptance.
- Accept eligible shipments.
- View assigned shipments.
- Update delivery status according to permitted transitions.

### 3. Receiver

The receiver can view shipments associated with their account.

Features:
- Register and log in securely.
- Manage relevant contact and delivery details.
- View associated shipments.
- Check pickup and delivery information.
- Monitor shipment progress.
- View available driver and vehicle information when assigned.

### 4. Truck Owner

The truck owner manages vehicles and monitors transportation activities.

Planned or applicable features:
- Register and manage trucks.
- Maintain vehicle registration details, type, and capacity.
- Manage vehicle availability.
- View shipments associated with owned trucks.
- Monitor active and completed trips.
- Review payment records when payment tracking is implemented.

## Shipment Lifecycle

The intended shipment lifecycle is:

`Pending → Accepted → Picked Up → In Transit → Delivered`

A shipment may also be marked `Cancelled` when cancellation is permitted.

The backend should enforce valid status transitions and prevent unauthorized users from changing shipment status.

## Key Features

- Role-based authentication and dashboards.
- JWT-based authentication.
- Password hashing using bcrypt.
- MongoDB-backed shipment management.
- Shipment creation and sender-specific shipment listing.
- Available-shipment discovery for drivers.
- Shipment acceptance and driver assignment.
- Role-specific access control.
- Receiver-specific shipment visibility.
- Truck and fleet management.
- Responsive user interface.
- Consistent styling across dashboards.
- Backend validation and ownership checks.

Feature availability depends on the current implementation and configuration of the application.

## Technology Stack

### Frontend
- React.js
- Vite
- React Router
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JSON Web Tokens (JWT)
- bcrypt

### Database
- MongoDB
- Mongoose

### Development Tools
- Visual Studio Code
- Git
- GitHub
- npm
- Postman

## System Architecture

UTI follows a client-server architecture with an MVC-based backend.

```text
                    UTI PLATFORM
                         |
          +--------------+--------------+
          |              |              |
        Sender         Driver         Receiver
          |              |              |
          +--------------+--------------+
                         |
                    Truck Owner
                         |
                         v
                 React Frontend
                      (Vite)
                         |
                    REST API
                         |
                 Node.js / Express
                         |
              Authentication Middleware
                         |
                  MVC Controllers
                         |
                   Mongoose Models
                         |
                     MongoDB
```

### Request Flow

1. A user logs in through the React frontend.
2. The backend validates credentials and issues a JWT.
3. The frontend includes the token in protected API requests.
4. Express middleware verifies the token and user permissions.
5. Controllers validate the request and perform database operations.
6. Mongoose communicates with MongoDB.
7. The API returns a JSON response.
8. React updates the interface using the response.

## Project Structure

The following is the intended structure. Actual filenames may vary slightly depending on the current implementation.

```text
unified-transport-interface/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   ├── Hero/
│   │   │   ├── Stakeholders/
│   │   │   └── Footer/
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── SenderDashboard.jsx
│   │   │   ├── ReceiverDashboard.jsx
│   │   │   ├── DriverDashboard.jsx
│   │   │   └── TruckOwnerDashboard.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── shipmentController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Shipment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── shipmentRoutes.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

Additional models, routes, components, and CSS files may be present as the application evolves.

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB, either locally or through MongoDB Atlas
- Git
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/AMAN1112221/unified-transport-interface.git
cd unified-transport-interface
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open another terminal from the project root:

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Use the actual MongoDB environment variable name expected by the existing database configuration. If the project currently uses `MONGO_URI` instead of `MONGODB_URI`, retain `MONGO_URI`.

Replace the example values with your own configuration. Never commit real database credentials or JWT secrets to GitHub.

### 5. Start the Backend

From the `server` directory:

```bash
npm start
```

Use the development script from `server/package.json` if you prefer automatic restarts and it is configured.

The backend is expected to run on port `5000` unless configured otherwise.

### 6. Start the Frontend

From the `client` directory, open a separate terminal and run:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

Ensure that the frontend API URL matches the backend address and that MongoDB is connected successfully.

## API Overview

The following core endpoints correspond to the existing authentication and sender-shipment workflow. Verify the route definitions in the repository before relying on them.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/shipments/` | Create a shipment |
| GET | `/api/shipments/my` | Retrieve the logged-in sender's shipments |

Protected requests should include the JWT in the authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Additional driver, receiver, truck-owner, assignment, cancellation, and status-update endpoints depend on the actual route implementations. Their paths should be documented here after they have been verified in the repository.

## Database Design

### User

Represents registered platform users.

Typical fields include:
- Name
- Email
- Hashed password
- Role
- Relevant profile and contact information

Supported roles:

- `sender`
- `receiver`
- `driver`
- `truck_owner`

### Shipment

Represents a goods transportation request.

Existing core fields include:
- Sender reference
- Pickup location
- Delivery location
- Package type
- Weight
- Required vehicle type
- Shipment status
- Creation and update timestamps

Additional references, such as receiver, assigned driver, or truck, depend on the current schema implementation.

### Truck, Trip, and Payment

These records can support fleet ownership, trip history, and payment tracking when the corresponding models and workflows are implemented.

Payment history must reflect actual payment records. It should not be inferred as a successful payment merely because a shipment is delivered.

## Security

UTI is designed around authenticated, role-specific access.

Important security requirements include:

- Hash passwords before storing them.
- Verify JWTs on protected APIs.
- Enforce role-based authorization on the backend.
- Restrict users to records they are authorized to access.
- Validate shipment ownership before cancellation or modification.
- Allow only eligible drivers to accept available shipments.
- Prevent multiple drivers from accepting the same shipment.
- Validate shipment status transitions on the server.
- Keep database credentials and JWT secrets in environment variables.

Frontend route protection improves navigation, but backend authorization is required to protect data.

## UI and Responsive Design

UTI uses a shared visual design system defined by the existing `App.css` and `index.css`.

Page-specific styles should be maintained in separate CSS files where appropriate, while preserving consistent colors, typography, buttons, cards, spacing, and responsive behavior.

The interface should remain usable on desktop, tablet, and mobile devices.

## Testing

Use Postman or another API client to verify backend functionality.

Recommended test workflow:

1. Register users with each supported role.
2. Log in and verify role-specific access.
3. Create a shipment as a sender.
4. Verify that the shipment is saved in MongoDB.
5. Confirm that the sender can view the shipment.
6. Confirm that an eligible driver can discover the shipment.
7. Search for the shipment by pickup, delivery, or package type.
8. Accept the shipment and verify the assignment in MongoDB.
9. Confirm that it disappears from available shipments and appears in the assigned list.
10. Verify that another driver cannot accept the same shipment.
11. Test valid and invalid status transitions.
12. Confirm that receivers and truck owners can access only their permitted records.
13. Test cancellation rules and logout behavior.
14. Run the frontend production build.

From the `client` directory:

```bash
npm run build
```

Only report tests as passing after they have actually been executed.

## Current Development Status

UTI is being developed incrementally. The existing repository contains the React/Vite frontend and Node.js/Express backend, with MongoDB-backed authentication and sender shipment functionality forming the foundation.

The remaining role-specific workflows should be evaluated against the current code and tested end-to-end before being described as production-ready.

## Future Enhancements

Potential future improvements include:

- Real-time shipment status notifications.
- GPS-based vehicle tracking.
- Map-based pickup and delivery visualization.
- Route optimization.
- Delivery proof and confirmation.
- Automated notifications to senders and receivers.
- Payment gateway integration.
- Advanced fleet analytics and reporting.

These are future enhancements unless their implementations are already present.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your changes with a descriptive message.
5. Open a pull request describing the changes.

Keep changes focused and avoid committing secrets, build artifacts, or local environment files.

## License

No license has been specified yet. Add an appropriate `LICENSE` file before permitting reuse or redistribution under an open-source license.

---

**UTI — Unified Transport Interface**

Connecting senders, receivers, drivers, and truck owners through one transportation platform.
