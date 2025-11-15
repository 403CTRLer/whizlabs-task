import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Alert,
  useTheme,
} from "@mui/material";
import { Warning as WarningIcon, TrendingUp as TrendingUpIcon, Inventory as InventoryIcon, Category as CategoryIcon } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useNotification } from "../contexts/NotificationContext";

interface Stats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  lowStockThreshold: number;
  categoryCount: number;
  categories: Array<{
    category: string;
    count: number;
    totalValue: number;
  }>;
}

interface Item {
  _id: string;
  itemName: string;
  quantity: number;
  price: number;
  category: string;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const theme = useTheme();

  // Get chart colors based on theme
  const getChartColors = () => {
    const isDark = theme.palette.mode === "dark";
    return isDark
      ? ["#D4AF37", "#22C55E", "#F59E0B", "#EF4444", "#B8941F", "#0EA5E9"]
      : ["#3182ce", "#38a169", "#d69e2e", "#e53e3e", "#805ad5", "#ed64a6"];
  };

  const COLORS = getChartColors();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Load stats
      const statsData = await api.getStats();
      setStats(statsData);

      // Load recently added items (last 5)
      const recentResponse = await api.listItems(undefined, undefined, 1, 5);
      setRecentItems(recentResponse.data || []);

      // Load low stock items
      const allItemsResponse = await api.listItems(undefined, undefined, 1, 100);
      const allItems = allItemsResponse.data || [];
      const lowStock = allItems
        .filter((item: Item) => item.quantity < (statsData.lowStockThreshold || 10))
        .slice(0, 5);
      setLowStockItems(lowStock);
    } catch (error: any) {
      showNotification(`Error loading dashboard: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            No statistics available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const pieData = stats.categories.map((cat) => ({
    name: cat.category,
    value: cat.count,
  }));

  const barData = stats.categories.map((cat) => ({
    name: cat.category,
    count: cat.count,
    value: Math.round(cat.totalValue),
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Inventory Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1E1D23 0%, #1A1A1A 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: `2px solid ${theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <InventoryIcon color="primary" />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Items
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                {stats.totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1E1D23 0%, #1A1A1A 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: `2px solid ${theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Value
                </Typography>
              </Box>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                ${stats.totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1E1D23 0%, #1A1A1A 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: `2px solid ${stats.lowStockCount > 0 ? theme.palette.error.main : (theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0")}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <WarningIcon color={stats.lowStockCount > 0 ? "error" : "disabled"} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Low Stock
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h3"
                  color={stats.lowStockCount > 0 ? "error.main" : "text.primary"}
                  sx={{ fontWeight: 700 }}
                >
                  {stats.lowStockCount}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Threshold: &lt; {stats.lowStockThreshold}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1E1D23 0%, #1A1A1A 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: `2px solid ${theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CategoryIcon color="secondary" />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Categories
                </Typography>
              </Box>
              <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 700 }}>
                {stats.categoryCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Items by Category
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.mode === "dark" ? "#1E1D23" : "#ffffff",
                        border: `1px solid ${theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No category data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Value Distribution by Category
              </Typography>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: theme.palette.text.secondary }}
                      stroke={theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}
                    />
                    <YAxis
                      tick={{ fill: theme.palette.text.secondary }}
                      stroke={theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.mode === "dark" ? "#1E1D23" : "#ffffff",
                        border: `1px solid ${theme.palette.mode === "dark" ? "#1A1A1A" : "#e2e8f0"}`,
                        borderRadius: "8px",
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="value" fill={COLORS[0]} name="Total Value ($)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No category data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Access Lists */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recently Added Items
                </Typography>
              </Box>
              {recentItems.length > 0 ? (
                <List>
                  {recentItems.map((item) => (
                    <ListItem key={item._id} disablePadding>
                      <ListItemButton
                        onClick={() => navigate(`/inventory?view=${item._id}`)}
                        sx={{
                          borderRadius: "8px",
                          mb: 0.5,
                          "&:hover": {
                            backgroundColor: theme.palette.mode === "dark" ? "rgba(212, 175, 55, 0.1)" : "rgba(49, 130, 206, 0.08)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={item.itemName}
                          secondary={
                            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                              <Chip label={item.category} size="small" />
                              <Typography variant="caption" color="text.secondary">
                                Qty: {item.quantity} | ${item.price.toFixed(2)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No recent items
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <WarningIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Low Stock Items
                </Typography>
              </Box>
              {lowStockItems.length > 0 ? (
                <>
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: "8px" }}>
                    {stats.lowStockCount} item(s) below threshold of {stats.lowStockThreshold}
                  </Alert>
                  <List>
                    {lowStockItems.map((item) => (
                      <ListItem key={item._id} disablePadding>
                        <ListItemButton
                          onClick={() => navigate(`/inventory?view=${item._id}`)}
                          sx={{
                            borderRadius: "8px",
                            mb: 0.5,
                            border: `1px solid ${theme.palette.error.main}20`,
                            "&:hover": {
                              backgroundColor: theme.palette.mode === "dark" ? "rgba(248, 113, 113, 0.1)" : "rgba(229, 62, 62, 0.08)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: theme.palette.error.main,
                                    animation: "pulse 2s infinite",
                                  }}
                                />
                                {item.itemName}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center" }}>
                                <Chip label={item.category} size="small" />
                                <Chip
                                  label={`Qty: ${item.quantity}`}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  ${item.price.toFixed(2)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  All items are well stocked
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
