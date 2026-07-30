/**
 * Marketing / landing page configuration.
 *
 * DEMO_URL is the single source of truth for the "Launch Demo" call-to-action.
 * The owner can point it at a real, externally hosted demo by setting
 * `VITE_DEMO_URL` in the environment (see .env.example). When unset it falls
 * back to the in-app operational dashboard, which is the demo entry point today.
 */
export const DEMO_URL = import.meta.env.VITE_DEMO_URL ?? "/dashboard";

/** True when DEMO_URL points to an external site rather than an in-app route. */
export const DEMO_IS_EXTERNAL = /^https?:\/\//i.test(DEMO_URL);
