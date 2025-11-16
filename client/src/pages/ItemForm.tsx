import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Tooltip,
  Divider,
  Alert,
} from "@mui/material";
import { AutoAwesome as AIIcon, Save as SaveIcon } from "@mui/icons-material";
import { api } from "../api";
import { useNotification } from "../contexts/NotificationContext";
import { auth } from "../services/auth";

interface ItemFormData {
  itemName: string;
  quantity: string;
  price: string;
  description: string;
  category: string;
}

type Props = {
  id?: string;
  onSaved?: () => void;
};

export default function ItemForm({ id, onSaved }: Props) {
  const [form, setForm] = useState<ItemFormData>({
    itemName: "",
    quantity: "",
    price: "",
    description: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});
  const { showNotification } = useNotification();
  const theme = useTheme();

  useEffect(() => {
    if (!id) {
      setForm({
        itemName: "",
        quantity: "",
        price: "",
        description: "",
        category: "",
      });
      setErrors({});
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const item = await api.getItem(id);
        setForm({
          itemName: item.itemName || "",
          quantity: String(item.quantity || ""),
          price: String(item.price || ""),
          description: item.description || "",
          category: item.category || "",
        });
        setErrors({});
      } catch (error: any) {
        showNotification(`Error loading item: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, showNotification]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ItemFormData, string>> = {};

    if (!form.itemName.trim()) {
      newErrors.itemName = "Item name is required";
    } else if (form.itemName.length < 2) {
      newErrors.itemName = "Item name must be at least 2 characters";
    }

    if (!form.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else {
      const qty = Number(form.quantity);
      if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
        newErrors.quantity = "Quantity must be a non-negative integer";
      }
    }

    if (!form.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const price = Number(form.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = "Price must be a non-negative number";
      }
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.length < 5) {
      newErrors.description = "Description must be at least 5 characters";
    }

    if (!form.category.trim()) {
      newErrors.category = "Category is required";
    } else if (form.category.length < 2) {
      newErrors.category = "Category must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateDescription = async () => {
    if (!form.itemName.trim() || !form.category.trim()) {
      showNotification("Please enter item name and category first", "warning");
      return;
    }

    setGenerating(true);
    try {
      const response = await api.generateDescription(form.itemName, form.category);
      setForm({ ...form, description: response.description });
      showNotification("Description generated successfully!", "success");
    } catch (error: any) {
      showNotification(`Error generating description: ${error.message}`, "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showNotification("Please fix validation errors", "error");
      return;
    }

    setLoading(true);
    const payload = {
      itemName: form.itemName.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      description: form.description.trim(),
      category: form.category.trim(),
    };

    try {
      if (id) {
        await api.updateItem(id, payload);
        showNotification("Item updated successfully!", "success");
      } else {
        await api.createItem(payload);
        showNotification("Item created successfully!", "success");
        setForm({
          itemName: "",
          quantity: "",
          price: "",
          description: "",
          category: "",
        });
      }
      onSaved?.();
    } catch (error: any) {
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {id ? "Edit Item" : "Add New Item"}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Item Name"
            value={form.itemName}
            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            error={!!errors.itemName}
            helperText={errors.itemName}
            margin="normal"
            required
            sx={{
              "& .MuiFormHelperText-root": {
                fontSize: "0.75rem",
                fontWeight: errors.itemName ? 500 : 400,
              },
            }}
          />

          <TextField
            fullWidth
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            error={!!errors.category}
            helperText={errors.category}
            margin="normal"
            required
            sx={{
              "& .MuiFormHelperText-root": {
                fontSize: "0.75rem",
                fontWeight: errors.category ? 500 : 400,
              },
            }}
          />

          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={!!errors.description}
            helperText={errors.description || "Click the AI icon to generate a description"}
            margin="normal"
            multiline
            rows={3}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ alignSelf: "flex-start", mt: 1 }}>
                  <Tooltip title="Generate description with AI">
                    <IconButton
                      onClick={handleGenerateDescription}
                      disabled={generating || !form.itemName.trim() || !form.category.trim()}
                      color="primary"
                      aria-label="generate description"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        },
                        "&:disabled": {
                          backgroundColor: alpha(theme.palette.action.disabled, 0.1),
                        },
                      }}
                    >
                      {generating ? (
                        <CircularProgress size={20} />
                      ) : (
                        <AIIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiFormHelperText-root": {
                fontSize: "0.75rem",
                fontWeight: errors.description ? 500 : 400,
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
              inputProps={{ min: 0, step: 1 }}
              sx={{
                flex: 1,
                "& .MuiFormHelperText-root": {
                  fontSize: "0.75rem",
                  fontWeight: errors.quantity ? 500 : 400,
                },
              }}
            />

            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={!!errors.price}
              helperText={errors.price}
              required
              inputProps={{ min: 0, step: 0.01 }}
              sx={{
                flex: 1,
                "& .MuiFormHelperText-root": {
                  fontSize: "0.75rem",
                  fontWeight: errors.price ? 500 : 400,
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {!auth.getToken() && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Login required
            </Alert>
          )}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !auth.getToken()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{
                flexGrow: 1,
                py: 1.5,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {id ? "Update Item" : "Create Item"}
            </Button>
            {id && (
              <Button
                variant="outlined"
                onClick={() => {
                  setForm({
                    itemName: "",
                    quantity: "",
                    price: "",
                    description: "",
                    category: "",
                  });
                  onSaved?.();
                }}
                sx={{
                  py: 1.5,
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
