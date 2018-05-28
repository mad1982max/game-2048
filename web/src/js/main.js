$(document).ready(onLoad);

//----------Дано-------------
let initState = {
    windWidth :  window.outerWidth,
    indexForSlider: 1,
    flagForBtn1: 0,
    flagForBtn2: 0,
    quantSqrOnBoard: 0,
    time: 300
};

let cells = [];
let sqr;
let varOfVal = [2,4];
let currentUser;
let animPerPressingKey;
let rulesObj = {
    2: ['#ECE4D9', '#736D61'],
    4: ['#EBE0C4', '#736D61'],
    8: ['#F3B17A', 'white'],
    16: ['#F99365', 'white'],
    32: ['#F57C5B', 'white'],
    64: ['#F35E38', 'white'],
    128: ['#ECD167', 'white'],
    256: ['#E9CE5D', 'white'],
    512: ['#ECC94A', 'white'],
    1024: ['black', 'white'],
    2048: ['black', 'white'],
};

//-----------Загрузка страницы--------------
function onLoad() {
    setStartPosForNums();
    firstAnimation();
}
//------Подгонка анимации под размер окна----
$(window).resize(onResize);
function onResize() {
    let dif = window.outerWidth - initState.windWidth;
    initState.windWidth = window.outerWidth;
    $('.header_num').css({left: `+=${dif / 2}px`});
    $('.header_text').css({left: `+=${dif / 2}px`});
    if ($('.hoverElem')) {
        $('.hoverElem').css({left: `+=${dif/2}px`});
    }
}
//-------Начаьное положение 2048 в шапке перед анимацией--------
function setStartPosForNums() {
    let initRight = window.outerWidth + $('.header_num')[0].offsetWidth;
    let initLeft = $('.header_num').outerWidth();
    $('.num2').css({left: `-${initLeft}px`});
    $('.num0').css({left: `-${initLeft}px`});
    $('.num4').css({left: `${initRight}px`});
    $('.num8').css({left: `${initRight}px`});
    $('.header_num').css({visibility: 'visible'});
}
//----------Цифры 2048 выезжают--------------------
function firstAnimation() {
    let widthNum = $('.header_num').outerWidth();

    let pos2 = window.outerWidth / 2 - 2 * widthNum;
    let pos8 = window.outerWidth / 2 + widthNum;
    let pos0 = window.outerWidth / 2 - widthNum;
    let pos4 = window.outerWidth / 2;

    let def_anim2 = $.Deferred();
    let def_anim0 = $.Deferred();
    let def_anim4 = $.Deferred();
    let def_anim8 = $.Deferred();

    $('.num0').animate({left: `${pos0}px`}, initState.time, def_anim0.resolve);
    $('.num4').animate({left: `${pos4}px`}, initState.time, def_anim4.resolve);

    $.when(def_anim0, def_anim4).done(()=> {
        $('.num2').animate({left: `${pos2}px`}, initState.time, def_anim2.resolve);
        $('.num8').animate({left: `${pos8}px`}, initState.time, def_anim8.resolve);
    });

    $.when(def_anim2, def_anim8).done(secondAnimation);
}
//-------------Появлятся текст 'the game'-----------------
function secondAnimation() {
    let heightAboveText = $('.num8')[0].offsetTop + $('.num8')[0].offsetHeight;
    let left8Pos = $('.num8')[0].offsetLeft + $('.num8')[0].offsetWidth;

    $('.header_text')
        .css({top: `${heightAboveText - $('.header_text')[0].offsetHeight/2}px`, left: `${left8Pos - $('.header_text')[0].offsetWidth}px`})
        .animate({opacity: 1}, initState.time*1.5, thirdAnimation());
}
//---------Шапка меняет цвета/--Появляется поле/кнопки------------
function thirdAnimation() {

    let def_numColor = $.Deferred();
    let def_textColor = $.Deferred();
    let def_bodyColor = $.Deferred();
    let def_mainApp = $.Deferred();
    let def_footerApp = $.Deferred();

    $('.header_num').animate({color: "#776E65"}, initState.time, def_numColor.resolve);
    $('.header_text').animate({color: "#776E65"}, initState.time, def_textColor.resolve);
    $('body').animate({backgroundColor: ' #F6F7EF'}, initState.time, def_bodyColor.resolve);
    $('.main').animate({opacity: 1}, initState.time, def_mainApp.resolve);
    $('.footer').animate({opacity: 1}, initState.time, def_footerApp.resolve);

    $.when(def_numColor, def_textColor, def_bodyColor, def_mainApp, def_footerApp).done(bindClicks);
}
//--------------Привязываем клики на клавиши------------
function bindClicks() {
    $('#btn1').click(clickBtn1);
    $('#btn2').click(clickBtn2);
    showHint();
}
//-------------Подсказка по вводу---------------------------------------------
function showHint() {
    $('input').focus(() => $('#errorField').html("<b>Use</b>: 0-9, a-z, 5 - 8 chars"));
}
//------------Привязываем разные функции при нажатии в зав-ти от флага--------
function clickBtn1() {
    if (initState.flagForBtn1 == 0) {
        reg();
    }
    else if (initState.flagForBtn1 == 1) {
        startGame();
    }
    else if (initState.flagForBtn1 == 2) {
        restart();
    }
}

