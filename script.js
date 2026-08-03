
// Constant Values
const CACHE_TIME = 1;
const MEMORY_TIME = 10;

let activeIntervals = [];


// --- Test Case Generators ---
function isPowerOfTwo(n) {
  if (n == 0)
    return false;

  return parseInt((Math.ceil((Math.log(n) / Math.log(2)))))
    == parseInt((Math.floor(((Math.log(n) / Math.log(2))))));
}

function getNumBlocks() {
    const n = parseInt(document.getElementById('cache-blocks').value)
    if (isPowerOfTwo(n) && n > 3){
        return n
    }
    else{
        alert("Invalid block count given, reverting to minimum block count of 4")
        document.getElementById('cache-blocks').value = 4;
        return 4
    }
}
function getNumWords() {
    const n = parseInt(document.getElementById('block-size').value)
    if (isPowerOfTwo(n) && n > 1){
        return n
    }
    else{
        alert("Invalid word count given, reverting to minimum word count of 2")
        document.getElementById('block-size').value = 2;
        return 2
    }
}

document.getElementById('btn-seq').addEventListener('click', () => {
    const n = getNumBlocks();
    let seq = [];
    for (let i = 0; i < 2 * n; i++) seq.push(i);
    document.getElementById('memory-sequence').value = [...seq, ...seq].join(', ');
});

document.getElementById('btn-mid').addEventListener('click', () => {
    const n = getNumBlocks();
    let part1 = [], part2 = [];
    for (let i = 0; i < n; i++) part1.push(i);
    for (let i = 0; i < 2 * n; i++) part2.push(i);
    
    let rev1 = [...part1].reverse();
    let rev2 = [...part2].reverse();
    
    const finalSeq = [...part1, ...part2, ...part2, ...rev1, ...rev2, ...rev2];
    document.getElementById('memory-sequence').value = finalSeq.join(', ');
});

document.getElementById('btn-rand').addEventListener('click', () => {
    let finalSeq = [];
    for (let i = 0; i < 64; i++) {
        finalSeq.push(Math.floor(Math.random() * 1024));
    }
    document.getElementById('memory-sequence').value = finalSeq.join(', ');
});

// --- Main Simulation Trigger - LRU ---
document.getElementById('run-lru').addEventListener('click', () => {

    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    const cacheBlocks = getNumBlocks();
    const blockSize = getNumWords();
    const sequenceStr = document.getElementById('memory-sequence').value;
    const readPolicy = document.getElementById('read-policy').value;
    const viewMode = document.getElementById('view-mode').value;

    const sequence = sequenceStr.split(',').map(item => parseInt(item.trim())).filter(item => !isNaN(item));

    if (sequence.length === 0) return alert("Please enter a valid memory sequence.");

    const lruData = simulateFA(sequence, cacheBlocks, blockSize, 'LRU', CACHE_TIME, MEMORY_TIME, readPolicy);

    renderOutputs('lru', lruData, cacheBlocks, viewMode);

})


// --- Main Simulation Trigger - MRU ---
document.getElementById('run-mru').addEventListener('click', () => {

    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    const cacheBlocks = getNumBlocks();
    const blockSize = getNumWords();
    const sequenceStr = document.getElementById('memory-sequence').value;
    const readPolicy = document.getElementById('read-policy').value;
    const viewMode = document.getElementById('view-mode').value;

    const sequence = sequenceStr.split(',').map(item => parseInt(item.trim())).filter(item => !isNaN(item));

    if (sequence.length === 0) return alert("Please enter a valid memory sequence.");

    const mruData = simulateFA(sequence, cacheBlocks, blockSize, 'MRU', CACHE_TIME, MEMORY_TIME, readPolicy);

    renderOutputs('mru', mruData, cacheBlocks, viewMode);

});


// --- Main Simulation Trigger - Both ---
document.getElementById('run-both').addEventListener('click', () => {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    const cacheBlocks = getNumBlocks();
    const blockSize = getNumWords();
    const sequenceStr = document.getElementById('memory-sequence').value;
    const readPolicy = document.getElementById('read-policy').value;
    const viewMode = document.getElementById('view-mode').value;

    const sequence = sequenceStr.split(',').map(item => parseInt(item.trim())).filter(item => !isNaN(item));

    if (sequence.length === 0) return alert("Please enter a valid memory sequence.");

    const lruData = simulateFA(sequence, cacheBlocks, blockSize, 'LRU', CACHE_TIME, MEMORY_TIME, readPolicy);
    const mruData = simulateFA(sequence, cacheBlocks, blockSize, 'MRU', CACHE_TIME, MEMORY_TIME, readPolicy);

    renderOutputs('lru', lruData, cacheBlocks, viewMode);
    renderOutputs('mru', mruData, cacheBlocks, viewMode);
});





