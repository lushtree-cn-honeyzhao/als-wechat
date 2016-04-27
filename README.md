# als-wechat
Ionic App Base For 阿拉善智能监控-微信端
=================================


## 安装条件:

```bash
    node    v0.12.5 
    npm     v2.11.2 
    git
    注意:配好上面三条命令的环境变量
```
可以使用淘宝镜像: http://npm.taobao.org/

## 安装

```bash
安装完成后，进入项目根目录
```

### 1.安装项目工具依赖
```bash
$ npm install ./

注意:该命令执行完成后bower命令已经添加到环境变量中了
    如果没有自动添加，可以手动添加
    /home/cc/ev-wechat/node_modules/bower/bin/bower
```

### 2.安装js依赖

```bash
$ bower install ./
```


## 项目结构

### www目录下为需要部署的文件
```bash
www中css,img,js为项目我们开发页面引用的文件
www中lib为项目依赖js文件,在bower.json中配置,不需要手动更改
www中templates为angular模板文件
www/lib/ionicDoc为ionic项目源码,可以参考里面的demon
www/lib/ionic为我们的页面需要引用的ionic依赖
```

### www/js文件按照angular推荐的规范模块化需要的js文件，全部采用依赖注入方式


### www/index.html为首页入口

### nginx 配置

在nginx配置文件中找到 
```bash
    server {
        listen 80 default_server;
        	listen [::]:80 default_server ipv6only=on;
        
        	root /usr/share/nginx/html;
        	index index.html index.htm;
        
        	# Make site accessible from http://localhost/
        	server_name localhost;
            ........
    }
```
在server项中最后位置加入如下内容
```bash
    #访问http://localhost/EasyGrails/ 则转发到http://127.0.0.1:8080/EasyGrails/
    location /EasyGrails/ {
        proxy_pass http://127.0.0.1:8080/EasyGrails/;
    }
    #访问http://localhost/www/ 则到/home/cc/ev-wechat/www/目录下寻找首页索引文件
    location /www/ {
        root /home/cc/ev-wechat/;       #定义服务器的默认网站根目录位置
        index index.html index.htm;     #定义首页索引文件的名称
    }
```

注意：grails服务器已经安装了跨域访问支持，故以上配置可以省略，直接在
```bash
.....
.constant('ENV',{api:'http://www.ev-easy.com/ev-manager', callCenterTel:'400-100-1001'})
.....
```
 中配置api的url即可访问

#Angular学习资料:

    1.w3c                    http://www.runoob.com/angularjs/angularjs-tutorial.html
    2.慕课网angularjs         http://www.imooc.com/learn/156
    3.angularJs官方文档       http://docs.angularjs.cn/api/
    4.ionic官方文档           http://ionicframework.com/docs/
    4.ionic快速开发工具        http://creator.ionic.io/


#Angular风格指南:
========

    见项目根目录风格指南《Angular风格指南.md》
    https://github.com/johnpapa/angular-styleguide/blob/master/i18n/zh-CN.md


#开发规范(试行):
========

##1.www/modules中为项目模块，每个模块规定目录结构为：
        modules/modulesName/css 
        modules/modulesName/img 
        modules/modulesName/js
      其中：js下面有按照功能分类的文件
        animations.js  app.js  controllers.js  directives.js  filters.js  router.js  services.js
      如果文件较大，将文件变成文件夹，比如将controllers.js变为文件夹controllers
      内部文件可能为：
        listCtrl.js  topCtrl.js  headerCtrl.js
    
##2.www下的css,img,js文件为全局文件内容，项目打包时会将www/modules文件合并到全局文件中
    

##3.路由暂时到全局router.js文件中配置

    因为state('tabs.messagelist')中点号有特殊用途，所以模块定义中的点号在此处改为下划线
    比如angular.module('app.login', ['app.login.forget','app.login.forget','app.login.reset'])
    要跳转到app.login.forget则写为 state('app_login_forget')

##4.controller,service,directive等的定义全部采用依赖注入的写法,方便解除耦和部署时js压缩




        $provide.provider('myDate', {
            $get: function() {
              return new Date();
            }
        });
        //可以写成
        $provide.factory('myDate', function(){
            return new Date();
        });
        //可以写成
        $provide.service('myDate', Date);
        
        
## 微信域名映射到本机例子


本机nginx配置

        location /EasyGrails/ {
                proxy_pass http://127.0.0.1:8080/EasyGrails/;
        }
        location /ev-wechat2/www/ev-manager/ {
                proxy_pass http://127.0.0.1:8080/EasyGrails/;
        }
        location /ev-wechat2/www/ {
                root /home/cc/;
                index index.html index.htm;
                allow all;
        }

本机ssh连接shell文件

        #!/bin/bash
        autossh -M 6678 -NR 12345:localhost:80 -p 52406 evmanager@101.200.173.221
        # ssh -NR 12345:localhost:80 -p 52406 evmanager@101.200.173.221

对应服务端配置
        
        location /ev-manager/wechat/test/ {
                proxy_pass http://127.0.0.1:12345/ev-wechat2/www/;
        }

## 在url中配置ENV环境变量
      
比如:      
http://ev-easy.com/ev-manager/wechat/test/?debug=true&clientId=cc&api=http://ev-easy.com/ev-manager/wechat/test/ev-manager/


## 项目部署

根目录下运行 
        gulp
会生成 
        dist文件夹
将该项目拷贝到正式服务器上即可使用 
        
