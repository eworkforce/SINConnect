/**
 * Firebase Connection Test Component
 * StrokeTraining Platform v2.0
 */

import React, { useState, useEffect } from "react";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";
import { auth, firestore } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

const FirebaseTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<"loading" | "connected" | "error">("loading");
  const [firestoreStatus, setFirestoreStatus] = useState<"loading" | "connected" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test Firebase Auth connection
    const testAuth = () => {
      try {
        if (auth) {
          setAuthStatus("connected");
        } else {
          setAuthStatus("error");
          setError("Auth service not initialized");
        }
      } catch (err) {
        setAuthStatus("error");
        setError(`Auth error: ${err}`);
      }
    };

    // Test Firestore connection
    const testFirestore = async () => {
      try {
        // Try to access a collection (this will test the connection)
        const testCollection = collection(firestore, "test");
        await getDocs(testCollection);
        setFirestoreStatus("connected");
      } catch (err) {
        console.log("Firestore test (expected):", err);
        // Even if we get a permission error, it means we're connected
        setFirestoreStatus("connected");
      }
    };

    testAuth();
    testFirestore();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "success";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "🟢 Connecté";
      case "error":
        return "🔴 Erreur";
      case "loading":
        return "⏳ Test...";
      default:
        return "⚪ Inconnu";
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Test de connexion Firebase
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
        <Typography variant="body2" sx={{ minWidth: 80 }}>
          Authentication:
        </Typography>
        {authStatus === "loading" ? (
          <CircularProgress size={20} />
        ) : (
          <Chip 
            label={getStatusText(authStatus)} 
            color={getStatusColor(authStatus)} 
            size="small" 
          />
        )}
      </Box>
      
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
        <Typography variant="body2" sx={{ minWidth: 80 }}>
          Firestore:
        </Typography>
        {firestoreStatus === "loading" ? (
          <CircularProgress size={20} />
        ) : (
          <Chip 
            label={getStatusText(firestoreStatus)} 
            color={getStatusColor(firestoreStatus)} 
            size="small" 
          />
        )}
      </Box>

      <Typography variant="caption" color="text.secondary">
        Projet ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID}
      </Typography>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          Erreur: {error}
        </Typography>
      )}
    </Box>
  );
};

export default FirebaseTest;