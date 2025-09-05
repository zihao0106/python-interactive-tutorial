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

# 智能的input模拟（支持游戏状态）
_input_counter = 0

def input(prompt=""):
    import re
    global _input_counter
    _input_counter += 1
    
    # 根据提示词判断期望的输入类型
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ['猜', 'guess', '输入数字']) and ('次' in prompt_lower):
        # 猜数字游戏 - 第一次猜对，避免循环
        if _input_counter == 1:
            result = "5"  # 第一次就猜中，结束游戏
        else:
            result = "3"  # 其他情况
        print(f"{prompt}[模拟输入: {result}]")
        return result
    elif any(word in prompt_lower for word in ['年龄', 'age', '数字', 'number', '整数', '多少', '几', '输入一个数']):
        # 期望数字输入
        result = "25"
        print(f"{prompt}[模拟输入: {result}]")
        return result
    elif any(word in prompt_lower for word in ['价格', 'price', '分数', 'score', '小数', '成绩']):
        # 期望小数输入
        result = "85.5"
        print(f"{prompt}[模拟输入: {result}]")
        return result
    elif any(word in prompt_lower for word in ['姓名', 'name', '名字', '叫什么']):
        # 期望姓名输入
        result = "小明"
        print(f"{prompt}[模拟输入: {result}]")
        return result
    elif any(word in prompt_lower for word in ['城市', 'city', '地址', '住哪']):
        # 期望城市输入
        result = "北京"
        print(f"{prompt}[模拟输入: {result}]")
        return result
    elif any(word in prompt_lower for word in ['密码', 'password', 'pwd']):
        # 期望密码输入
        result = "123456"
        print(f"{prompt}[模拟输入: {result}]")
        return result
    else:
        # 默认返回通用文本
        result = "用户输入"
        print(f"{prompt}[模拟输入: {result}]")
        return result
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
        
        // 启用所有运行按钮（包括两种类名）
        const runButtons = document.querySelectorAll('.run-code-btn, .run-code');
        runButtons.forEach(button => {
            button.disabled = false;
            button.textContent = '▶️ 运行代码';
            // 如果是现有的按钮，添加点击事件
            if (button.classList.contains('run-code')) {
                button.onclick = () => runExistingCodeBlock(button);
            }
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
        
        // 重置输入计数器
        pyodide.runPython('_input_counter = 0');
        
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

// 处理现有代码块的运行按钮
async function runExistingCodeBlock(button) {
    if (!pyodideReady || !pyodide) {
        alert('Python环境还未准备好，请稍等片刻后再试');
        return;
    }

    // 找到对应的代码块
    const codeExample = button.closest('.code-example');
    const codeBlock = codeExample ? codeExample.querySelector('pre code') : 
                     button.parentElement.parentElement.querySelector('pre code');
    
    if (!codeBlock) {
        alert('找不到要执行的代码');
        return;
    }

    const code = codeBlock.textContent || codeBlock.innerText;
    
    // 查找或创建输出区域
    const container = codeExample || button.parentElement.parentElement;
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
        
        // 重置输入计数器
        pyodide.runPython('_input_counter = 0');
        
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
