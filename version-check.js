const semver = require("semver");
const minVersion = "20.19.4";

if (!semver.satisfies(process.version, `>=${minVersion}`)) {
  console.error(
    `\x1b[31mERROR: Node.js version >=${minVersion} is required. Current version: ${process.version}\x1b[0m`,
  );
  console.error(
    `\x1b[36mPlease install Node.js v20.19.4 or higher: https://nodejs.org/\x1b[0m`,
  );
  console.error(`\x1b[33mIf using nvm:\x1b[0m\nnvm install 20.19.4 && nvm use`);
  process.exit(1);
}
