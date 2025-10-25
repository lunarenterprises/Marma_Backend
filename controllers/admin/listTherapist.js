let { Therapist, Category, Reviews, Booking, User, Op } = require('../../models/index');
const { Sequelize } = require('sequelize');

module.exports.ListTherapist = async (req, res) => {
    try {
        const { therapist_id, gender, category_id,search } = req.body || {}

        let whereClause = {};
        if (therapist_id) whereClause.id = therapist_id;
        if (category_id) whereClause.category_id = category_id;
        if (gender) whereClause.gender = gender;


        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { clinicName: { [Op.like]: `%${search}%` } },
                { specialization: { [Op.like]: `%${search}%` } },
                { specialty: { [Op.like]: `%${search}%` } },
                { state: { [Op.like]: `%${search}%` } },
                { district: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } },
                Sequelize.where(Sequelize.cast(Sequelize.col('category_id'), 'CHAR'), {
                    [Op.like]: `%${search}%`
                }),
            ];
        }

        // Common include array for aggregation query (aliases must match associations)
        const includeOptions = [
            {
                model: Category,
                as: 'category',
                attributes: ['c_id', 'c_name'],
                required: false,
            },
            {
                model: Booking,
                as: 'bookings',         // must match alias in association
                attributes: [],
                where: { status: 'completed' },
                required: false,        // left join so therapists with zero bookings included
            },
            {
                model: Reviews,
                as: 'reviews',          // must match alias in association
                attributes: [],
                where: { r_status: 'active' },
                required: false,        // left join so therapists with zero reviews included
            }
        ];

        // For aggregation, group by therapist and category fields
        const groupByFields = ['Therapist.id', 'category.c_id', 'category.c_name'];

        // ------------------- Single therapist -------------------
        if (therapist_id) {
            const therapist = await Therapist.findOne({
                where: {
                    roleId: 3,
                    ...whereClause
                },
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['c_id', 'c_name']
                    }
                ]
            });

            if (!therapist) {
                return res.send({
                    result: false,
                    message: "Therapist not found"
                });
            }

            // Count reviews
            const totalReviews = await Reviews.count({
                where: {
                    r_therapist_id: therapist_id,
                    r_status: 'active'
                }
            });

            // Count completed bookings
            const totaltherapycompleted = await Booking.count({
                where: {
                    therapistId: therapist_id,
                    status: 'completed'
                }
            });

            // Get reviews with user info
            const Reviewslist = await Reviews.findAll({
                where: {
                    r_therapist_id: therapist_id,
                    r_status: 'active'
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'profile_pic']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.send({
                result: true,
                message: "Therapist retrieved",
                data: {
                    totalReviews,
                    totaltherapycompleted,
                    ...therapist.toJSON(),
                    reviews: Reviewslist
                }
            });
        }


        // ------------------- All approved therapists -------------------
        const therapists = await Therapist.findAll({
            where: {
                ...whereClause,
                roleId: 3,

            },
            include: includeOptions,
            attributes: {
                include: [
                    [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('bookings.therapistId'))), 'totaltherapycompleted'],
                    [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('reviews.r_therapist_id'))), 'totalReviews']
                ]
            },
            group: groupByFields,
        });

        return res.send({
            result: therapists.length > 0,
            message: therapists.length > 0 ? "Therapists list retrieved" : "No therapists found",
            data: therapists
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};
