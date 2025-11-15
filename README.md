# Inventory Management System

A full-stack Inventory Management System built with React.js, Node.js, Express, and MongoDB. This application allows users to perform complete CRUD (Create, Read, Update, Delete) operations on inventory items with a clean, responsive user interface.

## Technology Stack

- **Front-End**: React.js with TypeScript, Vite
- **Back-End**: Node.js with Express and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod for schema validation
- **State Management**: React Context API
- **UI Library**: Material-UI (MUI)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- MongoDB running locally or MongoDB Atlas account
- Git (for cloning the repository)

## Project Structure

```
product-trainee-starter/
├── server/                 # Back-end Express application
│   ├── src/
│   │   ├── app.ts         # Express app configuration
│   │   ├── index.ts       # Server entry point
│   │   ├── db.ts          # MongoDB connection
│   │   ├── models/        # Mongoose models
│   │   │   └── item.model.ts
│   │   ├── controllers/   # Route controllers
│   │   │   └── item.controller.ts
│   │   ├── routes/        # API routes
│   │   │   └── items.ts
│   │   ├── validators/    # Zod validation schemas
│   │   │   └── item.validator.ts
│   │   ├── middlewares/   # Express middlewares
│   │   │   ├── asyncHandler.ts
│   │   │   └── errorHandler.ts
│   │   └── scripts/       # Utility scripts
│   │       └── seed.ts
│   └── package.json
├── client/                # Front-end React application
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── main.tsx       # Application entry point
│   │   ├── api.ts         # API client
│   │   ├── pages/         # Page components
│   │   │   ├── ItemList.tsx
│   │   │   ├── ItemForm.tsx
│   │   │   ├── ItemView.tsx
│   │   │   └── Dashboard.tsx
│   │   └── contexts/      # React Context providers
│   │       ├── NotificationContext.tsx
│   │       └── ThemeContext.tsx
│   └── package.json
└── README.md
```

## System Architecture

### Overview

The application follows a three-tier architecture:

1. **Presentation Layer (React Front-End)**
   - User interface built with React functional components
   - State management using React Context API
   - API communication via fetch API
   - Form validation on the client side

2. **Application Layer (Express Back-End)**
   - RESTful API endpoints
   - Request validation using Zod schemas
   - Centralized error handling middleware
   - Business logic in controllers

3. **Data Layer (MongoDB)**
   - Document-based database storage
   - Mongoose ODM for schema definition and validation
   - Indexed fields for optimized queries

### Data Flow

```
User Action (UI) 
  → React Component 
  → API Call (api.ts) 
  → Express Route 
  → Controller 
  → Mongoose Model 
  → MongoDB
```

### Component Interaction

- **ItemList**: Displays all items, handles view/edit/delete actions
- **ItemForm**: Handles adding new items and updating existing ones
- **ItemView**: Shows detailed information about a single item
- **NotificationContext**: Manages toast notifications across the app
- **ThemeContext**: Manages application theme (light/dark mode)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd product-trainee-starter
```

### 2. Back-End Setup

```bash
cd server
npm install
```

#### Environment Configuration

Create a `.env` file in the `server` directory:

```env
MONGO_URI=mongodb://localhost:27017/inventory-management
PORT=4000
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-management
PORT=4000
```

#### Seed the Database (Optional)

Populate the database with sample inventory items:

```bash
npm run seed
```

#### Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will run at `http://localhost:4000`

### 3. Front-End Setup

```bash
cd ../client
npm install
npm run dev
```

The client will run at `http://localhost:5173` (or the next available port)

## API Documentation

All API endpoints are prefixed with `/api/items`

**Base URL:** `http://localhost:4000/api/items`

### Database Schema

The inventory item schema includes the following fields:

```typescript
{
  itemName: string;      // Required, 2-100 characters
  quantity: number;      // Required, non-negative integer
  price: number;         // Required, non-negative number
  description: string;   // Required, 5-500 characters
  category: string;      // Required, 2-50 characters
  createdAt: Date;       // Automatically added
  updatedAt: Date;       // Automatically updated
}
```

