import { join } from 'path';
import { readFileSync, cpSync, writeFileSync } from 'fs';
import { readFilesInDir } from './read-files-in-dir.js';

/**
 * node16/nodenext resolve relative imports in .d.ts as ESM, so they need a
 * file extension. tsc emits extensionless paths under moduleResolution bundler.
 * @param {string} source
 * @returns {string}
 */
export function addJsExtensionsToRelativeSpecifiers(source) {
  return source.replace(
    /(from\s+|import\s*\()(['"])(\.[^'"]+)\2/g,
    (match, prefix, quote, specifier) => {
      if (/\.[cm]?js$|\.json$|\.node$|\.d\.ts$|\.ts$/.test(specifier)) {
        return match;
      }
      return `${prefix}${quote}${specifier}.js${quote}`;
    }
  );
}

function moveTypedefs() {
  const cwd = process.cwd();
  const pkgJSONtext = readFileSync(join(cwd, 'package.json'));
  const pkgJSON = JSON.parse(pkgJSONtext);

  if (pkgJSON.private) {
    return;
  }

  const allTsFiles = [];
  const srcFolder = join(cwd, '../../build/packages/', pkgJSON.name, 'src');
  const destFolder = join(cwd, 'dist');

  readFilesInDir(srcFolder, (fileName) => {
    if (fileName.endsWith('.ts')) {
      allTsFiles.push({
        absolutePath: fileName,
        relativePath: fileName.substring(srcFolder.length)
      });
    }
  });

  for (let i = 0, len = allTsFiles.length; i < len; ++i) {
    const file = allTsFiles[i];
    const destination = destFolder + file.relativePath;
    cpSync(file.absolutePath, destination, { recursive: true, force: true });

    let text = readFileSync(destination, 'utf8');
    text = addJsExtensionsToRelativeSpecifiers(text);

    // The flags package ships runtime enums. Publish ordinary declarations so
    // isolatedModules/verbatimModuleSyntax consumers can import those values.
    // Keep const enums in source so Inferno can still inline its own flags.
    if (pkgJSON.name === 'inferno-vnode-flags') {
      text = text.replace(/\bdeclare const enum\b/g, 'declare enum');
    }

    writeFileSync(destination, text);
  }
}

// pnpm exec / node path/to/move-typedefs.js (not when imported by unit tests)
if (process.argv[1] && /move-typedefs\.js$/.test(process.argv[1].replace(/\\/g, '/'))) {
  moveTypedefs();
}
