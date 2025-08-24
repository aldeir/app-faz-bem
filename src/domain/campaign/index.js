// Barrel exports for campaign domain utilities.
// Facilita imports: import { computeCampaignStatus } from '.../domain/campaign';

const {
  CampaignStatus,
  computeCampaignStatus,
  isValidStatus,
  getAllStatuses,
  isUpcoming,
  isActive,
  isPaused,
  isExpired,
  getStatusTimeline
} = require('./status');

module.exports = {
  CampaignStatus,
  computeCampaignStatus,
  isValidStatus,
  getAllStatuses,
  isUpcoming,
  isActive,
  isPaused,
  isExpired,
  getStatusTimeline
};
