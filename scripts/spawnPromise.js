const { spawn, spawnSync, SpawnOptions } = require('child_process')

exports.spawnPromise = (cmd, args, opts) => 
    new Promise((resolve, reject) => {
        const cp = spawn(cmd, args, opts)
        let stdout = ''
        let stderr = ''

        if (cp.stdout) {
            cp.stdout.on('data', d => stdout += d)
        }

        if (cp.stderr) {
            cp.stderr.on('data', d => stderr += d)
        }

        cp.on('error', reject)
        cp.on('close', code => {
            if (!code) {
                return resolve(stdout)
            }
            reject(new Error(`Command "${cmd} ${args.join(' ')}" exited with code ${code}.
Opts: ${JSON.stringify(opts)}
Stderr: ${stderr}`))
        })
    })


exports.spawnPromiseSync = (cmd, args, opts) =>
    new Promise((resolve, reject) => {
        const cp = spawnSync(cmd, args, opts)
        if (cp.error) {
            return reject(cp.error)
        }

        if (cp.status) {
            return reject(new Error(`Command "${cmd} ${args.join(' ')}" exited with code ${cp.status}.
Opts: ${JSON.stringify(opts)}
Stderr: ${cp.stderr}`))
        }

        resolve(cp.stdout)
    })