function clickBtn2() {
    if(initState.flagForBtn2 == 0) {
        send();
    }
    else if (initState.flagForBtn2 == 1) {
        getLeaders();
    }
}
//---------------Регистрируемся//Входим в аккаунт-----------------
function reg() {
    let login = $('#login').val();
    let psw = $('#psw').val();
    if (isValid(login) && isValid(psw)) {
        $('#errorField').text('');
        $.post(`http://localhost:8080/users/`, {_id: login, password: psw}, (data) => {
            if (typeof(data) === "string") {
                alertField(data, 'text');
            }
            else if (typeof(data[0]) === "object" && typeof(data[0]) !== null) {
                let user = data[0];
                chooseParams(user);
            }
        });
    } else {
        $('#errorField').text("INCORRECT DATA");
    }
}

function send() {
    //let login = 'adminMaks';
    //let psw = 'adminMaks';
    let login = $('#login').val();
    let psw = $('#psw').val();

    if (isValid(login) && isValid(psw)) {
        $('#errorField').text('');
        $.post(`http://localhost:8080/users/${login}`, {password: psw}, (data) => {
            if(typeof(data) === "string") {
                alertField(data, 'text');
            }
            else if(typeof(data) === "object" && typeof(data) !== "string") {
                let user = data;
                chooseParams(user);
            }
        });
    } else {
        $('#errorField').text("INCORRECT DATA");
    }
}
//---------Проверка на валидность имени/пароля----------
function isValid(val) {
    let regExp = /[ \.\,\$\\\`\(\)\{\}\+\-\*\[{}?!~]/;
    return val.length <= 10 && val.length >= 5 && val.search(regExp) < 0;
}
//------------Сообщение(модал.окно)---------------------
function alertField(data, tag) {
    $('#modal').css({display: 'block'});
    $(window).click(function () {
        $('#modal').css({display: 'none'});
    });
    if (tag === 'text') {
        $('#modal-content p').text(data);
    }
    else if (tag === 'html') {
        $('#modal-content p').html(data);
    }
}
//-----------Запрос лидеров-----------------
function getLeaders() {
    $.get(`http://localhost:8080/users/`, (data) => {
        console.log(data);
        showLeaders(data);
    });
}
//---------Установка рекорда (запись в БД)------------
function setNewRecord() {
    let login = currentUser._id;
    $.post(`http://localhost:8080/users/${login}/edit`, {record: currentUser.highestScore}, (data) => {
            console.log(data);
    });
}
//--------------Визуаизация списка лидеров------------------
function showLeaders(users) {
    let leaders = users;
    let table = ["<table class = 'leaders'>"];
    table.push("<tr>");
    table.push(`<th>User</th>`);
    table.push(`<th>Highest score</th>`);
    table.push("</tr>");
    for (let row of leaders) {
        table.push("<tr>");
        table.push(`<td class="_id">${row._id}</td>`);
        table.push(`<td class="highestScore">${row.highestScore}</td>`);
        table.push("</tr>");
    }
    table.push("</table>");
    table = table.join('');
    alertField(table, 'html')
}
//-------------Второй экран (выбор игрового поля)------------------
function chooseParams(user) {
    initState.flagForBtn1 = 1;
    initState.flagForBtn2 = 1;

    $('#btn1').text('Start');
    $('#btn2').text('Leaders');
    currentUser = user;
    currentUser.scores = 0;
    console.log(user);

    let def_hide_num = $.Deferred();
    let def_hide_text = $.Deferred();
    let def_hide_logField = $.Deferred();

    $('.header_num').fadeOut(initState.time).hide('fast', def_hide_num.resolve);
    $('.header_text').fadeOut(initState.time).hide('fast', def_hide_text.resolve);
    $('.main_login-field').fadeOut(initState.time).hide('fast', def_hide_logField.resolve);

    $.when(def_hide_num, def_hide_text, def_hide_logField).done(() => {
        $('.record').text(user.highestScore);
        $('.header_user').text(user._id);
        $('.header').css({display: 'grid'});
        $('.main').css({display: 'flex'});

        $('.header_logo').show(initState.time);
        $('.header_user').show(initState.time);
        $('.header_scores').show(initState.time);
        $('.header_record').show(initState.time);
        $('.main_prev').show(initState.time);
        $('.main_slider').show(initState.time);
        $('.main_next').show(initState.time);
        showImg(initState.indexForSlider);
    });
}
//------------Слайдер из игровых полей-----------------------
$('.main_next').click(function () {
    countIndex(1);
});
$('.main_prev').click(function () {
    countIndex(-1);
});

