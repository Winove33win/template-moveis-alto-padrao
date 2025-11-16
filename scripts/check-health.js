#!/usr/bin/env node
const axios = require("axios");

function toInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const DEFAULT_URL = "http://localhost:4000/healthz";
const DEFAULT_TIMEOUT = 5000;

const [, , cliUrl] = process.argv;
const healthcheckUrl = cliUrl || process.env.HEALTHCHECK_URL || DEFAULT_URL;
const timeout = toInteger(process.env.HEALTHCHECK_TIMEOUT_MS, DEFAULT_TIMEOUT);

(async () => {
  try {
    const response = await axios.get(healthcheckUrl, {
      timeout,
      headers: { Accept: "application/json" },
    });

    const okStatus = response.status >= 200 && response.status < 300;
    const payload = response.data ?? {};

    if (!okStatus) {
      console.error(`[HEALTHCHECK] Unexpected status code: ${response.status}`);
      console.error(payload);
      process.exit(1);
    }

    if (payload?.status !== "ok") {
      console.error("[HEALTHCHECK] Endpoint responded but did not report status=ok:");
      console.error(payload);
      process.exit(1);
    }

    console.log(`[HEALTHCHECK] ${healthcheckUrl} is healthy.`);
  } catch (error) {
    if (error.response) {
      console.error(
        `[HEALTHCHECK] ${healthcheckUrl} failed with status ${error.response.status}:`,
        error.response.data
      );
    } else {
      console.error(`[HEALTHCHECK] Unable to reach ${healthcheckUrl}:`, error.message);
    }
    process.exit(1);
  }
})();
