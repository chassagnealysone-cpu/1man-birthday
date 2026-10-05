# 背景音乐播放器

音乐：`assets/music/lovin-you.mp3`；封面：`assets/images/lovin-you-cover.jpg`。
HTML 结构在 `index.html` 的 `music-player` 区域，播放器不显示歌曲名或作者。
外观、黑胶旋转、贴边收起在 `music-player.css`。
播放、音量和自动播放回退在 `music-player.js`。本模块无需 Three.js 或 GSAP。

关键代码：
```js
audio.volume = .3; // 默认音量 30%
await audio.play(); // 请求播放，可能被浏览器拒绝
audio.pause(); // 手动暂停
player.classList.toggle('is-collapsed', collapsed); // 贴边收起
```
CSS 的 `animation-play-state` 让唱片暂停时停在当前角度，继续播放时接着旋转。
播放状态由音频事件同步；收起不会暂停。浏览器禁止自动有声播放时，首次点击或键盘输入会重试；手动暂停后不再自动重启。
系统选择减少动态效果时不旋转唱片。默认循环播放。
