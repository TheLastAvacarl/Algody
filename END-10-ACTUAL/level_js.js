const level_name = document.querySelector('#level-name')
const lesson_button = document.querySelector('#lesson-button')

const level = [
    'Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort',
    'Quick Sort', 'Euclid Algorithm', 'Linear Search', 'Binary Search',
    'Sequential Search', 'Depth First Search', 'Breadth First Search', 'Knuth Morris Pratt',   
]

const level_link = [
    'https://www.algorithmic-odyssey.online/lessons/bubble-sort', 'https://www.algorithmic-odyssey.online/lessons/insertion-sort', 'https://www.algorithmic-odyssey.online/lessons/merge-sort', 'https://www.algorithmic-odyssey.online/lessons/selection-sort', 
    'https://www.algorithmic-odyssey.online/lessons/quick-sort', 'http://127.0.0.1:5500/views/euclid-algorithm.html', 'http://127.0.0.1:5500/views/linear-search.html', 'http://127.0.0.1:5500/views/binary-search.html',
    'http://127.0.0.1:5500/views/sequential-search.html', 'http://127.0.0.1:5500/views/depth-first-search.html', 'http://127.0.0.1:5500/views/breadth-first-search.html', 'http://127.0.0.1:5500/views/knuth-morris-pratt.html',
]

//palitan nalang din yung image path
const image_path = [
    './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png',
    './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png',
    './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png',
]

//lagay dito yung link ng kada level check nalang yung level na array para alam yung pag kakasunod
const game_link = [
    'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=1', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=2', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=3', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=4',
    'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=5', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=6', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=7', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=8',
    'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=9', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=10', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=11', 'http://127.0.0.1:5500/END-10-ACTUAL/index.html?level=12',
]
const mode = document.querySelector('#mode')

let index = 0

if (mode.classList.contains('easy')){
    if (index == 0){
        index = 0
        change(index)
    }
}else if(mode.classList.contains('medium')){
    if (index == 0){
        index = 4
        change(index)
    }
}else if(mode.classList.contains('hard')){
    if (index == 0){
        index = 8
        change(index)
    }
}

function change(index){
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.classList.add('animated');
    
    level_name.textContent = `Level ${index + 1}: ${level[index]}`;
    lesson_button.textContent = `Understand ${level[index]}`;
    lesson_button.href = level_link[index];
    gameContainer.style.backgroundImage = `url(${image_path[index]})`;
    gameContainer.href = game_link[index]
    
    setTimeout(() => {
        gameContainer.classList.remove('animated');
    }, 600);
}

function next(mode){
    if (mode == 'easy'){
        if (index <= 2){
            index += 1
            change(index)
        }
    }else if(mode == 'medium'){
        if (index <= 6){
            index += 1
            change(index)
        }
    }else if(mode == 'hard'){
        if (index <= 10){
            index += 1
            change(index)
        }
    }
}

function previous(mode){
    if (mode == 'easy'){
        if (index >= 1){
            index -= 1
            change(index)
        }
    }else if(mode == 'medium'){
        if (index >= 5){
            index -= 1
            change(index)
        }
    }else if(mode == 'hard'){
        if (index >= 9){
            index -= 1
            change(index)
        }
    }
}

