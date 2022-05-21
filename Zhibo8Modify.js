// ==UserScript==
// @name         直播8显示改进
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.zhibo8.cc/*
// @icon         https://www.zhibo8.cc/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /*保证只显示重要赛事*/
    document.querySelectorAll('div[class="schedule_container left"] > div> div[class="content"] > ul > li').forEach(x => {
        if(x.innerHTML.indexOf('<b>') == -1){
            x.style.display = 'none';
        }
    })

    /*保证直播8的新闻页面的宽度*/
    document.querySelectorAll('.schedule_container').forEach(x => {
        x.style.width = '720px';
    })
    document.querySelectorAll('.bbs_container').forEach(x => {
        x.style.width = '260px';
    })


    document.querySelectorAll('video').forEach(x => {
        x.style.height = '100% !important';
    })

    /*右侧新闻悬停显示全文*/
    document.querySelectorAll('div[class="bbs_container right"] > div> div[class="content"] > ul > li > a').forEach(x => {
        x.title = x.innerText;
    })
})();
