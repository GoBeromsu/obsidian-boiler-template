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

## 🌟 Adding Your Plugin to the Community List

1. Publish an initial version.
2. Ensure you have a `README.md` in your repository root.
3. Submit a pull request to [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
