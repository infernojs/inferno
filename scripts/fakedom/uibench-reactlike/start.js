import {writeFile} from 'fs';
import {container} from '../libs/setup.js';
import {runUIBench} from './dist/bundle.js'
import CliTable from 'cli-table';
import Table from 'cli-table';
console.log("Sanity check starts")

// const perfData = [];
// const totalAllocations = [];
//
// function collectAllocations(node) {
//   let currentNode;
//   let totalEverything = 0;
//   let totalOwn  = 0;
//   const allocations = []
//   const stack = [node];
//
//   while ((currentNode = stack.pop()) !== undefined) {
//     stack.push(...currentNode.children)
//
//     totalEverything += currentNode.selfSize;
//
//     if (currentNode.selfSize > 0 && currentNode.callFrame.url.endsWith('bundle.js')) {
//       totalOwn += currentNode.selfSize;
//       allocations.push({
//         method: currentNode.callFrame.functionName,
//         size: currentNode.selfSize
//       })
//     }
//   }
//
//   return {
//     totalEverything,
//     totalOwn,
//     allocations: allocations.sort((a, b) => a.size - b.size).slice(0, 10)
//   };
// }

const formatMemoryUsage = (data) => Math.round(data / 1024 / 1024 * 100) / 100;


global.gc();
const allStats = [];


for (let i = 0; i < 5; i++) {
  const statistics = [];
  let log = 0;

  global.gc();

  let startHeap = process.memoryUsage().heapUsed;
  let startTime = performance.now();

  await runUIBench(container, () => {
    const perfNowEnds = performance.now();
    const endHeap = process.memoryUsage().heapUsed;

    // console.log( "iter => " + i + " Sanity check ends memory");
    const cpu = perfNowEnds - startTime;
    const memory = endHeap - startHeap;
    startTime = perfNowEnds
    statistics.push({
      round: i,
      log: log++,
      cpu,
      memory: formatMemoryUsage(memory)
    })
  });



  // const memory = collectAllocations(heapProfile.head);


  allStats.push(statistics);
  // console.log()

  // console.log("CPU " + cpu + " Memory " + formatMemoryUsage(memory),  " heap used: " + heapUsed.map(formatMemoryUsage).join(','));
}


let json = JSON.stringify(allStats);
writeFile('./scripts/fakedom/results/inferno_base_line.json', json, (err) => {
  if (err) {
    console.err(err);
  } else {
    console.log("results saved");
  }
});

// printCpuStats(allStats);



