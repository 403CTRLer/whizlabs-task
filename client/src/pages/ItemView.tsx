import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { api } from "../api";
import { useNotification } from "../contexts/NotificationContext";

export default function ItemView({ id }: { id: string }) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const theme = useTheme();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getItem(id);
        if (mounted) setItem(data);
      } catch (error: any) {
        showNotification(`Error loading item: ${error.message}`, "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, showNotification]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Item not found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {item.itemName}
          </Typography>
          <Chip label={item.category} color="primary" sx={{ fontWeight: 500 }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
            Description
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {item.description}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            p: 2,
            borderRadius: "8px",
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              Price
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
              ${item.price.toFixed(2)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              Quantity
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {item.quantity}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              Total Value
            </Typography>
            <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
              ${(item.price * item.quantity).toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {item.createdAt && (
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
