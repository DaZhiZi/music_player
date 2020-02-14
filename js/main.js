var log = function() {
    console.log.apply(console, arguments)
}

var e = function(selector) {
    return document.querySelector(selector)
}

var es = function(selector) {
    return document.querySelectorAll(selector)
}

var bindEvent = function(selector, eventName, callback) {
    var element = document.querySelector(selector)
    element.addEventListener(eventName, callback)
}

var bindAll = function(selector, eventName, callback) {
    var elements = document.querySelectorAll(selector)
    for(var i = 0; i < elements.length; i++) {
        var e = elements[i]
        e.addEventListener(eventName, callback)
    }
}

// 显示时间
var changeTime = function(time) {
    var min = parseInt(time / 60)
    var sec = parseInt(time % 60)
    if (min < 10) {
        min = `0${min}`
    }
    if (sec < 10) {
        sec = `0${sec}`
    }
    return `${min}:${sec}`
}

// 获取当前时间及进度
var getCurrentTime = function(){
    var music = e('.control-source')
    var time = music.currentTime
    var x = changeTime(time)
    var currentTime = e('.control-detail-currentTime')
    currentTime.innerHTML = x
}

var getCurrentProgress = function() {
    var music = e('.control-source')
    var duration = music.duration
    var time = music.currentTime
    var x = (time / duration) * 1000
    var progress = e('.control-progress-range')
    progress.value = x
}

// 进度条事件
var controlProgress = function() {
    var progress = e('.control-progress-range')
    var value = progress.value
    var music = e('.control-source')
    var duration = music.duration
    var time = (value / 1000) * duration
    music.currentTime = time
    var x = changeTime(time)
    var currentTime = e('.control-detail-currentTime')
    currentTime.innerHTML = x
}

// 播放音乐
var playMusic = function() {
    var container = e('.main-container')
    var button = e('.control-button')
    var music = e('.control-source')
    var play = e('.control-button-play')
    var pause = e('.control-button-pause')
    music.play()
    play.classList.add('hide')
    pause.classList.remove('hide')
    button.dataset.toggle = 'on'
    container.dataset.playing = 'true'
    var bgToggle = container.dataset.toggle
    setInterval(getCurrentTime, 1000)
    setInterval(getCurrentProgress, 1000)
}
// 暂停音乐
var pauseMusic = function() {
    var container = e('.main-container')
    var button = e('.control-button')
    var music = e('.control-source')
    var play = e('.control-button-play')
    var pause = e('.control-button-pause')
    music.pause()
    play.classList.remove('hide')
    pause.classList.add('hide')
    button.dataset.toggle = 'off'
    container.dataset.playing = 'false'
}

// 播放和暂停
var toggleBtn = function(event) {
    var button = e('.control-button')
    if (button.dataset.toggle == 'off') {
        playMusic()
    } else if (button.dataset.toggle == 'on') {
        pauseMusic()
    }
}

// 获取每首歌的详细信息
var createObject = function(cell) {
    var song = cell.querySelector('.detail-song').innerHTML
    var musician = cell.querySelector('.detail-musician').innerHTML
    var duration = cell.querySelector('.detail-duration').innerHTML
    var path = cell.dataset.path
    var cover = cell.querySelector('img').src
    var obj = {
        "song": song,
        "musician": musician,
        "duration": duration,
        "path": path,
        "cover": cover,
    }
    return obj
}

// 获取全部歌曲
var getPlaylist = function() {
    var playlist = []
    var cells = es('.cell-music')
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i]
        var obj = createObject(cell)
        playlist.push(obj)
    }
    return playlist
}

// 更换歌曲信息
var changeSong = function(obj) {
    var music = e('.control-source')
    music.src = "playlist/" + obj.path
    music.dataset.path = obj.path
    var song = e('.control-detail-song')
    song.innerHTML = obj.song
    var musician = e('.control-detail-musician')
    musician.innerHTML = "- " + obj.musician
    var duration = e('.control-detail-duration')
    duration.innerHTML = obj.duration
    var cover = obj.cover
    var backgroundStyle = e('style')
    backgroundStyle.innerHTML = `
        .backgroundImage {
            background-image: url("${cover}");
            background-size: cover;
            background-position: center;
        }
    `
}

// 添加点击歌曲事件
var selectSong = function(event) {
    var target = event.target
    if (target.classList.contains('cell-music')) {
        var cell = target
    } else {
        var cell = target.closest('.cell-music')
    }
    var obj = createObject(cell)
    changeSong(obj)
    playMusic()
}

// 选择下一首歌
var nextSong = function() {
    var playlist = getPlaylist()
    var music = e('.control-source')
    var nowPath = music.dataset.path
    for (var i = 0; i < playlist.length; i++) {
        var x = playlist[i].path
        if (x == nowPath && i != (playlist.length - 1)) {
            var next = playlist[i + 1]
            break
        } else if (x == nowPath && i == (playlist.length - 1)) {
            var next = playlist[0]
            break
        }
    }
    changeSong(next)
    var btn = e('.control-button')
    var toggle = btn.dataset.toggle
    if (toggle == 'on') {
        playMusic()
    }
}

