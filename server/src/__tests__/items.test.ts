import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import { ItemModel } from "../models/item.model";

describe("Items API", () => {
  let testItemId: string;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/inventory-test";
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear items before each test
    await ItemModel.deleteMany({});
  });

  describe("POST /api/items", () => {
    it("should create a new item with valid data", async () => {
      const itemData = {
        itemName: "Test Laptop",
        quantity: 10,
        price: 999.99,
        description: "A high-quality laptop for testing",
        category: "Electronics",
      };

      const response = await request(app)
        .post("/api/items")
        .send(itemData)
        .expect(201);

      expect(response.body.message).toBe("Item created successfully");
      expect(response.body.data.itemName).toBe(itemData.itemName);
      expect(response.body.data.quantity).toBe(itemData.quantity);
      expect(response.body.data.price).toBe(itemData.price);
      expect(response.body.data.description).toBe(itemData.description);
      expect(response.body.data.category).toBe(itemData.category);
      expect(response.body.data._id).toBeDefined();

      testItemId = response.body.data._id;
    });

    it("should return 400 when itemName is missing", async () => {
      const itemData = {
        quantity: 10,
        price: 999.99,
        description: "A high-quality laptop for testing",
        category: "Electronics",
      };

      const response = await request(app)
        .post("/api/items")
        .send(itemData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details).toBeDefined();
    });

    it("should return 400 when quantity is negative", async () => {
      const itemData = {
        itemName: "Test Item",
        quantity: -5,
        price: 999.99,
        description: "A high-quality laptop for testing",
        category: "Electronics",
      };

      const response = await request(app)
        .post("/api/items")
        .send(itemData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("GET /api/items", () => {
    it("should return all items", async () => {
      // Create test items
      await ItemModel.create([
        {
          itemName: "Item 1",
          quantity: 10,
          price: 100,
          description: "Description 1",
          category: "Category A",
        },
        {
          itemName: "Item 2",
          quantity: 20,
          price: 200,
          description: "Description 2",
          category: "Category B",
        },
      ]);

      const response = await request(app)
        .get("/api/items")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it("should filter items by category", async () => {
      await ItemModel.create([
        {
          itemName: "Item 1",
          quantity: 10,
          price: 100,
          description: "Description 1",
          category: "Electronics",
        },
        {
          itemName: "Item 2",
          quantity: 20,
          price: 200,
          description: "Description 2",
          category: "Furniture",
        },
      ]);

      const response = await request(app)
        .get("/api/items?category=Electronics")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe("Electronics");
    });
  });

  describe("GET /api/items/:id", () => {
    it("should return a single item by ID", async () => {
      const item = await ItemModel.create({
        itemName: "Test Item",
        quantity: 10,
        price: 999.99,
        description: "Test description",
        category: "Electronics",
      });

      const response = await request(app)
        .get(`/api/items/${item._id}`)
        .expect(200);

      expect(response.body.itemName).toBe("Test Item");
      expect(response.body._id).toBe(item._id.toString());
    });

    it("should return 404 when item not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/items/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe("Item not found");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/items/invalid-id")
        .expect(400);

      expect(response.body.error).toBe("Invalid item ID format");
    });
  });

  describe("PUT /api/items/:id", () => {
    it("should update an existing item", async () => {
      const item = await ItemModel.create({
        itemName: "Original Name",
        quantity: 10,
        price: 100,
        description: "Original description",
        category: "Electronics",
      });

      const updateData = {
        itemName: "Updated Name",
        quantity: 20,
      };

      const response = await request(app)
        .put(`/api/items/${item._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.itemName).toBe("Updated Name");
      expect(response.body.data.quantity).toBe(20);
      expect(response.body.data.price).toBe(100); // Should remain unchanged
    });

    it("should return 404 when item not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put(`/api/items/${fakeId}`)
        .send({ itemName: "Updated Name" })
        .expect(404);

      expect(response.body.error).toBe("Item not found");
    });
  });

  describe("DELETE /api/items/:id", () => {
    it("should delete an item", async () => {
      const item = await ItemModel.create({
        itemName: "Item to Delete",
        quantity: 10,
        price: 100,
        description: "Description",
        category: "Electronics",
      });

      await request(app)
        .delete(`/api/items/${item._id}`)
        .expect(204);

      // Verify item is deleted
      const deletedItem = await ItemModel.findById(item._id);
      expect(deletedItem).toBeNull();
    });

    it("should return 404 when item not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/items/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe("Item not found");
    });
  });

  describe("GET /api/items/stats", () => {
    it("should return inventory statistics", async () => {
      await ItemModel.create([
        {
          itemName: "Item 1",
          quantity: 10,
          price: 100,
          description: "Description 1",
          category: "Electronics",
        },
        {
          itemName: "Item 2",
          quantity: 5,
          price: 200,
          description: "Description 2",
          category: "Electronics",
        },
        {
          itemName: "Item 3",
          quantity: 3,
          price: 50,
          description: "Description 3",
          category: "Furniture",
        },
      ]);

      const response = await request(app)
        .get("/api/items/stats")
        .expect(200);

      expect(response.body.totalItems).toBe(3);
      expect(response.body.totalValue).toBe(10 * 100 + 5 * 200 + 3 * 50);
      expect(response.body.categories).toHaveLength(2);
      expect(response.body.categories[0].category).toBe("Electronics");
      expect(response.body.categories[0].count).toBe(2);
    });
  });

  describe("POST /api/items/generate-description", () => {
    it("should generate a description", async () => {
      const response = await request(app)
        .post("/api/items/generate-description")
        .send({
          itemName: "Test Laptop",
          category: "Electronics",
        })
        .expect(200);

      expect(response.body.description).toBeDefined();
      expect(typeof response.body.description).toBe("string");
    });

    it("should return 400 when itemName is missing", async () => {
      const response = await request(app)
        .post("/api/items/generate-description")
        .send({
          category: "Electronics",
        })
        .expect(400);

      expect(response.body.error).toBe("itemName and category are required");
    });
  });
});

