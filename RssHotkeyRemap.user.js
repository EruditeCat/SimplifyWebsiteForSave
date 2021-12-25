// ==UserScript==
// @name         Rss快捷键映射
// @namespace    http://EruditePig.net/
// @version      0.1
// @description  Inoreader和the old reader快捷键映射，利用小键盘区域，方便快速浏览文章
// @author       EruditePig
// @match        https://www.inoreader.com/*
// @match        https://theoldreader.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 这里需要jQuery，但因为inoreader肯定有jQuery，所以reqiure也不写了
    function simulateKeyDown(keyEventType, key, hasCtrlKey = false){
        //jQuery.event.trigger({ type: keyEventType, which: key, ctrlKey : hasCtrlKey });
        document.dispatchEvent(
            new KeyboardEvent(keyEventType, {
                key: String.fromCharCode((96 <= key && key <= 105)? key-48 : key),
                keyCode: key, // example values.
                //code: "KeyN", // put everything you need in this object.
                which: key,
                shiftKey: false, // you don't need to include values
                ctrlKey: hasCtrlKey,  // if you aren't going to use them.
                metaKey: false   // these are here for example's sake.
            })
        );
    }

    var el = document.body;

    el.onkeydown = function(evt) {
        evt = evt || window.event;
        switch (evt.keyCode) {
            case 45: //insert -> n
                evt.stopImmediatePropagation();
                simulateKeyDown('keydown', 78);
                break;
            case 40: //↓ -> p
                evt.stopImmediatePropagation();
                evt.view.event.preventDefault();   // 阻止发生页面滚动到底的行为
                simulateKeyDown('keydown', 80);
                break;
            case 46: // delete -> ctrl+m
                evt.stopImmediatePropagation();
                simulateKeyDown('keyup', 77, true);
                break;
            case 107: // + -> b
                evt.stopImmediatePropagation();
                simulateKeyDown('keydown', 66);
                break;
            default:
                break;
        }
    };



})();