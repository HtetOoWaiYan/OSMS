import { z } from "zod";

/**
 * User invitation validation schema
 */
export const inviteUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  role: z
    .enum(["admin", "agent"])
    .refine((val) => val === "admin" || val === "agent", {
      message: "Role must be either admin or agent",
    }),
});

export type InviteUserData = z.infer<typeof inviteUserSchema>;

/**
 * User update validation schema
 */
export const updateUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  role: z
    .enum(["admin", "agent"])
    .refine((val) => val === "admin" || val === "agent", {
      message: "Role must be either admin or agent",
    })
    .optional(),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;

/**
 * User role update validation schema
 */
export const updateUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z
    .enum(["admin", "agent"])
    .refine((val) => val === "admin" || val === "agent", {
      message: "Role must be either admin or agent",
    }),
});

export type UpdateUserRoleData = z.infer<typeof updateUserRoleSchema>;

/**
 * Remove user validation schema
 */
export const removeUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export type RemoveUserData = z.infer<typeof removeUserSchema>;

/**
 * Resend invitation validation schema
 */
export const resendInvitationSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export type ResendInvitationData = z.infer<typeof resendInvitationSchema>;
