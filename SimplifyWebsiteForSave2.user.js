// ==UserScript==
// @name            简化网站以存储2
// @namespace       https://github.com/EruditeCat/SimplifyWebsiteForSave/tree/master
// @description     重写的简化网站以存储
// @version         1.1.20.2
// @author          EruditePig
// @include         *
///////// @exclude         file://*
// @require         http://code.jquery.com/jquery-1.11.0.min.js
// @grant           GM_registerMenuCommand
// @run-at          document-end
// ==/UserScript==]


(function () {
    'use strict';

    /**
     * 以下Hotkey的代码来自hotkeys-js v3.8.7
     * 我修改了两处：
     * 1. dispatch函数中，保证按了ESC后，_downKeys数组清零，相当于强制ESC键不能绑定快捷键
     * 2. eventHandler函数中，在执行回调函数前，_downKeys数组清零，相当于只要命中一个快捷键，则清空
     */
    (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.hotkeys = factory());
    }(this, (function () {
        'use strict';

        var isff = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false; // 绑定事件

        function addEvent(object, event, method) {
            if (object.addEventListener) {
                object.addEventListener(event, method, false);
            } else if (object.attachEvent) {
                object.attachEvent("on".concat(event), function () {
                    method(window.event);
                });
            }
        } // 修饰键转换成对应的键码


        function getMods(modifier, key) {
            var mods = key.slice(0, key.length - 1);

            for (var i = 0; i < mods.length; i++) {
                mods[i] = modifier[mods[i].toLowerCase()];
            }

            return mods;
        } // 处理传的key字符串转换成数组


        function getKeys(key) {
            if (typeof key !== 'string') key = '';
            key = key.replace(/\s/g, ''); // 匹配任何空白字符,包括空格、制表符、换页符等等

            var keys = key.split(','); // 同时设置多个快捷键，以','分割

            var index = keys.lastIndexOf(''); // 快捷键可能包含','，需特殊处理

            for (; index >= 0;) {
                keys[index - 1] += ',';
                keys.splice(index, 1);
                index = keys.lastIndexOf('');
            }

            return keys;
        } // 比较修饰键的数组


        function compareArray(a1, a2) {
            var arr1 = a1.length >= a2.length ? a1 : a2;
            var arr2 = a1.length >= a2.length ? a2 : a1;
            var isIndex = true;

            for (var i = 0; i < arr1.length; i++) {
                if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
            }

            return isIndex;
        }

        var _keyMap = {
            backspace: 8,
            tab: 9,
            clear: 12,
            enter: 13,
            return: 13,
            esc: 27,
            escape: 27,
            space: 32,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            del: 46,
            delete: 46,
            ins: 45,
            insert: 45,
            home: 36,
            end: 35,
            pageup: 33,
            pagedown: 34,
            capslock: 20,
            num_0: 96,
            num_1: 97,
            num_2: 98,
            num_3: 99,
            num_4: 100,
            num_5: 101,
            num_6: 102,
            num_7: 103,
            num_8: 104,
            num_9: 105,
            num_multiply: 106,
            num_add: 107,
            num_enter: 108,
            num_subtract: 109,
            num_decimal: 110,
            num_divide: 111,
            '⇪': 20,
            ',': 188,
            '.': 190,
            '/': 191,
            '`': 192,
            '-': isff ? 173 : 189,
            '=': isff ? 61 : 187,
            ';': isff ? 59 : 186,
            '\'': 222,
            '[': 219,
            ']': 221,
            '\\': 220
        }; // Modifier Keys

        var _modifier = {
            // shiftKey
            '⇧': 16,
            shift: 16,
            // altKey
            '⌥': 18,
            alt: 18,
            option: 18,
            // ctrlKey
            '⌃': 17,
            ctrl: 17,
            control: 17,
            // metaKey
            '⌘': 91,
            cmd: 91,
            command: 91
        };
        var modifierMap = {
            16: 'shiftKey',
            18: 'altKey',
            17: 'ctrlKey',
            91: 'metaKey',
            shiftKey: 16,
            ctrlKey: 17,
            altKey: 18,
            metaKey: 91
        };
        var _mods = {
            16: false,
            18: false,
            17: false,
            91: false
        };
        var _handlers = {}; // F1~F12 special key

        for (var k = 1; k < 20; k++) {
            _keyMap["f".concat(k)] = 111 + k;
        }

        var _downKeys = []; // 记录摁下的绑定键

        var _scope = 'all'; // 默认热键范围

        var elementHasBindEvent = []; // 已绑定事件的节点记录
        // 返回键码

        var code = function code(x) {
            return _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);
        }; // 设置获取当前范围（默认为'所有'）


        function setScope(scope) {
            _scope = scope || 'all';
        } // 获取当前范围


        function getScope() {
            return _scope || 'all';
        } // 获取摁下绑定键的键值


        function getPressedKeyCodes() {
            return _downKeys.slice(0);
        } // 表单控件控件判断 返回 Boolean
        // hotkey is effective only when filter return true


        function filter(event) {
            var target = event.target || event.srcElement;
            var tagName = target.tagName;
            var flag = true; // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>

            if (target.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') && !target.readOnly) {
                flag = false;
            }

            return flag;
        } // 判断摁下的键是否为某个键，返回true或者false


        function isPressed(keyCode) {
            if (typeof keyCode === 'string') {
                keyCode = code(keyCode); // 转换成键码
            }

            return _downKeys.indexOf(keyCode) !== -1;
        } // 循环删除handlers中的所有 scope(范围)


        function deleteScope(scope, newScope) {
            var handlers;
            var i; // 没有指定scope，获取scope

            if (!scope) scope = getScope();

            for (var key in _handlers) {
                if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
                    handlers = _handlers[key];

                    for (i = 0; i < handlers.length;) {
                        if (handlers[i].scope === scope) handlers.splice(i, 1);
                        else i++;
                    }
                }
            } // 如果scope被删除，将scope重置为all


            if (getScope() === scope) setScope(newScope || 'all');
        } // 清除修饰键


        function clearModifier(event) {
            var key = event.keyCode || event.which || event.charCode;

            var i = _downKeys.indexOf(key); // 从列表中清除按压过的键


            if (i >= 0) {
                _downKeys.splice(i, 1);
            } // 特殊处理 cmmand 键，在 cmmand 组合快捷键 keyup 只执行一次的问题


            if (event.key && event.key.toLowerCase() === 'meta') {
                _downKeys.splice(0, _downKeys.length);
            } // 修饰键 shiftKey altKey ctrlKey (command||metaKey) 清除


            if (key === 93 || key === 224) key = 91;

            if (key in _mods) {
                _mods[key] = false; // 将修饰键重置为false

                for (var k in _modifier) {
                    if (_modifier[k] === key) hotkeys[k] = false;
                }
            }
        }

        function unbind(keysInfo) {
            // unbind(), unbind all keys
            if (!keysInfo) {
                Object.keys(_handlers).forEach(function (key) {
                    return delete _handlers[key];
                });
            } else if (Array.isArray(keysInfo)) {
                // support like : unbind([{key: 'ctrl+a', scope: 's1'}, {key: 'ctrl-a', scope: 's2', splitKey: '-'}])
                keysInfo.forEach(function (info) {
                    if (info.key) eachUnbind(info);
                });
            } else if (typeof keysInfo === 'object') {
                // support like unbind({key: 'ctrl+a, ctrl+b', scope:'abc'})
                if (keysInfo.key) eachUnbind(keysInfo);
            } else if (typeof keysInfo === 'string') {
                for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                // support old method
                // eslint-disable-line
                var scope = args[0],
                    method = args[1];

                if (typeof scope === 'function') {
                    method = scope;
                    scope = '';
                }

                eachUnbind({
                    key: keysInfo,
                    scope: scope,
                    method: method,
                    splitKey: '+'
                });
            }
        } // 解除绑定某个范围的快捷键


        var eachUnbind = function eachUnbind(_ref) {
            var key = _ref.key,
                scope = _ref.scope,
                method = _ref.method,
                _ref$splitKey = _ref.splitKey,
                splitKey = _ref$splitKey === void 0 ? '+' : _ref$splitKey;
            var multipleKeys = getKeys(key);
            multipleKeys.forEach(function (originKey) {
                var unbindKeys = originKey.split(splitKey);
                var len = unbindKeys.length;
                var lastKey = unbindKeys[len - 1];
                var keyCode = lastKey === '*' ? '*' : code(lastKey);
                if (!_handlers[keyCode]) return; // 判断是否传入范围，没有就获取范围

                if (!scope) scope = getScope();
                var mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
                _handlers[keyCode] = _handlers[keyCode].map(function (record) {
                    // 通过函数判断，是否解除绑定，函数相等直接返回
                    var isMatchingMethod = method ? record.method === method : true;

                    if (isMatchingMethod && record.scope === scope && compareArray(record.mods, mods)) {
                        return {};
                    }

                    return record;
                });
            });
        }; // 对监听对应快捷键的回调函数进行处理


        function eventHandler(event, handler, scope) {
            var modifiersMatch; // 看它是否在当前范围

            if (handler.scope === scope || handler.scope === 'all') {
                // 检查是否匹配修饰符（如果有返回true）
                modifiersMatch = handler.mods.length > 0;

                for (var y in _mods) {
                    if (Object.prototype.hasOwnProperty.call(_mods, y)) {
                        if (!_mods[y] && handler.mods.indexOf(+y) > -1 || _mods[y] && handler.mods.indexOf(+y) === -1) {
                            modifiersMatch = false;
                        }
                    }
                } // 调用处理程序，如果是修饰键不做处理

                // mod by sjx 2021-12-11 在执行回调函数前，_downKeys数组清零，相当于只要命中一个快捷键，则清空
                _downKeys = [];
                if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === '*') {
                    if (handler.method(event, handler) === false) {
                        if (event.preventDefault) event.preventDefault();
                        else event.returnValue = false;
                        if (event.stopPropagation) event.stopPropagation();
                        if (event.cancelBubble) event.cancelBubble = true;
                    }
                }
            }
        } // 处理keydown事件


        function dispatch(event) {
            var asterisk = _handlers['*'];
            var key = event.keyCode || event.which || event.charCode; // 表单控件过滤 默认表单控件不触发快捷键

            if (!hotkeys.filter.call(this, event)) return; // Gecko(Firefox)的command键值224，在Webkit(Chrome)中保持一致
            // Webkit左右 command 键值不一样

            if (key === 93 || key === 224) key = 91;

            // modify by sjx 2021-12-11 保证按了ESC后，_downKeys数组清零
            if (key === 27) {
                _downKeys = [];
                return;
            }
            /**
             * Collect bound keys
             * If an Input Method Editor is processing key input and the event is keydown, return 229.
             * https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
             * http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
             */

            if (_downKeys.indexOf(key) === -1 && key !== 229) _downKeys.push(key);
            /**
             * Jest test cases are required.
             * ===============================
             */

            ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach(function (keyName) {
                var keyNum = modifierMap[keyName];

                if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
                    _downKeys.push(keyNum);
                } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
                    _downKeys.splice(_downKeys.indexOf(keyNum), 1);
                } else if (keyName === 'metaKey' && event[keyName] && _downKeys.length === 3) {
                    /**
                     * Fix if Command is pressed:
                     * ===============================
                     */
                    if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
                        _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum));
                    }
                }
            });
            /**
             * -------------------------------
             */

            if (key in _mods) {
                _mods[key] = true; // 将特殊字符的key注册到 hotkeys 上

                for (var k in _modifier) {
                    if (_modifier[k] === key) hotkeys[k] = true;
                }

                if (!asterisk) return;
            } // 将 modifierMap 里面的修饰键绑定到 event 中


            for (var e in _mods) {
                if (Object.prototype.hasOwnProperty.call(_mods, e)) {
                    _mods[e] = event[modifierMap[e]];
                }
            }
            /**
             * https://github.com/jaywcjlove/hotkeys/pull/129
             * This solves the issue in Firefox on Windows where hotkeys corresponding to special characters would not trigger.
             * An example of this is ctrl+alt+m on a Swedish keyboard which is used to type μ.
             * Browser support: https://caniuse.com/#feat=keyboardevent-getmodifierstate
             */


            if (event.getModifierState && !(event.altKey && !event.ctrlKey) && event.getModifierState('AltGraph')) {
                if (_downKeys.indexOf(17) === -1) {
                    _downKeys.push(17);
                }

                if (_downKeys.indexOf(18) === -1) {
                    _downKeys.push(18);
                }

                _mods[17] = true;
                _mods[18] = true;
            } // 获取范围 默认为 `all`


            var scope = getScope(); // 对任何快捷键都需要做的处理

            if (asterisk) {
                for (var i = 0; i < asterisk.length; i++) {
                    if (asterisk[i].scope === scope && (event.type === 'keydown' && asterisk[i].keydown || event.type === 'keyup' && asterisk[i].keyup)) {
                        eventHandler(event, asterisk[i], scope);
                    }
                }
            } // key 不在 _handlers 中返回

            if (!(key in _handlers)) return;

            for (var _i = 0; _i < _handlers[key].length; _i++) {
                if (event.type === 'keydown' && _handlers[key][_i].keydown || event.type === 'keyup' && _handlers[key][_i].keyup) {
                    if (_handlers[key][_i].key) {
                        var record = _handlers[key][_i];
                        var splitKey = record.splitKey;
                        var keyShortcut = record.key.split(splitKey);
                        var _downKeysCurrent = []; // 记录当前按键键值

                        for (var a = 0; a < keyShortcut.length; a++) {
                            _downKeysCurrent.push(code(keyShortcut[a]));
                        }

                        if (_downKeysCurrent.sort().join('') === _downKeys.sort().join('')) {
                            // 找到处理内容
                            eventHandler(event, record, scope);
                        }
                    }
                }
            }
        } // 判断 element 是否已经绑定事件


        function isElementBind(element) {
            return elementHasBindEvent.indexOf(element) > -1;
        }

        function hotkeys(key, option, method) {
            _downKeys = [];
            var keys = getKeys(key); // 需要处理的快捷键列表

            var mods = [];
            var scope = 'all'; // scope默认为all，所有范围都有效

            var element = document; // 快捷键事件绑定节点

            var i = 0;
            var keyup = false;
            var keydown = true;
            var splitKey = '+'; // 对为设定范围的判断

            if (method === undefined && typeof option === 'function') {
                method = option;
            }

            if (Object.prototype.toString.call(option) === '[object Object]') {
                if (option.scope) scope = option.scope; // eslint-disable-line

                if (option.element) element = option.element; // eslint-disable-line

                if (option.keyup) keyup = option.keyup; // eslint-disable-line

                if (option.keydown !== undefined) keydown = option.keydown; // eslint-disable-line

                if (typeof option.splitKey === 'string') splitKey = option.splitKey; // eslint-disable-line
            }

            if (typeof option === 'string') scope = option; // 对于每个快捷键进行处理

            for (; i < keys.length; i++) {
                key = keys[i].split(splitKey); // 按键列表

                mods = []; // 如果是组合快捷键取得组合快捷键

                if (key.length > 1) mods = getMods(_modifier, key); // 将非修饰键转化为键码

                key = key[key.length - 1];
                key = key === '*' ? '*' : code(key); // *表示匹配所有快捷键
                // 判断key是否在_handlers中，不在就赋一个空数组

                if (!(key in _handlers)) _handlers[key] = [];

                _handlers[key].push({
                    keyup: keyup,
                    keydown: keydown,
                    scope: scope,
                    mods: mods,
                    shortcut: keys[i],
                    method: method,
                    key: keys[i],
                    splitKey: splitKey
                });
            } // 在全局document上设置快捷键


            if (typeof element !== 'undefined' && !isElementBind(element) && window) {
                elementHasBindEvent.push(element);
                addEvent(element, 'keydown', function (e) {
                    dispatch(e);
                });
                addEvent(window, 'focus', function () {
                    _downKeys = [];
                });
                addEvent(element, 'keyup', function (e) {
                    dispatch(e);
                    clearModifier(e);
                });
            }
        }

        var _api = {
            setScope: setScope,
            getScope: getScope,
            deleteScope: deleteScope,
            getPressedKeyCodes: getPressedKeyCodes,
            isPressed: isPressed,
            filter: filter,
            unbind: unbind
        };

        for (var a in _api) {
            if (Object.prototype.hasOwnProperty.call(_api, a)) {
                hotkeys[a] = _api[a];
            }
        }

        if (typeof window !== 'undefined') {
            var _hotkeys = window.hotkeys;

            hotkeys.noConflict = function (deep) {
                if (deep && window.hotkeys === hotkeys) {
                    window.hotkeys = _hotkeys;
                }

                return hotkeys;
            };

            window.hotkeys = hotkeys;
        }

        return hotkeys;

    })));
    // 工具函数集合
    class Tools {
        constructor() {}

        // 删除所有的Sibling节点
        static RemoveAllSiblings(el, includeParentsSiblings = true) {
            do {
                $(el).siblings(':not(style, link)').remove()
                el = el.parentElement ? el.parentElement : undefined;
            } while (includeParentsSiblings && el && el !== document.body)
        }

        static RemoveSelfAndChildren(el){
            el?.remove()
        }

        // 把节点及父元素的background属性删除
        static MakeBackgroundWhite(el) {
            do {
                //$(el).css({"background-color":'white' })
                $(el).css("background-image", "none");
                $(el).css('background-color', 'white')
                //el.style.backgroundColor  = "white";
                el = el.parentElement ? el.parentElement : undefined;
            } while (el && el !== document.parentElement)
        }

        // 设置margin
        static SetContentCenterAndLarge(el) {
            do {
                $(el).css({
                    "margin-left": '0px',
                    'margin-right': '0px',
                    'padding-left': '0px',
                    'padding-right': '0px',
                    'box-shadow': 'none',
                    'border': 'none',
                    'width': '100%',
                    'max-width': 'none',
                    'display': 'block',
                })
                el = el.parentElement ? el.parentElement : undefined;
            } while (el && el !== document.body)
            $(el).css({
                "margin-left": '50px',
                'margin-right': '50px',
                'padding-left': '0px',
                'padding-right': '0px',
                'box-shadow': 'none',
                'border': 'none',
                'width': 'calc(100% - 100px)',
                'max-width': 'none',
                'overflow': 'auto',
                'display': 'block',
            })
        }

        static WriteStylesheet(css) {
            let element = document.createElement('style');
            element.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(element);

            if (element.styleSheet) {
                element.styleSheet.cssText = css; // IE
            } else {
                element.innerHTML = css; // Non-IE
            }
        }
    }

    // 特征类基类
    class BasePattern {
        constructor() {}

        // 判断是否匹配当前的Pattern
        static IsMatch() {
            alert("子类忘记实现匹配判断函数了。");
            return false;
        }
        // 子类都要实现的Simplify函数
        autoProcessHtml() {
            alert("子类忘记实现自动处理网页函数。");
        }
        // 子类都要实现的手动Simplify函数
        manualProcessHtml() {
            alert("子类忘记实现手动处理网页函数")
        }
    }

    class CnblogPattern1 extends BasePattern {
        constructor() {
            super();
        }

        // 判断是否匹配当前的Pattern
        static IsMatch() {
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

        autoProcessHtml() {
            // 清理class=post节点的所有sibling
            let ele = document.getElementsByClassName("post")[0];
            Tools.RemoveAllSiblings(ele);
            // 删除id=blog_post_info_block
            $("#blog_post_info_block").remove()


            // 改变id=mainContent的margin-left
            //$("#mainContent").css("margin-left", "5px")
            // 删除所有背景
            Tools.MakeBackgroundWhite(ele)
            Tools.SetContentCenterAndLarge(ele)

            // 修改代码的字体
            document.styleSheets[0].insertRule('.postBody .cnblogs-markdown code.hljs.highlighter-hljs,.cnblogs_code pre,.cnblogs_code span{font-family:Consolas !important}', 0);
        }
    }

    class CSDNPattern1 extends BasePattern {
        constructor() {
            super();
        }

        // 判断是否匹配当前的Pattern
        static IsMatch() {
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
            return window.location.href.search(/.*blog\.csdn\.net.*/) == 0;
        }

        autoProcessHtml() {

            var simplifyInterval = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待CSDN加载结束");
                    return;
                }
                clearInterval(simplifyInterval);

                let ele = document.getElementsByClassName("blog-content-box")[0]
                // 清理class=post节点的所有sibling
                Tools.RemoveAllSiblings(ele);
                // 删除id=blog_post_info_block
                $("#blog_post_info_block").remove()
                $(".article-info-box").remove()
                $("#blogColumnPayAdvert").remove()

                // 改变id=mainContent的margin-left
                //$("#mainContent").css("margin-left", "5px")
                // 删除所有背景
                Tools.MakeBackgroundWhite(ele)
                Tools.SetContentCenterAndLarge(ele)
            }
        }
    }

    class JuejinPattern1 extends BasePattern {
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/.*juejin\.cn.*/) == 0;
        }

        autoProcessHtml() {

            var juejinInterval = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待掘金加载结束");
                    return;
                }
                clearInterval(juejinInterval);

                // 清理class=post节点的所有sibling
                let ele = document.getElementsByClassName("markdown-body")[0]
                Tools.RemoveAllSiblings(ele);
                Tools.MakeBackgroundWhite(ele)
                Tools.SetContentCenterAndLarge(ele)
            }
        }
    }

    class CodeProject extends BasePattern {
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/.*www\.codeproject\.com.*/) == 0;
        }

        autoProcessHtml() {

            Tools.RemoveAllSiblings(document.getElementsByClassName("article-container")[0]);
            $(".float-right").remove(); // 删除漂浮图片
            $("#_MessageBoardctl00_MessageBoard").prev().prev().remove(); // 删除评论
            $("#_MessageBoardctl00_MessageBoard").prev().remove(); // 删除评论
            $("#_MessageBoardctl00_MessageBoard").remove(); // 删除评论
            $("#ctl00_RateArticle_RatingTable").remove(); // 删除Rate评分
            $(".share-list").prev().remove(); // 删除分享部分
            $(".share-list").remove(); // 删除分享部分
            $("p.small-text").remove(); // 删除底部无用信息
            $("div.bottom-promo").remove(); // 删除底部无用信息
            document.querySelectorAll("p img").forEach(x => {
                let src = x.getAttribute("src");
                if (src.startsWith("data:image/gif;base64")) {
                    let s = x.getAttribute("data-srcset");
                    if (s != null) {
                        let imgSrcArr = s.split(',');
                        let imgSrcStr = imgSrcArr[imgSrcArr.length - 1];
                        let imgSrcLastWhiteSpaceIndex = imgSrcStr.lastIndexOf(' ');
                        let imgSrc = imgSrcStr.substring(0, imgSrcLastWhiteSpaceIndex);
                        x.setAttribute("src", imgSrc);
                    } else {
                        let ss = x.getAttribute("data-src");
                        if (ss != null) {
                            x.setAttribute("src", ss);
                        }
                    }
                }
            })
            Tools.SetContentCenterAndLarge(document.getElementsByClassName("article-container")[0])
            $(document.getElementById("ctl00_confirmError")).remove();
        }
    }

    class ZhihuDaily extends BasePattern {
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/.*daily\.zhihu\.com.*/) == 0;
        }

        autoProcessHtml() {

            let intervalCallBack = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待加载结束");
                    return;
                }
                clearInterval(intervalCallBack);

                Tools.RemoveAllSiblings(document.getElementsByClassName("App-main")[0]);
                Tools.SetContentCenterAndLarge(document.getElementsByClassName("App-main")[0])
                $("div.Daily").remove();
                $("div.DailyHeader-image").remove();
                $("p.DailyHeader-imageSource").remove();
                $("a.view-more").remove();

                $("header.DailyHeader").css({
                    "background-color": "white",
                    "height": "0"
                });
                $("p.DailyHeader-title").css({
                    "color": "black",
                    "bottom": "auto"
                });
                //$("header.DailyHeader").css("height", "none");
            }

        }
    }

    class ZhihuZhuanlan extends BasePattern{
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/.*zhuanlan\.zhihu\.com.*/) == 0;
        }

        autoProcessHtml() {

            let intervalCallBack = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待加载结束");
                    return;
                }
                clearInterval(intervalCallBack);

                Tools.RemoveSelfAndChildren(document.getElementsByClassName("ColumnPageHeader-Wrapper")[0]);
                Tools.RemoveSelfAndChildren(document.getElementsByClassName("Post-Sub Post-NormalSub")[0]);
                Tools.RemoveSelfAndChildren(document.getElementsByClassName("Sticky RichContent-actions is-bottom")[0]);
                Tools.RemoveSelfAndChildren(document.getElementsByClassName("CornerButtons")[0]);
                Tools.SetContentCenterAndLarge(document.getElementsByClassName("Post-RichTextContainer")[0]);
                Tools.RemoveSelfAndChildren(document.getElementsByClassName("css-1wq6v87")?.[0]);
                Tools.RemoveSelfAndChildren(document.getElementsByClassName("Modal-wrapper undefined Modal-enter-done")?.[0]);
                Tools.WriteStylesheet('img{width:auto!important}')
                document.documentElement.style["overflow"] = "auto";
            }

        }
    }


    class EastMoney extends BasePattern {
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/https:\/\/guba\.eastmoney\.com\/news,[0-9]+,[0-9]+\.html/) == 0;

        }

        autoProcessHtml() {

            let intervalCallBack = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待加载结束");
                    return;
                }
                clearInterval(intervalCallBack);

                $("#newsEditor").remove();
            }

        }
    }

    class WuAiPoJie extends BasePattern {
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/https:\/\/www\.52pojie\.cn\/.*/) == 0;
        }

        autoProcessHtml() {

            let intervalCallBack = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待加载结束");
                    return;
                }
                clearInterval(intervalCallBack);

                const oldElems = document.getElementsByClassName("t_f");
                // regex匹配找到百度盘的提取码，重点是找到提取码的4个[数字+字母]，且前后不是[数字+字母]
                const regexConcatBaiduPanUrl = /(https:\/\/pan\.baidu\.com\/s\/[0-9a-zA-Z\-_]{23})[^\?][\s\S]*[^0-9a-zA-Z]([0-9a-zA-Z]{4})[^0-9a-zA-Z]*/mg;
                const regexExactBaiduPanUrl = String.raw`https:\/\/pan\.baidu\.com\/s\/[0-9a-zA-Z\-_]{23}\?pwd=[0-9a-zA-Z]{4}`;
                let regexBaiduPanUrl = new RegExp('(' + regexExactBaiduPanUrl + ')', "mg");
                let regexBaiduPanLinkElem = new RegExp('<a.*href="(' + regexExactBaiduPanUrl + ')".*>\\1.*<\\/a>', "mg");
                for (let i = 0; i < oldElems.length; i++) {
                    // 尝试从帖子中找到百度盘的提取码，并编进链接里
                    if (oldElems[i].innerHTML.search(regexConcatBaiduPanUrl) != -1) {
                        const newItem = oldElems[i].cloneNode(true);
                        const replaceHtml = newItem.innerText.replace(regexConcatBaiduPanUrl, '<a href="$1?pwd=$2" target="_blank">$1?pwd=$2</a>')
                        newItem.innerHTML += "<hr><b>替换为</b><hr>"
                        newItem.innerHTML += replaceHtml
                        oldElems[i].parentNode.replaceChild(newItem, oldElems[i]);
                    // 如果找到的是百度盘的分享链接带提取码的，把它变成url，而不是文字
                    }else if(oldElems[i].innerHTML.search(regexBaiduPanLinkElem) == -1 && oldElems[i].innerHTML.search(regexBaiduPanUrl) != -1){
                        const newItem = oldElems[i].cloneNode(true);
                        const replaceHtml = newItem.innerText.replace(regexBaiduPanUrl, '<a href="$1" target="_blank">$1</a>')
                        newItem.innerHTML += "<hr><b>替换为</b><hr>"
                        newItem.innerHTML += replaceHtml
                        oldElems[i].parentNode.replaceChild(newItem, oldElems[i]);
                    }

                }
            }
        }
        manualProcessHtml() {

            let intervalCallBack = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待加载结束");
                    return;
                }
                clearInterval(intervalCallBack);
                let ele = document.querySelector("#postlist div td.t_f");
                Tools.RemoveAllSiblings(ele);
            }

        }
    }

    class SMZDM extends BasePattern {
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/https:\/\/post\.smzdm\.com\/.*/) == 0;
        }

        manualProcessHtml() {

            let intervalCallBack = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待加载结束");
                    return;
                }
                clearInterval(intervalCallBack);

                let ele = document.querySelector("#articleId");
                Tools.RemoveAllSiblings(ele);
                Tools.SetContentCenterAndLarge(ele)
                Tools.MakeBackgroundWhite(ele)
            }

        }
    }

    class V2EX extends BasePattern {
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/https:\/\/www\.v2ex\.com\/t\/.*/) == 0;
        }

        autoProcessHtml() {

            let intervalCallBack = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待加载结束");
                    return;
                }
                clearInterval(intervalCallBack);

                let ele = document.querySelector("#Main");
                Tools.RemoveAllSiblings(ele);
                $(".fr").remove(); // 删除楼主的头像
                $(".header > h1").siblings().remove(); // 标题上不需要的元素都删了
                $(".cell > table > tbody > tr > td:nth-of-type(1)").remove(); // 删除每个回复者的头像
                $(".ago").remove(); // 删除每个回复的时间显示
                $("#Main > div:last-of-type").remove(); // 删除页尾广告

                // 增加楼号
                let eles = document.querySelectorAll('[id^="r_"]')
                for (let i = 1; i <= eles.length; i++) {
                    let tdEle = document.createElement("td");
                    tdEle.innerText = i + "#";
                    tdEle.width = "20";
                    tdEle.valign = "top";
                    tdEle.align = "left";
                    eles[i - 1].querySelector("tr").prepend(tdEle);
                }

                Tools.SetContentCenterAndLarge(ele)
                Tools.MakeBackgroundWhite(ele)
            }
        }
    }

    class Weixin extends BasePattern {
        constructor() {
            super();
        }

        static IsMatch() {
            return window.location.href.search(/https:\/\/mp\.weixin\.qq\.com\/.*/) == 0;
        }

        autoProcessHtml() {

            let intervalCallBack = setInterval(_Simplify, 500);

            function _Simplify() {
                if (document.readyState != "complete") {
                    console.log("简化网页以存储：等待加载结束");
                    return;
                }
                clearInterval(intervalCallBack);

                let ele = document.querySelector(".rich_media_area_primary_inner");
                Tools.RemoveAllSiblings(ele);
                Tools.SetContentCenterAndLarge(ele);
                Tools.MakeBackgroundWhite(ele);

                let title = document.querySelector("#js_name").textContent;
                if (title.includes("土木吧")) {
                    let contentEle = document.querySelector("#js_content");
                    // 先删除前面的到包含“来源”的p元素
                    while (contentEle.firstElementChild.tagName.toLowerCase() != 'p' || !contentEle.firstElementChild.innerText.includes("来源")) {
                        contentEle.removeChild(contentEle.firstElementChild);
                    }
                }
            }
        }
    }

    // 根据各种特征判断当前网页符合哪个Pattern
    function matchAutoPattern() {
        let classes = [CSDNPattern1, CnblogPattern1, JuejinPattern1, CodeProject, ZhihuDaily, ZhihuZhuanlan, EastMoney, V2EX, Weixin, WuAiPoJie];
        for (let i = 0; i < classes.length; i++) {
            const patternClass = classes[i];
            if (patternClass.IsMatch()) {
                return new patternClass();
            }
        }

        return undefined;
    }

    // 高亮选中文字
    function highLight() {
        var dr = window.getSelection().getRangeAt(0);
        var span = document.createElement("span");
        span.style.cssText = "background-color:#f4ff00";
        dr.surroundContents(span);
    }


    class DomOutLine {
        constructor(options) {
            this.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            this.pub = {};
            this.self = {
                opts: {
                    namespace: options.namespace || 'DomOutLine' + this.id,
                    borderWidth: options.borderWidth || 2,
                    onClick: options.onClick || false,
                    onStop: options.onStop || false,
                    filter: options.filter || false,
                    clickThenStop: options.clickThenStop != undefined ? options.clickThenStop : true,
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
            this.updateOutlinePositionHandler = this._updateOutlinePosition.bind(this);
            this.stopOnEscapeHandler = this._stopOnEscape.bind(this);
            this.onClickHandler = this.onClick.bind(this);
        }


        _writeStylesheet(css) {
            let element = document.createElement('style');
            element.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(element);

            if (element.styleSheet) {
                element.styleSheet.cssText = css; // IE
            } else {
                element.innerHTML = css; // Non-IE
            }
        }

        _initStylesheet() {
            if (this.self.initialized !== true) {
                let css = '' +
                    '.' + this.self.opts.namespace + ' {' +
                    '    background: #09c;' +
                    '    position: absolute;' +
                    '    z-index: 1000000;' +
                    '    opacity: 0.3;' +
                    '}' +
                    '.' + this.self.opts.namespace + '_label {' +
                    '    background: #09c;' +
                    '    border-radius: 2px;' +
                    '    color: #fff;' +
                    '    font: bold 12px/12px Helvetica, sans-serif;' +
                    '    padding: 4px 6px;' +
                    '    position: absolute;' +
                    '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                    '    z-index: 1000001;' +
                    '}';

                this._writeStylesheet(css);
                this.self.initialized = true;
            }
        }

        _createOutlineElements() {
            this.self.elements.label = jQuery('<div></div>').addClass(this.self.opts.namespace + '_label').appendTo('body');
            //this.self.elements.top = jQuery('<div></div>').addClass(this.self.opts.namespace).appendTo('body');
            //this.self.elements.bottom = jQuery('<div></div>').addClass(this.self.opts.namespace).appendTo('body');
            //this.self.elements.left = jQuery('<div></div>').addClass(this.self.opts.namespace).appendTo('body');
            //this.self.elements.right = jQuery('<div></div>').addClass(this.self.opts.namespace).appendTo('body');
            this.self.elements.body = jQuery('<div></div>').addClass(this.self.opts.namespace).appendTo('body');
        }

        _removeOutlineElements() {
            jQuery.each(this.self.elements, function (name, element) {
                element.remove();
            });
        }

        _compileLabelText(element, width, height) {
            let label = element.tagName.toLowerCase();
            if (element.id) {
                label += '#' + element.id;
            }
            if (element.className) {
                label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
            }
            return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
        }

        _getScrollTop() {
            if (!this.self.elements.window) {
                this.self.elements.window = jQuery(window);
            }
            return this.self.elements.window.scrollTop();
        }

        _updateOutlinePosition(e) {

            this.pub.element = undefined;
            this.pub.lastElement = undefined;
            let q = document.elementsFromPoint(e.clientX, e.clientY);
            for (let index = 0; index < q.length; index++) {
                if (typeof q[index].className == 'string' && q[index].className.indexOf(this.self.opts.namespace) == -1) {
                    this.pub.element = q[index];
                    break;
                }
            }
            if (this.pub.element === undefined) return;
            if (this.self.opts.filter) {
                if (!jQuery(this.pub.element).is(this.self.opts.filter)) {
                    return;
                }
            }
            //pub.element = e.target;
            this._drawSelectedElem();
        }

        _drawSelectedElem() {
            let b = this.self.opts.borderWidth;
            let scroll_top = this._getScrollTop();
            let pos = this.pub.element.getBoundingClientRect();
            let top = pos.top + scroll_top;

            let label_text = this._compileLabelText(this.pub.element, pos.width, pos.height);
            let label_top = Math.max(0, top - 20 - b, scroll_top);
            let label_left = Math.max(0, pos.left - b);

            this.self.elements.label.css({
                top: label_top,
                left: label_left
            }).text(label_text);
            this.self.elements.body.css({
                top: top - b,
                left: pos.left,
                width: pos.width,
                height: pos.height
            });
        }

        _stopOnEscape(e) {
            if (e.keyCode === this.self.keyCodes.ESC || e.keyCode === this.self.keyCodes.BACKSPACE || e.keyCode === this.self.keyCodes.DELETE) {
                this._stop();
                this.self.opts.onStop();
            }

            return false;
        }

        _stop() {
            this.self.active = false;
            this._removeOutlineElements();
            document.body.removeEventListener('mousemove', this.updateOutlinePositionHandler);
            document.body.removeEventListener('keyup', this.stopOnEscapeHandler);
            if (this.self.opts.onClick) {
                document.body.removeEventListener('click', this.onClickHandler);
            }
        };

        selectParent() {
            if (this.pub.element !== undefined && this.pub.element !== null) {
                this.pub.lastElement = this.pub.element;
                this.pub.element = this.pub.element.parentElement;
                this._drawSelectedElem();
            }
        }

        selectChild() {
            if (this.pub.lastElement !== undefined) {
                this.pub.element = this.pub.lastElement;
                this.pub.lastElement = undefined;
                this._drawSelectedElem();
                return;
            }
            if (this.pub.element !== undefined && this.pub.element.childElementCount > 0) {
                this.pub.element = this.pub.element.children[0];
                this._drawSelectedElem();
            }
        }

        onClick(e, bStop = true) {
            if (this.self.opts.filter) {
                if (!jQuery(e.target).is(this.self.opts.filter)) {
                    return false;
                }
            }
            e.preventDefault();
            if (this.self.opts.clickThenStop == true) this._stop();
            this.self.opts.onClick(this.pub.element);

            return false;
        }

        start() {
            this._initStylesheet();
            if (this.self.active !== true) {
                this.self.active = true;
                this._createOutlineElements();

                document.body.addEventListener('mousemove', this.updateOutlinePositionHandler);
                document.body.addEventListener('keyup', this.stopOnEscapeHandler);
                if (this.self.opts.onClick) {
                    document.body.addEventListener('click', this.onClickHandler);
                }
            }
        }
    }

    // 简化选中元素
    function simplifyElem(el) {
        let myDomOutline = new DomOutLine({
            onClick: (ele) => {
                Tools.RemoveAllSiblings(ele);
                Tools.SetContentCenterAndLarge(ele);
                Tools.MakeBackgroundWhite(ele);
                hotkeys.deleteScope('simplifyElemHotkey');
            },
            clickThenStop: true,
        });
        hotkeys('up,down,enter', 'simplifyElemHotkey', function (event, handler) {
            event.preventDefault();
            switch (handler.key) {
                case "up":
                    myDomOutline.selectParent();
                    break;
                case "down":
                    myDomOutline.selectChild();
                    break;
                case "enter":
                    myDomOutline.onClick(event);
                    break;
            }
        });
        hotkeys.setScope('simplifyElemHotkey');

        // Start outline:
        myDomOutline.start();
    }
    // 删除选中元素
    function deleteElem() {

        let myDomOutline = new DomOutLine({
            onClick: (ele) => {
                ele.remove();
            },
            onStop: (ele) => {
                hotkeys.deleteScope('deleteElemHotkey');
            },
            clickThenStop: false,
        });

        hotkeys('up,down,enter', 'deleteElemHotkey', function (event, handler) {
            event.preventDefault();
            switch (handler.key) {
                case "up":
                    myDomOutline.selectParent();
                    break;
                case "down":
                    myDomOutline.selectChild();
                    break;
                case "enter":
                    myDomOutline.onClick(event);
                    break;
            }
        });
        hotkeys.setScope('deleteElemHotkey');
        myDomOutline.start();
    }

    // 延迟，靠手动点击快捷键触发简化页面
    function delayAutoSimplifyElem() {
        let classes = [WuAiPoJie, SMZDM];
        for (let i = 0; i < classes.length; i++) {
            const patternClass = classes[i];
            if (patternClass.IsMatch()) {
                new patternClass().manualProcessHtml();
            }
        }
    }

    // 这个特性需要和插件SmartToc配合，它负责添加toc，脚本负责在singleFile保存的本地html中添加js
    function addTocJumpScript() {
        const script = document.createElement("script");
        script.textContent = `
  let tocEle = document.querySelector('#smarttoc');
  if (tocEle != undefined) {
    addEventListener('click', function(e){
      let ele = e.target;
      if (ele.hasAttribute('data-index')){
        let targetEle = document.querySelector('[data-id="heading-' + ele.getAttribute('data-index') + '"]');
        if (targetEle!=undefined)   targetEle.scrollIntoView();
      }
  })}
  `;
        document.body.appendChild(script);
    }

    // 编辑网页
    function editHtml() {
        let isEditingHtml = "true";
        document.body.contentEditable = isEditingHtml;
        let handler = function (e) {
            if (e.key == "Escape") {
                document.body.contentEditable = "false";
                document.removeEventListener("keyup", handler);
            }
        };
        document.addEventListener("keyup", handler)
    }

    // 基本流程
    let pattern = matchAutoPattern();
    if (pattern) pattern.autoProcessHtml();


    // 注册键盘消息
    hotkeys('alt+q,alt+w,alt+a,alt+s,alt+x,ctrl+`', 'all', function (event, handler) {
        switch (handler.key) {
            case "alt+q":
                simplifyElem();
                break;
            case "alt+w":
                deleteElem();
                break;
            case "alt+a":
                delayAutoSimplifyElem();
                break;
            case "alt+s":
                addTocJumpScript();
                break;
            case "alt+x":
                editHtml();
                break;
            case "ctrl+`":
                highLight();
                break;
        }
    });

}());
