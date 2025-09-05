// 教程页面交互式代码执行器
let pyodide = null;
let pyodideReady = false;

// 初始化Pyodide
async function initTutorialPyodide() {
    if (pyodideReady) return;
    
    try {
        console.log('正在加载Python环境...');
        
        // 更新状态显示
        const statusElement = document.getElementById('python-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="alert alert-info">
                    <strong>Python 环境状态：</strong> 正在加载 Python 环境，请稍候...
                </div>
            `;
        }
        
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        
        // 配置输出重定向
        pyodide.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.outputs = []
    
    def write(self, text):
        self.outputs.append(text)
    
    def flush(self):
        pass
    
    def get_output(self):
        result = ''.join(self.outputs)
        self.outputs = []
        return result

output_capture = OutputCapture()

# 简单的input模拟
def input(prompt=""):
    print(f"{prompt}[模拟输入: 用户]")
    return "用户"
`);
        
        pyodideReady = true;
        console.log('Python环境加载完成');
        
        // 更新状态显示
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="alert alert-success">
                    <strong>Python 环境状态：</strong> ✅ Python环境就绪
                </div>
            `;
        }
        
        // 启用所有运行按钮
        const runButtons = document.querySelectorAll('.run-code-btn');
        runButtons.forEach(button => {
            button.disabled = false;
            button.textContent = '▶️ 运行代码';
        });
        
    } catch (error) {
        console.error('Python环境加载失败:', error);
        pyodideReady = false;
        
        const statusElement = document.getElementById('python-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Python 环境状态：</strong> ❌ 加载失败，请刷新页面重试
                </div>
            `;
        }
    }
}

// 执行代码块
async function runCodeBlock(button) {
    if (!pyodideReady || !pyodide) {
        alert('Python环境还未准备好，请稍等片刻后再试');
        return;
    }

    // 找到对应的代码块
    const container = button.closest('.code-container') || button.parentElement.parentElement;
    const codeBlock = container.querySelector('pre[data-executable="true"] code') || 
                     container.querySelector('code');
    
    if (!codeBlock) {
        alert('找不到要执行的代码');
        return;
    }

    const code = codeBlock.textContent || codeBlock.innerText;
    
    // 查找或创建输出区域
    let outputDiv = container.querySelector('.code-output');
    if (!outputDiv) {
        outputDiv = document.createElement('div');
        outputDiv.className = 'code-output mt-2 p-3 bg-dark text-light rounded';
        outputDiv.style.fontFamily = 'monospace';
        outputDiv.style.whiteSpace = 'pre-wrap';
        outputDiv.style.maxHeight = '300px';
        outputDiv.style.overflowY = 'auto';
        container.appendChild(outputDiv);
    }

    // 禁用按钮并显示运行状态
    button.disabled = true;
    button.textContent = '🔄 运行中...';
    outputDiv.textContent = '正在运行代码...';
    outputDiv.style.color = '#ffffff';

    try {
        console.log('执行代码:', code);
        
        // 重定向输出到我们的捕获器
        pyodide.runPython(`
sys.stdout = output_capture
sys.stderr = output_capture
`);
        
        // 运行用户代码
        pyodide.runPython(code);
        
        // 获取输出
        const output = pyodide.runPython('output_capture.get_output()');
        
        // 恢复标准输出
        pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
        
        // 显示结果
        const timestamp = new Date().toLocaleTimeString();
        if (output.trim()) {
            outputDiv.textContent = `[${timestamp}] 运行完成:\n${output}`;
        } else {
            outputDiv.textContent = `[${timestamp}] 运行完成 (无输出)`;
        }
        outputDiv.style.color = '#ffffff';
        
    } catch (error) {
        console.error('代码执行错误:', error);
        const timestamp = new Date().toLocaleTimeString();
        outputDiv.textContent = `[${timestamp}] 运行错误:\n${error.message}`;
        outputDiv.style.color = '#ff6b6b';
    } finally {
        button.disabled = false;
        button.textContent = '▶️ 运行代码';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('开始初始化教程页面...');
    
    // 为所有可执行代码块添加运行按钮
    const executableBlocks = document.querySelectorAll('[data-executable="true"]');
    console.log(`找到 ${executableBlocks.length} 个可执行代码块`);
    
    executableBlocks.forEach((block, index) => {
        console.log(`处理第 ${index + 1} 个代码块`);
        
        // 创建容器
        const container = document.createElement('div');
        container.className = 'code-container mb-3';
        block.parentNode.insertBefore(container, block);
        container.appendChild(block);
        
        // 添加运行按钮和复制按钮
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'd-flex justify-content-between align-items-center mb-2';
        buttonContainer.style.cssText = `
            background: #f8f9fa;
            padding: 8px 15px;
            border: 1px solid #ddd;
            border-bottom: none;
            border-radius: 8px 8px 0 0;
        `;
        
        // 运行按钮
        const runButton = document.createElement('button');
        runButton.className = 'btn btn-success btn-sm run-code-btn';
        runButton.textContent = '⏳ 加载中...';
        runButton.disabled = true;
        runButton.onclick = () => runCodeBlock(runButton);
        
        // 复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'btn btn-outline-secondary btn-sm';
        copyButton.textContent = '📋 复制';
        copyButton.onclick = () => {
            const code = block.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = '✅ 已复制';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            }).catch(() => {
                // 降级方案
                const textarea = document.createElement('textarea');
                textarea.value = code;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                const originalText = copyButton.textContent;
                copyButton.textContent = '✅ 已复制';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            });
        };
        
        buttonContainer.appendChild(runButton);
        buttonContainer.appendChild(copyButton);
        
        container.insertBefore(buttonContainer, block);
        
        // 调整代码块样式
        block.style.borderRadius = '0 0 8px 8px';
        block.style.marginTop = '0';
        block.style.border = '1px solid #ddd';
        block.style.borderTop = 'none';
    });
    
    // 初始化Python环境
    console.log('开始初始化Python环境...');
    initTutorialPyodide();
});
