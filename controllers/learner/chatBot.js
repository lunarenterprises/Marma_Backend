// ===================== FAQ DATA =====================
const faqs = [
    {
        question: "What is CP REFLEX MARMA THERAPY ?",
        answer: "CP’s Reflex Marma Therapy is a blending of two distinct wellness therapies namely Foot reflexology and Holistic Chakra Healing. It is a non-invasive therapy."
    },
    {
        question: "What does the C.P stands for in CP’s Reflex Marma ?",
        answer: "C. P. is the short form of the name CHANDRAN POOCHAKKAD, an Internationally well-known inventor, Award Winning Multilingual Author, Provisional Teacher of Acupuncture, and Alternative Therapist since 26 years."
    },
    {
        question: "What are the benefits of CP’s Reflex marma Therapy ?",
        answer: "Benefits include stress reduction, pain relief, improved circulation, better sleep, detoxification, mood enhancement, boosted immunity, and holistic healing."
    },
    {
        question: "Is the CP’s Reflex Marma a quackery?",
        answer: "Reflexology has more than 5000 years of history and chakra healing is described in ancient Indian texts."
    },
    {
        question: "Is there any medication in CP’s Reflex Marma Therapy ?",
        answer: "No medication is used. It is a non-invasive therapy."
    }
];

// ===================== GREETINGS =====================
const greetings = [
    "hi", "hello", "hey", "hai",
    "good morning", "good afternoon", "good evening"
];

// ===================== HELPERS =====================
const isGreeting = (text) => {
    text = text.toLowerCase();
    return greetings.some(word => text.includes(word));
};

const getQuestionList = (excludeQuestion = null) => {
    return faqs
        .filter(faq => faq.question !== excludeQuestion)
        .map(faq => faq.question);
};

const getBestMatch = (search) => {
    const searchWords = search.toLowerCase().split(/\s+/);

    let bestMatch = null;
    let maxMatches = 0;

    for (const faq of faqs) {
        const text = (faq.question + " " + faq.answer).toLowerCase();
        let matchCount = 0;

        for (const word of searchWords) {
            if (word.length > 2 && text.includes(word)) {
                matchCount++;
            }
        }

        if (matchCount > maxMatches) {
            maxMatches = matchCount;
            bestMatch = faq;
        }
    }

    return maxMatches >= 2 ? bestMatch : null;
};

// ===================== CONTROLLER =====================
module.exports.GetAnswer = async (req, res) => {
    try {
        const { search } = req.body;

        if (!search || search.trim() === "") {
            return res.send({
                result: false,
                message: "Please enter a question",
                questions: getQuestionList()
            });
        }


        // Find best answer
        const match = getBestMatch(search);

        // ✅ Answer + remaining questions
        if (match) {
            return res.send({
                result: true,
                question: match.question,
                answer: match.answer,
                nextQuestions: getQuestionList(match.question)
            });
        }

        // Unknown input → suggest questions
        return res.send({
            result: false,
            message: "I couldn't understand your question. Please choose from below:",
            questions: getQuestionList()
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};
