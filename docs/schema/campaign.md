# Campaign Schema Documentation

## Overview

This document describes the campaign data structure used in the App Faz Bem system, including field definitions, status rules, and date conventions.

## Campaign Object Structure

```javascript
{
  id: string,                    // Firestore document ID
  title: string,                 // Campaign title
  description: string,           // Campaign description
  entityId: string,              // Reference to entity that owns the campaign
  entityName: string,            // Cached entity name for display
  
  // Date fields (Firestore Timestamps)
  createdAt: Timestamp,          // Campaign creation date
  startsAt: Timestamp,           // Campaign start date (optional)
  expiresAt: Timestamp,          // Campaign expiration date (optional)
  
  // Status and progress
  status: string,                // Persisted status ('upcoming', 'active', 'completed')
  goal: number,                  // Target goal (monetary or item count)
  currentAmount: number,         // Current amount raised (optional)
  completedItems: Array,         // Array of completed donation items (optional)
  
  // Campaign configuration
  type: string,                  // Campaign type ('default', 'food', 'clothing', etc.)
  privacy: string,               // Visibility ('public', 'private')
  allowAnonymous: boolean,       // Allow anonymous donations
  
  // Media and presentation
  imageURL: string,              // Campaign banner image
  tags: Array<string>            // Categorization tags
}
```

## Status Derivation Rules

Campaign status is computed using the following priority order:

### 1. Expiration Check (Highest Priority)
- If `expiresAt` exists and is in the past → **COMPLETED**
- This overrides any persisted status

### 2. Upcoming Status Check
- If `status === 'upcoming'` AND `startsAt` is in the future → **UPCOMING**

### 3. Active Status Check
- If `expiresAt` is in the future → **ACTIVE**
- If no `expiresAt` but `startsAt` is in the past → **ACTIVE**

### 4. Fallback
- Use persisted `status` field or default to **ACTIVE**

## Date Field Conventions

### Firestore Timestamp Handling
- All date fields use Firestore `Timestamp` objects
- Use `normalizeTimestamp()` utility for cross-format compatibility
- Supports Date objects, ISO strings, and Unix timestamps for flexibility

### Optional Date Fields
- `startsAt`: If null, campaign is considered started
- `expiresAt`: If null, campaign has no expiration (manual completion only)

### Time Zone Considerations
- All dates stored in UTC via Firestore
- Client-side display should respect user's local timezone
- Comparisons use server time (Date.now()) for consistency

## Progress Calculation

Progress is calculated based on available data:

```javascript
// Monetary campaigns
progress = {
  current: currentAmount,
  goal: goal,
  percentage: Math.min((currentAmount / goal) * 100, 100)
}

// Item-based campaigns
progress = {
  current: completedItems.length,
  goal: goal,
  percentage: Math.min((completedItems.length / goal) * 100, 100)
}
```

## Status Invariants

The following rules must always hold:

1. **Temporal Consistency**: If `expiresAt < now`, status must be 'completed'
2. **Start/End Logic**: If `startsAt > expiresAt`, this is invalid data
3. **Goal Validation**: If `goal` is set, it must be > 0
4. **Progress Bounds**: Progress percentage is always 0-100%

## Usage Examples

### Creating a New Campaign
```javascript
const campaign = {
  title: "Winter Clothing Drive",
  description: "Help families stay warm this winter",
  entityId: "entity_123",
  startsAt: Timestamp.fromDate(new Date('2023-12-01')),
  expiresAt: Timestamp.fromDate(new Date('2023-12-31')),
  status: 'upcoming',
  goal: 100,
  type: 'clothing',
  createdAt: Timestamp.now()
};
```

### Computing Status
```javascript
import { computeCampaignStatus } from './status-utils.js';

const status = computeCampaignStatus(campaign);
// Returns: 'upcoming', 'active', or 'completed'
```

### Getting Progress
```javascript
import { getCampaignProgress } from './status-utils.js';

const progress = getCampaignProgress({
  goal: campaign.goal,
  currentAmount: campaign.currentAmount,
  completedItems: campaign.completedItems
});
// Returns: { current: 25, goal: 100, percentage: 25 }
```

## Migration Notes

When migrating existing campaigns:

1. Ensure all date fields are Firestore Timestamps
2. Validate `startsAt < expiresAt` relationships
3. Set default `status` to 'active' for campaigns without explicit status
4. Initialize `currentAmount: 0` for new monetary campaigns
5. Initialize `completedItems: []` for new item-based campaigns

## Related Documentation

- [Donation Schema](./donation.md)
- [Services Architecture](../architecture/services.md)
- [Status Utilities API](../../status-utils.js)