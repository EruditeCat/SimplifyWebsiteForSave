// ==UserScript==
// @name            简化网站以存储
// @namespace       http://tampermonkey.net/
// @description     Test
// @version         0.2.33
// @author          EruditePig
// @include         *
// @exclude         file://*
// @require         http://code.jquery.com/jquery-1.11.0.min.js
// @require         https://unpkg.com/hotkeys-js/dist/hotkeys.min.js
// @grant           GM_registerMenuCommand
// ==/UserScript==]


(function() {
    'use strict';

function test() {
	// 再测试一次TamperMonkey更新的修改。
}

function test2() {
	// 再测试一次TamperMonkey更新的修改。
}

function vczh() {
    remove(siblings(document.getElementById("centercontent")));
    remove(document.getElementsByClassName("commentform")[0]);
}
	
function juejin() {
    remove(siblings(document.getElementById("juejin")));
    remove(siblings(document.getElementsByClassName("view-container")[0]));
    remove(siblings(document.getElementsByClassName("container main-container")[0]));
    remove(siblings(document.getElementsByClassName("main-area article-area shadow")[0]));
    remove(siblings(document.getElementsByClassName("article")[0]));
}
	
function csdn_blog(){
    $("body > div.container").siblings().remove();
    $("main:first").siblings().remove();
    $("main:first").css({"width":"100%"});
    $("div.blog-content-box").siblings().remove();
    $("div#csdn-toolbar").remove();
    $("div.csdn-side-toolbar").remove();
}

function jianshu(){
    $("body > div#__next").siblings().remove();
    $("div#__next > div:first").siblings().remove();
    $("div#__next > div:first > div:first > div:first").siblings().remove();
    $("div#__next > div:first > div:first > div:first > section:first").siblings().remove();
    $("div#__next > div:first > div:first > div:first > section:first > div:empty").nextAll().remove();
}
function zhihu_daily(){
    var del = document.getElementsByClassName("global-header");
    del[0].parentElement.removeChild(del[0])
    del = document.getElementsByClassName("header-for-mobile");
    del[0].parentElement.removeChild(del[0])
    del = document.getElementsByClassName("bottom-wrap");
    del[0].parentElement.removeChild(del[0])
    del = document.getElementsByClassName("footer");
    del[0].parentElement.removeChild(del[0])
    del = document.getElementsByClassName("qr");
    del[0].parentElement.removeChild(del[0])
    del = document.getElementsByClassName("question");
    del[1].parentElement.removeChild(del[1])
}

function zhihu_zhuanlan(){
    remove(siblings(document.getElementById("root")));
    remove(siblings(document.getElementsByClassName("App-main")[0]));
    remove(siblings(document.getElementsByClassName("Post-Main Post-NormalMain")[0]));
    remove(document.getElementsByClassName("Recommendations-Main"));
    remove(document.getElementsByClassName("Comments-container"));
}
	
function blog_chinaunix(){
    $("body>div.box").siblings().remove();
    $(".Blog_contain").siblings().remove();
    $(".Blog_right1").siblings().remove();
    $(".Blog_right1_1").siblings().remove();
    $(".Blog_con3_3").remove();
}
	
function bilibili() {
	$("body > div.page-container").siblings().remove();
	$("body").children().children(":not(.head-container,.article-holder)").remove();
}

function codeproject() {
	$("body > div.page-background").siblings().remove();
	$("div#A").siblings().remove();
	$("div.article-container-parts").siblings().remove();
	$("div#AT").siblings().remove();
	$("div#ctl00_confirmError").remove();
}

function ruanyifeng() {
    $("div#container").siblings().remove();
    $("div#content").siblings().remove();
    $("div#entry-1975").siblings().remove();
    $("div.hentry").siblings().remove();
    $("article.hentry").siblings().remove();
    $("div.entry-sponsor").remove();
}
	
function cnblog(){
    $("#home").siblings().remove();
    $("#main").siblings().remove();
    $("#topicList").siblings().remove();
    $("#topics").siblings().remove();
    $(".postDesc").remove();
    $("#blog_post_info_block").remove();
    $("#sideBar").remove();
    $("#comment_form").remove();
    $("#topicList .forFlow").css("margin-left","50px");
    $("#topicList .forFlow").css("margin-right","50px");
    if ($("#mainContent").css('flex') === "0 1 880px") $("#mainContent").css('flex', '0 1 100%');
    if ($("#mainContent").css('max-width')) $("#mainContent").css('max-width', '100%');
}
	
function itnext(){
    $("#container").siblings().remove();
    $("div.surface").siblings().remove();
    $("div.screenContent>main").siblings().remove();
    $("footer").remove();
};
	
function siblings(node){
    var ss = [].slice.call(node.parentNode.children).filter(function(v){return v!== node});
    return ss;
}
	
function remove(nodes){
    if (canAccessAsArray(nodes)) {
        for (var i=0; i<nodes.length; i++) {
            nodes[i].parentElement.removeChild(nodes[i]);
        }
    } else {
        nodes.parentElement.removeChild(nodes);
    }
}
	
// assumes Array.isArray or a polyfill is available
function canAccessAsArray(item) {
    if (Array.isArray(item)) {
        return true;
    }
    // modern browser such as IE9 / firefox / chrome etc.
    var result = Object.prototype.toString.call(item);
    if (result === "[object HTMLCollection]" || result === "[object NodeList]") {
        return true;
    }
    //ie 6/7/8
    if (typeof item !== "object" || !item.hasOwnProperty("length") || item.length < 0) {
        return false;
    }
    // a false positive on an empty pseudo-array is OK because there won't be anything
    // to iterate so we allow anything with .length === 0 to pass the test
    if (item.length === 0) {
        return true;
    } else if (item[0] && item[0].nodeType) {
        return true;
    }
    return false;        
}
	
function simplify(){
    if(typeof(jQuery) == 'undefined'){
	    insertJQuery();
    }
    var dict = {};
    dict["^(?:http(s)?:\/\/)?blog\.csdn\.net\/.+"] = "csdn_blog";      // csdn blog
    dict["^(?:http(s)?:\/\/)?daily\.zhihu\.com\/.+"] = "zhihu_daily";      // zhihu_daily
    dict["^(?:http(s)?:\/\/)?zhuanlan\.zhihu\.com\/.+"] = "zhihu_zhuanlan";      // zhihu_zhuanlan
    dict["^(?:http(s)?:\/\/)?www\.jianshu\.com\/.+"] = "jianshu";      // jianshu
    dict["^(?:http(s)?:\/\/)?www\.bilibili\.com\/.+"] = "bilibili";      // bilibili
    dict["^(?:http(s)?:\/\/)?www\.codeproject\.com\/.+"] = "codeproject";      // codeproject
    dict["^(?:http(s)?:\/\/)?www\.ruanyifeng\.com\/.+"] = "ruanyifeng";      // ruanyifeng
    dict["^(?:http(s)?:\/\/)?blog\.chinaunix\.net\/.+"] = "blog_chinaunix";      // blog_chinaunix
    dict["^(?:http(s)?:\/\/)?itnext\.io\/.+"] = "itnext";      // itnext
    dict["^(?:http(s)?:\/\/)?juejin\.im\/.+"] = "juejin";      // juejin
    dict["^(?:http(s)?:\/\/)?juejin\.cn\/.+"] = "juejin";      // juejin
    dict["^(?:http(s)?:\/\/)?www\.cppblog\.com\/vczh\/.+"] = "vczh";      // vczh
    dict["^(?:http(s)?:\/\/)?www\.cnblogs\.com\/.+"] = "cnblog";      // cnblog

    for(var key in dict) {
        var reg = new RegExp(key);
        if(reg.test(document.URL)){
            var value = dict[key];
            eval(value + '()');
            return;
        }
    }
    alert("没有匹配的简化代码");
}
	
function commonSimplify(){

	let findContentEle = ()=>{
		let width  = document.body.getBoundingClientRect().width;
		let height = document.body.getBoundingClientRect().height;

		let el = document.body.firstElementChild;
		let lastSelEle = undefined;
		while (el) {
		  let elWidth = el.getBoundingClientRect().width;
		  let elHeight = el.getBoundingClientRect().height;
		  if ((elWidth*elHeight)/(width*height) > 0.4){
			  //console.log(el, "firstElementChild", elWidth, elHeight)
			  lastSelEle = el;
			  el = el.firstElementChild;
		  }else{
			  //console.log(el, "nextElementSibling", elWidth, elHeight)
			  el = el.nextElementSibling;
		  }
		}

		while(true){
			if (lastSelEle === document.body) return lastSelEle;
			let lastParent = lastSelEle.parentElement;
		    let parentWidth = lastParent.getBoundingClientRect().width;
		    let lastSelEleWidth = lastSelEle.getBoundingClientRect().width;
			if (lastSelEleWidth/parentWidth > 0.9){
				lastSelEle = lastParent;
			}else{
				return lastSelEle;
			}
		}
	}

	let simplifyContent = (ele)=>{
		let el = ele;
		do{
			$(el).siblings().remove()
			el = el.parentElement
		}while(el !== document.body)
	}

	let changeWidthToEle = (ele)=>{
		document.body.style="padding:0;border:0;margin:0 auto;width:95%;background:rgb(255,255,255);"
		let willShrinkEle = document.body.firstElementChild;
		do{
			willShrinkEle.style="padding:0;border:0;margin:0 auto;width:100%;max-width:100%;background:rgb(255,255,255);"
			willShrinkEle = willShrinkEle.firstElementChild;
		}while(willShrinkEle !== ele)
		willShrinkEle.style="padding:0;border:0;margin:0 auto;width:100%;max-width:100%;background:rgb(255,255,255);"
	}

	let clearComment = (commentEle) => {
		if (commentEle){
			while(true){
				let nextEle = commentEle.nextElementSibling;
				commentEle.remove();
				if(nextEle){
					commentEle = nextEle;
				}else{
					break;
				}
			}
		}
	}


	let contentEle = findContentEle();
	simplifyContent(contentEle);
	changeWidthToEle(contentEle);
	clearComment(document.getElementById("blog_post_info_block"));
	clearComment(document.getElementById("blog-comments-placeholder"));
}

function insertJQuery(){
    var jq = document.createElement('script');
    jq.src = "//code.jquery.com/jquery-1.11.0.min.js";
    document.getElementsByTagName('head')[0].appendChild(jq);
    jQuery.noConflict();
}

function insertFunc(){
    var jq = document.createElement('script');
    jq.type="text/javascript";
    jq.innerHTML = `
function canAccessAsArray(item) {
    if (Array.isArray(item)) {
        return true;
    }
    // modern browser such as IE9 / firefox / chrome etc.
    var result = Object.prototype.toString.call(item);
    if (result === "[object HTMLCollection]" || result === "[object NodeList]") {
        return true;
    }
    //ie 6/7/8
    if (typeof item !== "object" || !item.hasOwnProperty("length") || item.length < 0) {
        return false;
    }
    // a false positive on an empty pseudo-array is OK because there won't be anything
    // to iterate so we allow anything with .length === 0 to pass the test
    if (item.length === 0) {
        return true;
    } else if (item[0] && item[0].nodeType) {
        return true;
    }
    return false;        
}
function siblings(node){
    var ss = [].slice.call(node.parentNode.children).filter(function(v){return v!== node});
    return ss;
}
	
function remove(nodes){
    if (canAccessAsArray(nodes)) {
        for (var i=0; i<nodes.length; i++) {
            nodes[i].parentElement.removeChild(nodes[i]);
        }
    } else {
        nodes.parentElement.removeChild(nodes);
    }
}
`;
    document.getElementsByTagName('head')[0].appendChild(jq);
}

	
// 高亮选中文字
function highLight(){

    var dr = window.getSelection().getRangeAt(0);
    //console.log(dr);
    var span = document.createElement("span");
    span.style.cssText = "background-color:#f4ff00";
    dr.surroundContents(span);
}
    
// 注册键盘消息
hotkeys('ctrl+q,ctrl+`', function(event,handler) {
  switch(handler.key){
    case "ctrl+q":commonSimplify();break;
    case "ctrl+`":highLight();break;
  }
});
	
	
GM_registerMenuCommand("simplify", simplify, "s");
GM_registerMenuCommand("insertJQuery", insertJQuery, "i");
GM_registerMenuCommand("insertFunc", insertFunc, "i");
GM_registerMenuCommand("highLight", highLight, "h");
})();

