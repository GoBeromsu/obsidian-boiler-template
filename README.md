# Obsidian Plugin Boilerplate

This boilerplate template helps you quickly start developing plugins for [Obsidian](https://obsidian.md).

## 🏁 Getting Started

1. **Fork this repository:**
   Navigate to https://github.com/GoBeromsu/obsidian-boiler-template and click the "Fork" button in the top-right corner of the page. This will create a copy of the repository in your GitHub account.

2. **Clone your forked repository:**

    ```bash
    git clone https://github.com/your-username/obsidian-boiler-template.git
    ```

3. **Update personal details:**
   Before proceeding, make sure to update the following files with your personal information:

    - `LICENSE`: Update the year and your name.
    - `package.json`: Update the `author` field.
    - `manifest.json`: Update the `author`, `authorUrl`, and other relevant fields.

4. **Install dependencies:**

    ```bash
    cd your-plugin-name
    yarn install
    ```

5. **Build the plugin:**
    ```bash
    yarn run dev
    ```

## 💻 Development Workflow

1. Make changes to `main.ts` or create new `.ts` files.
2. Run `yarn run dev` to compile changes to `main.js`.
3. Reload Obsidian to load the new version of your plugin.
4. Enable the plugin in Obsidian's settings.

## 🚢 Releasing New Versions

1. Determine the new version number following [Semantic Versioning](https://semver.org/):
   - MAJOR version for incompatible API changes
   - MINOR version for backwards-compatible functionality additions
   - PATCH version for backwards-compatible bug fixes

2. Update `manifest.json` with the new version number.

3. Update `versions.json` if it exists in your repository.

4. Update the version in `package.json` if you're using npm/yarn for dependency management.

5. Commit these changes:
    ```bash
    git add manifest.json versions.json package.json
    git commit -m "Bump version to X.Y.Z"
    ```

6. Create a new git tag for the version:
    ```bash
    git tag -a X.Y.Z -m "Version X.Y.Z"
    ```

7. Push the changes and the new tag to GitHub:
    ```bash
    git push origin master
    git push origin --tags
    ```

8. Create a new GitHub release using the version number as the "Tag version".

9. Upload `manifest.json`, `main.js`, and `styles.css` as binary attachments to the release.

### Automated Version Update (Optional)

You can use the following script to automate the version update process:

```bash
yarn version
```

This command will:
1. Display the current version and prompt for a new one
2. Update the version in `package.json`
3. Run a `version-bump.mjs` script to update `manifest.json` and `versions.json`
4. Create a git commit with the changes

After running this command, manually push the tags and changes to the remote repository:

```bash
git push origin --tags
git push
```

## 🌟 Adding Your Plugin to the Community List

1. Publish an initial version.
2. Ensure you have a `README.md` in your repository root.
3. Submit a pull request to [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases).

## 🛠️ Manual Installation

Copy `main.js`, `styles.css`, and `manifest.json` to your vault's `.obsidian/plugins/your-plugin-id/` directory.

## 💰 Funding

To add funding information, update the `fundingUrl` field in `manifest.json`:

```json
{
	"fundingUrl": "https://example.com/funding"
}
```

## 📚 API Documentation

For detailed API documentation, visit the [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
