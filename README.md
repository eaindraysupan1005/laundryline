
  # LaundryLine

  LaundryLine is a Vite + React application that streamlines dorm laundry operations for both students and dorm managers. The UI is based on the original design at [Figma](https://www.figma.com/design/3AVm23ntm0273mGt2snKNO/Laundry-Management-Platform).

  ## ✨ Key Features
  - Student dashboard with live machine availability and queue management
  - Issue reporting workflow to notify dorm managers about malfunctioning machines
  - Manager console to add, update, or remove machines and resolve issue tickets
  - Profile management flow ensuring students/managers complete required details on first login
  - Real-time toast notifications for major actions (queue join, issue submission, machine updates)

  ## 🛠️ Tech Stack
  - **React 18** with TypeScript and modern JSX runtime
  - **Vite 6** for fast development and optimized builds
  - **Tailwind CSS** utility classes and Radix UI components for consistent styling
  - **Lucide Icons** for lightweight iconography
  - **Sonner** for toast notifications

  ## 🚀 Getting Started
  1. Install dependencies:
    ```cmd
    npm install
    ```
  2. Start the development server:
    ```cmd
    npm run dev
    ```
  3. Open the provided local URL in your browser (default: `http://localhost:5173`).

  ## 🔐 Demo Accounts
  Use the following credentials to explore the app quickly:

  | Role    | Email              | Password |
  |---------|--------------------|----------|
  | Student | `irene@mfu.ac.th` | irene2002 |
  | Manager | `noon@fmfu.ac.th` | noon2025 |

  ## 🧰 Available Scripts
  - `npm run dev` – Launches the Vite dev server
  - `npm run build` – Bundles the app for production

  ## 📘 API Documentation
  - `openapi.yaml` – OpenAPI 3.0 spec covering the Supabase REST resources (machines, queues, issues, dorms, users)
  - Render the spec with [Swagger UI](https://swagger.io/tools/swagger-ui/) or [Redoc](https://redocly.com/redoc/) by pointing them to `openapi.yaml`
  - Update this spec whenever Supabase schema or Edge Function behavior changes to keep docs in sync

  ## 📁 Project Structure (excerpt)
  ```
  src/
    components/        Reusable UI blocks (views, cards, forms)
    assets/            Static assets such as the app logo
    styles/            Global CSS overrides
    types/             Shared TypeScript types and declarations
  ```

  ## 📝 Notes
  - The project uses TypeScript with strict type checking. Add interfaces/types in `src/types` when extending functionality.
  - Tailwind’s arbitrary values are used for theming (`--primary`, `--secondary`). Update CSS variables in `src/styles/globals.css` to adjust the color palette.
  