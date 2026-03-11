const express = require("express");
const multer = require("multer");
const path = require("path");
const { body, validationResult } = require("express-validator");
const { parseFile } = require("../services/parseService");
const { generateSummary } = require("../services/aiService");
const { sendEmail } = require("../services/emailService");

const router = express.Router();

// Multer config — memory storage, restrict file types & size
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [".csv", ".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .csv, .xlsx, and .xls files are allowed"));
    }
  },
});

/**
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: Upload a sales data file and email an AI-generated summary
 *     description: >
 *       Accepts a CSV or XLSX file along with a recipient email address.
 *       The file is parsed, sent to Groq LLM for analysis, and the resulting
 *       narrative summary is emailed to the provided address.
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - email
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: A .csv or .xlsx sales data file (max 5 MB)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address for the summary
 *     responses:
 *       200:
 *         description: Summary generated and emailed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Summary sent successfully!
 *                 summary:
 *                   type: string
 *                   example: "Q1 2026 saw strong electronics sales..."
 *       400:
 *         description: Validation error (bad email, missing file, wrong format)
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post(
  "/analyze",
  upload.single("file"),
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email address is required"),
  ],
  async (req, res) => {
    try {
      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Please upload a .csv or .xlsx file" });
      }

      const { email } = req.body;

      // 1. Parse the uploaded file
      const data = parseFile(req.file);
      if (!data || data.length === 0) {
        return res.status(400).json({ error: "The uploaded file contains no data" });
      }

      // 2. Generate AI summary via Groq
      const summary = await generateSummary(data);

      // 3. Email the summary
      await sendEmail(email, summary);

      return res.json({
        message: "Summary sent successfully!",
        summary,
      });
    } catch (err) {
      console.error("Analyze error:", err.message);

      if (err.message.includes("Only .csv")) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds 5 MB limit" });
      }

      return res.status(500).json({
        error: "Failed to process the file. Please try again.",
      });
    }
  }
);

module.exports = router;
