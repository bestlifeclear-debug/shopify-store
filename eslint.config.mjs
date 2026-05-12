import { createRequire } from "module"

const require = createRequire(import.meta.url)
const nextCore = require("eslint-config-next/core-web-vitals")
const nextTs = require("eslint-config-next/typescript")

const config = [
  ...nextCore,
  ...nextTs,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "supabase/**",
    ],
  },
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]

export default config