### Endpoints

#### 1. POST /items - Add a New Item

**Purpose:** Creates a new inventory item in the database.

**Request Body:**
```json
{
  "itemName": "Laptop Computer",
  "quantity": 15,
  "price": 1299.99,
  "description": "High-performance laptop with 16GB RAM and 512GB SSD",
  "category": "Electronics"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "itemName": "Laptop Computer",
    "quantity": 15,
    "price": 1299.99,
    "description": "High-performance laptop with 16GB RAM and 512GB SSD",
    "category": "Electronics",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["itemName"],
      "message": "Item name is required"
    }
  ]
}
```

---

#### 2. GET /items - Retrieve All Items

**Purpose:** Fetches all inventory items from the database.

**Query Parameters (Optional):**
- `search`: Search in itemName and description (case-insensitive)
- `category`: Filter by category (case-insensitive)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Example:**
```
GET /api/items?category=Electronics&page=1&limit=10
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "itemName": "Laptop Computer",
      "quantity": 15,
      "price": 1299.99,
      "description": "High-performance laptop with 16GB RAM and 512GB SSD",
      "category": "Electronics",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### 3. GET /items/:id - Retrieve a Single Item

**Purpose:** Fetches a specific inventory item by its ID.

**URL Parameters:**
- `id`: MongoDB ObjectId of the item

**Example:**
```
GET /api/items/507f1f77bcf86cd799439011
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "itemName": "Laptop Computer",
  "quantity": 15,
  "price": 1299.99,
  "description": "High-performance laptop with 16GB RAM and 512GB SSD",
  "category": "Electronics",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Item not found"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid item ID format"
}
```

---

#### 4. PUT /items/:id - Update an Item

**Purpose:** Updates an existing inventory item. All fields are optional, but provided fields must be valid.

**URL Parameters:**
- `id`: MongoDB ObjectId of the item

**Request Body (all fields optional):**
```json
{
  "quantity": 20,
  "price": 1199.99
}
```

**Success Response (200 OK):**
```json
{
  "message": "Item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "itemName": "Laptop Computer",
    "quantity": 20,
    "price": 1199.99,
    "description": "High-performance laptop with 16GB RAM and 512GB SSD",
    "category": "Electronics",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed or invalid ID format
- `404 Not Found`: Item not found

---

#### 5. DELETE /items/:id - Delete an Item

**Purpose:** Removes an inventory item from the database.

**URL Parameters:**
- `id`: MongoDB ObjectId of the item

**Example:**
```
DELETE /api/items/507f1f77bcf86cd799439011
```

**Success Response (204 No Content):**
No response body

**Error Responses:**
- `400 Bad Request`: Invalid ID format
- `404 Not Found`: Item not found

---

### Error Handling

The API implements comprehensive error handling:

1. **Validation Errors (400)**: Invalid input data or missing required fields
   - Returns detailed error messages for each invalid field
   - Uses Zod schema validation for type checking

2. **Not Found Errors (404)**: Resource doesn't exist
   - Returns clear error message when item ID is not found

3. **Server Errors (500)**: Internal server errors
   - Centralized error handling middleware
   - Logs errors for debugging

All error responses follow this format:
```json
{
  "error": "Error message",
  "details": [] // Optional: Detailed validation errors
}
```

## Using the Inventory Management System

### Front-End Usage

#### Adding a New Item

1. Navigate to the Inventory page
2. Fill in the form on the right side with:
   - **Item Name**: Name of the item (required, min 2 characters)
   - **Category**: Item category (required, min 2 characters)
   - **Description**: Detailed description (required, min 5 characters)
   - **Quantity**: Number of items in stock (required, non-negative integer)
   - **Price**: Item price (required, non-negative number)
3. Click "Create Item" button
4. The item will appear in the list on the left
5. A success notification will confirm the item was created

#### Viewing Items

- All items are displayed in a card-based grid layout
- Each card shows: item name, category, description, price, and quantity
- Click the eye icon (👁️) to view detailed information in the right panel

#### Editing an Item

1. Click the edit icon (✏️) on any item card
2. The form will populate with the item's current data
3. Modify the fields you want to update
4. Click "Update Item" to save changes
5. A success notification will confirm the update

#### Deleting an Item

1. Click the delete icon (🗑️) on any item card
2. Confirm the deletion in the popup dialog
3. The item will be removed from the database and list
4. A success notification will confirm the deletion

### API Testing with cURL

```bash
# Get all items
curl http://localhost:4000/api/items

# Get a specific item
curl http://localhost:4000/api/items/507f1f77bcf86cd799439011

# Create a new item
curl -X POST http://localhost:4000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Wireless Keyboard",
    "quantity": 30,
    "price": 79.99,
    "description": "Ergonomic wireless keyboard with backlight",
    "category": "Electronics"
  }'

# Update an item
curl -X PUT http://localhost:4000/api/items/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "price": 69.99
  }'

# Delete an item
curl -X DELETE http://localhost:4000/api/items/507f1f77bcf86cd799439011
```

## Code Quality & Best Practices

### Back-End

- **TypeScript**: Full type safety throughout the application
- **Zod Validation**: Runtime validation for all API inputs
- **Async/Await**: Modern asynchronous code patterns
- **Error Handling**: Centralized error handling middleware
- **Code Comments**: Comprehensive JSDoc comments explaining each endpoint
- **Mongoose Indexes**: Optimized database queries with indexed fields
- **Separation of Concerns**: Controllers, routes, models, and validators are properly separated

### Front-End

- **React Hooks**: Modern functional component patterns using useState, useEffect
- **Context API**: Centralized state management for theme and notifications
- **Form Validation**: Client-side validation with clear error messages
- **Responsive Design**: Mobile-friendly interface using Material-UI Grid system
- **Error Handling**: User-friendly error messages and loading states
- **Component Organization**: Clear separation of concerns with dedicated components

## Development Scripts

### Server

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run seed     # Seed database with sample data
npm test         # Run unit tests
```

### Client

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm preview      # Preview production build
npm test         # Run unit tests
```

## Code Comments

Key logic and decisions are documented throughout the codebase:

- **Controllers** (`server/src/controllers/item.controller.ts`): Each endpoint includes JSDoc comments explaining purpose, parameters, and return values
- **Models** (`server/src/models/item.model.ts`): Schema definitions include comments explaining field requirements and validation rules
- **Validators** (`server/src/validators/item.validator.ts`): Validation schemas include comments explaining constraints
- **Routes** (`server/src/routes/items.ts`): Each route includes comments explaining its purpose
- **Components** (`client/src/pages/*.tsx`): React components include comments for complex logic and state management
- **API Client** (`client/src/api.ts`): Functions include comments explaining parameters and return values

## Additional Features

The implementation includes several enhancements beyond the core requirements:

- **Dashboard**: Analytics dashboard with KPIs and charts showing inventory statistics
- **Search & Filtering**: Server-side search by name/description and category filtering
- **Pagination**: Efficient handling of large datasets with page navigation
- **Low Stock Alerts**: Visual indicators for items below threshold quantity
- **Light/Dark Mode**: Theme switching with persistent user preference
- **AI Description Generation**: Optional feature to auto-generate product descriptions
- **Unit Tests**: Comprehensive test coverage for API endpoints and React components

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running locally or your Atlas connection string is correct
- Check the MONGO_URI in your `.env` file

**Port Already in Use:**
- Change the PORT in `server/.env` file
- Or stop the process using the port

**CORS Errors:**
- Ensure the server is running and CORS is enabled (already configured)
- Check that the front-end is calling the correct API URL

**Form Validation Errors:**
- Ensure all required fields are filled
- Check that quantity is a whole number and price is a valid number
- Verify field length requirements are met

## License

This project is created for evaluation purposes.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
