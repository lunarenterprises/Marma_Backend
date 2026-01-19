const cron = require('node-cron');
const { bookingTimeout } = require('./bookingtimeout');

// cron.schedule('* * * * *', bookingTimeout); //1 min
cron.schedule('*/30 * * * *', bookingTimeout); // 30 min    

