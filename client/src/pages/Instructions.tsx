import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  useTheme,
  alpha,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

/**
 * Instructions Component
 * Provides user guidance for using the inventory management system
 */
export default function Instructions() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={{
        mb: 3,
        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: "12px",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: expanded ? 2 : 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              How to Use the Inventory Management System
            </Typography>
          </Box>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
            aria-label="expand instructions"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ mb: 3 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Follow these steps to manage your inventory effectively:
        </Typography>

        <List>
          {/* Adding Items */}
          <ListItem sx={{ alignItems: "flex-start", mb: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <AddIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Adding a New Item
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    1. Navigate to the <strong>Inventory</strong> page using the navigation tabs
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    2. Fill in the form on the right side with:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3, mb: 1 }}>
                    <li>
                      <strong>Item Name</strong>: Name of the item (required, min 2 characters)
                    </li>
                    <li>
                      <strong>Category</strong>: Item category (required, min 2 characters)
                    </li>
                    <li>
                      <strong>Description</strong>: Detailed description (required, min 5 characters)
                      <Chip
                        icon={<AIIcon />}
                        label="AI Generate"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1, fontSize: "0.7rem" }}
                      />
                    </li>
                    <li>
                      <strong>Quantity</strong>: Number of items in stock (required, non-negative integer)
                    </li>
                    <li>
                      <strong>Price</strong>: Item price (required, non-negative number)
                    </li>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    3. Click the <strong>"Create Item"</strong> button to save
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* Viewing Items */}
          <ListItem sx={{ alignItems: "flex-start", mb: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <ViewIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Viewing Items
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • All items are displayed in a card-based grid layout on the left side
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Each card shows: item name, category, description, price, and quantity
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Items with low stock (quantity &lt; 10) are highlighted with a red border and warning indicator
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Click the <strong>View icon</strong> <ViewIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.5 }} /> to see detailed information in the right panel
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* Editing Items */}
          <ListItem sx={{ alignItems: "flex-start", mb: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <EditIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Editing an Item
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    1. Click the <strong>Edit icon</strong> <EditIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.5 }} /> on any item card
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    2. The form will automatically populate with the item's current data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    3. Modify the fields you want to update and click <strong>"Update Item"</strong> to save changes
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* Deleting Items */}
          <ListItem sx={{ alignItems: "flex-start", mb: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Deleting an Item
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    1. Click the <strong>Delete icon</strong> <DeleteIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.5 }} /> on any item card
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    2. Confirm the deletion in the popup dialog
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ mt: 1, fontStyle: "italic" }}>
                    ⚠️ Warning: This action cannot be undone
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* Searching and Filtering */}
          <ListItem sx={{ alignItems: "flex-start", mb: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <SearchIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Searching and Filtering
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Use the <strong>Search box</strong> to search by item name or description (case-insensitive)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Use the <strong>Category dropdown</strong> <CategoryIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.5 }} /> to filter items by category
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Use <strong>Pagination</strong> at the bottom to navigate through multiple pages of items
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* AI Features */}
          <ListItem sx={{ alignItems: "flex-start" }}>
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <AIIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  AI-Powered Description Generation
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Enter the item name and category in the form
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Click the <strong>AI icon</strong> <AIIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.5 }} /> next to the description field to automatically generate a description
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </List>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: "8px",
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            💡 Tips:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <li>
              <Typography variant="body2" color="text.secondary">
                The interface is fully responsive and works on mobile, tablet, and desktop devices
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                All form fields are validated in real-time to ensure data quality
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Visit the Dashboard to see inventory statistics and analytics
              </Typography>
            </li>
          </Box>
        </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

