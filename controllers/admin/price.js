const { priceDetails } = require('../../models/index');
let moment = require('moment');
const { where } = require('sequelize');

module.exports.AddPriceDetails = async (req, res) => {
    try {

        const { pd_minutes, pd_price, pd_therapist_fee, pd_doctor_fee } = req.body;

        if (!pd_minutes || !pd_price || !pd_therapist_fee || !pd_doctor_fee) {
            return res.status(400).send({
                result: false,
                message: "all Price details is required.",
            });
        }

        try {

            const newPriceDetails = await priceDetails.create({
                pd_minutes, pd_price, pd_therapist_fee, pd_doctor_fee
            });

            console.log("newPriceDetails", newPriceDetails);

            if (newPriceDetails) {
                return res.send({
                    result: true,
                    message: "Price Details added successfully",
                    data: newPriceDetails,
                });
            } else {
                return res.send({
                    result: false,
                    message: "Failed to add price details",
                    data: newPriceDetails,
                });
            }

        } catch (dbErr) {
            return res.status(500).send({
                result: false,
                message: "Database error.",
                data: dbErr.message,
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            result: false,
            message: "Unexpected server error.",
            data: error.message,
        });
    }
};

module.exports.ListPriceDetails = async (req, res) => {
    try {

        let PriceDetailslist = await priceDetails.findAll();

        if (PriceDetailslist.length > 0) {
            return res.send({
                result: true,
                message: "Data retrived",
                list: PriceDetailslist,
            });
        } else {
            return res.send({
                result: false,
                message: "data not found",
            });
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}


module.exports.EditPriceDetails = async (req, res) => {
    try {

        const { pd_id, pd_minutes, pd_price, pd_therapist_fee, pd_doctor_fee } = req.body;

        if (!pd_id) {
            return res.status(400).send({
                result: false,
                message: "Price Details ID is required.",
            });
        }

        const PriceDetails = await priceDetails.findByPk(pd_id);
        if (!PriceDetails) {
            return res.status(404).send({
                result: false,
                message: "Price Details not found.",
            });
        }

        // Prepare updated fields
        const updatedData = {};
        if (pd_minutes) updatedData.pd_minutes = pd_minutes;
        if (pd_price) updatedData.pd_price = pd_price;
        if (pd_therapist_fee) updatedData.pd_therapist_fee = pd_therapist_fee;
        if (pd_doctor_fee) updatedData.pd_doctor_fee = pd_doctor_fee;

        // Update PriceDetails instance
        let updateprice = await priceDetails.update(updatedData, {
            where: { pd_id: pd_id }
        });

        if (updateprice) {
            return res.send({
                result: true,
                message: "Price Details updated successfully",
                data: PriceDetails
            });
        } else {
            return res.send({
                result: false,
                message: "Failed to updated Price Details ",
                data: PriceDetails
            });
        }


    } catch (error) {
        return res.status(500).send({
            result: false,
            message: "Unexpected server error.",
            data: error.message,
        });
    }
};


module.exports.DeletePriceDetails = async (req, res) => {
    try {
        let { pd_id } = req.body || {};


        let checkPriceDetails = await priceDetails.findAll({
            where: { pd_id: pd_id }
        });


        if (checkPriceDetails.length > 0) {
            let DeletePriceDetails = await priceDetails.destroy({
                where: { pd_id: pd_id }
            });
            console.log("DeletePriceDetails :", DeletePriceDetails);

            if (DeletePriceDetails) {
                return res.send({
                    result: true,
                    message: "Price Details deleted sucessfully",
                });
            }

        } else {
            return res.send({
                result: false,
                message: "Price Details data not found",
            });
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}
