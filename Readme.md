# SummaryX

SummaryX is a Next.js application that helps you understand public github repository by generating context aware summary for all files in prompt friendly manner.

## 🧰 Technology Stack

| Technology   | Purpose/Role                                           |
| ------------ | ------------------------------------------------------ |
| Next.js      | React framework for server-side rendering and routing. |
| React        | JavaScript library for building user interfaces.       |
| TypeScript   | Adds static typing to JavaScript.                      |
| Prisma       | ORM for database access and schema management.         |
| PostgreSQL   | Relational database for persistent data storage.       |
| NextAuth.js  | Authentication library for handling user logins.       |
| GitHub API   | Used for fetching repository information.              |
| Pusher       | Real-time communication for updates.                   |
| Tailwind CSS | Utility-first CSS framework for styling.               |
| Shadcn UI    | UI component library.                                  |
| Radix UI     | UI primitives library.                                 |
| Sonner       | Library for displaying toast notifications.            |

## 📁 File Structure and Purpose

| File Path                                                     | Description                                                                                              |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `config/site.ts`                                              | Defines the website configuration, including metadata and social media links.                            |
| `components/dashboard/left-sidebar-repo-header.tsx`           | Renders the header for the dashboard's left sidebar, including a button to add new repositories.         |
| `components/dashboard/left-sidebar-repo-list.tsx`             | Displays a list of repositories in the dashboard's left sidebar; shows an empty state message if needed. |
| `Readme.md`                                                   | Provides instructions for setting up and running the project.                                            |
| `lib/prisma.ts`                                               | Sets up a Prisma Client instance for database interactions using a singleton pattern.                    |
| `package-lock.json`                                           | Contains a record of the project's dependencies and their versions.                                      |
| `lib/api.ts`                                                  | Defines API endpoints for fetching data from the server.                                                 |
| `lib/github.ts`                                               | Provides functions for parsing and validating GitHub repository URLs.                                    |
| `components/repo-details/navbar.tsx`                          | Renders the navigation bar for repository details pages.                                                 |
| `components/providers/toast.tsx`                              | Provides a React context for managing toast messages using the 'sonner' library.                         |
| `components/ui/avatar-menu.tsx`                               | No summary available                                                                                     |
| `components/ui/avatar.tsx`                                    | No summary available                                                                                     |
| `components/ui/background-shine.tsx`                          | No summary available                                                                                     |
| `components/ui/badge.tsx`                                     | No summary available                                                                                     |
| `lib/pusher/client.ts`                                        | Initializes a Pusher client for real-time communication.                                                 |
| `components/ui/border-hover-link.tsx`                         | No summary available                                                                                     |
| `components/ui/button.tsx`                                    | No summary available                                                                                     |
| `components/ui/card.tsx`                                      | No summary available                                                                                     |
| `components/ui/collapsible.tsx`                               | No summary available                                                                                     |
| `components/ui/dialog.tsx`                                    | No summary available                                                                                     |
| `components/ui/dropdown-menu.tsx`                             | No summary available                                                                                     |
| `components/ui/sonner.tsx`                                    | No summary available                                                                                     |
| `components/ui/terminal.tsx`                                  | No summary available                                                                                     |
| `app/logs/[id]/repo-logs.tsx`                                 | No summary available                                                                                     |
| `components/ui/gradient-button.tsx`                           | No summary available                                                                                     |
| `components/ui/lamp.tsx`                                      | No summary available                                                                                     |
| `components/ui/rotating-border-badge.tsx`                     | No summary available                                                                                     |
| `components/ui/scroll-area.tsx`                               | No summary available                                                                                     |
| `components/ui/separator.tsx`                                 | No summary available                                                                                     |
| `components/ui/sign-in.tsx`                                   | No summary available                                                                                     |
| `app/api/auth/[...nextauth]/route.ts`                         | No summary available                                                                                     |
| `app/repository/[id]/action.ts`                               | No summary available                                                                                     |
| `app/repository/[id]/layout.tsx`                              | No summary available                                                                                     |
| `prisma/migrations/20250424095546_basic_schema/migration.sql` | No summary available                                                                                     |
| `app/repository/[id]/page.tsx`                                | No summary available                                                                                     |
| `app/repository/[id]/repo-explorer.tsx`                       | No summary available                                                                                     |
| `app/repository/[id]/summary-modal.tsx`                       | No summary available                                                                                     |
| `prisma/migrations/20250428003010_added_logs/migration.sql`   | No summary available                                                                                     |
| `app/api/repository/get-all/route.ts`                         | No summary available                                                                                     |
| `app/api/repository/processing/route.ts`                      | No summary available                                                                                     |
| `app/api/repository/start-process/route.ts`                   | No summary available                                                                                     |
| `app/api/repository/stop-processing/route.ts`                 | No summary available                                                                                     |
| `.eslintrc.json`                                              | Configures ESLint for Next.js and TypeScript.                                                            |
| `interfaces/site.ts`                                          | Defines the type for site configuration.                                                                 |
| `components.json`                                             | Configures UI components using Shadcn's UI library.                                                      |
| `components/home/footer.tsx`                                  | Renders the footer component for the home page.                                                          |
| `lib/auth-options.ts`                                         | Configures authentication options using NextAuth.js.                                                     |
| `package.json`                                                | Defines the project's metadata, dependencies, and scripts.                                               |
| `tailwind.config.ts`                                          | Configures Tailwind CSS for the project.                                                                 |
| `tsconfig.json`                                               | Contains TypeScript compiler options.                                                                    |
| `prisma/schema.prisma`                                        | Defines the data model for the application using Prisma.                                                 |
| `app/globals.css`                                             | Sets global styles for the application.                                                                  |
| `app/layout.tsx`                                              | Defines the layout for all pages in the application.                                                     |
| `app/not-found.tsx`                                           | Renders the 404 page.                                                                                    |
| `interfaces/github.ts`                                        | Defines TypeScript interfaces for interacting with GitHub data.                                          |
| `interfaces/next-auth.ts`                                     | Extends NextAuth.js types to include a custom user ID.                                                   |
| `app/logs/[id]/layout.tsx`                                    | Handles authentication and data fetching for repository logs.                                            |
| `components/dashboard/left-sidebar-repository-card.tsx`       | Displays a single repository card in the left sidebar.                                                   |
| `lib/service-auth.ts`                                         | Handles the creation of JSON Web Tokens (JWTs) for service authentication.                               |
| `lib/utils.ts`                                                | Contains utility functions.                                                                              |
| `components/global/fade-in.tsx`                               | Provides a fade-in animation effect.                                                                     |
| `components/global/fade-slide-in.tsx`                         | Implements a fade-in animation with a slide effect.                                                      |
| `components/global/max-width-wrapper.tsx`                     | Wraps its children with a max-width container.                                                           |
| `components/home/navbar.tsx`                                  | Renders the navigation bar for the home page.                                                            |
| `components/providers/provider.tsx`                           | Sets up global providers for NextAuth session, SWR data fetching, and toast notifications.               |
| `app/(home)/hero.tsx`                                         | Renders the hero section of the home page.                                                               |
| `app/dashboard/action.ts`                                     | Handles fetching repository data for the dashboard.                                                      |
| `app/dashboard/layout.tsx`                                    | Defines the layout for the dashboard.                                                                    |
| `app/dashboard/page.tsx`                                      | The main component for the dashboard page.                                                               |
| `prisma/migrations/migration_lock.toml`                       | Lock file used by Prisma to manage database migrations.                                                  |
| `components/dashboard/left-sidebar.tsx`                       | Fetches and displays a list of user repositories in the left sidebar.                                    |
| `components/dashboard/navbar.tsx`                             | Renders the navigation bar for the dashboard.                                                            |
| `components/dashboard/right-sidebar.tsx`                      | Renders a right sidebar with information about updates and upcoming features.                            |
| `app/(home)/layout.tsx`                                       | Layout component for the home page.                                                                      |
| `app/(home)/page.tsx`                                         | Renders the main content of the home page.                                                               |
| `components/ui/border-beam.tsx`                               | Renders an animated border beam.                                                                         |
| `components/dashboard/empty/sidebar-repo-list.tsx`            | Renders an empty state message in the dashboard's sidebar when no repositories are found.                |
| `app/auth/sign-in/page.tsx`                                   | Renders the sign-in page.                                                                                |
| `components/ui/alert-dialog.tsx`                              | Provides a customizable alert dialog UI element.                                                         |
| `app/logs/[id]/page.tsx`                                      | Fetches and displays processing logs for a specific repository.                                          |
| `components/ui/alert.tsx`                                     | Renders an alert message.                                                                                |
