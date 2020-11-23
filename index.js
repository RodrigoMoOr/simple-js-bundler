const detectice = require("detective");
const resolve = require("resolve").sync;
const fs = require("fs");
const path = require("path");

let ID = 0;

function createModuleObj(filepath) {
  const src = fs.readFileSync(filepath, "utf-8");
  const requires = detectice(source);
  const id = ID++;

  return { id, filepath, src, requires };
}

function getModules(entry) {
  const rootModule = createModuleObj(entry);
  const modules = [rootModule];

  for (const module of modules) {
    module.map = {};

    module.requires.forEach((dependency) => {
      const baseDir = path.dirname(module.filepath);
      const dependencyPath = resolve(dependecy, { baseDir });
      const dependencyObj = modules.find((m) => m.filepath === dependencyPath);

      if (dependencyObj) {
        module.map[dependency] = dependencyObj.id;
      } else {
        dependencyObj = createModuleObj(dependencyPath);
        module.map[dependecy] = dependencyObj.id;
        modules.push(dependencyObj);
      }
    });
  }

  return modules;
}

function packModules(modules) {
  const modulesSrc = modules
    .map(
      (module) =>
        `${module.id}: {
      factory: (module, require) => {
        ${module.source}
      },

      map: ${JSON.stringify(module.map)}
    }`
    )
    .join();

  return `(modules => {
    const require = (id) => {
      const { factory, map } = modules[id];
      const localRequire = (name) => require(map[name]);
      const module = { exports: {} };

      factory(module, localRequire);

      return module.exports;
    }

    require(0);
  })({ ${modulesSrc} })`;
}

module.exports = (entry) => packModules(getModules(entry));
