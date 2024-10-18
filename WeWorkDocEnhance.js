// ==UserScript==
// @name         WeWorkDocEnhance
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  提升企微文档的可用性
// @author       Sjx
// @match        https://doc.weixin.qq.com/sheet/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=qq.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function makeFormulaDivDraggable(contentDiv){

        // 如果找不到目标 div，则不执行操作
        if (contentDiv == null) {
            return;
        }

        // 删除contentDiv的div.bar-dragger
        const oldDraggerDiv = contentDiv.querySelector('div.bar-dragger');
        if (oldDraggerDiv != null){
            oldDraggerDiv.remove();
        }

        // 创建 container div 并包裹 content div
        const containerDiv = document.createElement('div');
        containerDiv.style.position = 'absolute';
        containerDiv.style.width = '600px';
        containerDiv.style.height = '300px';
        containerDiv.style.border = '1px solid black';
        containerDiv.style.zIndex = '9999';  // 确保 container 位于页面最上层

        // 将 container div 插入到 contentDiv 的父节点中，并包裹 contentDiv
        contentDiv.parentNode.insertBefore(containerDiv, contentDiv);
        contentDiv.style.height = 'calc(100% - 27px)';
        contentDiv.style.maxHeight = '10000px';
        containerDiv.appendChild(contentDiv);

        // 创建 title bar 并插入到 container div 内
        const titleBar = document.createElement('div');
        titleBar.style.backgroundColor = 'darkblue';
        titleBar.style.color = 'white';
        titleBar.style.padding = '5px';
        titleBar.style.cursor = 'move';
        titleBar.style.userSelect = 'none';
        titleBar.innerText = '公式栏';

        // 将 title bar 插入到 container div 的顶部
        containerDiv.prepend(titleBar);

        // 创建 resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.style.width = '15px';
        resizeHandle.style.height = '15px';
        resizeHandle.style.backgroundColor = 'red';
        resizeHandle.style.cursor = 'nwse-resize'; // 斜向调整大小的指针
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.right = '0';
        resizeHandle.style.zIndex = '100';

        // 将 resize handle 添加到 container div
        containerDiv.appendChild(resizeHandle);

        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        // 拖动事件的处理函数
        titleBar.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - containerDiv.offsetLeft;
            offsetY = e.clientY - containerDiv.offsetTop;
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                containerDiv.style.left = e.clientX - offsetX + 'px';
                containerDiv.style.top = e.clientY - offsetY + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        // 调整大小事件处理
        let isResizing = false;

        resizeHandle.addEventListener('mousedown', function(e) {
            isResizing = true;
            e.preventDefault(); // 防止选中文本
        });

        document.addEventListener('mousemove', function(e) {
            if (isResizing) {
                const newWidth = e.clientX - containerDiv.getBoundingClientRect().left;
                const newHeight = e.clientY - containerDiv.getBoundingClientRect().top;

                if (newWidth > 100) {
                    containerDiv.style.width = newWidth + 'px';
                }
                if (newHeight > 100) {
                    containerDiv.style.height = newHeight + 'px';
                }
            }
        });

        document.addEventListener('mouseup', function() {
            isResizing = false;
        });
    }


    // MutationObserver 来监听 DOM 的变化
    const observer = new MutationObserver(function(mutations, observer) {
        const draggableDiv = document.querySelector('div.formula-bar');

        // 如果找到了目标 div，执行拖动功能
        if (draggableDiv) {
            makeFormulaDivDraggable(draggableDiv);
            observer.disconnect(); // 一旦找到并设置完目标 div，停止观察
        }
    });

    // 开始观察 DOM 的变化
    observer.observe(document, {
        childList: true,
        subtree: true
    });
})();
