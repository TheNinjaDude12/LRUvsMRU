var blockSize = document.getElementById("block_size");
var cacheBlocks = document.getElementById("cache_block")
const buttonStart = document.getElementById("start_button")
const Table1 = document.getElementById("visualTable")

buttonStart.addEventListener("click", function() {
    console.log(blockSize.value)
    console.log(cacheBlocks.value)


    if(document.getElementById("Load-Through").checked) {
        console.log("Load-Through")
    }

    else {
        console.log("Non Load-Through")
    }


    if(document.getElementById("sequential").checked) {
        
        if(document.getElementById("LRU").checked) {
            //Initialize blocks
            for (let i = 0; i < cacheBlocks.value; i++) {
                const newRow = document.createElement("tr");
                const blockNumber = document.createElement("td");
                 Table1.appendChild(newRow);
                 blockNumber.textContent = i
                 newRow.append(blockNumber)
            }

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

    
        }
    }
})