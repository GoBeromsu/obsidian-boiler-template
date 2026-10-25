<!--
Copy this file to the plugin repo as README.md.
Replace every {{PLACEHOLDER}}. Delete every HTML comment and every section that does not apply.
The Community preview scan flags leftover placeholder text and empty sections: before pushing, run
  grep -nE '\{\{|<!--' README.md
which must print nothing.
Visual guidance: docs/README-visuals.md
-->

# {{PLUGIN_NAME}}

{{ONE_LINE_DESCRIPTION}}

<!-- Same text as manifest.json "description": action verb first, max 250 chars, ends with a period, no emoji. -->

![{{DEMO_ALT_TEXT}}](https://raw.githubusercontent.com/{{OWNER}}/{{REPO}}/main/docs/assets/demo.gif)

<!--
Demo right under the title. Describe what happens in the alt text, e.g. "Selecting a note and running the command adds tags".
Video instead of GIF: link a YouTube URL on its own line, or [![alt](poster.png)](https://youtu.be/...).
Keep it under about 3 MB; see docs/README-visuals.md.
-->

## Features

- {{FEATURE_1}}
- {{FEATURE_2}}
- {{FEATURE_3}}

<!-- 3 to 5 bullets, each one user-visible outcome. Delete unused bullets. -->

## Usage

1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

<!-- Short steps. Command names and setting labels exactly as shown in the UI. Optionally add one annotated screenshot or a Mermaid diagram. -->

## Installation

**Community plugins**: open Settings, Community plugins, Browse, search for "{{PLUGIN_NAME}}", then Install and Enable.

**Manual**: download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/{{OWNER}}/{{REPO}}/releases/latest) into `<vault>/<configDir>/plugins/{{PLUGIN_ID}}/`, then enable the plugin. `<configDir>` is your vault's configuration folder (`.obsidian` by default).

<!-- If the plugin has no styles.css, drop it from the list. -->

## Disclosures

- **Network use**: {{REMOTE_SERVICE}} is contacted to {{WHY}}. {{WHAT_DATA_IS_SENT}}.
- **Account or payment**: {{ACCOUNT_OR_PAYMENT_REQUIRED_FOR_FULL_ACCESS}}.
- **Files outside the vault**: {{PATH_AND_WHY}}.
- **Telemetry**: {{SERVER_SIDE_TELEMETRY}}. Privacy policy: {{PRIVACY_POLICY_URL}}.
- **Ads**: {{STATIC_ADS_IN_PLUGIN_UI}}.
- **Closed source**: {{CLOSED_SOURCE_PARTS}}.

<!--
Required by the Developer policies for each item that applies. Keep only the bullets that are true.
If none apply, delete this whole section; do not write "None".
Client-side telemetry and dynamic ads are not allowed at all.
-->

## Development

See the [dev contract](https://github.com/GoBeromsu/obsidian-boiler-template#dev-contract): `bun run dev`, `bun run build`, `bun run ci`.

## License

[{{LICENSE_NAME}}](LICENSE)
