import {
  DeviceEventEmitter,
  EmitterSubscription,
  HostComponent,
  Dimensions,
} from 'react-native';
import throttle from 'lodash/throttle';
import { getLastMatchedThreshold, getMedian } from './utils';

export type IElementRef = React.ElementRef<HostComponent<unknown>> | null;

export type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
) => void;

// 距离屏幕四边的距离
export interface RootMargin {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// 对象四边所在位置
export interface BoundingClientRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface IntersectionObserverOptions {
  rootMargin?: RootMargin;
  thresholds?: Array<number>;
  throttle?: number;
}

export interface IntersectionObserverEntry {
  boundingClientRect: BoundingClientRect;
  intersectionRatio: number;
  intersectionRect: BoundingClientRect;
  target: IElementRef;
  isInsecting: boolean;
}

export interface EmitterEventHandlerParams {
  scope: string;
}

export const IntersectionObeserverEvent = 'IntersectionObeserverEvent';
export const kDefaultRootMargin = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
export const kDefaultThresholds = [0];
export const kDefaultThrottle = 300;

class IntersectionObserver {
  public scope: string; // 优化，设置scope以进行单独measure

  public rootMargin: RootMargin;

  public thresholds: Array<number>;

  public callback: IntersectionObserverCallback;

  public throttle: number;

  private targets: Array<IElementRef> = [];

  private previousInsectionRatios: Map<IElementRef, number> = new Map(); // 前一次的相交比例，决定是否回调

  private emitterSubscription?: EmitterSubscription; // 事件监听器

  constructor(
    scope: string,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverOptions,
  ) {
    this.scope = scope;
    this.rootMargin = (options && options.rootMargin) || kDefaultRootMargin;
    this.thresholds = (options && options.thresholds) || kDefaultThresholds;
    this.throttle = (options && options.throttle) || kDefaultThrottle;
    this.thresholds.sort();
    this.callback = callback;
  }

  /**
   * 触发IntersectionObserver检测，通常在onScroll时机进行触发
   * @param scope
   * @param pageOffset 用于内嵌到原生界面的 RN 来计算最终的 pageX 和 pageY
   */
  static emitEvent = throttle(
    (scope: string, pageOffset: { x: number; y: number } = { x: 0, y: 0 }) => {
      DeviceEventEmitter.emit(IntersectionObeserverEvent, {
        scope,
        pageOffset,
      });
    },
    50,
  );

  /**
   * 开始监听指定元素
   * @param target 目标元素
   */
  public observe = (target: IElementRef) => {
    const index = this.targets.indexOf(target);
    if (index < 0) {
      this.targets.push(target);
      this.measureTarget(target).then((targetMeasureResult) => {
        this.callback([targetMeasureResult]);
        this.previousInsectionRatios.set(
          target,
          targetMeasureResult.intersectionRatio,
        );
      });
    }
    if (this.targets.length > 0) {
      this.emitterSubscription = DeviceEventEmitter.addListener(
        IntersectionObeserverEvent,
        throttle(this.handleEmitterEvent, this.throttle),
      );
    }
  };

  /**
   * 停止监听指定元素
   * @param target 目标元素
   */
  public unobserve = (target: IElementRef) => {
    const index = this.targets.indexOf(target);
    if (index >= 0) {
      this.targets.splice(index, 1);
    }
    if (this.targets.length <= 0) {
      this.emitterSubscription?.remove();
      // globalExistingIntersectionObserver -= 1;
    }
  };

  private measureTarget = (
    target: IElementRef,
  ): Promise<IntersectionObserverEntry> => {
    return new Promise<IntersectionObserverEntry>((resolve) => {
      target?.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          const boundingClientRect = {
            left: x,
            top: y,
            right: x + width,
            bottom: y + height,
          };
          const {
            intersectionRatio,
            intersectionRect,
          } = this.measureIntersection(boundingClientRect);
          const isInsecting = this.isInsecting(intersectionRatio);
          const targetMeasureResult = {
            boundingClientRect,
            intersectionRatio,
            intersectionRect,
            target,
            isInsecting,
          };
          resolve(targetMeasureResult);
        },
      );
    });
  };

  private handleEmitterEvent = (params: EmitterEventHandlerParams) => {
    if (
      params.scope &&
      params.scope.length &&
      this.scope &&
      this.scope.length &&
      params.scope !== this.scope
    ) {
      return;
    }

    const measureTasks = this.targets.map((target) => {
      return this.measureTarget(target);
    });

    Promise.all(measureTasks).then((measureResults) => {
      const needReportEntries = measureResults.filter((measureResult) => {
        const previousRatio = this.previousInsectionRatios.get(
          measureResult.target,
        );
        return this.needReportIntersection(
          measureResult.intersectionRatio,
          previousRatio,
        );
      });
      measureResults.forEach((measureResult) => {
        this.previousInsectionRatios.set(
          measureResult.target,
          measureResult.intersectionRatio,
        );
      });
      if (needReportEntries && needReportEntries.length > 0) {
        this.callback(needReportEntries);
      }
    });
  };

  isInsecting = (intersectionRatio: number) => {
    const minIntersectionThreshold = Math.max(Math.min(...this.thresholds), 0);
    return intersectionRatio >= minIntersectionThreshold;
  };

  needReportIntersection = (ratio: number, previousRatio = 0) => {
    if (this.isInsecting(ratio) !== this.isInsecting(previousRatio)) {
      return true;
    }
    return (
      getLastMatchedThreshold(ratio, this.thresholds) !==
      getLastMatchedThreshold(previousRatio, this.thresholds)
    );
  };

  measureIntersection = (boundingClientRect: BoundingClientRect) => {
    const window = Dimensions.get('window');
    const pageHeight = window.height;
    const pageWidth = window.width;

    // 计算屏幕可见区域
    const displayAreaTop = this.rootMargin.top;
    const displayAreaBottom = pageHeight - this.rootMargin.bottom;
    const displayAreaLeft = this.rootMargin.left;
    const displayAreaRight = pageWidth - this.rootMargin.right;

    // 计算目标元素可视区域
    const visibleTop = getMedian(
      displayAreaTop,
      displayAreaBottom,
      boundingClientRect.top,
    );
    const visibleBottom = getMedian(
      displayAreaTop,
      displayAreaBottom,
      boundingClientRect.bottom,
    );
    const visibleLeft = getMedian(
      displayAreaLeft,
      displayAreaRight,
      boundingClientRect.left,
    );
    const visibleRight = getMedian(
      displayAreaLeft,
      displayAreaRight,
      boundingClientRect.right,
    );

    // 计算两个区域的面积
    const itemArea =
      (boundingClientRect.bottom - boundingClientRect.top) *
      (boundingClientRect.right - boundingClientRect.left);
    const visibleArea =
      (visibleBottom - visibleTop) * (visibleRight - visibleLeft);

    const intersectionRect = {
      top: visibleTop,
      bottom: displayAreaBottom,
      left: visibleLeft,
      right: displayAreaRight,
    };
    const intersectionRatio = itemArea ? visibleArea / itemArea : 0;
    const intersectionRatioRound = Math.round(intersectionRatio * 100) / 100;
    return {
      intersectionRect,
      intersectionRatio: intersectionRatioRound,
    };
  };
}

export default IntersectionObserver;
