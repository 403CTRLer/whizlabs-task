import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductForm from "../ProductForm";
import { api } from "../../api";

// Mock the API
jest.mock("../../api", () => ({
  api: {
    getProduct: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
  },
}));

describe("ProductForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(<ProductForm />);
    
    expect(screen.getByText("New Product")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("tags comma separated")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<ProductForm />);
    
    const submitButton = screen.getByText("Create");
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    const nameInput = screen.getByPlaceholderText("Name") as HTMLInputElement;
    expect(nameInput.validity.valid).toBe(false);
  });

  it("validates price is non-negative", async () => {
    render(<ProductForm />);
    
    const priceInput = screen.getByPlaceholderText("Price") as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: "-10" } });
    
    // HTML5 validation should prevent negative values
    expect(priceInput.validity.valid).toBe(false);
  });

  it("creates a product with valid data", async () => {
    (api.createProduct as jest.Mock).mockResolvedValue({
      _id: "123",
      name: "Test Product",
      price: 99.99,
    });

    render(<ProductForm />);
    
    const nameInput = screen.getByPlaceholderText("Name");
    const priceInput = screen.getByPlaceholderText("Price");
    const submitButton = screen.getByText("Create");

    fireEvent.change(nameInput, { target: { value: "Test Product" } });
    fireEvent.change(priceInput, { target: { value: "99.99" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        name: "Test Product",
        description: "",
        price: 99.99,
        inStock: true,
        tags: [],
      });
    });
  });

  it("loads product data when editing", async () => {
    const mockProduct = {
      _id: "123",
      name: "Test Product",
      description: "Test description",
      price: 99.99,
      inStock: true,
      tags: ["tag1", "tag2"],
    };

    (api.getProduct as jest.Mock).mockResolvedValue(mockProduct);

    render(<ProductForm id="123" />);

    await waitFor(() => {
      expect(api.getProduct).toHaveBeenCalledWith("123");
      expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
      expect(screen.getByDisplayValue("99.99")).toBeInTheDocument();
      // Tags are joined with comma (no space) in ProductForm
      expect(screen.getByDisplayValue("tag1,tag2")).toBeInTheDocument();
    });
  });

  it("updates a product with valid data", async () => {
    const mockProduct = {
      _id: "123",
      name: "Original Product",
      price: 50,
      inStock: true,
      tags: [],
    };

    (api.getProduct as jest.Mock).mockResolvedValue(mockProduct);
    (api.updateProduct as jest.Mock).mockResolvedValue({
      ...mockProduct,
      name: "Updated Product",
    });

    render(<ProductForm id="123" />);

    await waitFor(() => {
      expect(api.getProduct).toHaveBeenCalledWith("123");
    });

    const nameInput = screen.getByPlaceholderText("Name");
    const submitButton = screen.getByText("Save");

    fireEvent.change(nameInput, { target: { value: "Updated Product" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.updateProduct).toHaveBeenCalledWith("123", expect.objectContaining({
        name: "Updated Product",
      }));
    });
  });

  it("handles tags correctly", async () => {
    (api.createProduct as jest.Mock).mockResolvedValue({
      _id: "123",
      name: "Test Product",
    });

    render(<ProductForm />);
    
    const nameInput = screen.getByPlaceholderText("Name");
    const priceInput = screen.getByPlaceholderText("Price");
    const tagsInput = screen.getByPlaceholderText("tags comma separated");
    const submitButton = screen.getByText("Create");

    fireEvent.change(nameInput, { target: { value: "Test Product" } });
    fireEvent.change(priceInput, { target: { value: "99.99" } });
    fireEvent.change(tagsInput, { target: { value: "tag1, tag2, tag3" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        name: "Test Product",
        description: "",
        price: 99.99,
        inStock: true,
        tags: ["tag1", "tag2", "tag3"],
      });
    });
  });

  it("handles inStock checkbox", async () => {
    (api.createProduct as jest.Mock).mockResolvedValue({
      _id: "123",
      name: "Test Product",
    });

    render(<ProductForm />);
    
    const nameInput = screen.getByPlaceholderText("Name");
    const priceInput = screen.getByPlaceholderText("Price");
    const inStockCheckbox = screen.getByLabelText("In stock") as HTMLInputElement;
    const submitButton = screen.getByText("Create");

    fireEvent.change(nameInput, { target: { value: "Test Product" } });
    fireEvent.change(priceInput, { target: { value: "99.99" } });
    fireEvent.click(inStockCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        name: "Test Product",
        description: "",
        price: 99.99,
        inStock: false,
        tags: [],
      });
    });
  });
});

