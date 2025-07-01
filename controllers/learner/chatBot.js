const faqs = [
    {
        "question": "What is \"CP's REFLEX MARMA THERAPY\"?",
        "answer": "CP’s Reflex Marma Therapy is a blending of two distinct wellness therapies namely Foot reflexology and Holistic Chakra Healing. It is a non-invasive therapy."
    },
    {
        "question": "What does the C.P stands for in CP’s Reflex Marma?",
        "answer": "C. P. is the short form of the name CHANDRAN POOCHAKKAD, an Internationally well-known inventor, Award Winning Multilingual Author of several Books, Provisional Teacher of Acupuncture of a Government Acupuncture Council in India, and the Director of Stylus Acupuncture Wellness Clinic and Training Centre, who had been serving as an Alternative Therapist since last 26 years."
    },
    {
        "question": "What are the benefits of CP’s Reflex marma Therapy?",
        "answer": "The benefits of Foot reflexology, a type of massage therapy, offers several potential health benefits, including stress reduction, pain relief, and improved circulation, Enhanced Sleep Quality, Detoxification, Mood Enhancement, boosted immune function, help reduce symptoms of anxiety and depression etc. Chakra healing helps to relieve mental, spiritual and Holistic aspects of Human illness."
    },
    {
        "question": "Is the CP’s Reflex Marma a quackery?",
        "answer": "Reflexology has a history of more than 5000 years and found in Egypt and Indian culture. Father of modern Reflexology is believed to be an American ENT Doctor William Fitzgerald (1872-1942). Chakra healing was first mentioned in The Sat-Cakra-Nirupana (part of the Shiva Samhita tradition)."
    },
    {
        "question": "Is there any medication in CP’s Reflex Marma Therapy?",
        "answer": "No medication, this is a non-invasive therapy."
    },
    {
        "question": "How does the CP’s REFLEX MARMA App work?",
        "answer": "1. Download CP’s Reflex Marma Mobile app\n2. Make the payment for training fee\n3. Attend 3 days Professional Skill Development Training at Trivandrum\n4. On successful Completion, you'll be added as a therapist in the app\n5. Receive service requests through the app\n6. Your account will be credited for services rendered"
    },
    {
        "question": "How will my performance be assessed at the end of the programme?",
        "answer": "There will be Continuous Evaluation and correction Process throughout the three days training programme. All those who complete the training programme are allowed to start working as CP’s Reflex Marma therapist."
    },
    {
        "question": "Is the course accredited by any recognized body or institution?",
        "answer": "No"
    },
    {
        "question": "What kind of certificate or qualification do I receive upon completion?",
        "answer": "On successful completion, you will be awarded a Certificate issued by Stylus Acupuncture Wellness Research clinic and Training Centre."
    },
    {
        "question": "Do you use any kind of Tools in this Therapy?",
        "answer": "Yes, we will teach how to use a Wooden Acupressure Jimmy similar to the one used by Honourable Indian Prime Minister Sri. Narendra Modi during his visit to Mahabalipuram, Tamil Nādu."
    },
    {
        "question": "What kind of technical support is available if I encounter issues?",
        "answer": "A help desk team of experts and Doctors at CP’s Reflex Marma will be available for online service for the registered CP’s Reflex Marma Therapists."
    },
    {
        "question": "Is the course accessible for individuals with disabilities?",
        "answer": "Yes, if you think your hands are capable of serving the needy clients."
    },
    {
        "question": "Can a college going student work as a Part time CP’s Reflex Marma therapist?",
        "answer": "Yes. There will be special Fee discount for college going students."
    },
    {
        "question": "I am a working employee; can I work as a part time CP’s Reflex Marma Therapist?",
        "answer": "Yes. You can."
    },
    {
        "question": "How long does it take to process an application?",
        "answer": "Please check with the CP’s Reflex Marma App and select your choice of dates for training."
    }
]

module.exports.GetAnswer = async (req, res) => {
    try {
        let user = req.user
        let { search } = req.body
        if (!search) {
            return res.send({
                result: false,
                message: "Search is empty"
            })
        }
        const fallback = faqs.find(faq =>
            faq.question.toLowerCase().includes(search.toLowerCase()) ||
            faq.answer.toLowerCase().includes(search.toLowerCase())
        );
        if (fallback) {
            return res.send({
                result: true,
                question: fallback.question,
                answer: fallback.answer
            });
        }
        return res.send({
            result: false,
            message: "Sorry, I couldn't find an answer."
        });
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}