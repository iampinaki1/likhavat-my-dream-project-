import { z } from "zod";

// Generic validation middleware factory
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({ success: false, msg: "Validation failed", errors });
  }
  req.body = result.data; // use parsed/sanitized data
  next();
};

// ── Auth schemas ──────────────────────────────────────────────────────────────
export const signupSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  termAndCondition: z.boolean().refine(v => v === true, "You must accept the terms"),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.union([z.string(), z.number()]).transform(v => Number(v)),
});

export const changePasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8).max(72),
});

// ── Script schemas ────────────────────────────────────────────────────────────
export const createScriptSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(2000).trim(),
  genre: z.enum(["Drama","Comedy","Romance","Horror","Thriller","Action","Adventure","Science Fiction","Fantasy","Social Message","Biography","Historical"]),
  purpose: z.enum(["Short Film","Stage Play","YouTube Skit","Advertisement","Educational Video","Awareness Video"]),
  visibility: z.enum(["public","private","restricted"]).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export const updateScriptSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().min(1).max(2000).trim().optional(),
  genre: z.enum(["Drama","Comedy","Romance","Horror","Thriller","Action","Adventure","Science Fiction","Fantasy","Social Message","Biography","Historical"]).optional(),
  purpose: z.enum(["Short Film","Stage Play","YouTube Skit","Advertisement","Educational Video","Awareness Video"]).optional(),
  visibility: z.enum(["public","private","restricted"]).optional(),
});

export const versionBodySchema = z.object({
  body: z.string().max(500000).optional(),
  versionId: z.string().optional(),
});

// ── Book schemas ──────────────────────────────────────────────────────────────
export const createBookSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  visibility: z.enum(["public","private","restricted"]).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export const createChapterSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).max(500000).trim(),
  chapterNumber: z.number().int().positive(),
  bookId: z.string().min(1),
});

// ── Poem schemas ──────────────────────────────────────────────────────────────
export const createPoemSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).max(50000).trim(),
  subject: z.string().max(100).trim().optional(),
});

// ── Comment schema ────────────────────────────────────────────────────────────
export const commentSchema = z.object({
  text: z.string().min(1).max(2000).trim(),
});
