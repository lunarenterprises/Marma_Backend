const { Therapist, Role } = require('../../models/index')
const { formatPhoneNumber } = require('../../utils/sms')

module.exports.AddLearner = async (req, res) => {
    try {
        let { name, gender, phone, email } = req.body || {}
        if (!name || !gender || !email || !phone) {
            return res.send({
                result: false,
                message: "Name, phone, email and gender are required"
            })
        }
        await Therapist.destroy({
            where: {
                phone: formatPhoneNumber(phone),
                phoneVerified: 'false',
            },
        });
        await Therapist.destroy({
            where: {
                email: email.toLowerCase().trim(),
                phoneVerified: 'false',
            },
        })
        let checkEmail = await Therapist.findOne({
            where: { email: email.toLowerCase().trim(), phoneVerified: "true" }
        })
        if (checkEmail) {
            return res.send({
                result: false,
                message: "Email already registered"
            })
        }
        let checkPhone = await Therapist.findOne({
            where: { phone: formatPhoneNumber(phone), phoneVerified: "true" }
        })
        if (checkPhone) {
            return res.send({
                result: false,
                message: "Phone number is already registered"
            })
        }
        let formattedNumber = formatPhoneNumber(phone)

        let createNew = await Therapist.create({
            name,
            gender,
            phone: formattedNumber,
            email,
            status:'Approved',
            roleId: 2
        })

        console.log("createNew : ", createNew)
        if (createNew) {
            return res.send({
                result: true,
                message: "Registration successful.",
                learner_id: createNew.id,
            });

        } else {
            return res.send({
                result: false,
                message: "Failed to register."
            })
        }
    } catch (error) {
        console.log("error : ", error)
        return res.send({
            result: false,
            message: error.message
        })
    }
}