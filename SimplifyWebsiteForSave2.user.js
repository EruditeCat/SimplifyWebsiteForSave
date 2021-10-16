// ==UserScript==
// @name            简化网站以存储2
// @namespace       http://tampermonkey.net/
// @description     重写的简化网站以存储
// @version         1.0.0
// @author          EruditePig
// @include         *
// @exclude         file://*
// @require         http://code.jquery.com/jquery-1.11.0.min.js
// @require         https://unpkg.com/hotkeys-js/dist/hotkeys.min.js
// @grant           GM_registerMenuCommand
// @run-at          document-end
// ==/UserScript==]


(function() {
    'use strict';

// 工具函数集合
class Tools{
    constructor(){}

    // 删除所有的Sibling节点
    static RemoveAllSiblings(el, includeParentsSiblings = true){
        do{
			$(el).siblings().remove()
			el = el.parentElement ? el.parentElement : undefined;
		}while(includeParentsSiblings && el && el !== document.body)
    }

    // 把节点的background属性删除
    static MakeBackgroundWhite(el, includeParents = true){
        do{
            $(el).css({"background":'rgb(255,255,255)' })
			el = el.parentElement ? el.parentElement : undefined;
        }while(includeParents && el && el !== document)
    }

    // 设置margin
    static SetContentCenterAndLarge(el)
    {
        do{
            $(el).css({
                "margin-left":'0px','margin-right':'0px',
                'padding-left' : '0px', 'padding-right':'0px',
                'box-shadow' :'none',
                'border':'none', 
                'width':'100%', 'max-width' : 'none',
                'display' : 'block',
            })
			el = el.parentElement ? el.parentElement : undefined;
        }while(el && el !== document.body)
        $(el).css({
            "margin-left":'50px','margin-right':'50px',
            'padding-left' : '0px', 'padding-right':'0px',
            'box-shadow' :'none',
            'border':'none', 
            'width':'calc(100% - 100px)', 'max-width' : 'none',
            'overflow' : 'auto',
            'display' : 'block',
        })
    }
    
}

// 特征类基类
class BasePattern{
    constructor(){}

    // 判断是否匹配当前的Pattern
    static IsMatch(){alert("子类忘记实现匹配判断函数了。"); return false;}
    // 子类都要实现的Simplify函数
    Simplify(){alert("子类忘记实现简化函数了。");}
}

class CSDNPattern1 extends BasePattern {
    constructor(){super();}

    // 判断是否匹配当前的Pattern
    static IsMatch(){
        /*https://www.cnblogs.com/Fly-Bob/p/15336351.html
          https://www.cnblogs.com/Can-daydayup/p/12008874.html
          https://www.cnblogs.com/cxyxz/p/15385361.html
          body -> id:top_nav
               -> id:home
                 -> id:header
                 -> id:main
                   -> id:mainContent
                   -> id:sideBar
                 -> id:footer
        */
       return window.location.href.search(/.*www\.cnblogs\.com.*/) == 0;
    }

    Simplify(){
        // 清理class=post节点的所有sibling
        Tools.RemoveAllSiblings(document.getElementsByClassName("post")[0]);
        // 删除id=blog_post_info_block
        $("#blog_post_info_block").remove()


        // 改变id=mainContent的margin-left
        //$("#mainContent").css("margin-left", "5px")
        // 删除所有背景
        Tools.MakeBackgroundWhite(document.getElementsByClassName("post")[0])
        Tools.SetContentCenterAndLarge(document.getElementsByClassName("post")[0])
    }
}

class JuejinPattern1 extends BasePattern{
    constructor(){super();}

    static IsMatch(){
        return window.location.href.search(/.*juejin\.cn.*/) == 0;
    }

    Simplify(){
        
        var juejinInterval = setInterval(_Simplify, 500);
        function _Simplify() {
            if (document.readyState != "complete") {
                console.log("简化网页以存储：等待掘金加载结束");
                return;
            }
            clearInterval(juejinInterval);

            // 清理class=post节点的所有sibling
            Tools.RemoveAllSiblings(document.getElementsByClassName("article-content")[0]);
            Tools.MakeBackgroundWhite(document.getElementsByClassName("article-content")[0])
            Tools.SetContentCenterAndLarge(document.getElementsByClassName("article-content")[0])
        }
    }
}

class CodeProject extends BasePattern{
    constructor(){super();}

    static IsMatch(){
        return window.location.href.search(/.*www\.codeproject\.com.*/) == 0;
    }

    Simplify(){
        
        Tools.RemoveAllSiblings(document.getElementsByClassName("article-container")[0]);
        Tools.SetContentCenterAndLarge(document.getElementsByClassName("article-container")[0])
    }
}

// 根据各种特征判断当前网页符合哪个Pattern
function matchPattern(){
    let classes = [CSDNPattern1, JuejinPattern1, CodeProject];
    for (let i = 0; i < classes.length; i++) {
        const patternClass = classes[i];
        if(patternClass.IsMatch()){
            return new patternClass();
        }
    }

    return undefined;
}

// 高亮选中文字
function highLight(){
    var dr = window.getSelection().getRangeAt(0);
    var span = document.createElement("span");
    span.style.cssText = "background-color:#f4ff00";
    dr.surroundContents(span);
}

var DomOutline = function (options) {
    options = options || {};

    var pub = {};
    var self = {
        opts: {
            namespace: options.namespace || 'DomOutline',
            borderWidth: options.borderWidth || 2,
            onClick: options.onClick || false,
            filter: options.filter || false
        },
        keyCodes: {
            BACKSPACE: 8,
            ESC: 27,
            DELETE: 46
        },
        active: false,
        initialized: false,
        elements: {}
    };

    function writeStylesheet(css) {
        var element = document.createElement('style');
        element.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(element);

        if (element.styleSheet) {
            element.styleSheet.cssText = css; // IE
        } else {
            element.innerHTML = css; // Non-IE
        }
    }

    function initStylesheet() {
        if (self.initialized !== true) {
            var css = '' +
                '.' + self.opts.namespace + ' {' +
                '    background: #09c;' +
                '    position: absolute;' +
                '    z-index: 1000000;' +
                '    opacity: 0.3;' +
                '}' +
                '.' + self.opts.namespace + '_label {' +
                '    background: #09c;' +
                '    border-radius: 2px;' +
                '    color: #fff;' +
                '    font: bold 12px/12px Helvetica, sans-serif;' +
                '    padding: 4px 6px;' +
                '    position: absolute;' +
                '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                '    z-index: 1000001;' +
                '}';

            writeStylesheet(css);
            self.initialized = true;
        }
    }

    function createOutlineElements() {
        self.elements.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label').appendTo('body');
        //self.elements.top = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        //self.elements.bottom = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        //self.elements.left = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        //self.elements.right = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.body = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
    }

    function removeOutlineElements() {
        jQuery.each(self.elements, function(name, element) {
            element.remove();
        });
    }

    function compileLabelText(element, width, height) {
        var label = element.tagName.toLowerCase();
        if (element.id) {
            label += '#' + element.id;
        }
        if (element.className) {
            label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
    }

    function getScrollTop() {
        if (!self.elements.window) {
            self.elements.window = jQuery(window);
        }
        return self.elements.window.scrollTop();
    }

    function updateOutlinePosition(e) {

        pub.element = undefined;
        let q = document.elementsFromPoint(e.clientX, e.clientY);
        for (let index = 0; index <q.length; index++) {
            if (typeof q[index].className == 'string' && q[index].className.indexOf(self.opts.namespace) == -1){
                pub.element = q[index];
                break;
            }
        }
        if (pub.element===undefined) return;
        if (self.opts.filter) {
            if (!jQuery(pub.element).is(self.opts.filter)) {
                return;
            }
        }
        //pub.element = e.target;

        var b = self.opts.borderWidth;
        var scroll_top = getScrollTop();
        var pos = pub.element.getBoundingClientRect();
        var top = pos.top + scroll_top;

        var label_text = compileLabelText(pub.element, pos.width, pos.height);
        var label_top = Math.max(0, top - 20 - b, scroll_top);
        var label_left = Math.max(0, pos.left - b);

        self.elements.label.css({ top: label_top, left: label_left }).text(label_text);
        //self.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
        //self.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
        //self.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
        //self.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
        self.elements.body.css({ top: top - b, left: pos.left, width: pos.width, height: pos.height });
    }

    function stopOnEscape(e) {
        if (e.keyCode === self.keyCodes.ESC || e.keyCode === self.keyCodes.BACKSPACE || e.keyCode === self.keyCodes.DELETE) {
            pub.stop();
        }

        return false;
    }

    function clickHandler(e) {
        //pub.stop();
        self.opts.onClick(pub.element);

        return false;
    }

    pub.start = function () {
        initStylesheet();
        if (self.active !== true) {
            self.active = true;
            createOutlineElements();
            jQuery('body').on('mousemove.' + self.opts.namespace, updateOutlinePosition);
            jQuery('body').on('keyup.' + self.opts.namespace, stopOnEscape);
            if (self.opts.onClick) {
                setTimeout(function () {
                    jQuery('.'+self.opts.namespace).on('click.' + self.opts.namespace, function(e){
                        if (self.opts.filter) {
                            if (!jQuery(e.target).is(self.opts.filter)) {
                                return false;
                            }
                        }
                        e.preventDefault();
                        clickHandler.call(this, e);
                    });
                }, 50);
            }
        }
    };

    pub.stop = function () {
        self.active = false;
        removeOutlineElements();
        jQuery('body').off('mousemove.' + self.opts.namespace)
            .off('keyup.' + self.opts.namespace)
            .off('click.' + self.opts.namespace);
    };

    return pub;
};

// 简化选中元素
function simplifyElem(el){
    var myDomOutline = DomOutline(
        { 
            onClick: (ele)=>{
                Tools.RemoveAllSiblings(ele);
                Tools.SetContentCenterAndLarge(ele)
            },
        }
    );

    // Start outline:
    myDomOutline.start();
}
// 删除选中元素
function deleteElem(){
    var myDomOutline = DomOutline(
        { 
            onClick: (ele)=>{
                ele.remove();
            },
        }
    );

    // Start outline:
    myDomOutline.start();
}

// 基本流程
let pattern = matchPattern();
if(pattern) pattern.Simplify();


// 注册键盘消息
hotkeys('alt+q,alt+w,ctrl+`', function(event,handler) {
    switch(handler.key){
      case "alt+q":simplifyElem();break;
      case "alt+w":deleteElem();break;
      case "ctrl+`":highLight();break;
    }
});

}());