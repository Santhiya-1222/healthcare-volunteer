const calculateTrustScore = (volunteer) => {
  const completionScore = (volunteer.completedTasks || 0) * 2;
  const ratingScore = (volunteer.avgRating || 0) * 10;
  const penalty = (volunteer.cancelledTasks || 0) * 5;
  return Math.max(0, completionScore + ratingScore - penalty);
};

module.exports = calculateTrustScore;
