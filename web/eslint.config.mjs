// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [...compat.extends("next/core-web-vitals")];

// export default eslintConfig;
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals.js';

const eslintConfig = [
  {
    ...nextCoreWebVitals[0], // assumes nextCoreWebVitals is an array
  },
];

export default eslintConfig;
