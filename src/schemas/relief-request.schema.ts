import { z } from "zod";

export const disasterTypes = [
  "flood",
  "earthquake",
  "landslide",
  "fire",
] as const;
export const reliefTypes = [
  "food",
  "medical",
  "shelter",
  "evacuation",
] as const;
export const priorities = ["low", "medium", "high", "critical"] as const;
export const statuses = [
  "pending",
  "approved",
  "assigned",
  "resolved",
] as const;

export const reliefRequestSchema = z.object({
  disaster_type: z.enum(disasterTypes),
  ward_number: z
    .number()
    .min(1, "Ward number must be between 1 and 35")
    .max(35, "Ward number must be between 1 and 35"),
  location_details: z
    .string()
    .min(10, "Location details must be at least 10 characters")
    .max(500, "Location details must not exceed 500 characters"),
  damage_description: z
    .string()
    .min(20, "Damage description must be at least 20 characters")
    .max(2000, "Damage description must not exceed 2000 characters"),
  relief_type: z.enum(reliefTypes),
  priority: z.enum(priorities),
});

export const reliefRequestUpdateSchema = z.object({
  status: z.enum(statuses).optional(),
  assigned_team: z.string().max(100).optional().nullable(),
  admin_remark: z.string().max(500).optional().nullable(),
});

export type ReliefRequestInput = z.infer<typeof reliefRequestSchema>;
export type ReliefRequestUpdateInput = z.infer<
  typeof reliefRequestUpdateSchema
>;
