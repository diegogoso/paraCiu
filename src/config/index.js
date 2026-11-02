module.exports = {
  port: Number(process.env.PORT || 3000),
  commentMaxAgeMonths: Number(process.env.COMMENT_MAX_AGE_MONTHS || 6),
};
