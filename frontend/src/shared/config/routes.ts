export const AUTH_COOKIE_NAME = "turon_admin_session";
export const LOGIN_ROUTE = "/login";
export const DEFAULT_AUTHENTICATED_ROUTE = "/users";
export const PUBLIC_PATHS = [LOGIN_ROUTE];

export const ROUTES = {
  login: LOGIN_ROUTE,
  users: "/users",
  products: "/products",
  applications: "/applications",
} as const;
