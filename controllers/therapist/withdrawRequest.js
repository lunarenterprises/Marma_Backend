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

module.exports.GetWithdrawRequests = async (req, res) => {
    try {
        const { therapist_id, status } = req.body || {}

        const whereClause = {};
        if (therapist_id) whereClause.wr_therapist_id = therapist_id;
        if (status) whereClause.wr_status = status;


        const includeOptions = [
            {
                model: Therapist,
                as: 'therapist', // must match your association alias
                attributes: ['name', 'clinicName', 'phone', 'specialization', 'file'],
                required: false, // left join — includes therapists even without matches
            },
        ];

        // Fetch data
        const data = await WithdrawRequest.findAll({
            where: whereClause,
            include: includeOptions,
        });

        // Response handling
        if (data && data.length > 0) {
            return res.send({
                result: true,
                message: 'Data retrieved successfully',
                data,
            });
        } else {
            return res.send({
                result: false,
                message: 'No data found',
            });
        }
    } catch (error) {
        return res.status(500).send({
            result: false,
            message: error.message,
        });
    }
};


module.exports.WithdrawRequestApprovel = async (req, res) => {
    try {
        const user = req.user;
        const { wr_id, status } = req.body || {};
        const role = user?.Role?.name;

        if (role !== 'admin') {
            return res.send({ result: false, message: "You are not Authorized" });
        }

        if (!wr_id || !status) {
            return res.send({
                result: false,
                message: "withdraw request id and status are required"
            });
        }

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.send({
                result: false,
                message: "Invalid status"
            });
        }

        const withdrawrequest = await WithdrawRequest.findByPk(wr_id);

        if (!withdrawrequest) {
            return res.send({
                result: false,
                message: "Withdraw Request not found"
            });
        }

        // Prevent double action
        if (withdrawrequest.wr_status === status) {
            return res.send({
                result: false,
                message: `Withdraw request already ${status}`
            });
        }

        const therapist_id = withdrawrequest.wr_therapist_id;
        const amount = Number(withdrawrequest.wr_amount);

        // If REJECTED → refund wallet
        if (status === 'Rejected') {

            const therapist = await Therapist.findByPk(therapist_id);

            if (!therapist) {
                return res.send({
                    result: false,
                    message: "Therapist not found"
                });
            }

            therapist.wallet = Number(therapist.wallet) + amount;
            await therapist.save();

            // Wallet history (credit)
            await WalletHistory.create({
                wh_therapist_id: therapist_id,
                wh_amount: amount,
                wh_type: 'Credit'
            });
        }

        // Update withdraw request status
        withdrawrequest.wr_status = status;
        await withdrawrequest.save();

        return res.send({
            result: true,
            message: `Withdraw request ${status} successfully`
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


