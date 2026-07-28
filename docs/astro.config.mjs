// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import starlightThemeRapide from "starlight-theme-rapide";

// https://astro.build/config
export default defineConfig({
  site: "https://mgcrea.github.io",
  base: "/react-native-tailwind",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "React Native Tailwind",
      logo: {
        src: "./src/assets/logo.svg",
      },
      plugins: [starlightLinksValidator(), starlightThemeRapide()],
      customCss: ["./src/styles/custom.css"],
      expressiveCode: {
        themes: ["github-dark"],
      },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/mgcrea/react-native-tailwind" }],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "index" },
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Quick Start", slug: "getting-started/quick-start" },
            { label: "How It Works", slug: "getting-started/how-it-works" },
            { label: "How It Compares", slug: "getting-started/how-it-compares" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Basic Usage", slug: "guides/basic-usage" },
            { label: "Dynamic ClassNames", slug: "guides/dynamic-classnames" },
            { label: "State Modifiers", slug: "guides/state-modifiers" },
            { label: "Platform Modifiers", slug: "guides/platform-modifiers" },
            { label: "Color Scheme", slug: "guides/color-scheme" },
            { label: "RTL Support", slug: "guides/rtl-support" },
            { label: "Compile-Time tw", slug: "guides/compile-time-tw" },
            { label: "Runtime tw", slug: "guides/runtime-tw" },
            { label: "List Components", slug: "guides/list-components" },
            { label: "Reusable Components", slug: "guides/reusable-components" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Spacing", slug: "reference/spacing" },
            { label: "Layout", slug: "reference/layout" },
            { label: "Colors", slug: "reference/colors" },
            { label: "Typography", slug: "reference/typography" },
            { label: "Borders", slug: "reference/borders" },
            { label: "Outlines", slug: "reference/outlines" },
            { label: "Shadows & Elevation", slug: "reference/shadows" },
            { label: "Filters", slug: "reference/filters" },
            { label: "Aspect Ratio", slug: "reference/aspect-ratio" },
            { label: "Transforms", slug: "reference/transforms" },
            { label: "Sizing", slug: "reference/sizing" },
            { label: "Programmatic API", slug: "reference/api" },
          ],
        },
        {
          label: "Advanced",
          items: [
            { label: "Component Variants", slug: "advanced/component-variants" },
            { label: "Custom Attributes", slug: "advanced/custom-attributes" },
            { label: "Custom Styles Identifier", slug: "advanced/custom-styles-identifier" },
            { label: "Custom Colors", slug: "advanced/custom-colors" },
            { label: "Custom Color Scheme Hook", slug: "advanced/custom-color-scheme-hook" },
            { label: "Arbitrary Values", slug: "advanced/arbitrary-values" },
            { label: "Babel Configuration", slug: "advanced/babel-configuration" },
            { label: "Troubleshooting", slug: "advanced/troubleshooting" },
            { label: "Contributing", slug: "advanced/contributing" },
          ],
        },
      ],
    }),
  ],
});
