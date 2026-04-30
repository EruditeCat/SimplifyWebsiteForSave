// ==UserScript==
// @name         SelectionSearch助手
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  把SelectionSearch选择的文字通过消息发过来，再做精细化的处理
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // 监听 Selection Search 发来的消息
    window.addEventListener("message", function(event) {
        if (!event.data || event.data.type !== "SelectionSearch_AI") return;

        openAiQueryDialog(event.data.text);
    });


    function openAiQueryDialog(initialText) {

        const modal = document.createElement('div');
        modal.id = 'rss_ai_query_modal';
        modal.style.cssText = `
position: fixed;
inset: 0;
background: rgba(0, 0, 0, 0.35);
z-index: 10050;
display: flex;
align-items: center;
justify-content: center;
`;

        const panel = document.createElement('div');
        panel.style.cssText = `
background: #fff;
border-radius: 10px;
box-shadow: 0 8px 24px rgba(0,0,0,0.2);
width: 640px;
max-width: calc(100vw - 40px);
padding: 14px 14px 12px 14px;
font-size: 14px;
`;

        const textarea = document.createElement('textarea');
        textarea.value = initialText || '';
        textarea.style.cssText = `
width: 100%;
height: 160px;
resize: vertical;
box-sizing: border-box;
border: 1px solid #ddd;
border-radius: 8px;
padding: 10px;
outline: none;
`;

        const row = document.createElement('div');
        row.style.cssText = `
display: flex;
gap: 10px;
margin-top: 10px;
align-items: center;
justify-content: flex-end;
`;

        const serviceSelect = document.createElement('select');
        serviceSelect.style.cssText = `
border: 1px solid #ddd;
border-radius: 8px;
padding: 6px 10px;
`;

        const services = [
            { label: 'GoogleAI', urlTemplate: 'https://www.google.com/search?q=%s&udm=50&csuir=1' },
            { label: 'ChatGPT', urlTemplate: 'https://chatgpt.com/?model=auto&q=%s' },
            { label: '千问', urlTemplate: 'https://www.qianwen.com/?q=%s' },
            { label: 'Grok', urlTemplate: 'https://grok.com/?q=%s' },
            { label: 'Perplexity', urlTemplate: 'https://www.perplexity.ai/?q=%s' },
        ];
        services.forEach((s) => {
            const opt = document.createElement('option');
            opt.value = s.urlTemplate;
            opt.textContent = s.label;
            serviceSelect.appendChild(opt);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
border: 1px solid #ddd;
border-radius: 8px;
padding: 6px 12px;
background: #fff;
cursor: pointer;
`;

        const goBtn = document.createElement('button');
        goBtn.textContent = '查询';
        goBtn.style.cssText = `
border: 1px solid #2d6cdf;
border-radius: 8px;
padding: 6px 12px;
background: #2d6cdf;
color: #fff;
cursor: pointer;
`;

        const submitQuery = () => {
            const query = (textarea.value || '').trim();
            const template = serviceSelect.value;
            const url = template.replace('%s', encodeURIComponent(query));
            window.open(url, '_blank', 'noopener,noreferrer');
            close(0);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                close();
                return;
            }
            if (e.ctrlKey && (e.key === 'Enter' || e.keyCode === 13)) {
                e.preventDefault();
                e.stopPropagation();
                submitQuery();
            }
        };

        const close = (focusDelayMs = 0) => {
            window.removeEventListener('keydown', onKeyDown, true);
            modal.remove();
        };

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
        });

        goBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            submitQuery();
        });

        modal.addEventListener('mousedown', (e) => {
            if (e.target === modal) close();
        });

        window.addEventListener('keydown', onKeyDown, true);

        row.appendChild(serviceSelect);
        row.appendChild(cancelBtn);
        row.appendChild(goBtn);
        panel.appendChild(textarea);
        panel.appendChild(row);
        modal.appendChild(panel);
        document.body.appendChild(modal);
        textarea.focus();
        const textLen = textarea.value.length;
        try {
            textarea.setSelectionRange(textLen, textLen);
        } catch (e) {}
        textarea.scrollTop = textarea.scrollHeight;
    }

})();
