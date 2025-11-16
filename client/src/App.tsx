import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Dashboard as DashboardIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import ItemList from "./pages/ItemList";
import ItemForm from "./pages/ItemForm";
import ItemView from "./pages/ItemView";
import Dashboard from "./pages/Dashboard";
import Instructions from "./pages/Instructions";
import LoginForm from "./components/LoginForm";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider, useTheme as useCustomTheme } from "./contexts/ThemeContext";

function ThemeToggle() {
  const { mode, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  
  return (
    <IconButton
      onClick={toggleTheme}
      sx={{
        color: "inherit",
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          transform: "scale(1.05)",
        },
        transition: "all 0.2s ease",
        borderRadius: "8px",
        p: 1,
      }}
      aria-label="toggle theme"
    >
      {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
}

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
    setSelectedId(null);
    setEditingId(null);
  };

  const handleItemSaved = () => {
    setEditingId(null);
    setSelectedId(null);
    // Trigger refresh of ItemList by updating key
    setRefreshKey((prev) => prev + 1);
  };

  const handleItemDeleted = () => {
    setSelectedId(null);
    // Trigger refresh of ItemList by updating key
    setRefreshKey((prev) => prev + 1);
  };

  const currentPath = location.pathname;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1E1D23 0%, #000000 100%)"
            : "linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 3 }}>
            <InventoryIcon sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Inventory Manager
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <ThemeToggle />
          
          <Tabs
            value={currentPath}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              minHeight: 64,
              ml: 3,
              "& .MuiTab-root": {
                minHeight: 64,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
                "&.Mui-selected": {
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<DashboardIcon />}
              iconPosition="start"
              label="Dashboard"
              value="/"
            />
            <Tab
              icon={<InventoryIcon />}
              iconPosition="start"
              label="Inventory"
              value="/inventory"
            />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/inventory"
            element={
              <Box>
                {/* User Instructions */}
                <Instructions />
                
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 400px" }, gap: 3 }}>
                  <Box>
                    <ItemList
                      key={refreshKey}
                      onView={(id) => {
                        setSelectedId(id);
                        setEditingId(null);
                      }}
                      onEdit={(id) => {
                        setEditingId(id);
                        setSelectedId(null);
                      }}
                      onDelete={handleItemDeleted}
                    />
                  </Box>
                  <Box>
                    <LoginForm />
                    <Box sx={{ mt: 3 }}>
                      <ItemForm
                        id={editingId ?? undefined}
                        onSaved={handleItemSaved}
                      />
                    </Box>
                    {selectedId && (
                      <Box sx={{ mt: 3 }}>
                        <ItemView id={selectedId} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            }
          />
        </Routes>
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Navigation />
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}
