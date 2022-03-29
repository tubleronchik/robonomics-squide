export function getAgents(): string[] {
  /**
   * Return list of addresses, which datalog's records will be saved
   */
  return require("../../agents.json");
}
