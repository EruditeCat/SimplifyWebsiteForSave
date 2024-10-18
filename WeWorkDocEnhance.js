// ==UserScript==
// @name         WeWorkDocEnhance
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  提升企微文档的可用性
// @author       Sjx
// @match        https://doc.weixin.qq.com/sheet/*
// @icon         https://doc.weixin.qq.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function makeFormulaDivDraggable(){

        function _makeFormulaDivDraggable(contentDiv){

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

        const draggableDiv = document.querySelector('div.formula-bar');
        _makeFormulaDivDraggable(draggableDiv);
    }

    // 一个全局的菜单按钮
    function floatMenuButton(){

        // 创建按钮
        const button = document.createElement('button');
        button.innerText = '☰'; // 使用汉堡图标表示菜单
        button.style.position = 'fixed'; // 设置为相对于窗口
        button.style.top = '10px';  // 初始位置：距离顶部10px
        button.style.right = '10px'; // 初始位置：距离右边10px
        button.style.zIndex = '9999'; // 确保按钮在最上层
        button.style.cursor = 'move';
        button.style.width = '50px';  // 设置按钮宽度
        button.style.height = '50px';  // 设置按钮高度
        button.style.borderRadius = '50%'; // 使按钮圆形
        button.style.backgroundColor = '#007BFF'; // 按钮背景色
        button.style.color = 'white'; // 按钮字体颜色
        button.style.border = 'none'; // 去除边框
        button.style.fontSize = '24px'; // 设置字体大小
        button.style.opacity = '0.5'; // 默认透明度50%
        button.style.transition = 'opacity 0.3s'; // 过渡效果

        // 鼠标悬停时改变透明度
        button.addEventListener('mouseenter', function() {
            button.style.opacity = '1'; // 悬停时透明度100%
        });

        button.addEventListener('mouseleave', function() {
            button.style.opacity = '0.5'; // 离开时透明度50%
        });

        document.body.appendChild(button);

        // 创建菜单
        const menu = document.createElement('div');
        menu.style.position = 'absolute';
        menu.style.display = 'none'; // 默认隐藏
        menu.style.backgroundColor = 'lightgray';
        menu.style.border = '1px solid black';
        menu.style.zIndex = '9999'; // 确保菜单在最上层
        menu.style.padding = '5px';

        // 创建菜单项
        const command1 = document.createElement('div');
        command1.innerText = '浮出公式栏';
        command1.style.cursor = 'pointer';
        command1.onclick = function() {
            makeFormulaDivDraggable();
            menu.style.display = 'none'; // 执行后隐藏菜单
        };

        // 将菜单项添加到菜单中
        menu.appendChild(command1);
        document.body.appendChild(menu);

        // 拖动功能
        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        button.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - button.getBoundingClientRect().left;
            offsetY = e.clientY - button.getBoundingClientRect().top;
            e.preventDefault(); // 防止选择文本
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;
                button.style.left = newX + 'px';
                button.style.top = newY + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        // 点击按钮显示或隐藏菜单
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止点击按钮时触发其他事件
            const rect = button.getBoundingClientRect();
            menu.style.left = rect.left + 'px';
            menu.style.top = (rect.bottom + window.scrollY) + 'px'; // 菜单显示在按钮下方
            menu.style.display = (menu.style.display === 'none') ? 'block' : 'none'; // 切换菜单显示状态
        });

        // 点击页面其他地方隐藏菜单
        document.addEventListener('click', function() {
            menu.style.display = 'none'; // 点击其他地方时隐藏菜单
        });
    }

    floatMenuButton();

})();
