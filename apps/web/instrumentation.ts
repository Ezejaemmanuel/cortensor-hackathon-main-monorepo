// Disable Mastra telemetry warning
globalThis.___MASTRA_TELEMETRY___ = true;

export async function register() {
  // This function is called when the instrumentation is loaded
  // Set the global variable to disable Mastra telemetry warnings
  if (typeof globalThis !== 'undefined') {
    globalThis.___MASTRA_TELEMETRY___ = true;
  }
}