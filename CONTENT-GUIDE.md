# 一曼生日网站 · 文字编辑地图

绝大多数正文都在 `index.html`，互动过程中才出现的文字在 `script.js`。样式文件 `style.css` 和粒子文件 `particle-scene.js` 通常不需要改文字。

> 推荐操作：先备份文件，再用编辑器的 `Ctrl + F` 搜索下表中的“定位关键词”。只修改标签中间的文字，不要删除 `<p>`、`<span>`、`<br />` 等标签。

## 1. 入口

| 要修改的内容 | 文件 | 定位关键词 |
| --- | --- | --- |
| 输入框提示 `Enter your Key` | `index.html` | `placeholder="Enter your Key"` |
| 按钮文字 `Enter` | `index.html` | `<button type="submit">Enter</button>` |
| 真正的口令 | `script.js` | `const ACCESS_CODE` |

入口的错误反馈目前依靠轻微抖动，不显示额外文字。

## 2. 上海建筑首页

| 要修改的内容 | 文件 | 定位关键词 |
| --- | --- | --- |
| `Happy Birthday，` | `index.html` | `Happy Birthday，` |
| `一曼` | `index.html` | `<strong>一曼</strong>` |

标题下面的郁金香图片是 `assets/images/particle-tulip-bouquet-v1.png`；右侧建筑图片是 `assets/images/shanghai-skyline-four-handdrawn-v1.png`。

## 3. 篮球互动与篮球故事

| 要修改的内容 | 文件 | 定位关键词 |
| --- | --- | --- |
| 初始提示 `穿上你的球衣` | `index.html` | `id="court-instruction"` |
| 球衣号码 `6` | `index.html` | `class="jersey__number"` |
| 进球后的标题 `关于篮球` | `index.html` | `<h2>关于篮球</h2>` |
| 进球后的篮球正文 | `index.html` | `你对篮球的热爱与Passion` |
| 点击球衣后的提示 `把球投进篮筐` | `script.js` | `把球投进篮筐` |

以后修改篮球故事时，主要编辑 `court-story__copy` 这个区域；可以继续增删段落，但每一段都需要使用 `<p>……</p>`。

## 4. 安安互动页

| 要修改的内容 | 文件 | 定位关键词 |
| --- | --- | --- |
| 页面标题 `安安的数字分身` | `index.html` | `安安的数字分身` |
| 安安介绍 | `index.html` | `这是安安的数字分身` |
| 气泡背面的生日祝福 | `index.html` | `安安祝一曼生日快乐` |
| 第一次、第二次摸猫回应 | `script.js` | `showAnanBubble("喵")` |
| 玩具拒绝、喂食长叫声 | `script.js` | `安安现在不想玩` |
| 左侧操作提示 | `script.js` | `ananHint.textContent` |

安安图片文件是 `assets/images/anan-digital-avatar-v1.png`。

## 5. 新一岁祝福

| 要修改的内容 | 文件 | 定位关键词 |
| --- | --- | --- |
| 大标题 `希望新的一岁——` | `index.html` | `希望新的一岁——` |
| 五条祝福 | `index.html` | `class="wish-lines"` |
| 右下角结尾句 | `index.html` | `class="wishes__ending"` |

保留每一条前面的 `<span>01</span>` 编号即可，例如：

```html
<p class="reveal"><span>01</span> 在这里改成新的祝福</p>
```

## 6. 信封前的文字与最终信件

| 要修改的内容 | 文件 | 定位关键词 |
| --- | --- | --- |
| 信封页标题与说明 | `index.html` | `最后，还有一些话` |
| 信封上的英文 | `index.html` | `FOR YIMAN` |
| 打开按钮文字 | `index.html` | `打开信封` |
| 信件日期 | `index.html` | `letter-sheet__date` |
| 称呼 `亲爱的1man：` | `index.html` | `letter-sheet__salutation` |
| 信件正文 | `index.html` | `class="letter-body"` |
| 网站制作附记 | `index.html` | `class="letter-postscript"` |

修改信件正文时，可以在 `letter-body` 里面继续增删普通段落：

```html
<div class="letter-body">
  <p>第一段正文……</p>
  <p>第二段正文……</p>
  <p>第三段正文……</p>
</div>
```

## 7. 最后一页

| 要修改的内容 | 文件 | 定位关键词 |
| --- | --- | --- |
| `摸一下再走` | `index.html` | `摸一下再走` |
| 每次摸猫轮换出现的句子 | `script.js` | `const endingMessages` |

修改轮换句子时，保留双引号、逗号和数组外侧的方括号：

```js
const endingMessages = [
  "第一句反馈。",
  "第二句反馈。",
  "第三句反馈。",
];
```

## 8. 浏览器标签与页脚

| 要修改的内容 | 文件 | 定位关键词 |
| --- | --- | --- |
| 浏览器标签标题 | `index.html` | `<title>一曼，生日快乐</title>` |
| 网页简介 | `index.html` | `name="description"` |
| 页脚两行英文 | `index.html` | `YIMAN · BIRTHDAY PROTOTYPE 01` |

## 修改后如何检查

1. 保存文件。
2. 刷新浏览器；如果内容没有变化，使用 `Ctrl + F5` 强制刷新。
3. 从入口重新走一遍相关互动。
4. 如果页面突然空白，优先检查刚修改的 HTML 标签、JavaScript 引号和每行末尾的逗号。
