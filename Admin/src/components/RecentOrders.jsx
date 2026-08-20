import React from 'react'

const RecentOrders = () => {
  const orders = [
    { id: '#1234', customer: 'John Doe', amount: '₹2,499', status: 'delivered' },
    { id: '#1235', customer: 'Jane Smith', amount: '₹1,299', status: 'shipped' },
    { id: '#1236', customer: 'Mike Johnson', amount: '₹899', status: 'processing' },
    { id: '#1237', customer: 'Sarah Wilson', amount: '₹3,499', status: 'pending' },
    { id: '#1238', customer: 'Tom Brown', amount: '₹599', status: 'delivered' }
  ]

  return (
    <div className="recent-orders">
      {orders.map((order) => (
        <div key={order.id} className="order-item">
          <span className="order-id">{order.id}</span>
          <span className="customer-name">{order.customer}</span>
          <span className="order-amount">{order.amount}</span>
          <span className={`order-status ${order.status}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default RecentOrders
