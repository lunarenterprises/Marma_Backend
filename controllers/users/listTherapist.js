let { Therapist, Category, Reviews, Booking, User, Op } = require('../../models/index');
const { Sequelize } = require('sequelize');

module.exports.ListTherapist = async (req, res) => {
    try {
        const { therapist_id, gender, category_id, featured, topratedinarea, user_id, district, mostbooked, highlyreviewed, search, latitude, longitude, nearbytherapist } = req.body || {}

        if (user_id && latitude && longitude) {

            const updateuserlocation = await User.update({
                latitude: latitude,
                longitude: longitude
            }, {
                where: { id: user_id }
            });
            console.log("updateuserlocation", updateuserlocation);
        }



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

        // ------------------- Nearby therapists -------------------

        if (nearbytherapist) {
            // if (!user_id) {
            //     return res.send({
            //         result: false,
            //         message: "User id is required"
            //     });
            // }

            // const user = await User.findOne({
            //     where: { id: user_id }
            // });

            // if (!user) {
            //     return res.send({
            //         result: false,
            //         message: "User not found"
            //     });
            // }


            const getnearbytherapist = await Therapist.findAll({
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`6371 * ACOS(
                    COS(RADIANS(${latitude})) *
                    COS(RADIANS(latitude)) *
                    COS(RADIANS(longitude) - RADIANS(${longitude})) +
                    SIN(RADIANS(${latitude})) *
                    SIN(RADIANS(latitude))
                )`),
                            "distance"
                        ]
                    ]
                },
                where: {
                    status: "Approved",
                    roleId: 3,

                    latitude: { [Op.ne]: null },
                    longitude: { [Op.ne]: null },

                    ...whereClause
                },
                order: [[Sequelize.literal("distance"), "ASC"]],
                limit: 10
            });



            return res.send({
                result: getnearbytherapist.length > 0,
                message: getnearbytherapist.length > 0 ? "Nearby therapists retrieved" : "No nearby therapists found",
                data: getnearbytherapist
            });

        }

        // ------------------- Featured therapists -------------------
        if (featured) {
            const therapists = await Therapist.findAll({
                where: {
                    ...whereClause,
                    status: 'Approved',
                    roleId: 3,
                },
                include: includeOptions,
                attributes: {
                    include: [
                        // Use DISTINCT on Booking to avoid count duplicates caused by join
                        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('bookings.therapistId'))), 'totaltherapycompleted'],
                        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('reviews.r_therapist_id'))), 'totalReviews']
                    ]
                },
                group: groupByFields,
                order: [['rating', 'DESC']],
            });

            return res.send({
                result: therapists.length > 0,
                message: therapists.length > 0 ? "Featured therapists retrieved" : "No featured therapists found",
                data: therapists
            });
        }

        // ------------------- Single therapist -------------------
        if (therapist_id) {
            const therapist = await Therapist.findOne({
                where: {
                    status: 'Approved',
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
            console.log(therapist, "tttt");

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
                message: "Single therapist retrieved",
                data: {
                    totalReviews,
                    totaltherapycompleted,
                    ...therapist.toJSON(),
                    reviews: Reviewslist
                }
            });
        }

        //----------------top rated in your area-------------------

        if (topratedinarea) {
            if (!user_id || !district) {
                return res.send({
                    result: false,
                    message: "Please provide user id and district to get top rated therapists in your area"
                })
            }

            const therapists = await Therapist.findAll({
                where: {
                    district: district,
                    status: 'Approved',
                    roleId: 3,
                },
                include: includeOptions,
                attributes: {
                    include: [
                        // Use DISTINCT on Booking to avoid count duplicates caused by join
                        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('bookings.therapistId'))), 'totaltherapycompleted'],
                        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('reviews.r_therapist_id'))), 'totalReviews']
                    ]
                },
                group: groupByFields,
                order: [['rating', 'DESC']],
            });

            return res.send({
                result: therapists.length > 0,
                message: therapists.length > 0 ? "Featured therapists retrieved" : "No featured therapists found",
                data: therapists
            });
        }

        // ------------------- Most Booked Therapists -------------------
        if (mostbooked) {
            const therapists = await Booking.findAll({
                where: {
                    status: 'completed',
                    roleId: 3,
                },
                attributes: [
                    'therapistId',
                    [Sequelize.fn('COUNT', Sequelize.col('therapistId')), 'totalBookings']
                ],
                group: ['therapistId'],
                order: [[Sequelize.literal('totalBookings'), 'DESC']],
                limit: 10, // limit to top 10 most booked therapists
                include: [
                    {
                        model: Therapist,
                        as: 'therapist',
                        where: { status: 'Approved' },
                        include: [
                            {
                                model: Category,
                                as: 'category',
                                attributes: ['c_id', 'c_name']
                            }
                        ]
                    }
                ]
            });

            return res.send({
                result: therapists.length > 0,
                message: therapists.length > 0 ? "Most booked therapists retrieved" : "No data found",
                data: therapists
            });
        }


        // ------------------- Highly Reviewed Therapists -------------------


        if (highlyreviewed) {
            const therapists = await Reviews.findAll({
                where: {
                    r_status: 'active',
                    roleId: 3,
                },
                attributes: [
                    'r_therapist_id',
                    [Sequelize.fn('COUNT', Sequelize.col('r_id')), 'totalReviews']
                ],
                group: [
                    'r_therapist_id'
                ],
                order: [[Sequelize.literal('totalReviews'), 'DESC']],
                limit: 10,
                include: [
                    {
                        model: Therapist,
                        as: 'therapist',
                        where: { status: 'Approved' },
                        include: [
                            {
                                model: Category,
                                as: 'category',
                                attributes: ['c_id', 'c_name']
                            }
                        ]
                    }
                ]
            });

            return res.send({
                result: therapists.length > 0,
                message: therapists.length > 0 ? "Highly reviewed therapists retrieved" : "No data found",
                data: therapists
            });
        }

        // ------------------- All approved therapists -------------------
        const therapists = await Therapist.findAll({
            where: {
                ...whereClause,
                status: 'Approved',
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
