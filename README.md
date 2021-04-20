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

### Trigger detection from React Native

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

### Trigger detection from Native (Android example)

```java
getReactApplicationContext()
  .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
  .emit("IntersectionObeserverEvent", { scope: 'YourOwnScope' });
```

## Props & Params

### 1) IntersectionObserver / IntersectionObserverView

| Props | Params Type | Description |
| :----- | :--- | :--- |
| scope | string | Scope of the target View, required in event trigger. |
| rootMargin | {top: number, left: number, bottom: number, right: number} | Distance from screen edge of detect area. |
| thresholds | number[] | Intersection ratios which should trigger intersection callbacks. |
| throttle | number | throttle time between each detection(ms). |


### 2) Intersection Callback (onIntersectionChange)

Callback parameters contained info of each target which triggered intersection callback：

| Params | Params Type | Description |
| :----- | :--- | :--- |
| boundingClientRect | {top: number, left: number, bottom: number, right: number} | Position of target View's edge. |
| intersectionRatio | number | Intersection ratio of target View in detect area |
| intersectionRect | {top: number, left: number, bottom: number, right: number} | Position of intersection area's edge. |
| target | Ref | Ref of target View |
| isInsecting | boolean | Determine current intersection ratio is larger than any threshold. |

PS：Different from IntersectionObserver, IntersectionObserverView provides single parameter.

## License

MIT
