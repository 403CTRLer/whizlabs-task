import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from "@mui/material";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load theme from localStorage or default to dark
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("themeMode");
    return (saved === "dark" || saved === null ? "dark" : "light") as ThemeMode;
  });

  // Apply theme to document for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Create MUI theme with enhanced color palette
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#3182ce" : "#3B82F6",
        light: mode === "light" ? "#5a9bd4" : "#60a5fa",
        dark: mode === "light" ? "#2c5aa0" : "#2563EB",
        contrastText: mode === "light" ? "#ffffff" : "#ffffff",
      },
      secondary: {
        main: mode === "light" ? "#805ad5" : "#a78bfa",
        light: mode === "light" ? "#9f7aea" : "#c4b5fd",
        dark: mode === "light" ? "#6b46c1" : "#8b5cf6",
      },
      background: {
        default: mode === "light" ? "#f5f7fa" : "#18181B",
        paper: mode === "light" ? "#ffffff" : "#27272A",
      },
      text: {
        primary: mode === "light" ? "#1a202c" : "#E2E8F0",
        secondary: mode === "light" ? "#718096" : "#A1A1AA",
        disabled: mode === "light" ? "#a0aec0" : "#71717A",
      },
      divider: mode === "light" ? "#e2e8f0" : "#3F3F46",
      error: {
        main: mode === "light" ? "#e53e3e" : "#EF4444",
      },
      warning: {
        main: mode === "light" ? "#d69e2e" : "#F59E0B",
      },
      success: {
        main: mode === "light" ? "#38a169" : "#22C55E",
      },
      info: {
        main: mode === "light" ? "#3182ce" : "#0EA5E9",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: mode === "light" 
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
            border: `1px solid ${mode === "light" ? "#e2e8f0" : "#3F3F46"}`,
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: mode === "light"
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
          contained: {
            boxShadow: mode === "light"
              ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
              : "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
            "&:hover": {
              boxShadow: mode === "light"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              transition: "all 0.2s ease",
              "&:hover": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: mode === "light" ? "#3182ce" : "#3B82F6",
                },
              },
              "&.Mui-focused": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: "2px",
                },
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            transition: "all 0.2s ease",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "6px",
            fontWeight: 500,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor: mode === "light" ? "rgba(49, 130, 206, 0.08)" : "rgba(59, 130, 246, 0.16)",
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
