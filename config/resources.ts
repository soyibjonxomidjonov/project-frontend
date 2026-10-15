import { z } from "zod";

export type ResourceField = { key: string; label: string; type: "text" | "textarea" | "number" | "date" | "select"; required?: boolean; options?: string[] };
export type ResourceSchema = { type: string; singular: string; plural: string; description: string; fields: ResourceField[] };

// Replace this schema after the competition topic is known. Entity.data holds the domain fields.
export const resourceSchema: ResourceSchema = {
  type: "item", singular: "Record", plural: "Records", description: "A flexible collection ready for your domain.",
  fields: [
    { key: "description", label: "Description", type: "textarea" },
    { key: "category", label: "Category", type: "text" },
  ],
};

export function resourceFormSchema(schema: ResourceSchema) {
  const shape: Record<string, z.ZodType> = { title: z.string().trim().min(1, "Title is required").max(120) };
  for (const field of schema.fields) {
    const base = field.type === "number" ? z.coerce.number<number>().finite() : z.string().trim();
    shape[field.key] = field.required ? (field.type === "number" ? base : (base as z.ZodString).min(1, `${field.label} is required`)) : base.optional();
  }
  return z.object(shape);
}
