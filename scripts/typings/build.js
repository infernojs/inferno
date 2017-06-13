const dts = require("dts-bundle");
const { join } = require("path");

const cwd = process.cwd();
const pkgJSON = require(join(cwd, "package.json"));

if (pkgJSON.private) {
  return;
}

try {
  dts.bundle({
    main: join(
      __dirname,
      "../../build/packages/",
      pkgJSON.name,
      "src/index.d.ts"
    ),
    name: pkgJSON.name,
    out: join(cwd, `dist/${pkgJSON.name}.d.ts`)
  });
  console.log(`${pkgJSON.name} in typings is DONE`);
} catch (e) {
  throw Error(e);
}