function countIndex(n) {
    initState.indexForSlider += n;
    showImg(initState.indexForSlider);
}
function showImg(n) {
    let slides = $('.slides');
    if (n > slides.length) {initState.indexForSlider = 1;}
    if (n < 1) {initState.indexForSlider = slides.length;}
    slides.css("display", "none");
    slides.eq(initState.indexForSlider - 1).css("display","block");
    let row = slides.eq(initState.indexForSlider - 1).find('img').data('index');
    $('#btn1').data("index", row);
}
//--------------Рестарт------------------
function restart() {
    $('#modal').css({display: 'none'});
    cells = [];
    animPerPressingKey = 0;
    currentUser.scores = 0;
    sqr = 0;
    initState.flagForBtn1 = 1;
    $('.scores').text(currentUser.scores);
    $('table').empty();
    $('table').remove();
    $('.hoverElem').remove();

    $('.main').css({display: 'flex'});
    $('.main_slider').show(initState.time);
    $('.main_prev').show(initState.time);
    $('.main_next').show(initState.time);

    $('#btn1').text('Start');
}
//----------------------------------------
//------------Определение направления по нажатию-------------
function keyBindMoving(e) {
    if (e.which == 37) {
        move('left');
    }
    else if (e.which == 39) {
        move('right');
    }
    else if (e.which == 38) {
        move('up');
    }
    else if (e.which == 40) {
        move('down');
    }
}

