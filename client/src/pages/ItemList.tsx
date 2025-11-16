import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Alert,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { api } from "../api";
import { useNotification } from "../contexts/NotificationContext";
import { auth } from "../services/auth";

interface Item {
  _id: string;
  itemName: string;
  quantity: number;
  price: number;
  description: string;
  category: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type Props = {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
  lowStockThreshold?: number;
};

const LOW_STOCK_THRESHOLD = 10;

export default function ItemList({ onView, onEdit, onDelete, lowStockThreshold = LOW_STOCK_THRESHOLD }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const theme = useTheme();

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load items when search, category, or page changes
  useEffect(() => {
    loadItems();
  }, [searchQuery, selectedCategory, currentPage]);

  async function loadCategories() {
    try {
      const response = await api.getCategories();
      setCategories(response.categories || []);
    } catch (error: any) {
      showNotification(`Error loading categories: ${error.message}`, "error");
    }
  }

  async function loadItems() {
    setLoading(true);
    try {
      const search = searchQuery.trim() || undefined;
      const category = selectedCategory || undefined;
      const response = await api.listItems(search, category, currentPage, 10);
      setItems(response.data || []);
      setPagination(response.meta || null);
    } catch (error: any) {
      showNotification(`Error loading items: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await api.deleteItem(id);
      showNotification("Item deleted successfully", "success");
      loadItems();
      onDelete?.(id);
    } catch (error: any) {
      showNotification(`Error deleting item: ${error.message}`, "error");
    }
  };

  const isLowStock = (quantity: number) => quantity < lowStockThreshold;

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton
              onClick={loadItems}
              disabled={loading}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      {/* Results Summary */}
      {pagination && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
          Showing {items.length} of {pagination.total} items
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory && ` in category "${selectedCategory}"`}
        </Typography>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              {searchQuery || selectedCategory
                ? "No items match your search criteria"
                : "No items found"}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    border: isLowStock(item.quantity)
                      ? `2px solid ${theme.palette.error.main}`
                      : `1px solid ${theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.palette.mode === "dark"
                        ? "0 10px 15px -3px rgba(0, 0, 0, 0.4)"
                        : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  {/* Low Stock Indicator */}
                  {isLowStock(item.quantity) && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.error.main,
                        boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.error.main}40`,
                        animation: "pulse 2s infinite",
                        zIndex: 1,
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                      <Box sx={{ flexGrow: 1, pr: isLowStock(item.quantity) ? 3 : 0 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {item.itemName}
                        </Typography>
                        {isLowStock(item.quantity) && (
                          <Alert
                            severity="warning"
                            icon={<WarningIcon />}
                            sx={{
                              mt: 1,
                              py: 0,
                              fontSize: "0.75rem",
                              "& .MuiAlert-icon": {
                                fontSize: "1rem",
                              },
                            }}
                          >
                            Low Stock
                          </Alert>
                        )}
                      </Box>
                      <Chip
                        label={item.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 40, lineHeight: 1.5 }}
                    >
                      {item.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        p: 1.5,
                        borderRadius: "8px",
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        <strong>Price:</strong> ${item.price.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={isLowStock(item.quantity) ? "error.main" : "text.primary"}
                        sx={{
                          fontWeight: isLowStock(item.quantity) ? 700 : 500,
                        }}
                      >
                        <strong>Qty:</strong> {item.quantity}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onView(item._id)}
                          aria-label="view"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            "&:hover": {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={!auth.getToken() ? "Login required" : "Edit Item"}>
                        <span>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => onEdit(item._id)}
                            aria-label="edit"
                            disabled={!auth.getToken()}
                            sx={{
                              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                              "&:hover": {
                                backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={!auth.getToken() ? "Login required" : "Delete Item"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item._id)}
                            aria-label="delete"
                            disabled={!auth.getToken()}
                            sx={{
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                backgroundColor: alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    "&.Mui-selected": {
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
