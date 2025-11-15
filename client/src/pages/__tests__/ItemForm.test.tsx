import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ItemForm from "../ItemForm";
import { NotificationProvider } from "../../contexts/NotificationContext";
import { api } from "../../api";

// Mock the API
jest.mock("../../api", () => ({
  api: {
    getItem: jest.fn(),
    createItem: jest.fn(),
    updateItem: jest.fn(),
    generateDescription: jest.fn(),
  },
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<NotificationProvider>{component}</NotificationProvider>);
};

describe("ItemForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form correctly", () => {
    renderWithProvider(<ItemForm />);
    
    expect(screen.getByText("Add New Item")).toBeInTheDocument();
    expect(screen.getByLabelText("Item Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
    expect(screen.getByText("Create Item")).toBeInTheDocument();
  });

  it("shows validation errors when form is submitted empty", async () => {
    renderWithProvider(<ItemForm />);
    
    const submitButton = screen.getByText("Create Item");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Item name is required")).toBeInTheDocument();
      expect(screen.getByText("Quantity is required")).toBeInTheDocument();
      expect(screen.getByText("Price is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
      expect(screen.getByText("Category is required")).toBeInTheDocument();
    });
  });

  it("validates item name length", async () => {
    renderWithProvider(<ItemForm />);
    
    const itemNameInput = screen.getByLabelText("Item Name");
    fireEvent.change(itemNameInput, { target: { value: "A" } });
    
    const submitButton = screen.getByText("Create Item");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Item name must be at least 2 characters")).toBeInTheDocument();
    });
  });

  it("validates quantity is a non-negative integer", async () => {
    renderWithProvider(<ItemForm />);
    
    const quantityInput = screen.getByLabelText("Quantity");
    fireEvent.change(quantityInput, { target: { value: "-5" } });
    
    const submitButton = screen.getByText("Create Item");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Quantity must be a non-negative integer")).toBeInTheDocument();
    });
  });

  it("calls generateDescription when AI button is clicked", async () => {
    (api.generateDescription as jest.Mock).mockResolvedValue({
      description: "Generated description",
    });

    renderWithProvider(<ItemForm />);
    
    const itemNameInput = screen.getByLabelText("Item Name");
    const categoryInput = screen.getByLabelText("Category");
    
    fireEvent.change(itemNameInput, { target: { value: "Test Item" } });
    fireEvent.change(categoryInput, { target: { value: "Electronics" } });

    const aiButton = screen.getByLabelText("generate description");
    fireEvent.click(aiButton);

    await waitFor(() => {
      expect(api.generateDescription).toHaveBeenCalledWith("Test Item", "Electronics");
    });
  });

  it("loads item data when editing", async () => {
    const mockItem = {
      _id: "123",
      itemName: "Test Item",
      quantity: 10,
      price: 99.99,
      description: "Test description",
      category: "Electronics",
    };

    (api.getItem as jest.Mock).mockResolvedValue(mockItem);

    renderWithProvider(<ItemForm id="123" />);

    await waitFor(() => {
      expect(api.getItem).toHaveBeenCalledWith("123");
      expect(screen.getByDisplayValue("Test Item")).toBeInTheDocument();
      expect(screen.getByDisplayValue("10")).toBeInTheDocument();
      expect(screen.getByDisplayValue("99.99")).toBeInTheDocument();
    });
  });
});

