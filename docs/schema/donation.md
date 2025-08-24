# Donation Schema Documentation

## Overview

This document describes the donation data structure used in the App Faz Bem system, including field definitions, status computation rules, and scheduling conventions.

## Donation Object Structure

```javascript
{
  id: string,                    // Firestore document ID
  
  // Donor information
  donorId: string,              // Reference to donor user
  donorName: string,            // Cached donor name
  donorPhoto: string,           // Cached donor photo URL (optional)
  
  // Campaign relationship
  campaignId: string,           // Reference to target campaign
  campaignTitle: string,        // Cached campaign title
  entityId: string,             // Reference to receiving entity
  
  // Donation items
  items: Array<{
    type: string,               // Item type/category
    status: string,             // Item status ('pending', 'completed', etc.)
    uniqueCode: string,         // Generated unique identifier
    photoURL: string,           // Item photo (optional)
    // ... other item-specific fields
  }>,
  
  // Scheduling and timing
  createdAt: Timestamp,         // Donation creation date
  scheduledAt: Timestamp,       // Scheduled delivery/pickup date
  
  // Status and metadata
  status: string,               // Donation status ('scheduled', 'pending', 'completed', etc.)
  privacy: string,              // Visibility ('public', 'private')
  campaignType: string,         // Type of campaign being donated to
  
  // Optional tracking
  completedAt: Timestamp,       // Completion timestamp (optional)
  notes: string                 // Additional notes (optional)
}
```

## Status Derivation Rules

Donation status is computed using the following logic:

### 1. Explicit Status Check (Highest Priority)
- If `status === 'cancelled'` or `status === 'reagendado'` → return as-is
- These states are terminal and override date-based logic

### 2. Item Completion Check
- If all items have `status === 'completed'` → **COMPLETED**
- Overrides scheduling logic when items are done

### 3. Scheduling Logic
- If `scheduledAt` is in the future → **SCHEDULED**
- If `scheduledAt` is in the past and has items → **PENDING**

### 4. Fallback
- Use persisted `status` field or default to **SCHEDULED**

## Status Enumeration

```javascript
const DONATION_STATUS = {
  SCHEDULED: 'scheduled',     // Future delivery date
  PENDING: 'pending',         // Past due, awaiting completion
  COMPLETED: 'completed',     // All items processed
  CANCELLED: 'cancelled',     // Donation cancelled
  RESCHEDULED: 'reagendado'   // Moved to new time slot
};
```

## Item Status Lifecycle

Individual donation items follow this status progression:

1. **pending** → Item created, awaiting processing
2. **completed** → Item successfully received/processed
3. **cancelled** → Item cancelled (rare, usually whole donation is cancelled)

## Date Field Conventions

### Scheduling Rules
- `scheduledAt`: Specific delivery/pickup appointment time
- `createdAt`: When donation was initially registered
- `completedAt`: When all items were marked complete (optional)

### Timestamp Normalization
- All dates use Firestore `Timestamp` objects
- Use `normalizeTimestamp()` utility for compatibility
- Support for Date objects, ISO strings, and Unix timestamps

## Usage Examples

### Creating a New Donation
```javascript
const donation = {
  donorId: "user_123",
  donorName: "João Silva",
  campaignId: "campaign_456",
  campaignTitle: "Winter Clothing Drive",
  entityId: "entity_789",
  items: [
    {
      type: "Casaco",
      status: "pending",
      uniqueCode: "WCD-000001",
      photoURL: "https://example.com/coat.jpg"
    }
  ],
  scheduledAt: Timestamp.fromDate(new Date('2023-12-15T14:00:00')),
  status: 'scheduled',
  privacy: 'public',
  createdAt: Timestamp.now()
};
```

### Computing Status
```javascript
import { computeDonationStatus } from './status-utils.js';

const status = computeDonationStatus(donation);
// Returns: 'scheduled', 'pending', 'completed', etc.
```

### Checking Item Completion
```javascript
const allCompleted = donation.items.every(item => item.status === 'completed');
if (allCompleted) {
  // Donation can be marked as completed
}
```

## Rescheduling Flow

When a donation is rescheduled:

1. Create new donation with new `scheduledAt`
2. Mark original donation `status: 'reagendado'`
3. Link via metadata if needed for audit trail

```javascript
// Original donation
const oldDonation = {
  ...originalData,
  status: 'reagendado'
};

// New donation
const newDonation = {
  ...originalData,
  id: newId,
  scheduledAt: newTimestamp,
  status: 'scheduled',
  createdAt: Timestamp.now()
};
```

## Privacy Considerations

### Public vs Private Donations
- `privacy: 'public'`: Visible in public feeds and statistics
- `privacy: 'private'`: Only visible to donor and receiving entity

### Data Retention
- Completed donations: Retain for reporting and analytics
- Cancelled donations: Mark as cancelled, preserve for audit
- Personal data: Follow data protection policies

## Status Invariants

The following rules must always hold:

1. **Item Consistency**: If all items are completed, donation status should be 'completed'
2. **Temporal Logic**: Scheduled donations in the past should be 'pending' unless completed
3. **Terminal States**: 'cancelled' and 'reagendado' are terminal (no further updates)
4. **Item Codes**: Each item must have a unique `uniqueCode` within the system

## Integration Notes

### With Campaigns
- Donations link to campaigns via `campaignId`
- Completed donations contribute to campaign progress
- Campaign completion affects donation visibility

### With Scheduling System
- `scheduledAt` integrates with calendar/appointment system
- Time slots have capacity limits (managed separately)
- Rescheduling creates new donation records

## Related Documentation

- [Campaign Schema](./campaign.md)
- [Services Architecture](../architecture/services.md)
- [Status Utilities API](../../status-utils.js)