//---------------------------------------
//--------------Начало игры--------------
function startGame() {
    $('.main_slider').css({display: 'none'});
    $('.main_next').css({display: 'none'});
    $('.main_prev').css({display: 'none'});

    initState.flagForBtn1 = 2;
    $('#btn1').text('Restart');

    //привязка клавиш
    $(document).keydown((e) => {
        keyBindMoving(e);
    });

    //привязка свайпов
    $(document).swipe({
        swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
            if (direction === 'left') {
                move('left');
            }
            else if (direction === 'right') {
                move('right');
            }
            else if (direction === 'up') {
                move('up');
            }
            else if (direction === 'down') {
                move('down');
            }
        },
        triggerOnTouchEnd: false,
        threshold: 10
    });
    /*let tipText = `Use control keys: <i class="fas fa-arrow-up"></i> <i class="fas fa-arrow-down"></i> <i class="fas fa-arrow-left"></i> <i class="fas fa-arrow-right"></i> or swipe`;
    console.log(tipText);
    //alertField(tipText, 'html');*/

    sqr = $('#btn1').data('index');

    buildTable(sqr);
    setWidthTR(sqr);
    setTimeout(createElem, initState.time, sqr);
}

//----------Строим виртуаьную таблицу игрового поля------------------
function buildTable(n) {
    let arr = [];
    for (let i = 0; i < n*n; i++) {
        arr.push([`c${i}`, 0]);
    }
    while(arr.length) {
        cells.push(arr.splice(0, n));
    }
    $(".content").append(wrap(cells));
}

//----------Визуально показываем таблицу игрового поля---------------
function wrap(arr) {
    let result = ["<table id='game_table'>"];
    for (let row of arr) {
        result.push("<tr>");
        for (let data of row) {
            result.push(`<td id = ${data[0]}></td>`);
        }
        result.push("</tr>");
    }
    result.push("</table>");
    return result.join('');
}

//---------------Подгоняем размер ячеек под экран-------------------
function setWidthTR(sqr) {
    if (initState.windWidth <= 480) {
        switch (sqr) {
            case 3:
                $('td').css({width: '90px', height: '90px'});
                break;
            case 4:
                $('td').css({width: '67.5px', height: '67.5px'});
                break;
            case 5:
                $('td').css({width: '54px', height: '54px'});
                break;
            case 6:
                $('td').css({width: '45px', height: '45px'});
                break;
            case 8:
                $('td').css({width: '33.75px', height: '33.75px'});
        }
    }   else if (initState.windWidth >= 760 && window.outerHeight >= 840) {
            switch(sqr) {
                case 3: $('td').css({width: '150px', height: '150px'});
                    break;
                case 4: $('td').css({width: '112.5px', height: '112.5px'});
                    break;
                case 5: $('td').css({width: '90px', height: '90px'});
                    break;
                case 6: $('td').css({width: '75px', height: '75px'});
                    break;
                case 8: $('td').css({width: '56.25px', height: '56.25px'});
            }
    }   else /*if (initState.windWidth >= 480 && initState.windWidth <= 760) */{
            switch(sqr) {
            case 3: $('td').css({width: '120px', height: '120px'});
                break;
            case 4: $('td').css({width: '90px', height: '90px'});
                break;
            case 5: $('td').css({width: '72px', height: '72px'});
                break;
            case 6: $('td').css({width: '60px', height: '60px'});
                break;
            case 8: $('td').css({width: '45px', height: '45px'});
            }
    }
}

