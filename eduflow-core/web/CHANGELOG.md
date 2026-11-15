# Changelog — EduFlow AI Web (`eduflow-core/web`)

All notable changes and fixes made to the routing, build, lint, and runtime layers.

## [1.1.0] - 2026-11-15

### Fixed
- **Build Syntax Error (`studentManagement.jsx:106`)**: Removed dangling closing brace and orphan DOM manipulation nodes leftover from legacy CSV download link, restoring the React component function body and allowing `npm run build` to pass.
- **ESLint Error (`OnlineExamPage.jsx:190`)**: Replaced empty `catch (_) {}` block statement with an explicit cleanup error comment, resolving `no-empty` lint rule.
- **Missing Parent Redirects (`App.jsx`)**: Added missing `/parent` (`DirectPathRedirect` to `/parent-dashboard`) and `/parent/*` (`RolePathRedirect` to `/parent-dashboard/*`) routes, completing parity across all 7 user roles.
- **Role Scope Leak in `generatedRoutes` (`App.jsx`)**: Restricted `generatedRoutes` to true dashboard roles (`admin`, `faculty`, `student`, `parent`, `hod`, `staff`, `finance`), preventing unauthenticated public and common utilities from being mounted under inaccessible `*-dashboard` role-guarded routes.
- **Slug Inconsistency & Trailing Suffixes (`App.jsx`)**: Normalized dynamic route slugs to standard kebab-case, stripping trailing `-page` suffixes (e.g. `/admin-dashboard/degree-audit` instead of `degree-audit-page`).
- **Route Shadowing & Duplication (`App.jsx`)**: Added `explicitRoutePaths` Set filter to `generatedRoutes.map(...)` to prevent duplicate route registrations for paths already explicitly configured in role blocks.
- **Routing Layer Hardening (`App.jsx`)**: Wrapped dynamic components in `generatedRoutes.map(...)` with `<ErrorBoundary>` and `<Suspense fallback={<SkeletonLoader variant="card" />}>` and set collision-free keys `key={route.role + route.routePath}`.
- **Documented Orphans & Aliases**: Added explicit documentation to `OfficerPlaceholder.jsx` (reserved for future unfinished officers) and `SignupPage.jsx` (canonical alias for `InstitutionRegister`).

### Added
- **Route Audit Matrix (`docs/route-audit.md`)**: Full 162-file inventory and classification table.
- **Route Map (`docs/route-map.md`)**: Comprehensive role-by-role routing table.
- **Route Smoke Tests (`src/tests/routeSmoke.test.jsx`)**: Automated integrity verification asserting 100% route coverage, valid redirect targets, zero path duplicates, and role protection.
