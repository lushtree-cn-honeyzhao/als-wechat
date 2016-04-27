雪碧图使用规范
=================================

# 1.准备
www/img/sprite文件夹中,格式为png


# 2.制作
项目根目录运行命令
    gulp sprite
会在www/css中生成两个文件
    sprite.css
    sprite.png
    
如果机器上没有安装gulp,可以通知我制作好后提交
    
# 3.使用

Icon classes can be used entirely standalone. They are named after their original file names.

```html
<!-- `display: block` sprite -->
<div class="icon-home"></div>

<!-- `display: inline-block` sprite -->
<img class="icon-home" />
```