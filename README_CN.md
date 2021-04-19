# react-native-intersection-observer

react-native-intersection-observer基于Web场景下最流行的Intersection Observer API对measureInWindow进行封装，同时基于事件通知进行检测触发，实现了较为复杂的场景下组件曝光检测的能力。

[English](https://github.com/gtbl2012/react-native-intersection-observer/blob/main/README.md) | 中文

## Installation

```sh
npm install rn-intersection-observer
```

## Usage

### 需要被检测的对象

```tsx
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

## License

MIT
