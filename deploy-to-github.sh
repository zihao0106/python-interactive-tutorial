#!/bin/bash
# GitHub部署脚本
# 请将 yourusername 替换为你的GitHub用户名

echo "=== GitHub部署脚本 ==="
echo "1. 请先在GitHub上创建名为 'python-interactive-tutorial' 的仓库"
echo "2. 将下面的yourusername替换为你的GitHub用户名"
echo "3. 然后运行以下命令："
echo ""
echo "git remote add origin https://github.com/yourusername/python-interactive-tutorial.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "4. 启用GitHub Pages："
echo "   - 在GitHub仓库页面，点击Settings标签"
echo "   - 在左侧菜单找到Pages"
echo "   - 在Source下选择 'Deploy from a branch'"
echo "   - 选择branch: main，folder: / (root)"
echo "   - 点击Save"
echo ""
echo "5. 访问你的网站："
echo "   https://yourusername.github.io/python-interactive-tutorial"
