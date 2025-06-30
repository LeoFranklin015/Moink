/**
 * Get the base URL based on the current environment
 * @returns The appropriate base URL for the current environment
 */
export const getBaseUrl = (): string => {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return "https://moink.crevn.xyz";
  } else {
    return "https://moink.crevn.xyz";
  }
};

/**
 * Get the issue redirect URL based on the current environment
 * @returns The appropriate issue URL for the current environment
 */
export const getIssueUrl = (): string => {
  return `${getBaseUrl()}/issue`;
};
