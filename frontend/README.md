# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Testing AI Tools without Supabase

Start the Vite development server and open `http://localhost:5173/ai-tools?localTest=1&step=3` to jump directly to the "Nội dung yêu cầu" step.
Use `http://localhost:5173/ai-tools?localTest=1` to start at the first step instead. This local-only mode skips draft loading and saving and lets you test without signing in. Form data is not saved. The mode is disabled in production builds.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
