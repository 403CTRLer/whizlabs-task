import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import { ProductModel } from "../models/product.model";

describe("Products API", () => {
  let testProductId: string;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/inventory-test";
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear products before each test
    await ProductModel.deleteMany({});
  });

  describe("POST /api/products", () => {
    it("should create a new product with valid data", async () => {
      const productData = {
        name: "Test Product",
        description: "A test product description",
        price: 99.99,
        inStock: true,
        tags: ["electronics", "test"],
      };

      const response = await request(app)
        .post("/api/products")
        .send(productData)
        .expect(201);

      expect(response.body.message).toBe("Product created successfully");
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.price).toBe(productData.price);
      expect(response.body.data.inStock).toBe(productData.inStock);
      expect(response.body.data.tags).toEqual(productData.tags);
      expect(response.body.data._id).toBeDefined();

      testProductId = response.body.data._id;
    });

    it("should return 400 when name is missing", async () => {
      const productData = {
        description: "A test product description",
        price: 99.99,
      };

      const response = await request(app)
        .post("/api/products")
        .send(productData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details).toBeDefined();
    });

    it("should return 400 when price is negative", async () => {
      const productData = {
        name: "Test Product",
        price: -10,
      };

      const response = await request(app)
        .post("/api/products")
        .send(productData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should create product with optional fields", async () => {
      const productData = {
        name: "Minimal Product",
        price: 50,
      };

      const response = await request(app)
        .post("/api/products")
        .send(productData)
        .expect(201);

      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.inStock).toBe(true); // Default value
      expect(response.body.data.tags).toEqual([]); // Default value
    });
  });

  describe("GET /api/products", () => {
    it("should return all products", async () => {
      // Create test products
      await ProductModel.create([
        {
          name: "Product 1",
          price: 100,
          inStock: true,
        },
        {
          name: "Product 2",
          price: 200,
          inStock: false,
        },
      ]);

      const response = await request(app)
        .get("/api/products")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(20);
    });

    it("should filter products by tag", async () => {
      await ProductModel.create([
        {
          name: "Product 1",
          price: 100,
          tags: ["electronics"],
        },
        {
          name: "Product 2",
          price: 200,
          tags: ["furniture"],
        },
      ]);

      const response = await request(app)
        .get("/api/products?tag=electronics")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].tags).toContain("electronics");
    });

    it("should support pagination", async () => {
      // Create 5 products
      await ProductModel.create(
        Array.from({ length: 5 }, (_, i) => ({
          name: `Product ${i + 1}`,
          price: 100 + i,
        }))
      );

      const response = await request(app)
        .get("/api/products?page=1&limit=2")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(5);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.meta.totalPages).toBe(3);
      expect(response.body.meta.hasNextPage).toBe(true);
      expect(response.body.meta.hasPrevPage).toBe(false);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a single product by ID", async () => {
      const product = await ProductModel.create({
        name: "Test Product",
        price: 99.99,
        description: "Test description",
      });

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body.name).toBe("Test Product");
      expect(response.body._id).toBe(product._id.toString());
    });

    it("should return 404 when product not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe("Product not found");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/products/invalid-id")
        .expect(400);

      expect(response.body.error).toBe("Invalid product ID format");
    });
  });

  describe("PUT /api/products/:id", () => {
    it("should update an existing product", async () => {
      const product = await ProductModel.create({
        name: "Original Name",
        price: 100,
        inStock: true,
      });

      const updateData = {
        name: "Updated Name",
        price: 150,
        inStock: false,
      };

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Product updated successfully");
      expect(response.body.data.name).toBe("Updated Name");
      expect(response.body.data.price).toBe(150);
      expect(response.body.data.inStock).toBe(false);
    });

    it("should return 404 when product not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .send({ name: "Updated Name" })
        .expect(404);

      expect(response.body.error).toBe("Product not found");
    });

    it("should return 400 for invalid update data", async () => {
      const product = await ProductModel.create({
        name: "Test Product",
        price: 100,
      });

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ price: -10 })
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product", async () => {
      const product = await ProductModel.create({
        name: "Product to Delete",
        price: 100,
      });

      await request(app)
        .delete(`/api/products/${product._id}`)
        .expect(204);

      // Verify product is deleted
      const deletedProduct = await ProductModel.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it("should return 404 when product not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe("Product not found");
    });
  });
});

