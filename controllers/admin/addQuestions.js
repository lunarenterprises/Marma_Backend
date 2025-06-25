const formidable = require("formidable");
const fs = require("fs");
const mammoth = require("mammoth");
const { Questions } = require("../../models/index"); // Sequelize model

module.exports.UploadQuestions = (req, res) => {
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        const filePath = files.file.filepath;

        try {
            const result = await mammoth.extractRawText({ path: filePath });
            const lines = result.value.split("\n").map(line => line.trim()).filter(Boolean);

            const questions = [];
            let answerKeys = [];

            // Helper: extract A, B, C... from answer key lines
            const extractAnswersFromLine = (line) => {
                const matches = line.match(/[A-D]/g);
                return matches || [];
            };

            // Parse lines
            for (let line of lines) {
                // Append answer keys
                if (line.startsWith("Answer Key")) continue;
                if (/^\s*[A-D]\s*(\d+\.)?/.test(line)) {
                    answerKeys = answerKeys.concat(extractAnswersFromLine(line));
                    continue;
                }

                // Extract question and options from merged lines
                const match = line.match(/^(.*?)(A\..*)$/);
                if (match) {
                    const questionMatch = match[1].trim().match(/^\d+\.\s*(.*)/);
                    const questionText = questionMatch ? questionMatch[1].trim() : match[1].trim();
                    let optionsRaw = match[2].trim();

                    // Fix spacing between option labels
                    optionsRaw = optionsRaw.replace(/([A-D])\./g, ' $1.');

                    const options = [];
                    const optRegex = /([A-D])\.\s*(.*?)(?=\s+[A-D]\.|$)/gs;

                    let m;
                    while ((m = optRegex.exec(optionsRaw)) !== null) {
                        options.push(m[2].trim());
                    }
                    questions.push({ question: questionText, options, answer: "" });
                }

            }

            // Apply correct answer using letter keys
            questions.forEach((q, i) => {
                const letter = answerKeys[i];
                const index = ["A", "B", "C", "D"].indexOf(letter);
                q.answer = q.options[index] || "";
            });
            // Save to DB
            for (let q of questions) {
                await Questions.create({
                    question: q.question,
                    options: q.options,
                    answer: q.answer,
                    mark: 1
                });
            }

            res.json({
                success: true,
                message: "Questions uploaded successfully",
                total: questions.length
            });
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ success: false, error: error.message });
        } finally {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    });
};