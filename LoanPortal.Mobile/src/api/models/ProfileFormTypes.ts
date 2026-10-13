import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  nmls: z.number().min(1, "NMLS is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  companyId: z.string().min(1, "Enter company name or type N/A if you don't have one"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export type ProfileFormPayloadData = {
  FirstName: string;
  LastName: string;
  JobTitle: string;
  NMLS: number;
  Phone: string;
  Email: string;
  CompanyId: string;
  Profile?: File | null;
};
