import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("login", "routes/login.tsx"),
    route("register-event", "routes/register-event.tsx"),
    route("scoreboard", "routes/scoreboard.tsx"),
    route("admin", "routes/admin.tsx"),
    index("routes/home.tsx"),
] satisfies RouteConfig;
