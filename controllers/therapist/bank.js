const { Bank } = require('../../models/index')


module.exports.CreateBank = async (req, res) => {
    try {
        let user = req.user
        let { bank_name, holder_name, account_number, ifsc_code, branch } = req.body
        if (!bank_name || !holder_name || !account_number || !ifsc_code || !branch) {
            return res.send({
                result: false,
                message: "Bank name, holder name, account number, ifsc code and branch are required "
            })
        }
        let checkExist = await Bank.findOne({
            where: {
                therapist_id: user.id
            }
        })
        if (checkExist) {
            return res.send({
                result: false,
                message: "Bank already added."
            })
        }

        let created = await Bank.create({
            bank_name,
            user_name: holder_name,
            account_number,
            ifsc_code,
            branch,
            therapist_id: user.id
        })
        if (created) {
            return res.send({
                result: true,
                message: "Bank details added successfully."
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add bank details."
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.EditBank = async (req, res) => {
    try {
        let user = req.user
        let { bank_id, bank_name, holder_name, account_number, ifsc_code, branch } = req.body || {}
        if (!bank_id || !bank_name || !holder_name || !account_number || !ifsc_code || !branch) {
            return res.send({
                result: false,
                message: "Bank id, Bank name, holder name, account number, ifsc code and branch are required "
            })
        }
        let checkBank = await Bank.findOne({
            where: {
                id: bank_id,
                therapist_id: user.id
            }
        })
        if (!checkBank) {
            return res.send({
                result: false,
                message: "Bank data not exist"
            })
        }
        let [affectedCount] = await Bank.update(
            {
                bank_name,
                user_name: holder_name,
                account_number,
                ifsc_code,
                branch
            },
            { where: { id: bank_id } }
        )
        if (affectedCount > 0) {
            return res.send({
                result: true,
                message: "Bank updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to update bank"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.GetBank = async (req, res) => {
    try {
        let user = req.user
        let bankData = await Bank.findOne({
            where: { therapist_id: user.id }
        })
        if (bankData) {
            return res.send({
                result: true,
                message: "Bank data retrieved",
                data: bankData
            })
        } else {
            return res.send({
                result: false,
                message: "No data found."
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}