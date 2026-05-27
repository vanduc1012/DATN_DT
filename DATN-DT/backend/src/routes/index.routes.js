const userRoutes = require('./users.routes');
const fieldRoutes = require('./field.routes');
const fieldPriceRoutes = require('./fieldPrice.routes');
const bookingRoutes = require('./booking.routes');
const discountRoutes = require('./discount.routes');
const reviewRoutes = require('./review.routes');
const dashboardRoutes = require('./dashboard.routes');
const blogRoutes = require('./blog.routes');
const notificationRoutes = require('./notification.routes');

function routes(app) {
    app.use('/api/users', userRoutes);
    app.use('/api/fields', fieldRoutes);
    app.use('/api/field-prices', fieldPriceRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/discounts', discountRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/blog', blogRoutes);
    app.use('/api/notifications', notificationRoutes);
}

module.exports = routes;
