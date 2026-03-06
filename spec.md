# Color Tap Rush 3D

## Current State
The game has a rewarded ad modal (`RewardedAdModal.tsx`) triggered from the Game Over screen. Currently it only simulates an ad with a 5-second countdown timer -- no real ad is ever loaded or shown. The `continueGame()` function in the game store restores score state.

## Requested Changes (Diff)

### Add
- Google IMA SDK (Interactive Media Ads) loaded via `<script>` tag in `index.html` for rewarded video ads
- A `useRewardedAd` hook that manages the full IMA SDK lifecycle: loading, requesting, showing, reward callback, error handling
- Fallback behavior: if the IMA SDK fails to load or an ad is not available (fill rate < 100%), show a graceful message and still allow continue after a short wait

### Modify
- `index.html` -- inject the Google IMA SDK `<script>` tag
- `RewardedAdModal.tsx` -- replace fake timer logic with real IMA SDK rewarded video ad flow: request ad -> show "Loading ad..." state -> play real video ad -> on reward event -> enable Continue button

### Remove
- The fake countdown timer (AD_DURATION / setInterval / timeLeft state) from `RewardedAdModal.tsx`

## Implementation Plan
1. Add Google IMA SDK script to `index.html`
2. Add IMA SDK TypeScript type declarations (global `google.ima`) in a `.d.ts` file
3. Create `useRewardedAd.ts` hook that:
   - Initializes `google.ima.AdDisplayContainer` and `google.ima.AdsLoader`
   - Requests a rewarded ad using a test ad tag URL (can be swapped for live tag)
   - Handles `ADS_MANAGER_LOADED` -> starts ad
   - Handles `AD_ERROR` -> falls back gracefully
   - Handles reward event (`AD_REWARDED`) to unlock the continue button
4. Refactor `RewardedAdModal.tsx` to use the hook, render the IMA ad container, show loading/playing/rewarded/error states
