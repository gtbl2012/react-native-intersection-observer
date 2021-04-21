# react-native-intersection-observer

react-native-intersection-observer基于Web场景下最流行的Intersection Observer API对measureInWindow进行封装，同时基于事件通知进行检测触发，实现了较为复杂的场景下组件曝光检测的能力。

[English](https://github.com/gtbl2012/react-native-intersection-observer/blob/main/README.md) | 中文

## 依赖

本组件基于以下依赖版本开发，同时可用于支持“measureInWindow”的低版本框架。

React >= 16.13.1

React-native >= 0.63.4

## 安装

```sh
npm install rn-intersection-observer
```

## 使用

### 需要被检测的对象

```tsx
import { IntersectionObserverView } from 'rn-intersection-observer';

// ...

<IntersectionObserverView
    scope="YourOwnScope"
    thresholds={[0.8]}
    onIntersectionChange={onTagIntersectionChange}
>
 {/* your own view */}
</IntersectionObserverView>
```

### 从React Native触发检测

```tsx
import { IntersectionObserver } from 'rn-intersection-observer';

// ...

const onScroll = useCallback(
    (event) => {
        IntersectionObserver.emitEvent('YourOwnScope');
    },
    [],
);

return (
    <ScrollView onScroll={onScroll}>
        {/* Scroll view contains IntersectionObserverView */}
    </ScrollView>
);
```

### 从原生触发检测(Android)

```java
getReactApplicationContext()
  .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
  .emit("IntersectionObeserverEvent", { scope: 'YourOwnScope' });
```

## 参数说明

### 1) IntersectionObserver / IntersectionObserverView

| 参数名 | 类型 | 含义 |
| :----- | :--- | :--- |
| scope | string | 当前View所属场景，用于触发时区分 |
| [rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin) | {top: number, left: number, bottom: number, right: number} | 触发区域距离屏幕四边的距离 |
| [thresholds](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds) | number[] | 相交阈值，当相交比例达到设定值时触发回调 |
| throttle | number | 触发检测的时间间隔(ms) |


### 2) 回调函数

回调函数函数的回调值是一个由所有在本次回调命中了阈值的View，数组的每一个元素结构如下：

| 回调参数名 | 类型 | 含义 |
| :----- | :--- | :--- |
| [boundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) | {top: number, left: number, bottom: number, right: number} | 元素四边位置 |
| intersectionRatio | number | 相交比例 |
| intersectionRect | {top: number, left: number, bottom: number, right: number} | 相交区域四边位置 |
| target | Ref | 触发元素的Ref |
| isInsecting | boolean | 是否大于任意一个相交阈值 |

注：使用IntersectionObserverView时由于只有单个View，回调只有单个Entry。

## 相关文章

[一种适用于复杂场景下React Native组件曝光检测的方案](https://tech.weread.qq.com/exposure-detection-on-complex-react-native/)

## License

MIT
