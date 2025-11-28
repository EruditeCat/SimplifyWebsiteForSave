// ==UserScript==
// @name         Rss快捷键映射
// @namespace    https://github.com/EruditeCat/SimplifyWebsiteForSave/blob/master/RssHotkeyRemap.user.js
// @version      1.0.7
// @description  Inoreader和the old reader快捷键映射，利用小键盘区域，方便快速浏览文章
// @author       EruditePig
// @match        https://www.inoreader.com/*
// @grant        none
// ==/UserScript==

/*
依赖的Inoreader的API如下：
is_touch_device : 判断当前是否触摸屏， index_js.js
open_url_background(url) : 在后台打开url，index_js.js
mark_read(articleId) : 将某篇文章标记为已读 ，index_js.js
mark_read_direction(articleId,'above'): 将某篇文章以上标记为已读 ，index_js.js
*/
(function() {
    'use strict';


    // 可拖动的圆形按钮类
    class DraggableFixedButton {
        constructor(config) {
            // 合并配置
            this.config = Object.assign({
                size: 50,
                position: { right: 20, bottom: 20 },
                color: 'rgba(33, 150, 243, 0.5)',
                onClick: () => {}
            }, config)

            // 创建按钮元素
            this.button = document.createElement('button')
            this.button.textContent = this.config.textContent
            this.setBaseStyles()
            document.body.appendChild(this.button)

            // 初始化状态
            this.isDragging = false
            this.startPos = { x: 0, y: 0 }
            this.currentPos = { ...this.config.position }
            this.lastZoom = 1
            this.zIndex = this.config.zIndex

            // 绑定事件
            this.initEvents()
            this.startZoomMonitor()
        }

        InnerButton() {return this.button}

        setBaseStyles() {
            // 基础样式设置
            Object.assign(this.button.style, {
                position: 'fixed',
                borderRadius: '50%',
                cursor: 'move',
                transformOrigin: 'center',
                border: 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                transition: 'opacity 0.3s',
                width: `${this.config.size}px`,
                height: `${this.config.size}px`,
                right: `${this.config.position.right}px`,
                bottom: `${this.config.position.bottom}px`,
                backgroundColor: this.config.color,
                opacity: this.config.color.split(',')[3].split(')')[0],
                zIndex: this.config.zIndex
            })

            // 悬停效果
            this.button.addEventListener('mouseenter', () => {
                this.button.style.opacity = Math.min(
                    parseFloat(this.button.style.opacity) + 0.3,
                    1
                )
            })
            this.button.addEventListener('mouseleave', () => {
                this.button.style.opacity = this.config.color.split(',')[3].split(')')[0]
            })
        }

        initEvents() {
            // 鼠标事件
            this.button.addEventListener('mousedown', this.startDrag.bind(this))
            this.button.addEventListener('click', this.handleClick.bind(this))

            // 触摸事件
            this.button.addEventListener('touchstart', this.startDrag.bind(this))
            this.button.addEventListener('touchend', this.endDrag.bind(this))
        }

        startDrag(e) {
            this.isDragging = true
            const clientX = e.touches ? e.touches[0].clientX : e.clientX
            const clientY = e.touches ? e.touches[0].clientY : e.clientY

            // 记录初始位置
            this.startPos = {
                x: clientX,
                y: clientY,
                right: this.currentPos.right,
                bottom: this.currentPos.bottom
            }

            // 添加移动监听
            document.addEventListener('mousemove', this.drag)
            document.addEventListener('mouseup', this.endDrag)
            document.addEventListener('touchmove', this.drag)
        }

        drag = (e) => {
            if (!this.isDragging) return

            const clientX = e.touches ? e.touches[0].clientX : e.clientX
            const clientY = e.touches ? e.touches[0].clientY : e.clientY
            const zoom = this.getZoomLevel()

            // 计算移动距离（考虑缩放）
            const deltaX = (clientX - this.startPos.x) / zoom
            const deltaY = (clientY - this.startPos.y) / zoom

            // 更新位置
            this.currentPos.right = this.startPos.right - deltaX
            this.currentPos.bottom = this.startPos.bottom - deltaY

            this.button.style.right = `${this.currentPos.right}px`
            this.button.style.bottom = `${this.currentPos.bottom}px`
        }

        endDrag = () => {
            this.isDragging = false
            document.removeEventListener('mousemove', this.drag)
            document.removeEventListener('mouseup', this.endDrag)
            document.removeEventListener('touchmove', this.drag)
        }

        handleClick(e) {
            if (!this.isDragging) {
                this.config.onClick(e)
            }
        }

        getZoomLevel() {
            return window.innerWidth / document.documentElement.clientWidth
        }

        updateScale() {
            const currentZoom = this.getZoomLevel()
            if (currentZoom !== this.lastZoom) {
                this.button.style.transform = `scale(${1/currentZoom})`
                this.lastZoom = currentZoom
            }
        }

        startZoomMonitor() {
            const animate = () => {
                this.updateScale()
                requestAnimationFrame(animate)
            }
            animate()
        }

        destroy() {
            this.button.remove()
            document.removeEventListener('mousemove', this.drag)
            document.removeEventListener('mouseup', this.endDrag)
            document.removeEventListener('touchmove', this.drag)
        }
    }

    // 触屏交互
    class TouchScreenUI {
        constructor(){
            this.lastSelectedDiv = null
        }

        // 检测两个矩形是否碰撞的函数
        isColliding(rect1, rect2) {
            return !(
                rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom
            );
        }

        // 检测按钮与所有 div 的碰撞
        checkButtonCollisions(button, divs) {
            const buttonRect = button.getBoundingClientRect();
            const collidingDivs = [];

            divs.forEach(div => {
                const divRect = div.getBoundingClientRect();
                if (this.isColliding(buttonRect, divRect)) {
                    collidingDivs.push(div);
                }
            });
            return collidingDivs;
        }

        onScrollStopped(delay, callback) {
            let scrollTimer;
            window.addEventListener('scroll', function () {
                if (scrollTimer) {
                    clearTimeout(scrollTimer);
                }
                scrollTimer = setTimeout(() => {
                    callback();
                }, delay);
            });
        }

        selectDiv(newDiv) {
            // 取消上一次选中的 div 的选中状态
            if (this.lastSelectedDiv) {
                this.lastSelectedDiv.style.border = '';
            }

            // 设置新的 div 为选中状态
            newDiv.style.border = '3px solid red';

            // 更新上一次选中的 div
            this.lastSelectedDiv = newDiv;
        }

        // 加载css
        loadCss() {
	    let style = document.createElement('style');
            style.innerHTML = `
 /*不显示右下角控制文章上下的按钮*/
div[id="move_article_list"]
{
    display: none !important;
}
        `;
            document.body.appendChild(style);
    	}
	    
        run(){
            let touchTestBtn = new DraggableFixedButton({
                size: 30,
                color: 'rgba(255, 99, 71, 0.7)',
                position: { right: 0.5*window.innerWidth, bottom: 0.5*window.innerHeight },
                zIndex : 0,
                onClick: () => {
                    //console.log('按钮被点击了!')
                    //alert('Hello from fixed button!')
                }
            });

            let markAboveBtn = new DraggableFixedButton({
                size: 60,
                color: 'rgba(255, 99, 71, 0.7)',
                position: { right: 0.05*window.innerWidth, bottom: 0.05*window.innerHeight },
                zIndex : 10000,
                textContent : "以上已读",
                onClick: () => {
                    if (this.lastSelectedDiv){
                        let articleId = this.lastSelectedDiv.getAttribute('data-aid');
                        mark_read_direction(articleId,'above');
                    }
                }
            });

            let openArticleBtn = new DraggableFixedButton({
                size: 60,
                color: 'rgba(255, 99, 71, 0.7)',
                position: { right: 0.01*window.innerWidth, bottom: 0.1*window.innerHeight },
                zIndex : 10000,
                textContent : "Open",
                onClick: () => {
                    if (this.lastSelectedDiv){
                        //console.log(this.lastSelectedDiv)
                        let aId = "article_title_link_"+this.lastSelectedDiv.id.split("article_")[1];
                        //console.log(aId)
                        let link = document.getElementById(aId).getAttribute('href');
                        //article_click_trap(null,aId)
                        window.open(link,'_blank')
                    }
                }
            });

            this.onScrollStopped(300,()=>{
                const articleDivs = document.querySelectorAll('div[id=reader_pane]>div[id^="article_"]');
                let collisions = this.checkButtonCollisions(touchTestBtn.InnerButton(), articleDivs);
                if (collisions.length > 0) this.selectDiv(collisions[0])
            })

		
            this.loadCss();
        }

    }

    class KeyboardMouseUI {
        run(){

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
                    case 97: //Numpad1 -> n
                        evt.stopImmediatePropagation();
                        simulateKeyDown('keydown', 78);
                        break;
                    case 96: //Numpad0 -> Space
                        evt.stopImmediatePropagation();
                        evt.view.event.preventDefault();   // 阻止发生页面滚动到底的行为
                        simulateKeyDown('keydown', 32);
                        break;
                    case 98: // Numpad2 -> p
                        evt.stopImmediatePropagation();
                        simulateKeyDown('keydown', 80);
                        break;
                    case 99: // Numpad3 -> b
                        evt.stopImmediatePropagation();
                        simulateKeyDown('keydown', 66);
                        break;
                    case 101: // Numpad5 -> r
                        evt.stopImmediatePropagation();
                        simulateKeyDown('keydown', 82);
                        break;
                    case 102: // Numpad6 -> ctrl+m
                        evt.stopImmediatePropagation();
                        simulateKeyDown('keyup', 77, true);
                        break;
                    default:
                        break;
                }
            };

            // 加载css
            function loadCss() {
                let style = document.createElement('style');
                style.innerHTML = `
        /*让open之后预览下，旁边的黑色遮罩别那么黑*/
        #article_dialog_modal_overlay{
            opacity: 0.6 !important ;
        }

        /*不显示中国政府新闻的logo*/
        div.article_content p img[alt="20190530videobg.jpg"],
        /*不显示日经新闻的logo*/
        div.article_content p img[alt="nikkei-chinese-logo-02.jpg"],
        /*不显示小众软件论坛delogo*/
        div.article_content p img[alt="cbd4ea4a240cf3eb8809fb647da09ba01691f6b4"],
        /*不显示分享按钮*/
        a[class~="article_share"]
        {
            display:none !important;
        }

        /*右侧按钮调整到左侧*/
        a[id^="aurl"],
        div[class~="popularity_div"]{
            display:none !important;
        }
        div[class~="article_unread_dot"],
        div[class~="article_favicon"],
        div[class~="arrow_div"]{
            order : -1;
        }

        div[class~="arrow_div"]{
            position:relative !important;
            float:left !important;
            /*padding-left:0px !important;*/
            padding-top: 4px !important;
            /*left: -5px  !important;*/
        }



		div.ar:not(.article_expanded) {
			height:32px;
		}
        /*扩大阅读文章宽度到1000px*/
        div[class~="article_expanded"] div[class="article_full_contents"]{
            width:1000px !important;
            max-width:1000px !important;
        }
        div[class~="article_expanded"] div[class="article_full_contents"] div[class="article_title"]{
            width:1000px !important;
            max-width:1000px !important;
        }
        div[class~="article_expanded"] div[class="article_full_contents"] div.article_content{
            width:1000px !important;
            max-width:1000px !important;
        }
        div.article_content p img ,
        div.article_content img
        {
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
         /*不显示ReadLater按钮*/
        div[id^="article_read_later_btn"]
        {
            display: none !important;
        }
         /*不显示右下角控制文章上下的按钮*/
        div[id="move_article_list"]
        {
            display: none !important;
        }

        `;
                document.body.appendChild(style);
            };
            loadCss();

            // 显示小键盘
            function showNumpad(){
                // 定义参数化的配置
                const config = {
                    buttonSize: 35,     // 按键的基本大小（宽度和高度）
                };
                config.buttonGap = 0.16*config.buttonSize;      // 按键间距
                config.margin = 0.3*config.buttonSize;
                config.keypadWidth = 4*config.buttonSize+3*config.buttonGap+2*config.margin;   // 小键盘的宽度
                config.keypadHeight = 5*config.buttonSize+4*config.buttonGap+2*config.margin;  // 小键盘的高度
                config.largeButtonSize = 2*config.buttonSize+config.buttonGap; // 大按钮高度（Enter 和 +）
                config.fontSize = 0.3*config.buttonSize;       // 按键字体大小
                config.largeButtonFontSize = 0.3*config.buttonSize; // Enter 键的字体大小

                // 创建小键盘容器
                const keypadContainer = document.createElement('div');
                keypadContainer.style.cssText = `
display: grid;
grid-template-columns: repeat(4, ${config.buttonSize}px);
grid-gap: ${config.buttonGap}px;
margin: ${config.margin}px auto;
width: ${config.keypadWidth}px;
height: ${config.keypadHeight}px;
padding: ${config.margin}px;
border: 2px solid #ccc;
border-radius: calc(0.5 * ${config.margin}px);
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
background-color: #f9f9f9;
position: fixed;
bottom: 0;
right: 50px;
cursor: move;
z-index: 1000;
`;

                // 按键配置
                const keys = [
                    'Num', '/', '*', '-',
                    '7', '8', '9', '+',
                    '4', '5', '6',
                    '1', '2', '3', 'Enter',
                    '0', '.'
                ];

                const keyMaps = {
                    '0' : 'Space',
                    '1' : '\u21D3',
                    '2' : '\u21D1',
                    '3' : 'B',
                    '5' : '\u21BA',
                    '6' : '\u2714',
                    '4' : '',
                    '7' : '',
                    '8' : '',
                    '9' : '',
                    //'.' : '',
                };
                // 创建按键
                keys.forEach(key => {
                    const keyButton = document.createElement('button');
                    keyButton.id = `keybord_${key}`
                    keyButton.textContent = key;
                    keyButton.style.width = `${config.buttonSize}px`;  // 使用参数化的按键大小
                    keyButton.style.height = `${config.buttonSize}px`; // 使用参数化的按键大小
                    keyButton.style.fontSize = `${config.fontSize}px`; // 使用参数化的字体大小
                    keyButton.style.border = '1px solid #ddd';
                    keyButton.style.borderRadius = `calc(0.4*${config.margin}px)`;
                    keyButton.style.cursor = 'pointer';
                    keyButton.style.backgroundColor = '#fff';

                    // 合并0键跨两列
                    if (key === '0') {
                        keyButton.style.gridColumn = 'span 2';
                        keyButton.style.width = `${config.largeButtonSize}px`;  //
                    }

                    // 让 + 和 Enter 键横跨两行，并且设置更高的按钮
                    if (key === '+' || key === 'Enter') {
                        keyButton.style.gridRow = 'span 2';
                        keyButton.style.height = `${config.largeButtonSize}px`;  // 设置更高的按钮
                    }

                    keyButton.addEventListener('mouseover', () => {
                        keyButton.style.backgroundColor = '#f0f0f0';
                    });

                    keyButton.addEventListener('mouseout', () => {
                        keyButton.style.backgroundColor = '#fff';
                    });

                    keypadContainer.appendChild(keyButton);
                });

                // 按照按键映射显示文字
                for(let key in keyMaps){
                    keypadContainer.querySelector(`#keybord_${key}`).innerText = keyMaps[key]
                }

                function updateNumLockStatus(event) {
                    // Check the status of Num Lock key
                    const numLockEnabled = event.getModifierState('NumLock');
                    if(numLockEnabled)
                        keypadContainer.querySelector(`#keybord_Num`).style.backgroundColor = 'yellow'
                    else
                        keypadContainer.querySelector(`#keybord_Num`).style.backgroundColor = '#f9f9f9'
                }
                // Add event listener for keydown event
                window.addEventListener('keyup', updateNumLockStatus);

                // 拖拽功能实现
                let isDragging = false;
                let offsetX, offsetY;

                keypadContainer.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    offsetX = e.clientX - keypadContainer.getBoundingClientRect().left;
                    offsetY = e.clientY - keypadContainer.getBoundingClientRect().top;
                    keypadContainer.style.cursor = 'grabbing';
                });

                window.addEventListener('mousemove', (e) => {
                    if (isDragging) {
                        keypadContainer.style.left = `${e.clientX - offsetX}px`;
                        keypadContainer.style.top = `${e.clientY - offsetY}px`;
                    }
                });

                window.addEventListener('mouseup', () => {
                    isDragging = false;
                    keypadContainer.style.cursor = 'move';
                });

                // 将小键盘添加到页面
                document.body.appendChild(keypadContainer);
            }
            showNumpad();

        }
    }

    if(is_touch_device()){
        new TouchScreenUI().run();
    }else{
        new KeyboardMouseUI().run();
    }


