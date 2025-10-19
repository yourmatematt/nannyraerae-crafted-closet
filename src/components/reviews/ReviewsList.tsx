import { useState } from 'react'
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import type { ReviewWithCustomer } from '../../types'

interface ReviewsListProps {
  reviews: ReviewWithCustomer[]
  showAllReviews?: boolean
  maxReviews?: number
  allowSorting?: boolean
}

export function ReviewsList({
  reviews,
  showAllReviews = false,
  maxReviews = 5,
  allowSorting = true
}: ReviewsListProps) {
  const [sortBy, setSortBy] = useState('newest')
  const [filterRating, setFilterRating] = useState('all')
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  // Calculate stats
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  const ratingCounts = reviews.reduce((counts, review) => {
    counts[review.rating] = (counts[review.rating] || 0) + 1
    return counts
  }, {} as Record<number, number>)

  // Sort and filter reviews
  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating === 'all' || review.rating === parseInt(filterRating))
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
        case 'oldest':
          return new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'helpful':
          return (b.helpful_count || 0) - (a.helpful_count || 0)
        default:
          return 0
      }
    })

  const displayedReviews = showAllReviews
    ? sortedAndFilteredReviews
    : sortedAndFilteredReviews.slice(0, maxReviews)

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const isExpanded = (reviewId: string) => expandedReviews.has(reviewId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCustomerName = (review: ReviewWithCustomer) => {
    const profile = review.customer_profile
    if (!profile) return 'Anonymous'

    const firstName = profile.first_name || 'Anonymous'
    const lastInitial = profile.last_name ? `${profile.last_name[0]}.` : ''

    return `${firstName} ${lastInitial}`.trim()
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">
            <Star className="w-8 h-8 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
            <p className="text-sm">
              Be the first to review this one-of-a-kind piece!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating] || 0
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{rating}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      {allowSorting && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
              <SelectItem value="lowest">Lowest rated</SelectItem>
              <SelectItem value="helpful">Most helpful</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars only</SelectItem>
              <SelectItem value="4">4 stars only</SelectItem>
              <SelectItem value="3">3 stars only</SelectItem>
              <SelectItem value="2">2 stars only</SelectItem>
              <SelectItem value="1">1 star only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((review, index) => {
          const expanded = isExpanded(review.id)
          const shouldTruncate = review.comment && review.comment.length > 300

          return (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        {review.is_verified_purchase && (
                          <Badge variant="outline" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getCustomerName(review)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.created_at!)}
                    </p>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="font-medium">{review.title}</h4>
                  )}

                  {/* Review Content */}
                  {review.comment && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {shouldTruncate && !expanded
                          ? `${review.comment.slice(0, 300)}...`
                          : review.comment
                        }
                      </p>
                      {shouldTruncate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(review.id)}
                          className="mt-2 p-0 h-auto text-primary"
                        >
                          {expanded ? (
                            <>
                              Show less <ChevronUp className="w-4 h-4 ml-1" />
                            </>
                          ) : (
                            <>
                              Read more <ChevronDown className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {review.images.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} className="aspect-square">
                          <img
                            src={imageUrl}
                            alt={`Review image ${imgIndex + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center gap-4 pt-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Helpful ({review.helpful_count || 0})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Flag className="w-4 h-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </CardContent>
              {index < displayedReviews.length - 1 && <Separator />}
            </Card>
          )
        })}
      </div>

      {/* Show More Button */}
      {!showAllReviews && sortedAndFilteredReviews.length > maxReviews && (
        <div className="text-center">
          <Button variant="outline">
            Show {sortedAndFilteredReviews.length - maxReviews} more review{sortedAndFilteredReviews.length - maxReviews !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}