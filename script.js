var blockSize = document.getElementById("block_size");
var cacheBlocks = document.getElementById("cache_block")
const buttonStart = document.getElementById("start_button")
const Table1 = document.getElementById("visualTable")
var CAT = 1
var MAT = 10
var MP 
var hits 
var misses 
var hit_rate
var miss_rate
var access_count
var AMAT
var TMAT


buttonStart.addEventListener("click", function() {
    console.log(blockSize.value)
    console.log(cacheBlocks.value)
    const data_seq = []

    if(document.getElementById("Load-Through").checked) {
        MP = CAT + MAT + CAT
        console.log("Load-Through")
    }
    else {
        MP = CAT + (cacheBlocks.value * MAT) + CAT
        console.log("Non Load-Through")
    }
    
    //Initialize blocks
    for (let i = 0; i < cacheBlocks.value; i++) {
        const newRow = document.createElement("tr");
        const blockNumber = document.createElement("td");
            Table1.appendChild(newRow);
            blockNumber.textContent = i
            newRow.append(blockNumber)
    }

    //Sequential, 2n data blocks repeated twice
    if(document.getElementById("sequential").checked) {

        //Initializing an array to hold the 2n data sequence repeated twice.
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < cacheBlocks.value*2; j++){
                data_seq.push(j)
            }
        }
        
        access_count = data_seq.length

        if(document.getElementById("LRU").checked) {
            
           //fill up all missing
           const rows = document.querySelectorAll('tr');

            // STAGE 1 (t=1000ms): block 0 1 2 3, age 0 1 2 3
            setTimeout(function() {
                rows.forEach((element, index) => {
                    if(index == 0) return;
                    const data = document.createElement("td");
                    const age =  document.createElement("td");
                    data.textContent = index - 1
                    age.textContent = index - 1
                    element.append(age)
                    element.append(data)
                });
            }, 1000);

            // STAGE 2 (t=3000ms): block 4 5 6 7, age 4 5 6 7
            setTimeout(function() {
                var number = cacheBlocks.value
                var age = cacheBlocks.value
                rows.forEach((element, index) => {
                    if(index == 0) return;
                    const cells = element.querySelectorAll('td')
                    cells.forEach((cell, index) => {
                        if(index == 0) return;
                        if(index == 1) { cell.textContent = age; }
                        if(index == 2) { cell.textContent = number; }
                    });
                    number++;
                    age++;
                });
            }, 3000);

            // STAGE 3 (t=5000ms): block 0 1 2 3, age 8 9 10 11
            // STAGE 4 (t=6600ms): block 4 5 6 7, age 12 13 14 15
            var age = 2 * cacheBlocks.value; // continues from stage 2's last age (7) -> starts at 8
            for(let i = 0; i < 2; i++) {
                setTimeout(function() {
                    var number = i * cacheBlocks.value; // i=0 -> 0 1 2 3, i=1 -> 4 5 6 7
                    rows.forEach((element, index) => {
                        if(index == 0) return;
                        const cells = element.querySelectorAll('td')
                        cells.forEach((cell, index) => {
                            if(index == 0) return;
                            if(index == 1) { cell.textContent = age; }
                            if(index == 2) { cell.textContent = number; }
                        });
                        number++;
                        age++;
                    });
                }, 5000 + i * 1600);
            }

            simulate_seq(data_seq, 1)
            
        }

        if(document.getElementById("MRU").checked) {
            simulate_seq(data_seq, 0)
        }
    }
    //Mid-repeat, one run 0 to n-1 then two runs 0 to 2n-1 then reverse 
    if(document.getElementById("midrepeat").checked) {
        
        //First pushing 0 to n-1
        for (let i = 0; i < cacheBlocks.value; i++){
            data_seq.push(i)
        }

        //Then pushing 0 to 2n-1 twice
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2*cacheBlocks.value; j++){
                data_seq.push(j)
            }
        }
        
        //Now pushing n-1 to 0
        for (let i = cacheBlocks.value-1; i >= 0; i--){
            data_seq.push(i)
        }

        //Finally pushing 2n-1 to 0 twice
        for (let i = 0; i < 2; i++){
            for (let j = 2*cacheBlocks.value-1; j >= 0; j--){
                data_seq.push(j)
            }
        }
 
        access_count = data_seq.length
        
        if(document.getElementById("LRU").checked) {
            simulate_seq(data_seq, 1)
        }

        if(document.getElementById("MRU").checked) {
            simulate_seq(data_seq, 0)
        }
    }
    //Random sequence of 64 block accesses within 0-1023
    if(document.getElementById("random").checked) {
        
        //initialize random 64 block access 
        for (let i=0; i < 64; i++){
            data_seq.push(Math.round(Math.random() * (1023 - 0) + 0))
        }

        access_count = data_seq.length

        if(document.getElementById("LRU").checked) {
            simulate_seq(data_seq, 1)
        }

        if(document.getElementById("MRU").checked) {
            simulate_seq(data_seq, 0)
        }
    }
})

//main function to simulate sequence
function simulate_seq(data_seq, LRU){
    var replace
    var pass = false

    hits=0
    misses=0

    const cache = Array(cacheBlocks.value).fill(-1);
    const age = Array(cacheBlocks.value).fill(-1);
    
    for (let i = 0; i < data_seq.length; i++){
        //First iterate through array to check if there is a hit
        for (let j = 0; j < cacheBlocks.value; j++){
            if (cache[j] === data_seq[i]){
                cache[j] = data_seq[i]
                age[j] = i
                hits++
                pass = true
                j = 99999 
            }
        }
        //If cache still has space then add new data, else begin replacement 
        if (i < cacheBlocks.value && !pass){
            cache[i] = data_seq[i]
            age[i] = i
            misses++
        }
        else if (!pass) {
            if (LRU == 1){
                replace = Math.min.apply(null, age)
                rindex = age.indexOf(replace)

                cache[rindex] = data_seq[i]
                age[rindex] = i
                misses++
            }
            else {
                replace = Math.max.apply(null, age)
                rindex = age.indexOf(replace)

                cache[rindex] = data_seq[i]
                age[rindex] = i
                misses++
            }
        }
        pass = false
    }
    //debugging
    console.log("Data",cache)
    console.log("Age ",age)

    //beginning calculation of statistical output

    console.log("Access Count", access_count)
    console.log("Hits", hits)
    console.log("Misses", misses)

    cal_stats()
}

//calculates values needed for statistical output
function cal_stats(){
    miss_rate = misses/access_count
    hit_rate = hits/access_count

    console.log("Hit rate", hit_rate)
    console.log("Miss rate", miss_rate)

    var AMAT = (CAT*hit_rate) + (MAT*MP)
    var TMAT = (hits * blockSize.value * CAT) + (misses * blockSize.value * (CAT + MAT)) + (misses * CAT)

    console.log("Average Memory Access Time(ns)",AMAT)
    console.log("Total Memory Access Time(ns)",TMAT)
}
