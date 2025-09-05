// ThebeLab 配置 - 使用Pyodide后端
const thebeConfig = {
    requestKernel: true,
    // 使用Pyodide作为后端，更稳定
    kernelOptions: {
        kernelName: "python",
        serverSettings: {
            baseUrl: "https://jupyterlite-pyodide-kernel.readthedocs.io/en/latest/_static/",
            // 或者使用本地Pyodide
            kernelType: "pyodide"
        }
    },
    codeMirrorConfig: {
        theme: "github-light",
        lineNumbers: true,
        readOnly: false
    },
    predefinedOutput: true,
    mountActivateWidget: true,
    mountStatusWidget: true,
    selector: "[data-executable]",
    // 添加错误处理
    errorHandler: function(error) {
        console.error("ThebeLab错误:", error);
    }
};

// 初始化 ThebeLab
function initThebelab() {
    console.log('开始初始化 ThebeLab...');
    
    // 检查 thebe 是否加载
    if (typeof thebe === 'undefined') {
        console.error('ThebeLab 未加载！请检查脚本是否正确引入。');
        alert('ThebeLab 库未加载，请刷新页面重试。');
        return;
    }
    
    console.log('ThebeLab 库已加载，配置信息:', thebeConfig);
    
    // 添加必要的属性到代码块
    const pythonBlocks = document.querySelectorAll('pre[data-executable="true"], pre code.language-python');
    console.log(`找到 ${pythonBlocks.length} 个Python代码块`);
    
    pythonBlocks.forEach((element, index) => {
        const pre = element.tagName === 'PRE' ? element : element.parentElement;
        
        // 检查是否已经初始化过
        if (pre.hasAttribute('data-thebe-initialized')) {
            console.log(`代码块 ${index + 1} 已经初始化过`);
            return;
        }
        
        pre.setAttribute('data-executable', 'true');
        pre.setAttribute('data-language', 'python');
        pre.setAttribute('data-thebe-initialized', 'true');
        
        // 添加运行按钮
        if (!pre.querySelector('.run-button')) {
            const runButton = document.createElement('button');
            runButton.className = 'btn btn-sm btn-primary run-button';
            runButton.innerHTML = '▶️ 运行代码';
            runButton.style.cssText = 'position: absolute; top: 5px; right: 5px; z-index: 10;';
            
            pre.style.position = 'relative';
            pre.appendChild(runButton);
        }
        
        console.log(`代码块 ${index + 1} 初始化完成`);
    });
    
    try {
        // 启动 ThebeLab
        console.log('正在启动 ThebeLab...');
        thebe.bootstrap(thebeConfig).then(() => {
            console.log('ThebeLab 初始化成功！');
            
            // 添加状态指示
            const button = document.getElementById('thebelab-button');
            if (button) {
                button.innerHTML = '✅ 交互模式已启用';
                button.classList.remove('btn-outline-light');
                button.classList.add('btn-success');
                button.disabled = false;
            }
        }).catch(error => {
            console.error('ThebeLab 启动失败:', error);
            alert('ThebeLab 启动失败: ' + error.message);
        });
    } catch (error) {
        console.error('ThebeLab 初始化失败:', error);
        alert('ThebeLab 初始化失败: ' + error.message);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
    
    // 首先增强代码块（添加复制按钮等）
    enhanceCodeBlocks();
    
    // 检查是否有启用按钮，如果有则等待用户点击
    const thebelabButton = document.getElementById('thebelab-button');
    if (thebelabButton) {
        console.log('找到ThebeLab启用按钮，等待用户点击');
        thebelabButton.addEventListener('click', function() {
            this.innerHTML = '🔄 正在启动...';
            this.disabled = true;

            // 延迟一点再初始化，让用户看到状态变化
            setTimeout(() => {
                initThebelab();
            }, 500);
        });
    } else {
        // 如果没有按钮，可能是在其他页面，暂时不自动初始化
        console.log('未找到启用按钮，如需自动启用请取消下行注释');
        // initThebelab();
    }
});

// 代码高亮和交互功能
function enhanceCodeBlocks() {
    document.querySelectorAll('pre code').forEach((block) => {
        const pre = block.parentElement;
        
        // 检查是否已经添加过复制按钮
        if (pre.querySelector('.copy-button')) {
            return;
        }
        
        // 添加复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'btn btn-sm btn-outline-secondary copy-button';
        copyButton.innerHTML = '📋';
        copyButton.title = '复制代码';
        
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(block.textContent).then(() => {
                this.innerHTML = '✅';
                setTimeout(() => {
                    this.innerHTML = '📋';
                }, 1500);
            }).catch(err => {
                console.error('复制失败:', err);
            });
        });
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
        
        // 调整按钮位置，避免与运行按钮冲突
        if (pre.querySelector('.run-button')) {
            copyButton.style.cssText = 'position: absolute; top: 5px; right: 80px; z-index: 10;';
        } else {
            copyButton.style.cssText = 'position: absolute; top: 5px; right: 40px; z-index: 10;';
        }
    });
}

document.addEventListener('DOMContentLoaded', enhanceCodeBlocks);