//---------Параметры новой ячейки------------------
function createSqr(id, val) {
    let widthEl = $('td').css('width');
    let heightEl = $('td').css('height');
    let top = $(`#${id}`).offset().top;
    let elem = $('<div/>', {
        id: `h${id}`,
        class: 'hoverElem',
        css: {
            position: 'absolute',
            width: `${widthEl}`,
            height: `${heightEl}`,
            top: top + `px`,
            left: $(`#${id}`).offset().left + `px`,
            border: '1px solid #B9AD9B',
            background: 'white',
            color: '#736D61',
            'border-radius': '10px',
            'font-size': parseFloat(widthEl)/1.75,
            'line-height': `${heightEl}`
        },
        text: val,
        'data-prev': id,
        'data-current': id
    });
    $('#game_table').append(elem);
    setVal(id, val);
    changeColor(id, val);
}
//---------Цвет ячейки в зависимости от значения--------------------
function changeColor(id, val) {
    $(`#h${id}`).css({backgroundColor: rulesObj[val][0], color: rulesObj[val][1]});
}
//--------------Случайное значение----------------------------------
function getRandom(max) {
    return Math.floor(Math.random() * max);
}
//---------------isFree-----------------------------------
function isFree(id) {
    return !getVal(id);
}
//---------Создаем новую ячейку (положение, значение)-----------------
function createElem(sqr) {
    let pos = `c${getRandom(sqr*sqr)}`;
    while(!isFree(pos)) {
        pos = `c${getRandom(sqr*sqr)}`;
    }
    let val = varOfVal[getRandom(varOfVal.length)];
    createSqr(pos, val);
}
//--------------Присвоение && получение значений таблица-ячейка-----------
function setVal(id, val) {
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            if (cells[i][j].indexOf(id) >=0) {
                cells[i][j][1] = val;
            }
        }
    }
}
//--------------
function getVal(id) {
    let val;
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            if (cells[i][j].indexOf(id) >=0) {
                val = cells[i][j][1];
            }
        }
    }
    return val;
}
//-------------------------------------------------------------------
//------------------Запуск, пересчет положения анимация -------------

function move(dir) {
    $(document).unbind('keydown'); //отвязка кликов и свайпов до окончания анимации
    $(document).swipe('disable'); //
    animPerPressingKey = 0;

    for (let j = 0; j < cells.length; j++) {
        if(dir == 'left' || dir == 'right') {
            transform(dir, cells[j]);
        }
        else if(dir == 'up' || dir == 'down') {
            let colArr = cells.map(row => row[j]);
            transform(dir, colArr);
        }
    }
}
//-------------------
function cutZero(ar) {
   return ar.filter(val => val[1] !== 0);
}
//-------------------
function transform(direction, array) {
    let sub = array.slice();
    sub = cutZero(sub);
    if(direction=='left' || direction=='up') {
        sub.reverse();
    }
    let cutted = [];

    for (let i = sub.length - 1; i > 0; i--) {
        if(sub[i][1] == sub[i-1][1]) {
            sub[i][1] *= 2;
            currentUser.scores += sub[i][1]/2;
            sub[i-1][1] = 0;
            cutted.push([sub[i-1][0], sub[i][0]]);
        }
    }
    sub = cutZero(sub);

    if(direction=='left' || direction=='up') {
        sub.reverse();
    }
    else if(direction=='right' || direction=='down') {
        sub = new Array(array.length - sub.length).fill(0).concat(sub);
    }
    initState.quantSqrOnBoard = $('.hoverElem').length;
    delEmpty(cutted, direction); //анимация удаления
    moving(direction, array, sub); //анимация движения
    correctPos(direction, array, sub); //корректировка оставшихся ячеек
}

//-------------анимация движения----------------------
function moving(direction, array, sub) {
    if (direction=='right' || direction=='down') {
        for (let i = sub.length - 1; i >=0; i--) {
            changePos(i, array, sub, direction);
        }
    }
    else if (direction=='left' || direction=='up') {
        for  (let i = 0; i < sub.length; i++) {
            changePos(i, array, sub, direction);
        }
    }
}
//-------
function changePos(i, array, sub, direction) {
    if (direction=='right' || direction=='left') {
        if (sub[i] !== 0) {
            $(`#h${sub[i][0]}`).animate({left: $(`#${array[i]}`).offset().left + 'px'}, 'fast', function(){contAfterAnimEnd(array[i][0])});
            $(`#h${sub[i][0]}`).text(sub[i][1]);
        }
    }
    else if (direction=='up' || direction=='down') {
        if (sub[i] !== 0) {
            $(`#h${sub[i][0]}`).animate({top: $(`#${array[i]}`).offset().top + 'px'}, 'fast', function() {contAfterAnimEnd(array[i][0])});
            $(`#h${sub[i][0]}`).text(sub[i][1]);
        }
    }
}
//-------------Подсчет ячеек закончивших движение---------
function contAfterAnimEnd(cell) {
    animPerPressingKey++;
    if (animPerPressingKey === initState.quantSqrOnBoard) {
        createElem(sqr);
        checkTableForFulling();
        console.log('stop');
    }
}

