/**
 * Form Validation Schemas
 * StrokeTraining Platform v2.0
 */

import { z } from "zod";

// Registration form validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Format d'email invalide"),
  
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  
  confirmPassword: z
    .string()
    .min(1, "La confirmation du mot de passe est requise"),
  
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  
  hospital: z
    .string()
    .min(2, "Le nom de l'hôpital est requis")
    .max(200, "Le nom de l'hôpital ne peut pas dépasser 200 caractères"),
  
  specialization: z
    .string()
    .max(100, "La spécialisation ne peut pas dépasser 100 caractères")
    .optional(),
  
  region: z
    .string()
    .max(100, "La région ne peut pas dépasser 100 caractères")
    .optional(),
  
  phoneNumber: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{8,20}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal("")),
  
  role: z.string().refine(
    (val) => ["attendee", "specialist", "stakeholder"].includes(val),
    {
      message: "Veuillez sélectionner un rôle valide",
    }
  ),
  
  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Format d'email invalide"),
  
  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
  
  rememberMe: z.boolean().optional(),
});

// Password reset validation schema
export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Format d'email invalide"),
});

// Export types for TypeScript
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

// Helper function to get validation error messages
export const getValidationErrorMessage = (error: z.ZodError) => {
  return error.issues[0]?.message || "Données invalides";
};
