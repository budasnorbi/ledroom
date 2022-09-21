module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    project: ["**/tsconfig.json"]
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: ["plugin:@typescript-eslint/recommended" /*"plugin:prettier/recommended"*/],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-explicit-any": "off"
    // "max-len": ["error", { code: 200, ignoreUrls: true }]
  }
}