// 选择上一首歌
var prevSong = function() {
    var playlist = getPlaylist()
    var music = e('.control-source')
    var nowPath = music.dataset.path
    for (var i = 0; i < playlist.length; i++) {
        var x = playlist[i].path
        if (x == nowPath && i != 0) {
            var next = playlist[i - 1]
            break
        } else if (x == nowPath && i == 0) {
            var next = playlist[playlist.length - 1]
            break
        }
    }
    changeSong(next)
    var btn = e('.control-button')
    var toggle = btn.dataset.toggle
    if (toggle == 'on') {
        playMusic()
    }
}

// 随机选择一首歌
var randomSong = function() {
    var playlist = getPlaylist()
    var length = playlist.length
    var i = Math.floor(Math.random() * length)
    var next = playlist[i]
    changeSong(next)
    var btn = e('.control-button')
    var toggle = btn.dataset.toggle
    if (toggle == 'on') {
        playMusic()
    }
}

// 列表循环
var orderPlay = function() {
    var music = e('.control-source')
    music.removeEventListener('ended', randomSong)
    music.removeEventListener('ended', playMusic)
    music.addEventListener('ended', nextSong)
    music.dataset.style = "orderPlay"
    var loop = e('.control-button-loop')
    var random = e('.control-button-random')
    var single = e('.control-button-single')
    loop.classList.add('sign')
    random.classList.remove('sign')
    single.classList.remove('sign')
}

// 单曲循环
var singlePlay = function() {
    var music = e('.control-source')
    music.removeEventListener('ended', randomSong)
    music.removeEventListener('ended', nextSong)
    music.addEventListener('ended', playMusic)
    music.dataset.style = "singlePlay"
    var loop = e('.control-button-loop')
    var random = e('.control-button-random')
    var single = e('.control-button-single')
    loop.classList.remove('sign')
    random.classList.remove('sign')
    single.classList.add('sign')
}

// 随机播放
var randomPlay = function() {
    var music = e('.control-source')
    music.removeEventListener('ended', playMusic)
    music.removeEventListener('ended', nextSong)
    music.addEventListener('ended', randomSong)
    music.dataset.style = "randomPlay"
    var loop = e('.control-button-loop')
    var random = e('.control-button-random')
    var single = e('.control-button-single')
    loop.classList.remove('sign')
    random.classList.add('sign')
    single.classList.remove('sign')
}

// 添加第二样式
var addClass = function(selector) {
    for (var i = 0; i < selector.length; i++) {
        var s = e(selector[i])
        var newSel = selector[i] + '-2'
        var newClass = newSel.slice(1)
        s.classList.add(newClass)
    }
}

// 删除第二样式
var removeClass = function(selector) {
    for (var i = 0; i < selector.length; i++) {
        var s = e(selector[i])
        var newSel = selector[i] + '-2'
        var newClass = newSel.slice(1)
        s.classList.remove(newClass)
    }
}

// 第二样式开关
var styleToggle = function() {
    var container = e('.main-container')
    var selector = [
        '.section-playlist',
        '.section-head',
        '.model-background',
        '.model-control',
        '.control-button',
        '.control-detail',
        '.control-progress-bar',
        '.control-button-style',
        '.control-button-select'
    ]
    var toggle = container.dataset.toggle
    var playing = container.dataset.playing
    if (toggle == 'off') {
        addClass(selector)
        container.dataset.toggle = 'on'
    } else if (toggle == 'on') {
        removeClass(selector)
        container.dataset.toggle = 'off'
    }
}

// 旋转效果
var rotateToggle = function() {
    var bgImg = e('.model-background')
    var playBtn = e('.control-button-play')
    var pauseBtn = e('.control-button-pause')
    var style = e('.rotateStyle')
    var t1 = `
        .rotate {
            animation: 9.5s rotate infinite;
            animation-timing-function: linear;
            animation-play-state: running;
        }
    `
    var t2 = `
        .rotate {
            animation-play-state: paused;
        }
    `
    if (bgImg.classList.contains('model-background-2') && playBtn.classList.contains('hide')) {
        style.innerHTML = t1
    } else if (bgImg.classList.contains('model-background-2') && pauseBtn.classList.contains('hide')) {
        style.innerHTML = t1 + t2
    } else {
        style.innerHTML = ''
    }
}

var bind = function() {
    bindEvent('.control-button', 'click', toggleBtn)
    bindEvent('.control-button-loop', 'click', orderPlay)
    bindEvent('.control-button-random', 'click', randomPlay)
    bindEvent('.control-button-single', 'click', singlePlay)
    bindEvent('.control-progress-range', 'click', controlProgress)
    bindEvent('.control-button-next', 'click', nextSong)
    bindEvent('.control-button-prev', 'click', prevSong)
    bindEvent('.model-background', 'click', styleToggle)
    bindEvent('.main-container', 'click', rotateToggle)
    bindAll('.cell-music', 'click', selectSong)
}

var _main = function() {
    bind()
    orderPlay()
}

_main()
