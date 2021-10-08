// ==UserScript==
// @name            简化网站以存储2
// @namespace       http://tampermonkey.net/
// @description     重写的简化网站以存储
// @version         1.0.0
// @author          EruditePig
// @include         https://www.cnblogs.com/*
// @exclude         file://*
// @require         http://code.jquery.com/jquery-1.11.0.min.js
// @require         https://unpkg.com/hotkeys-js/dist/hotkeys.min.js
// @grant           GM_registerMenuCommand
// @run-at document-end
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
    static RemoveBackground(el, includeParents = true){
        do{
            $(el).css({"background":'' })
			el = el.parentElement ? el.parentElement : undefined;
        }while(includeParents && el && el !== document)
    }
}

// 特征类基类
class BasePattern{
    constructor(){}

    // 判断是否匹配当前的Pattern
    IsMatch(){alert("子类忘记实现匹配判断函数了。");}
    // 子类都要实现的Simplify函数
    Simplify(){alert("子类忘记实现简化函数了。");}
}

class CSDNPattern1 extends BasePattern {
    constructor(){super();}

    // 判断是否匹配当前的Pattern
    IsMatch(){
        /*https://www.cnblogs.com/Fly-Bob/p/15336351.html
          https://www.cnblogs.com/Can-daydayup/p/12008874.html
          body -> id:top_nav
               -> id:home
                 -> id:header
                 -> id:main
                   -> id:mainContent
                   -> id:sideBar
                 -> id:footer
        */
    }

    Simplify(){
        // 清理class=post节点的所有sibling
        Tools.RemoveAllSiblings(document.getElementsByClassName("post")[0]);
        // 删除id=blog_post_info_block
        $("#blog_post_info_block").remove()


        // 改变id=mainContent的margin-left
        //$("#mainContent").css("margin-left", "5px")
        // 删除所有背景
        Tools.RemoveBackground(document.getElementsByClassName("post")[0])
    }
}

// 根据各种特征判断当前网页符合哪个Pattern
function matchPattern(){
    return new CSDNPattern1();
}

// 基本流程
let pattern = matchPattern();
pattern.Simplify();

}());