// --- FA Simulation Logic ---
function simulateFA(sequence, numBlocks, blockSize, policy, cacheTime, memTime, readPolicy) {
    let cache = []; 
    let hits = 0, misses = 0, timeStep = 0;
    let snapshots = [], logs = [];
    

    for (let i = 0; i < sequence.length; i++) {
        let block = sequence[i];
        timeStep++;
        let isHit = false;

        let index = cache.findIndex(c => c.block === block);
        
        if (index !== -1) {
            isHit = true;
            hits++;
            cache[index].lastAccess = timeStep;
            logs.push(`Step ${timeStep}: Block ${block} -> HIT`);
        } else {
            misses++;
            if (cache.length < numBlocks) {
                cache.push({ block: block, lastAccess: timeStep });
                logs.push(`Step ${timeStep}: Block ${block} -> MISS (Stored in empty slot)`);
            } else {
                let replaceIdx = 0;
                for (let j = 1; j < cache.length; j++) {
                    if (policy === 'LRU' && cache[j].lastAccess < cache[replaceIdx].lastAccess) replaceIdx = j;
                    if (policy === 'MRU' && cache[j].lastAccess > cache[replaceIdx].lastAccess) replaceIdx = j;
                }
                logs.push(`Step ${timeStep}: Block ${block} -> MISS (Evicted Block ${cache[replaceIdx].block})`);
                cache[replaceIdx] = { block: block, lastAccess: timeStep };
            }
        }

        let state = cache.map(c => c.block);
        while (state.length < numBlocks) state.push("-");
        snapshots.push({ block: block, isHit: isHit, state: state });
    }

    // --- RESTORED SPECIFIC MATH LOGIC ---
    const totalAccesses = sequence.length;
    const hitRateDec = totalAccesses > 0 ? (hits / totalAccesses) : 0;
    const missRateDec = totalAccesses > 0 ? (misses / totalAccesses) : 0;

    let MP = 0;
    if (readPolicy === 'load-through') {
        MP = cacheTime + memTime + cacheTime;
    } else {
        MP = cacheTime + (blockSize * memTime) + cacheTime;
    }

    const amat = (cacheTime * hitRateDec) + (missRateDec * MP);
    const totalTime = (hits * blockSize * cacheTime) + (misses * blockSize * (cacheTime + memTime)) + (misses * cacheTime);

    return { 
        totalAccesses, 
        hits, 
        misses, 
        hitRate: hitRateDec * 100, 
        missRate: missRateDec * 100, 
        amat, 
        totalTime, 
        snapshots, 
        logs 
    };
}

// --- Output Rendering ---
function renderOutputs(prefix, data, numBlocks, viewMode) {
    document.getElementById(`${prefix}-stats`).innerHTML = `
        <ul>
            <li>Total memory access count: <b>${data.totalAccesses}</b></li>
            <li>Cache hit count: <b>${data.hits}</b></li>
            <li>Cache miss count: <b>${data.misses}</b></li>
            <li>Cache hit rate: <b>${data.hitRate.toFixed(2)}%</b></li>
            <li>Cache miss rate: <b>${data.missRate.toFixed(2)}%</b></li>
            <li>Average Memory Access Time (AMAT): <b>${data.amat} ns</b></li>
            <li>Total memory access time: <b>${data.totalTime} ns</b></li>
        </ul>
    `;

    const logDiv = document.getElementById(`${prefix}-log`);
    const tableDiv = document.getElementById(`${prefix}-table`);

    if (viewMode === 'final' || data.snapshots.length === 0) {
        logDiv.innerHTML = data.logs.join('<br>');
        logDiv.scrollTop = logDiv.scrollHeight;

        let html = '<table><tr><th>Block #</th><th>Data</th></tr>';
        let finalState = data.snapshots.length > 0 ? data.snapshots[data.snapshots.length - 1].state : Array(numBlocks).fill("-");
        for (let i = 0; i < numBlocks; i++) {
            html += `<tr><td>${i}</td><td>${finalState[i]}</td></tr>`;
        }
        tableDiv.innerHTML = html + '</table>';
    } else {
        logDiv.innerHTML = '';
        tableDiv.innerHTML = '';
        let step = 0;

        let interval = setInterval(() => {
            if (step >= data.snapshots.length) {
                clearInterval(interval);
                return;
            }

            logDiv.innerHTML += data.logs[step] + '<br>';
            logDiv.scrollTop = logDiv.scrollHeight;

            let html = '<table><tr><th>Access</th>';
            for (let i = 0; i <= step; i++) html += `<th>${data.snapshots[i].block} (${data.snapshots[i].isHit ? 'H' : 'M'})</th>`;
            html += '</tr>';

            for (let row = 0; row < numBlocks; row++) {
                html += `<tr><td>Block ${row}</td>`;
                for (let i = 0; i <= step; i++) html += `<td>${data.snapshots[i].state[row]}</td>`;
                html += '</tr>';
            }
            
            tableDiv.innerHTML = html + '</table>';
            tableDiv.scrollLeft = tableDiv.scrollWidth;
            step++;
        }, 500);
        
        activeIntervals.push(interval);
    }
}