//-------------Проверка таблицы на заполненность----------
function checkTableForFulling()  {
    if ($('.hoverElem').length === sqr*sqr) {
        checkForFreeMoving();
    }
    else {
        $(document).keydown((e) => {
            keyBindMoving(e);
        });
        $(document).swipe('enable');
    }
}
//------------анимация удаления------------
function delEmpty(cutted, direction) {
    for (let i = 0; i < cutted.length; i++) {
        if (direction=='right' || direction=='left') {
            $(`#h${cutted[i][0]}`).animate({left: $(`#${cutted[i][1]}`).offset().left + 'px',  opacity: 0.3}, 'fast', function() {
                $(this).remove();
                contAfterAnimEnd(cutted[i][0]);
            });
        }
        else if (direction=='up' || direction=='down') {
            $(`#h${cutted[i][0]}`).animate({top: $(`#${cutted[i][1]}`).offset().top + 'px',  opacity: 0.3}, 'fast', function() {
                $(this).remove();
                contAfterAnimEnd(cutted[i][0]);
            });
        }
    }
}

//----------------корректировка оставшихся ячеек-----------------------
function correctPos(direction, array, sub) {
    if (direction=='right' || direction=='down') {
        for (let i = sub.length - 1; i > 0; i--) {
            correction(i, array, sub);
        }
    }
    else if (direction == 'left' || direction=='up') {
        for (let i = 0; i < sub.length; i++) {
            correction(i, array, sub);
        }
    }
    $('.scores').text(currentUser.scores);

    //проверка на рекорд-----
    if(currentUser.scores > currentUser.highestScore) {
        currentUser.highestScore = currentUser.scores;
        $('.record').text(currentUser.scores);
        setNewRecord();
    }
}
//----
function correction(i, array, sub) {
    if (array[i][1] !== sub[i][1]) {
        setVal(array[i][0], sub[i][1]);
        setVal(sub[i][0], 0);
    }
    $(`#h${sub[i][0]}`).attr('id', `h${array[i][0]}`);
    $(`#h${array[i][0]}`).attr('data-prev', sub[i][0]);
    $(`#h${array[i][0]}`).attr('data-current', array[i][0]);

    if (array[i][1] !== 0) {
        let val = $(`#h${array[i][0]}`).text();
        $(`#h${array[i][0]}`).css({background: rulesObj[val][0], color: rulesObj[val][1]});
    }
}
//---------Действия при наявности/отсутствии дополнительного хода----------------------
function checkForFreeMoving() {
    if(isMoveExist(cells)) {
        $(document).keydown((e) => {
            keyBindMoving(e);
        });
        $(document).swipe('enable');
    }
    else {
        let msg = `<h2>Game over!</h2></br><p>Your result: <span class = 'endGame'>${currentUser.scores}</span></p>`;
        alertField(msg, 'html');
    }
}
//------------дополнитеьный ход - горизонт-----------------------
function findMoveHor(arr) {
    let isMoving = false;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length - 1; j++) {
            if(arr[i][j][1] === arr[i][j+1][1] || arr[i][j+1][1] === 0) {
                isMoving = true;
                break;
            }
        }
        if (isMoving) break;
    }
    return isMoving;
}
//------------------------дополнитеьный ход - вертикаль------------------
function findMoveVert(arr) {
    let isMoving = false;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length -1; j++) {
            //console.log(arr[j][i], arr[j+1][i]);
            if(arr[j][i][1] === arr[j+1][i][1] || arr[j+1][i][1] === 0) {
                isMoving = true;
                break;
            }
        }
        if (isMoving) break;
    }
    return isMoving;
}
//-------------проверка на дополнитеьный ход-------------------
function isMoveExist(arr) {
    return findMoveHor(arr) || findMoveVert(arr);
}
