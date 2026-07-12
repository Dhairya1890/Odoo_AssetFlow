const router = require('express').Router();
const ctrl = require('../controllers/booking.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);
router.get('/my', ctrl.myBookings);
router.get('/', ctrl.listBookings);
router.post('/', ctrl.createBooking);
router.patch('/:id/cancel', ctrl.cancelBooking);
router.patch('/:id/reschedule', ctrl.rescheduleBooking);

module.exports = router;
