import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../style/EventDetailsPopup.css'; // Import custom styles for the popup

const EventDetailsPopup = ({ show, onClose, orders, selectedDate }) => {
  // Filter orders by selected date
  const filteredOrders = orders.filter(
    (order) =>
      new Date(order.shippingAddress.date).toLocaleDateString() === selectedDate
  );

  // Handle closing the popup
  const handleClosePopup = () => {
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClosePopup} centered>
      <Modal.Header closeButton>
        <Modal.Title>Event Details for {selectedDate}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {filteredOrders.length > 0 ? (
          // Display orders if found
          filteredOrders.map((order) => (
            <div key={order._id} className="order-details">
              <p>Time: {order.shippingAddress.time}</p>
              <ul>
                {order.orderItems.map((item) => (
                  <li key={item._id}>{item.name}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          // Display message if no orders found
          <p>No orders found for the selected date.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClosePopup}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EventDetailsPopup;
