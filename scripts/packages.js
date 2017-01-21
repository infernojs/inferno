const Repository = require('lerna/lib/Repository');
const ProgressBar = require('progress');

module.exports = function processPackages (repo = new Repository) {
    const { packages, packageGraph } = repo;
    const pendingDeps = {};
    const todoPackages = packages.slice();
    todoPackages.forEach(pkg => packageGraph.get(pkg.name).dependencies.forEach(dep => {
        if (!pendingDeps[dep]) {
            pendingDeps[dep] = 0;
        }
        pendingDeps[dep]++;
    }));

    // This is an ordered list of batches that we have to execute serially
    const batches = []
    while (todoPackages.length !== 0) {
        const batch = todoPackages.filter(pkg => {
            const node = packageGraph.get(pkg.name);
            // This node has no pending deps
            const { dependencies } = node;
            return !dependencies.filter(dep => pendingDeps[dep]).length;
        });

        // Circular dependencies
        if (!batch.length) {
            throw new Error('Circular dependencies');
        }

        batch.forEach(pkg => {
            delete pendingDeps[pkg.name]
            todoPackages.splice(todoPackages.indexOf(pkg), 1)
        });

        batches.push(batch);
    }

    return {
        packageGraph,
        batches,
        /**
         * Execute fn in all packages in the order:
         * - Parallel for all packages in the same batch
         * - Serialize each batch (batch 0 has to finish before batch 1 starts)
         *
         * @param {ExecuteFn} fn
         * @returns {Promise<any>}
         */
        execute (fn) {
            const bar = new ProgressBar('Executing [:bar] :percent', {
                complete: '$',
                incomplete: '-',
                width: 50,
                total: batches.length
            });
            // Serially execute these
            return batches.reduce(
                (allPromises, batch) => allPromises.then(
                    // Everything in the same batch can be executed
                    // in parallel
                    _ => Promise.all(batch.map(fn))
                ).then(_ => bar.tick()),
                Promise.resolve()
            );
        },
        /**
         * Same as execute but order everything synchronously
         * instead of trying to parallelize them
         *
         * @param {ExecuteFn} fn
         * @returns {Promise<any>}
         */
        executeSync (fn) {
            new ProgressBar('Executing [:bar] :percent', {
                complete: '$',
                incomplete: '-',
                width: 50,
                total: batches.length
            });
            const ordered = batches.reduce((all, b) => all.concat(b), []);
            return ordered.reduce((allPromises, pkg) => allPromises.then(() => fn(pkg)), Promise.resolve());
        }
    }
}