// region 监视文章列表变化
    let observeDOM = (function(){
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        return function( obj, callback ){
            if( !obj || obj.nodeType !== 1 ) return;

            if( MutationObserver ){
                // define a new observer
                let mutationObserver = new MutationObserver(callback)

                // have the observer observe foo for changes in children
                mutationObserver.observe( obj, { childList:true, subtree:true })
                return mutationObserver
            }

            // browser support fallback
            else if( window.addEventListener ){
                obj.addEventListener('DOMNodeInserted', callback, false)
                obj.addEventListener('DOMNodeRemoved', callback, false)
            }
        }
    })()

    let readerPane = document.querySelector('div[id=reader_pane]');

    observeDOM(readerPane, function(m){
        let addedNodes = [];
        m.forEach(record => record.addedNodes.length & addedNodes.push(...record.addedNodes))
        addedNodes.forEach(onAddArticle)
    });
    
    // 固定大小的环形缓冲区，用来针对bbs这种论坛有很多重复帖子的情况
    class FixedSizeCache {
        constructor(maxSize) {
            this.maxSize = maxSize;
            this.cache = new Map();
        }

        add(key) {
            if (this.cache.has(key)) {
                this.cache.delete(key);
            } else if (this.cache.size >= this.maxSize) {
                const oldestKey = this.cache.keys().next().value;
                this.cache.delete(oldestKey);
            }
            this.cache.set(key, true);
        }

        find(key) {
            return this.cache.has(key);
        }
    }
    var appinnForumArticleCache = new FixedSizeCache(100);
    // 增加以上文章已读按钮
    function addMarkAboveReadButton(articleId){
        let spanElem = document.createElement('span');
        spanElem.className = "icon16 icon-share-article";
        let markAboveReadElem = document.createElement('a');
        markAboveReadElem.addEventListener("mouseup", function(event) { mark_read_direction(articleId,'above') });
        markAboveReadElem.appendChild(spanElem);
        let divElem = document.getElementById("ad_"+articleId);
        if(divElem) divElem.prepend(markAboveReadElem);
    }

    // 增加ScrollUp按钮
    function addScrollUpButton(articleId){
        let spanElem = document.createElement('span');
        spanElem.className = "icon16 icon-widget-minimize";
        let scrollUpElem = document.createElement('a');
        scrollUpElem.addEventListener("mouseup", function(event) { scroll_to_article(articleId) });
        scrollUpElem.appendChild(spanElem);
        let divElem = document.getElementById("ad_"+articleId);
        divElem.prepend(scrollUpElem);
    }

    // 增加后台打开文章按钮
    function addOpenUrlBackgroundButton(articleId, articleUrl){
        let spanElem = document.createElement('span');
        spanElem.className = "icon16 icon-new_tab_small";
        let openUrlBackgroundElem = document.createElement('a');
        if (window.hasOwnProperty("openUrlBackground")){ // 这种方式依赖于插件提供后台打开标签页的能力
            openUrlBackgroundElem.addEventListener("mouseup", function(event) {
                openUrlBackground(articleUrl);
                mark_read(articleId);
            });
        }else{
            openUrlBackgroundElem.href = articleUrl;
            openUrlBackgroundElem.target = '_blank';
        }
        openUrlBackgroundElem.appendChild(spanElem);
        let divElem = document.getElementById("ad_"+articleId);
        divElem.prepend(openUrlBackgroundElem);
    }

    function is_touch_device(){
        return 'ontouchstart' in window;
    }
    
    // 添加文章的回调
    function onAddArticle(ar){
        if(ar.nodeName=='DIV'&&ar.className.includes("article_subscribed")){
            let article = ar.getElementsByClassName("article_title_wrapper")[0];
            let articleId = ar.getAttribute("data-aid");
            let link = article.getElementsByTagName("a")[0].getAttribute('href');

            if (!is_touch_device()){
                addMarkAboveReadButton(articleId);  // 增加以上文章已读按钮
                addScrollUpButton(articleId);  // 增加ScrollUp按钮
                addOpenUrlBackgroundButton(articleId, link);   // 增加后台打开文章按钮
            }
            
            let span = article.getElementsByTagName("span")[0];
            let span2 = article.getElementsByTagName("span")[1];
            if (link.includes("https://www.ndtv.com/")){ // 对印度NDTV的新闻加上分组
                let group = link.slice(21, link.indexOf('/', 21));
                span.innerText = `【${group}】`+span.innerText;
            }else if(link.includes("www.mohurd.gov.cn")){ // 对住建部的新闻取正文的前40个文字
                let prefixIndex = span2.innerText.indexOf("发布时间：");
                span.innerText = span2.innerText.slice(prefixIndex+27, prefixIndex+27+40);
            }else if(link.includes("https://www.ulapia.com/reports")){ // 对财报的新闻正文加上作者
                let regmatch = article_contents[articleId].match(/author_name_menu.*?<span>(.*?)<\/span>/)
                if (regmatch){
                    let author = regmatch[1]
                    span.innerText = `【${author}】`+span.innerText;
                }
            }else if(link.includes("https://meta.appinn.net")){ // 对小众软件论坛的帖子做去重
                if(appinnForumArticleCache.find(span.innerText)){
                    mark_read(articleId, true, true)
                    ar.style.opacity = 0.1
                }else{
                    appinnForumArticleCache.add(span.innerText)
                }
            }
        }
    }
// endregion 监视文章列表变化
})();

