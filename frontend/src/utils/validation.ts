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

// =============================================================================
// DOCUMENT VALIDATION SCHEMAS
// =============================================================================

// Document upload validation schema
export const documentUploadSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
    
  description: z
    .string()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(1000, "La description ne peut pas dépasser 1000 caractères"),
    
  summary: z
    .string()
    .max(300, "Le résumé ne peut pas dépasser 300 caractères")
    .optional(),
    
  category: z.string().refine(
    (val) => [
      'clinical-guidelines',
      'training-materials',
      'case-studies',
      'best-practices',
      'research-papers',
      'policy-documents',
      'presentations',
      'videos',
      'infographics',
      'assessments'
    ].includes(val),
    { message: "Veuillez sélectionner une catégorie valide" }
  ),
  
  tags: z
    .array(z.string().max(50, "Un tag ne peut pas dépasser 50 caractères"))
    .max(10, "Maximum 10 tags autorisés"),
    
  keywords: z
    .array(z.string().max(50, "Un mot-clé ne peut pas dépasser 50 caractères"))
    .max(20, "Maximum 20 mots-clés autorisés"),
    
  priority: z.string().refine(
    (val) => ['low', 'normal', 'high', 'critical'].includes(val),
    { message: "Veuillez sélectionner une priorité valide" }
  ),
  
  language: z.string().refine(
    (val) => ['fr', 'en'].includes(val),
    { message: "Langue non supportée" }
  ),
  
  medicalSpecialty: z
    .array(z.string())
    .optional(),
    
  targetAudience: z
    .array(z.string().refine(
      (val) => ['attendee', 'specialist', 'admin', 'stakeholder'].includes(val),
      { message: "Public cible invalide" }
    ))
    .optional(),
    
  difficultyLevel: z
    .string()
    .refine(
      (val) => ['beginner', 'intermediate', 'advanced', 'expert'].includes(val),
      { message: "Niveau de difficulté invalide" }
    )
    .optional(),
    
  cmeCredits: z
    .number()
    .min(0, "Les crédits CME ne peuvent pas être négatifs")
    .max(50, "Maximum 50 crédits CME autorisés")
    .optional(),
    
  medicalDisclaimer: z
    .string()
    .max(500, "L'avertissement médical ne peut pas dépasser 500 caractères")
    .optional(),
    
  clinicalEvidence: z
    .string()
    .max(1000, "Les preuves cliniques ne peuvent pas dépasser 1000 caractères")
    .optional(),
    
  authorCredentials: z
    .string()
    .max(200, "Les références de l'auteur ne peuvent pas dépasser 200 caractères")
    .optional(),
    
  isPublic: z.boolean(),
  
  allowedRoles: z
    .array(z.string().refine(
      (val) => ['attendee', 'specialist', 'admin', 'stakeholder'].includes(val),
      { message: "Rôle invalide" }
    )),
    
  requiresApproval: z.boolean(),
  
  embargoUntil: z.date().optional(),
  
  expiresAt: z.date().optional(),
}).refine(
  (data) => {
    if (data.embargoUntil && data.expiresAt) {
      return data.embargoUntil < data.expiresAt;
    }
    return true;
  },
  {
    message: "La date d'embargo doit être antérieure à la date d'expiration",
    path: ["embargoUntil"]
  }
);

// Document search validation schema
export const documentSearchSchema = z.object({
  query: z.string().max(200, "La recherche ne peut pas dépasser 200 caractères"),
  
  categories: z.array(z.string()),
  
  tags: z.array(z.string()),
  
  status: z.array(z.string()),
  
  language: z.string().refine(
    (val) => ['fr', 'en'].includes(val),
    { message: "Langue non supportée" }
  ),
  
  priority: z.array(z.string()),
  
  dateFrom: z.date().optional(),
  
  dateTo: z.date().optional(),
  
  fileTypes: z.array(z.string()),
  
  difficultyLevels: z.array(z.string()),
  
  medicalSpecialties: z.array(z.string()),
  
  hasVideo: z.boolean(),
  
  hasCMECredits: z.boolean(),
  
  sortBy: z.string().refine(
    (val) => ['relevance', 'date', 'title', 'author', 'views', 'downloads'].includes(val),
    { message: "Critère de tri invalide" }
  ),
  
  sortOrder: z.string().refine(
    (val) => ['asc', 'desc'].includes(val),
    { message: "Ordre de tri invalide" }
  ),
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return data.dateFrom <= data.dateTo;
    }
    return true;
  },
  {
    message: "La date de début doit être antérieure ou égale à la date de fin",
    path: ["dateFrom"]
  }
);

// Document review validation schema
export const documentReviewSchema = z.object({
  documentId: z.string().min(1, "ID du document requis"),
  
  status: z.string().refine(
    (val) => ['approved', 'rejected', 'needs-revision'].includes(val),
    { message: "Statut de révision invalide" }
  ),
  
  reviewNotes: z
    .string()
    .min(10, "Les notes de révision doivent contenir au moins 10 caractères")
    .max(1000, "Les notes de révision ne peuvent pas dépasser 1000 caractères"),
    
  contentAccuracy: z
    .number()
    .min(1, "Note minimum: 1")
    .max(5, "Note maximum: 5"),
    
  clinicalRelevance: z
    .number()
    .min(1, "Note minimum: 1")
    .max(5, "Note maximum: 5"),
    
  presentationQuality: z
    .number()
    .min(1, "Note minimum: 1")
    .max(5, "Note maximum: 5"),
    
  languageClarity: z
    .number()
    .min(1, "Note minimum: 1")
    .max(5, "Note maximum: 5"),
});

// Document rating validation schema
export const documentRatingSchema = z.object({
  documentId: z.string().min(1, "ID du document requis"),
  
  rating: z
    .number()
    .min(1, "Note minimum: 1 étoile")
    .max(5, "Note maximum: 5 étoiles"),
    
  review: z
    .string()
    .max(500, "L'avis ne peut pas dépasser 500 caractères")
    .optional(),
    
  isAnonymous: z.boolean(),
});

// File upload validation schema
export const fileUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    { message: "Fichier requis" }
  ).refine(
    (file) => file.size <= 500 * 1024 * 1024, // 500MB
    { message: "Le fichier ne peut pas dépasser 500MB" }
  ).refine(
    (file) => file.size >= 1024, // 1KB
    { message: "Le fichier doit faire au moins 1KB" }
  ).refine(
    (file) => [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'video/mp4',
      'video/webm'
    ].includes(file.type),
    { message: "Type de fichier non supporté" }
  ),
});

// Export types for TypeScript
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
export type DocumentSearchFormData = z.infer<typeof documentSearchSchema>;
export type DocumentReviewFormData = z.infer<typeof documentReviewSchema>;
export type DocumentRatingFormData = z.infer<typeof documentRatingSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
