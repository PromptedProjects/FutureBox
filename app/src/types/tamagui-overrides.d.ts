// FlashList v2 renamed estimatedItemSize -> estimatedListSize
// This file provides ambient overrides for these quirks.

import '@shopify/flash-list';

declare module '@shopify/flash-list' {
  interface FlashListProps<T> {
    estimatedItemSize?: number;
  }
}
