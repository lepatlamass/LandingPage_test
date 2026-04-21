'use client';

import { getAnalytics, logEvent, setAnalyticsCollectionEnabled, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { app } from './firebase';

/* ─────────────────────────────────────────── */
/* Singleton analytics instance               */
/* ─────────────────────────────────────────── */

let analytics: Analytics | null = null;

/**
 * Initialise Firebase Analytics (call only after user consents).
 * Safe to call multiple times — idempotent.
 */
export async function initAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics;
  if (typeof window === 'undefined') return null;

  const supported = await isSupported();
  if (!supported) return null;

  analytics = getAnalytics(app);
  setAnalyticsCollectionEnabled(analytics, true);
  return analytics;
}

/** Disable analytics collection (e.g. user revokes consent). */
export function disableAnalytics() {
  if (analytics) {
    setAnalyticsCollectionEnabled(analytics, false);
  }
}

/* ─────────────────────────────────────────── */
/* Safe event logger                          */
/* ─────────────────────────────────────────── */

function log(eventName: string, params?: Record<string, unknown>) {
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}

/* ─────────────────────────────────────────── */
/* Page-view tracking                         */
/* ─────────────────────────────────────────── */

export function trackPageView(pagePath: string, pageTitle?: string) {
  log('page_view', { page_path: pagePath, page_title: pageTitle });
}

/* ─────────────────────────────────────────── */
/* Tool usage events                          */
/* ─────────────────────────────────────────── */

/** User started processing with a specific tool. */
export function trackToolUsed(toolId: string) {
  log('tool_used', { tool_id: toolId });
}

/** Tool processing completed successfully. */
export function trackToolCompleted(toolId: string) {
  log('tool_completed', { tool_id: toolId });
}

/** User uploaded a file to a tool. */
export function trackFileUploaded(toolId: string, fileType?: string) {
  log('file_uploaded', { tool_id: toolId, file_type: fileType });
}

/** User downloaded a processed result. */
export function trackFileDownloaded(toolId: string) {
  log('file_downloaded', { tool_id: toolId });
}

/* ─────────────────────────────────────────── */
/* Auth events                                */
/* ─────────────────────────────────────────── */

export function trackSignUp(method: string = 'google') {
  log('sign_up', { method });
}

export function trackLogin(method: string = 'google') {
  log('login', { method });
}

/* ─────────────────────────────────────────── */
/* Subscription / purchase events             */
/* ─────────────────────────────────────────── */

export function trackSubscriptionStarted(planType: string) {
  log('subscription_started', { plan_type: planType });
}

export function trackCreditPurchased(amount?: number) {
  log('credit_purchased', { credit_amount: amount });
}

/** AI credit consumed for a specific tool. */
export function trackAICreditConsumed(toolId: string) {
  log('ai_credit_consumed', { tool_id: toolId });
}
