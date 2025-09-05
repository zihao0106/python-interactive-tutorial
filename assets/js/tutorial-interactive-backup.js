// 教程页面交互式代码执行器
let pyodide = null;
let pyodideReady = false;

// 初始化Pyodide
async function initTutorialPyodide() {
    if (pyodideReady) return;
    
    try {
        console.log('正在加载Python环境...');
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
        const statusElement = document.getElementById('python-status');
        if (statusElement) {
            statusElement.textContent = '✅ Python环境就绪';
        }
        
        // 更新所有运行按钮状态
        const runButtons = document.querySelectorAll('.run-code-btn');
        runButtons.forEach(btn => {
            btn.disabled = false;
            btn.textContent = '▶️ 运行代码';
        });
        
    } catch (error) {
        console.error('Python环境加载失败:', error);
    }
}

// 运行代码块
async function runCodeBlock(button) {
    if (!pyodideReady) {
        await initTutorialPyodide();
    }
    
    const codeBlock = button.closest('.code-container').querySelector('code');
    const code = codeBlock.textContent;
    
    // 创建或找到输出区域
    let outputDiv = button.closest('.code-container').querySelector('.code-output');
    if (!outputDiv) {
        outputDiv = document.createElement('div');
        outputDiv.className = 'code-output';
        outputDiv.style.cssText = `
            background: #1e1e1e;
            color: #fff;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            padding: 15px;
            border-radius: 0 0 8px 8px;
            margin-top: 0;
            white-space: pre-wrap;
            border: 1px solid #ddd;
            border-top: none;
        `;
        button.closest('.code-container').appendChild(outputDiv);
    }
    
    try {
        button.disabled = true;
        button.textContent = '⏳ 运行中...';
        
        // 重定向输出
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
        outputDiv.textContent = `[${timestamp}] 运行完成:\n${output || '(无输出)'}`;
        outputDiv.style.color = '#fff';
        
    } catch (error) {
        const timestamp = new Date().toLocaleTimeString();
        outputDiv.textContent = `[${timestamp}] 运行错误:\n${error.message}`;
        outputDiv.style.color = '#ff6b6b';
    } finally {
        button.disabled = false;
        button.textContent = '▶️ 运行代码';
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 为所有可执行代码块添加运行按钮
    const executableBlocks = document.querySelectorAll('[data-executable="true"]');
    
    executableBlocks.forEach(block => {
        // 创建容器
        const container = document.createElement('div');
        container.className = 'code-container';
        block.parentNode.insertBefore(container, block);
        container.appendChild(block);
        
        // 添加运行按钮
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            background: #f8f9fa;
            padding: 8px 15px;
            border: 1px solid #ddd;
            border-bottom: none;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const runButton = document.createElement('button');
        runButton.className = 'btn btn-success btn-sm run-code-btn';
        runButton.textContent = '⏳ 加载中...';
        runButton.disabled = true;
        runButton.onclick = () => runCodeBlock(runButton);
        
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
            });
        };
        
        buttonContainer.appendChild(runButton);
        buttonContainer.appendChild(copyButton);
        
        container.insertBefore(buttonContainer, block);
        
        // 调整代码块样式
        block.style.borderRadius = '0 0 8px 8px';
        block.style.marginTop = '0';
    });
    
    // 自动初始化Python环境
    initTutorialPyodide();
});
