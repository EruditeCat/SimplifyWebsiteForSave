// ==UserScript==
// @name         ZW下载解析工具-知网-万方
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  不知道能用多久，是调用了http://www.xuexi365.top/api_zw/RTVC875CY提供的接口，每天可以下载3篇文章
// @author       XiaoM
// @match        https://*.cnki.net/kns8s/*
// @match        https://*.cnki.net/kcms2/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://unpkg.com/layui@2.8.18/dist/layui.js

// @connect      xuexi365.top
// @grant         GM_xmlhttpRequest

// ==/UserScript==


(function() {



    'use strict';
    /* globals jQuery, $, waitForKeyElements */

    var $ = unsafeWindow.jQuery;

//this.$ = this.jQuery = jQuery.noConflict(true);
// @require      file://D:\Microsoft VS Code\project\ZW下载\index.js

var link = document.createElement('link');
link.rel="stylesheet"
link.href = 'https://unpkg.com/layui@2.8.18/dist/css/layui.css';
document.head.appendChild(link);


// var script = document.createElement('script');
// script.src = 'https://unpkg.com/layui@2.8.18/dist/layui.js';
// document.head.appendChild(script);



function download(url,data){


  var loadIndex = layer.msg('正在获取下载地址', {
      icon: 16,
      shade: 0.11,
      time:300000,
      shadeClose:false
    });


 //console.log({dataFilename,dataDbname,orderid})


 //let url="http://www.xuexi365.top/api_zw/RTVC875CY"
 GM_xmlhttpRequest({
     method:     "POST",
     url:        url,
     data:      data,
     anonymous:  true,
     headers: {
         "Accept": "application/json, text/javascript, */*; q=0.01",
         "Content-Type": "application/json; charset=utf-8"


       },
       onload: function (res) {

        console.log(res.responseText)

            try{
                var json=JSON.parse(res.responseText);
            }catch(err){
                layer.close(loadIndex);
                layer.alert("[0X86889]网络错误，可能接口出现问题，请联系管理源");
                return;
            }

            try{
                $.isEmptyObject(json.data.code)
            }catch(err){
                layer.close(loadIndex);
                layer.alert("[0X83889]网络错误，可能接口出现问题，请联系管理源");
                return;
            }


           if(json.data.code >0){
               layer.close(loadIndex);

          layer.alert(json.data.msg);
          window.open(json.data.url, "_blank");
         }else{
             layer.close(loadIndex);
          layer.alert(json.data.msg);
         }

       },
       onerror:    function (){
           layer.close(loadIndex);
        layer.alert('出现错误，请重试');
       }
   });

}


layui.use(function(){
    var util = layui.util;

    var bars=[];

 if(location.pathname.search('kns8s')>0){
  //查询页面
  bars= [{ // 定义可显示的 bar 列表信息 -- v2.8.0 新增
      type: 'help',
      icon: 'layui-icon-app',
      style: 'background-color: #ff5722'
  }, {
      type: 'download',

        icon: 'layui-icon-download-circle',
        style: 'background-color: #16baaa;'
    }]
   }else if(location.pathname.search('kcms2')>0){

  //详情页面
  bars= [{ // 定义可显示的 bar 列表信息 -- v2.8.0 新增
      type: 'help',
      style: 'background-color: #ff5722',
      icon: 'layui-icon-app'
    }, {
      type: 'download_caj',

        icon: 'layui-icon-download-circle',
        style: 'background-color: #3594ff;'
      }, {
        type: 'download_pdf',

      icon: 'layui-icon-download-circle',
      style: 'background-color: #5d9e2b;'
    }]
 }else if(location.origin=='https://d.wanfangdata.com.cn'){

  //万方
  bars= [ { // 定义可显示的 bar 列表信息 -- v2.8.0 新增
    type: 'help',
    icon: 'layui-icon-app',
    style: 'background-color: #ff5722'
  },{
      type: 'download_wf',
      icon: 'layui-icon-download-circle',
      style: 'background-color: #5d9e2b;'
    }]


 }






    // 自定义固定条
    util.fixbar({
      bars:bars,
      // bar1: true,
      // bar2: true,
       default: false, // 是否显示默认的 bar 列表 --  v2.8.0 新增
      // bgcolor: '#393D52', // bar 的默认背景色
       css: { bottom: 200},
      // target: '#target-test', // 插入 fixbar 节点的目标元素选择器
      // duration: 300, // top bar 等动画时长（毫秒）
      on: { // 任意事件 --  v2.8.0 新增
        mouseenter: function(type){

        if(type=='help'){
          var content = "如何使用"
        }else if(type=='download'){
          var content = "帮我下载"
        }else if(type=='download_caj'){
          var content = "下载CAJ"
        }else if(type=='download_pdf'){
          var content = "下载PDF"
        }else if(type=='download_wf'){
          var content = "下载PDF"
        }


          layer.tips(content, this, {
            tips: 4,
            fixed: true
          });
        },
        mouseleave: function(type){
          layer.closeAll('tips');
        }
      },
      // 点击事件
      click: function(type){
        console.log(this, type);

        if(type=='help'){


            // layer.open({
            //   type: 1,
            //   area: ['420px', '240px'], // 宽高
            //   content: ''
            // });



            layer.open({
              type: 1,
              offset: 'l',
              anim: 'slideRight', // 从左往右
              area: ['320px', '100%'],
              shade: 0.1,
              shadeClose: true,
              id: 'ID-demo-layer-direction-l',
              content:help_content
            });



          }else if(type=='download'){

            var selectCount =  $("#selectCount").text();
            if( selectCount !=1){

                layer.tips("请查看这里，是否选定的不是一个", "#selectCount", {
                    tips: [1, '#ff5722'],
                    time:10000
                  })
                layer.msg('您没有选择或则选择了多个！');

                return
            }


            var FileNameSNZKPT = localStorage.getItem('FileNameSNZKPT');
            var input = $('input[value="'+FileNameSNZKPT+'"]').val()
            if(input!=FileNameSNZKPT){
                layer.msg('请查看是否选择的内容不在本页面！');

                return
            }

            //children('.icon-collect').attr('data-filename')
           var dataFilename = $('input[value="'+FileNameSNZKPT+'"]').parent("td").parent("tr").find('.icon-collect').attr("data-filename");
           var dataDbname= $('input[value="'+FileNameSNZKPT+'"]').parent("td").parent("tr").find('.icon-collect').attr("data-dbname");
           var orderid= $('input[value="'+FileNameSNZKPT+'"]').parent("td").parent("tr").find('.downloadlink').attr("href");

            const regex = /order\?id=(.*)/i;
            var match = regex.exec(orderid);
            if(match){
                orderid=match[1]
            }

            layer.confirm('这里下载可能是CAJ格式，需要PDF需要进入文章详情页点击按钮，确定要下载码？', {icon: 3}, function(){
              let url="http://www.xuexi365.top/api_zw/RTVC875CY"
              let data=JSON.stringify( {'dataFilename':dataFilename,'dataDbname':dataDbname,'orderId':orderid})
              download(url,data)
            }, function(){
               // layer.msg('点击取消的回调');
            });





          }else if(type=='download_caj'||type=='download_pdf'){

            var dataFilename = $('#param-filename').val();
            var dataDbname=  $('#param-dbname').val();
            if(type=='download_caj'){
                var orderid= $('#cajDown').attr("href");

            }else if(type=='download_pdf'){
                var orderid= $('#pdfDown').attr("href");
            }

            const regex = /order\?id=(.*)/i;
            var match = regex.exec(orderid);
            if(match){
                orderid=match[1]
            }

          let url="http://www.xuexi365.top/api_zw/RTVC875CY"
          let data=JSON.stringify( {'dataFilename':dataFilename,'dataDbname':dataDbname,'orderId':orderid})

          download(url,data)


        }else if(type=='download_wf'){
          //var downloadlink=$('.download .buttonItem').attr("href");
          var downloadlink=$('.download').attr("href");
          console.log(downloadlink)

          GM_xmlhttpRequest({
            method:     "HEAD",
            url:        downloadlink,
            anonymous:  true,
            onload: function (res) {
            var url =  res.finalUrl;
            console.log(url)
            // 解析URL参数
            var params = new URL(url);
            // 获取指定参数的值
            var paramValue = params.searchParams.get("service");

            console.log(paramValue);

            let queryurl="http://www.xuexi365.top/api_wf/WMDP8NJ9T"
            let data=JSON.stringify( {'url':paramValue})
            download(queryurl,data)


            },
            onerror:    function (){
                layer.close(loadIndex);
             layer.alert('出现错误，请重试');
            }
        });


      }
    }
    });

  //隐藏知网原本滚动条
  $('.fixedbar').hide();
  $('.anxs-left-bom').hide();


  });









})();
