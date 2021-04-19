# react-native-intersection-observer

react-native-intersection-observer is a React Native implementation of [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). An easier way to detect "View" exposure in complex application.

English | [中文](https://github.com/gtbl2012/react-native-intersection-observer/blob/main/README_CN.md)

## Installation

```sh
npm install rn-intersection-observer
```

## Usage

### Target view

```tsx
<IntersectionObserverView
    scope="YourOwnScope"
    thresholds={[0.8]}
    onIntersectionChange={onTagIntersectionChange}
>
 {/* your own view */}
</IntersectionObserverView>
```

### Trigger detection from React Native

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

### Trigger detection from Native (Android example)

```java
getReactApplicationContext()
  .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
  .emit("IntersectionObeserverEvent", { scope: 'YourOwnScope' });
```

## License

MIT
