console.show();
auto.waitFor();
console.setTitle("自动任务");
console.setPosition(device.width / 3, 0)
console.setSize(device.width / 3, device.height / 3)
var ham = hamibot.env
var InitialValue
var deletedfriends = []
var sended = []
var limited = []
//工具模块
//提取坐标中心
function getXy(obj) {
    if (obj == null) {
        return null;
    }
    var bounds = obj.bounds();
    return {
        centerX: (bounds.left + bounds.right) / 2,
        centerY: (bounds.top + bounds.bottom) / 2
    };
}
//点击坐标中心
function clickCenter(params) {
    var center = getXy(params);
    if (center == null) {
        console.log('没找到')
        return
    }
    click(center.centerX, center.centerY);
    console.log('点击坐标')
}
//直到能点击
function clickParentIfClickable(widget) {
    if (InitialValue == null) {
        InitialValue = widget
    }
    if (widget == null) {
        console.log('找不到');
        return;  // 终止递归的条件：如果 widget 是空值，则结束递归
    }
    if (widget.click()) {
        console.log('已点击');
        return;  // 点击控件
    }
    var parentWidget = widget.parent();  // 获取控件的父类
    if (parentWidget == null) {
        return clickCenter(InitialValue);
    }
    clickParentIfClickable(parentWidget);  // 递归调用自身，传入父类控件进行下一次查找和点击
}


//功能模块
//前往好友页面
function gowechatfriends(params) {
    launch('com.tencent.mm');
    clickParentIfClickable(text('通讯录').findOne())
    do {
        var friends = id('kbq').visibleToUser(true).find()
        friends.forEach(element => {
            deleted(element)
        });
        if (!textMatches(/\d+个朋友/).exists()) {
            swipe(getXy(friends[friends.length - 1]).centerX, getXy(friends[friends.length - 1]).centerY, getXy(friends[0]).centerX, getXy(friends[0]).centerY, 700)
        } else {
            break
        }
    } while (true);
    console.log(sended);
}
//检测好友
function deleted(params) {
    console.log('进入发消息');
    clickParentIfClickable(params)
    waitForActivity('com.tencent.mm.plugin.profile.ui.ContactInfoUI')
    if (!id("cff").exists()) {
        back()
        sleep(500)
        return
    }
    if (id("cff").findOne().text() == '微信号:  ' + ham.text_01) {
        sended.push(id("cff").findOne().text())
        back()
        sleep(500)
        return
    }
    if (sended.indexOf(id("cff").findOne().text()) != -1) {
        back()
        sleep(500)
        return
    }
    sended.push(id("cff").findOne().text())
    console.log('发消息');
    do {
        clickParentIfClickable(text('发消息').findOnce())
    } while (text('发消息').exists());
    console.log('更多功能按钮，已折叠');
    clickParentIfClickable(desc('更多功能按钮，已折叠').findOne())
    console.log('转账');
    do {
        clickCenter(text('转账').findOnce())
    } while (!text('添加转账说明').exists());
    id('pbn').findOne().setText('0.01')
    console.log();
    clickParentIfClickable(text('转账').findOne())
    text('微信支付').waitFor()
    while (text('微信支付').exists()) {
        sleep(1000);  // 等待一秒钟
    }
    if (text('我知道了').exists()) {
        if (text("你不是收款方好友，对方添加你为好友后才能发起转账").exists()) {
            console.log(params.text());
            deletedfriends.push(params.text())
        } else {
            limited.push(params.text())
        }
        clickParentIfClickable(text('我知道了').findOne())
    }
    //         for (let index = 0; index < 6; index++) {
    //             back()
    //             sleep(800)
    //         }
    do {
        back()
        sleep(400)
    } while (!id('kbq').visibleToUser(true).exists())

}
/**
 * 
 * @param {*} params 
 * //给被删除添加标签
// function addLabel(params) {
//     console.log('标签');
//     clickParentIfClickable(text('标签').findOne())
//     console.log('已删除好友');
//     clickParentIfClickable(text('已删除好友').findOne())
//     console.log('添加成员');
//     clickParentIfClickable(desc('添加成员').findOne())
//     var deletedLabel = id('odf').find()
//     console.log(deletedLabel);
//     deletedLabel.forEach(element => {
//         for (let index = 0; index < deletedfriends.length; index++) {
//             if (element.text() == deletedfriends[index]) {
//                 clickParentIfClickable(element)
//             }
//         }
//     });
//     clickParentIfClickable(text('完成').findOne())
//     clickParentIfClickable(text('保存').findOne())
//     back()
// }
 */
//给被删除、被限制备注
function remark(params) {
    var num = 0
    do {
        var friends = id('kbq').visibleToUser(true).find()
        friends.forEach(element => {
            if (deletedfriends.indexOf(element.text()) != -1) {
                num++
                clickParentIfClickable(element)
                do {
                    clickParentIfClickable(text('设置备注和标签').findOnce())
                } while (!text('添加标签').exists());
                clickParentIfClickable(id('cdk').findOne())
                id('cdb').findOne().setText('被删除-' + element.text())
                clickParentIfClickable(text('完成').findOne())
                text('发消息').waitFor()
                back()
                sleep(500)
            }
            if (limited.indexOf(element.text()) != -1) {
                num++
                clickParentIfClickable(element)
                do {
                    clickParentIfClickable(text('设置备注和标签').findOnce())
                } while (!text('添加标签').exists());
                clickParentIfClickable(id('cdk').findOne())
                id('cdb').findOne().setText('被限制-' + element.text())
                clickParentIfClickable(text('完成').findOne())
                text('发消息').waitFor()
                back()
                sleep(500)
            }
        });
        swipe(getXy(friends[0]).centerX, getXy(friends[0]).centerY, getXy(friends[friends.length - 1]).centerX, getXy(friends[friends.length - 1]).centerY, 700)
    } while (deletedfriends.length + limited.length != num);
}
gowechatfriends()
remark()
console.log('被删除' + deletedfriends);
console.log('被限制' + limited);
console.hide()
engines.stopAllAndToast()
