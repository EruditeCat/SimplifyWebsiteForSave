// ==UserScript==
// @name         Rss快捷键映射
// @namespace    http://EruditePig.net/
// @version      0.9.1
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
        `;
        document.body.appendChild(style);
    };
    loadCss();



    // ↓↓↓↓↓↓↓↓↓↓↓↓↓监视文章列表变化↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
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

    // 增加以上文章已读按钮
    function addMarkAboveReadButton(articleId){
        let spanElem = document.createElement('span');
        spanElem.className = "icon16 icon-share-article";
        let markAboveReadElem = document.createElement('a');
        markAboveReadElem.addEventListener("mouseup", function(event) { mark_read_direction(articleId,'above') });
        markAboveReadElem.appendChild(spanElem);
        let divElem = document.getElementById("ad_"+articleId);
        divElem.prepend(markAboveReadElem);
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
        openUrlBackgroundElem.addEventListener("mouseup", function(event) { open_url_background(articleUrl);mark_read(articleId); });
        openUrlBackgroundElem.appendChild(spanElem);
        let divElem = document.getElementById("ad_"+articleId);
        divElem.prepend(openUrlBackgroundElem);
    }

    // 添加文章的回调
    function onAddArticle(ar){
        if(ar.nodeName=='DIV'&&ar.className.includes("article_subscribed")){
            let article = ar.getElementsByClassName("article_title_wrapper")[0];
            let articleId = ar.getAttribute("data-aid");
            let link = article.getElementsByTagName("a")[0].getAttribute('href');

            addMarkAboveReadButton(articleId);  // 增加以上文章已读按钮
            addScrollUpButton(articleId);  // 增加ScrollUp按钮
            addOpenUrlBackgroundButton(articleId, link);   // 增加后台打开文章按钮
            
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
            }
        }
    }
    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑监视文章列表变化↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
})();
