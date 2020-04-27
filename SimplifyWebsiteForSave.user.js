// ==UserScript==
// @name            简化网站以存储
// @namespace       http://tampermonkey.net/
// @description     Test
// @version         0.2.19
// @author          EruditePig
// @include         *
// @exclude         file://*
// @require         http://code.jquery.com/jquery-1.11.0.min.js
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
}

function jianshu(){
    $("body > div.note").siblings().remove();
    $("div.post:first").siblings().remove();
    $("div.article:first").siblings().remove();
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
    dict["^(?:http(s)?:\/\/)?www\.cppblog\.com\/vczh\/.+"] = "vczh";      // vczh
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
GM_registerMenuCommand("simplify", simplify, "h");
GM_registerMenuCommand("insertJQuery", insertJQuery, "h");
GM_registerMenuCommand("insertFunc", insertFunc, "h");

})();
