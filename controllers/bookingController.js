const Booking = require('../models/bookingModel');
const Customer = require('../models/customerModel'); // Import the Customer model
const Vendor = require('../models/vendorModel'); // Import the Vendor model
const Service = require('../models/serviceModel'); // Import the Service model
const Schedule = require('../models/scheduleModel');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        // Create the booking
        const booking = await Booking.create(req.body);

        // Update the customer's booking history
        await Customer.findByIdAndUpdate(
            req.body.customer, // Assuming the customer ID is passed in the request body
            { $push: { booking_history: booking._id } }, // Add the new booking ID to the customer's booking history
            { new: true }
        );

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('customer service vendor');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('customer service vendor');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Update the customer's booking history if the customer ID has changed
        if (req.body.customer) {
            await Customer.findByIdAndUpdate(
                req.body.customer,
                { $addToSet: { booking_history: booking._id } }, // Add the booking ID to the new customer's booking history
                { new: true }
            );
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Remove the booking ID from the customer's booking history
        await Customer.findByIdAndUpdate(
            booking.customer,
            { $pull: { booking_history: booking._id } }, // Remove the booking ID from the customer's booking history
            { new: true }
        );

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get bookings by customer ID
exports.getBookingsByCustomerId = async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.params.customerId }).populate('service vendor');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get bookings by vendor ID
exports.getBookingsByVendorId = async (req, res) => {
    try {
        const bookings = await Booking.find({ vendor: req.params.vendorId }).populate('customer service customer.userId');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Filter bookings based on status and date
exports.filterBookings = async (req, res) => {
    const { status, startDate, endDate, customerName, customerId, vendorName, vendorId, serviceId, serviceName, serviceCategory, serviceSubCategory, scheduleId, slot, payment_status, payment_type } = req.query;

    // Build a dynamic filter object
    const filter = {};

    // Filtering by status
    if (status) filter.status = status;

    // Filtering by payment status
    if (payment_status) filter.payment_status = payment_status;

    // Date range filter
    if (startDate && endDate) {
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Filter by Customer ID
    if (customerId) filter.customer = customerId;

    // Filter by Vendor ID
    if (vendorId) filter.vendor = vendorId;

    // Filter by Schedule ID
    if (scheduleId) filter.schedule = scheduleId;

    // Filter by slot timings
    if (slot) {
        const { startTime, endTime } = JSON.parse(slot); // Assuming `slot` is passed as a JSON string like {"startTime":"10:00","endTime":"11:00"}
        filter['slot.startTime'] = startTime;
        filter['slot.endTime'] = endTime;
    }

    // Filter by Service ID
    if (serviceId) filter.service = serviceId;

    try {
        // Apply additional text-based filters using aggregation
        const bookings = await Booking.find(filter)
            .populate({
                path: 'customer',
                match: customerName ? { name: new RegExp(customerName, 'i') } : {}, // Filter by customer name
            })
            .populate({
                path: 'vendor',
                match: vendorName ? { name: new RegExp(vendorName, 'i') } : {}, // Filter by vendor name
            })
            .populate({
                path: 'service',
                match: {
                    ...(serviceName ? { name: new RegExp(serviceName, 'i') } : {}),
                    ...(serviceCategory ? { category: new RegExp(serviceCategory, 'i') } : {}),
                    ...(serviceSubCategory ? { subCategory: new RegExp(serviceSubCategory, 'i') } : {}),
                },
            });

        // Filter out bookings where populates did not match (e.g., wrong names)
        const filteredBookings = bookings.filter(
            (booking) =>
                (!customerName || (booking.customer && booking.customer.name)) &&
                (!vendorName || (booking.vendor && booking.vendor.name)) &&
                (!serviceName || (booking.service && booking.service.length > 0))
        );

        res.status(200).json(filteredBookings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get special bookings by customer ID
exports.getSpecialBookingsByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Find all schedules with special service slots booked by the customer
        const schedules = await Schedule.find({
            'specialServiceAvailability.serviceSlots': {
                $elemMatch: {
                    isBooked: true,
                    bookedBy: customerId
                }
            }
        }).populate('vendor');

        // Extract booked special service slots and add service details
        const specialBookings = await Promise.all(schedules.flatMap(schedule => 
            schedule.specialServiceAvailability.serviceSlots
                .filter(slot => slot.isBooked && slot.bookedBy.toString() === customerId)
                .map(async (slot) => {
                    // Find the corresponding booking
                    const booking = await Booking.findOne({
                        customer: customerId,
                        vendor: schedule.vendor._id,
                        'slot.startTime': slot.startTime.toISOString(),
                        'slot.endTime': slot.endTime.toISOString()
                    });

                    // Find the service details
                    const service = booking ? await Service.findById(booking.service[0]) : null;

                    return {
                        bookingDetails: booking,
                        slotDetails: {
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            duration: slot.duration
                        },
                        vendorDetails: schedule.vendor,
                        serviceDetails: service
                    };
                })
        ));

        res.status(200).json({
            success: true,
            count: specialBookings.length,
            data: specialBookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};


exports.UpdateVendorLocation = async (req, res) => {
    try {
        const { id } = req.params;
    const { latitude, longitude } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        $set: { 
          'vendorLocation.coordinates': [longitude, latitude],
          'vendorLocation.timestamp': new Date()
        }
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Vendor location updated successfully', booking });
  } catch (error) {
    console.error('Error updating vendor location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.GetVendorLocation = async (req, res) => {
    try {
      const { id } = req.params;
  
      const booking = await Booking.findById(id).select('vendorLocation');
  
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      res.status(200).json({ vendorLocation: booking.vendorLocation });
    } catch (error) {
      console.error('Error retrieving vendor location:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

exports.UpdateCustomerLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude } = req.body;
    
        const booking = await Booking.findByIdAndUpdate(
          id,
          { 
            $set: { 
              'customerLocation.coordinates': [longitude, latitude],
              'customerLocation.timestamp': new Date()
            }
          },
          { new: true }
        );
    
        if (!booking) {
          return res.status(404).json({ message: 'Booking not found' });
        }
    
        res.status(200).json({ message: 'Customer location updated successfully', booking });
      } catch (error) {
        console.error('Error updating customer location:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    };

exports.GetCustomerLocation = async (req, res) => {
    try {
        const { id } = req.params;
    
        const booking = await Booking.findById(id).select('customerLocation');
    
        if (!booking) {
          return res.status(404).json({ message: 'Booking not found' });
        }
    
        res.status(200).json({ customerLocation: booking.customerLocation });
      } catch (error) {
        console.error('Error retrieving customer location:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
      };