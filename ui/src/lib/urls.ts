/**
 * Dynamically insert localhost or the live domain into service URLs.
 */
export const getServiceUrl = (servicePrefix: string): string => {
  const currentHost = window.location.hostname; // e.g., app.localhost or app.myservice.com
  const serviceHost = currentHost.replace(/^app\./, `${servicePrefix}.`);
  return `https://${serviceHost}`;
};

export const AUTH_URL = getServiceUrl("auth");
export const BACKEND_URL = getServiceUrl("backend");
export const PROCESSOR_URL = getServiceUrl("processor");
