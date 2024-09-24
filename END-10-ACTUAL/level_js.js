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
    './images/level/Untitled.png', './images/level/2.png', './images/level/3.png', './images/level/4.png',
    './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png',
    './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png', './images/level/Untitled.png',
]

//lagay dito yung link ng kada level check nalang yung level na array para alam yung pag kakasunod
let game_link = [
    '/END-10-ACTUAL/index.html?level=1', '/END-10-ACTUAL/index.html?level=2', '/END-10-ACTUAL/index.html?level=3', '/END-10-ACTUAL/index.html?level=4',
    '/END-10-ACTUAL/index.html?level=5', '/END-10-ACTUAL/index.html?level=6', '/END-10-ACTUAL/index.html?level=7', '/END-10-ACTUAL/index.html?level=8',
    '/END-10-ACTUAL/index.html?level=9', '/END-10-ACTUAL/index.html?level=10', '/END-10-ACTUAL/index.html?level=11', '/END-10-ACTUAL/index.html?level=12',
]
const mode = document.querySelector('#mode')

let temp_userID
window.onload = async function () {
    const data = await fetch("http://localhost:5000/api/users");
    const {users}= await data.json();
    const {session} = users
    temp_userID = users.user.id
};



let index = 0

// ilalagay nalang yung ginawang seassion dito ni ronnie samay backend
async function get_user_data(temp_userID) {
    const response = await fetch('http://localhost:3000/api/game');
    const data = await response.json();
    return data;
}

let current_user_level
get_user_data(temp_userID)
    .then(data => {
        setTimeout(() => {
            Promise.all(data.users.map(async user => {
                console.log(temp_userID)
                if (user.id == temp_userID) {
                    current_user_level = user.level;
                    console.log(user.level);
                }
            }));
        }, 600);
    })
    .catch(error => console.error('Error fetching data:', error));


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

setTimeout(() => {
    console.log(current_user_level)
    num = 0
    play_icon_to_lock(index)
}, 500); 


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


const play = document.querySelector('#play_button')
const lock = document.querySelector('#lock_button')

function play_icon_to_lock(index){
    if (index  > current_user_level - 1){
        gameContainer.href = '#level-name'
        play.classList.replace('flex', 'hidden')
        lock.classList.replace('hidden', 'flex')
    }
}


function lock_to_play_icon(index){
    if (index  < current_user_level){
        gameContainer.href = game_link[index]
        lock.classList.replace('flex', 'hidden')
        play.classList.replace('hidden', 'flex')
    }else if(index  > current_user_level - 1){
        gameContainer.href = '#level-name'
    }
}


function next(mode){
    if (mode == 'easy'){
        if (index <= 2){
            index += 1
            change(index)
            play_icon_to_lock(index)
        }
    }else if(mode == 'medium'){
        if (index <= 6){
            index += 1
            change(index)
            play_icon_to_lock(index)
        }
    }else if(mode == 'hard'){
        if (index <= 10){
            index += 1
            change(index)
            play_icon_to_lock(index)
        }
    }
}

function previous(mode){
    if (mode == 'easy'){
        if (index >= 1){
            index -= 1
            change(index)
            lock_to_play_icon(index)
        }
    }else if(mode == 'medium'){
        if (index >= 5){
            index -= 1
            change(index)
            lock_to_play_icon(index)
        }
    }else if(mode == 'hard'){
        if (index >= 9){
            index -= 1
            change(index)
            lock_to_play_icon(index)
        }
    }
}
