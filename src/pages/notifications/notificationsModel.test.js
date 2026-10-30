import { describe, expect, it } from 'vitest';
import {
  Bell,
  MessageSquare,
  Reply,
  CheckCircle,
  XCircle,
  EyeOff,
  Star,
  Sparkles,
} from 'lucide-react';
import {
  getNotificationIcon,
  isToday,
  groupNotificationsByDay,
  formatBadgeCount,
} from './notificationsModel';

describe('getNotificationIcon', () => {
  it('maps all 7 CONTRACT §6 types to the expected Lucide icon and background', () => {
    expect(getNotificationIcon('enquiry_new').Icon).toBe(MessageSquare);
    expect(getNotificationIcon('enquiry_reply').Icon).toBe(Reply);
    expect(getNotificationIcon('business_approved').Icon).toBe(CheckCircle);
    expect(getNotificationIcon('business_rejected').Icon).toBe(XCircle);
    expect(getNotificationIcon('business_unpublished').Icon).toBe(EyeOff);
    expect(getNotificationIcon('review_new').Icon).toBe(Star);
    expect(getNotificationIcon('digest_new_businesses').Icon).toBe(Sparkles);
  });

  it('falls back to Bell for unknown or system types', () => {
    expect(getNotificationIcon('system').Icon).toBe(Bell);
    expect(getNotificationIcon('unknown_event').Icon).toBe(Bell);
    expect(getNotificationIcon(undefined).Icon).toBe(Bell);
  });
});

describe('isToday', () => {
  const baseNow = new Date('2026-10-30T12:00:00');

  it('returns true when ISO string matches local date of now', () => {
    const todayEarlier = new Date(baseNow.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const todayLater = new Date(baseNow.getTime() + 2 * 60 * 60 * 1000).toISOString();
    expect(isToday(todayEarlier, baseNow)).toBe(true);
    expect(isToday(todayLater, baseNow)).toBe(true);
  });

  it('returns false for yesterday or previous dates', () => {
    const yesterday = new Date(baseNow.getTime() - 36 * 60 * 60 * 1000).toISOString();
    const lastWeek = new Date(baseNow.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(isToday(yesterday, baseNow)).toBe(false);
    expect(isToday(lastWeek, baseNow)).toBe(false);
  });

  it('returns false for invalid date strings', () => {
    expect(isToday('invalid-date', baseNow)).toBe(false);
    expect(isToday('', baseNow)).toBe(false);
  });
});

describe('groupNotificationsByDay', () => {
  const baseNow = new Date('2026-10-30T12:00:00');

  it('correctly partitions items into today and earlier groups', () => {
    const today1 = new Date(baseNow.getTime() - 60 * 60 * 1000).toISOString();
    const today2 = new Date(baseNow.getTime() - 30 * 60 * 1000).toISOString();
    const yesterday = new Date(baseNow.getTime() - 36 * 60 * 60 * 1000).toISOString();
    const lastWeek = new Date(baseNow.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const items = [
      { id: '1', title: 'New enquiry', createdAt: today1 },
      { id: '2', title: 'Shop approved', createdAt: yesterday },
      { id: '3', title: 'New review', createdAt: today2 },
      { id: '4', title: 'Older update', createdAt: lastWeek },
    ];

    const { today, earlier } = groupNotificationsByDay(items, baseNow);
    expect(today.map((n) => n.id)).toEqual(['1', '3']);
    expect(earlier.map((n) => n.id)).toEqual(['2', '4']);
  });

  it('handles empty input gracefully', () => {
    expect(groupNotificationsByDay([], baseNow)).toEqual({ today: [], earlier: [] });
    expect(groupNotificationsByDay(undefined, baseNow)).toEqual({ today: [], earlier: [] });
  });
});

describe('formatBadgeCount', () => {
  it('returns null for 0, negative or falsy numbers', () => {
    expect(formatBadgeCount(0)).toBeNull();
    expect(formatBadgeCount(-1)).toBeNull();
    expect(formatBadgeCount(null)).toBeNull();
    expect(formatBadgeCount(undefined)).toBeNull();
  });

  it('returns exact count as string for 1 to 9', () => {
    expect(formatBadgeCount(1)).toBe('1');
    expect(formatBadgeCount(5)).toBe('5');
    expect(formatBadgeCount(9)).toBe('9');
  });

  it('caps at "9+" for counts greater than 9', () => {
    expect(formatBadgeCount(10)).toBe('9+');
    expect(formatBadgeCount(99)).toBe('9+');
  });
});
