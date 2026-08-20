import React, { useState } from 'react'
import { Search, Filter, Star, ThumbsUp, ThumbsDown, Eye, MessageCircle } from 'lucide-react'

const CustomerReviews = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')

  const reviews = [
    {
      id: 1,
      customer: 'John Doe',
      product: 'Wireless Headphones',
      rating: 5,
      comment: 'Excellent product! Great sound quality and comfortable to wear for long periods.',
      date: '2024-01-15',
      status: 'published',
      helpful: 12,
      images: 2
    },
    {
      id: 2,
      customer: 'Jane Smith',
      product: 'Cotton T-Shirt',
      rating: 4,
      comment: 'Good quality fabric and fits well. Color is exactly as shown in the picture.',
      date: '2024-01-14',
      status: 'published',
      helpful: 8,
      images: 1
    },
    {
      id: 3,
      customer: 'Mike Johnson',
      product: 'Running Shoes',
      rating: 3,
      comment: 'Decent shoes but sizing runs a bit small. Comfort is okay for short runs.',
      date: '2024-01-13',
      status: 'pending',
      helpful: 3,
      images: 0
    },
    {
      id: 4,
      customer: 'Sarah Wilson',
      product: 'Smartphone Case',
      rating: 2,
      comment: 'Case feels cheap and doesn\'t fit properly. Not worth the price.',
      date: '2024-01-12',
      status: 'published',
      helpful: 1,
      images: 1
    },
    {
      id: 5,
      customer: 'Tom Brown',
      product: 'Coffee Mug',
      rating: 5,
      comment: 'Perfect size and keeps coffee hot for hours. Love the design!',
      date: '2024-01-11',
      status: 'published',
      helpful: 15,
      images: 3
    }
  ]

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'danger'
      default: return 'default'
    }
  }

  return (
    <div className="customer-reviews">
      <div className="page-header">
        <div className="header-left">
          <h1>Customer Reviews</h1>
          <p>Monitor and manage customer feedback</p>
        </div>
      </div>

      <div className="reviews-stats">
        <div className="stat-card">
          <div className="stat-content">
            <h3>4.2</h3>
            <p>Average Rating</p>
          </div>
          <div className="rating-stars">
            {renderStars(4)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>1,234</h3>
            <p>Total Reviews</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>23</h3>
            <p>Pending Reviews</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>89%</h3>
            <p>Positive Reviews</p>
          </div>
        </div>
      </div>

      <div className="rating-breakdown">
        <div className="card">
          <div className="card-header">
            <h3>Rating Distribution</h3>
          </div>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar">
                <div className="rating-label">
                  {rating} <Star size={14} className="star-filled" />
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : rating === 2 ? 3 : 2}%` }}
                  ></div>
                </div>
                <div className="rating-count">
                  {rating === 5 ? 742 : rating === 4 ? 308 : rating === 3 ? 123 : rating === 2 ? 37 : 24}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <button className="btn btn-outline">
            <Filter size={20} />
            More Filters
          </button>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="customer-info">
                <div className="customer-avatar">
                  {review.customer.charAt(0)}
                </div>
                <div className="customer-details">
                  <h4>{review.customer}</h4>
                  <p>{review.product}</p>
                </div>
              </div>
              <div className="review-meta">
                <div className="rating">
                  {renderStars(review.rating)}
                </div>
                <span className="review-date">{review.date}</span>
              </div>
            </div>

            <div className="review-content">
              <p>{review.comment}</p>
              {review.images > 0 && (
                <div className="review-images">
                  <span className="image-count">{review.images} images</span>
                </div>
              )}
            </div>

            <div className="review-footer">
              <div className="review-actions">
                <button className="action-btn helpful">
                  <ThumbsUp size={16} />
                  {review.helpful} helpful
                </button>
                <button className="action-btn reply">
                  <MessageCircle size={16} />
                  Reply
                </button>
                <button className="action-btn view">
                  <Eye size={16} />
                  View Details
                </button>
              </div>
              <div className="review-status">
                <span className={`status-badge ${getStatusColor(review.status)}`}>
                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomerReviews
