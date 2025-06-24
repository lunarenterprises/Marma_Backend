const { Therapist, WithdrawRequest, WalletHistory } = require('../../models/index.js');

module.exports.WithdrawRequest = async (req, res) => {
    try {
        let user = req.user
        // console.log(user);

        var { amount } = req.body || {}
        let therapist_id = user.id

        if (!amount) {
            return res.send({
                result: false,
                message: "Amount id is required"
            })
        }

        const therapist = await Therapist.findByPk(therapist_id);

        if (!therapist) {
            return res.send({
                result: false,
                message: "Therapist not found"
            })
        }

        if (therapist.wallet < amount) {
            return res.send({
                result: false,
                message: "Insufficient balance in your wallet"
            })
        }
        let balanceAmount = await therapist.wallet - amount

        const addWithdrawRequest = await WithdrawRequest.create({
            wr_therapist_id: therapist_id,
            wr_amount: amount
        });

        const UpdateWallet = await Therapist.update(
            { wallet: balanceAmount },
            { where: { id: therapist_id } }
        );


        console.log(addWithdrawRequest, "addbooking");
        console.log(UpdateWallet, "addbooking");


        return res.send({
            result: true,
            message: "Withdraw request send succesfully"
        })


    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}



module.exports.WithdrawRequestApprovel = async (req, res) => {
    try {
        let user = req.user
        console.log("userrrr :", user);

        var { wr_id, status } = req.body || {}
        let role = user.role

        if (role !== 'admin') {
            return res.send({
                result: false,
                message: "You are not Authorized"
            })
        }

        if (!wr_id) {
            return res.send({
                result: false,
                message: "withdraw request id is required"
            })
        }

        const withdrawrequest = await WithdrawRequest.findByPk(wr_id);

        if (!withdrawrequest) {
            return res.send({
                result: false,
                message: "Withdraw Request not found"
            })
        }
        let therapist_id = withdrawrequest.wr_therapist_id

        const UpdateWalletstatus = await WithdrawRequest.update(
            { wr_status: status },
            { where: { wr_id: wr_id } }
        );

        if (!UpdateWalletstatus) {
            return res.send({
                result: false,
                message: "failed to update request status"
            })
        }
        if (status == 'Approved') {

            let addwallethistory = await WalletHistory.create({
                wh_therapist_id: therapist_id,
                wh_amount: payAmount,
                wh_type: 'Debit'
            });

            if (!addwallethistory) {
                return res.send({
                    result: false,
                    message: "failed to add debit wallet history"
                })
            }
        }
        // console.log(addWithdrawRequest, "addbooking");
        // console.log(UpdateWallet, "addbooking");

        return res.send({
            result: true,
            message: `Withdraw request ${status} succesfully`
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}