import React, { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';
import IntersectionObserver, {
  IntersectionObserverEntry,
  RootMargin,
} from '../IntersectionObserver';
import { compareProps, IntersectionObserverRequiredProps } from './utils';

interface IntersectionObserverViewProps extends ViewProps {
  scope: string;
  rootMargin?: RootMargin;
  thresholds?: Array<number>;
  throttle?: number; // 相交检测间隔
  onIntersectionChange?: (entry: IntersectionObserverEntry) => void;
}

class IntersectionObserverView extends React.PureComponent<
  PropsWithChildren<IntersectionObserverViewProps>,
  any
> {
  observeTargetRef: React.RefObject<View>;

  intersectionObserver: IntersectionObserver;

  mounted: boolean;

  constructor(props: IntersectionObserverViewProps) {
    super(props);
    const { rootMargin, thresholds, throttle, scope } = props;
    this.observeTargetRef = React.createRef();
    this.intersectionObserver = this.createIntersectionObserver({
      rootMargin,
      thresholds,
      throttle,
      scope,
    });
    this.mounted = false;
  }

  componentDidMount() {
    this.intersectionObserver.observe(this.observeTargetRef.current);
    this.mounted = true;
  }

  componentDidUpdate(prevProps: IntersectionObserverViewProps) {
    if (!compareProps(prevProps, this.props)) {
      // 优化: observe参数有实际变更，才进行重新创建
      if (this.mounted) {
        this.intersectionObserver.unobserve(this.observeTargetRef.current);
      }
      const { rootMargin, thresholds, throttle, scope } = this.props;
      this.intersectionObserver = this.createIntersectionObserver({
        rootMargin,
        thresholds,
        throttle,
        scope,
      });
      if (this.mounted) {
        this.intersectionObserver.observe(this.observeTargetRef.current);
      }
    }
  }

  componentWillUnmount() {
    this.intersectionObserver.unobserve(this.observeTargetRef.current);
    this.mounted = false;
  }

  // 回调
  intersectionHandler = (entries: IntersectionObserverEntry[]) => {
    const { onIntersectionChange } = this.props;
    if (!onIntersectionChange) {
      return;
    }
    entries.forEach((entry) => {
      onIntersectionChange(entry);
    });
  };

  createIntersectionObserver(
    intersectionObserverProps: IntersectionObserverRequiredProps,
  ) {
    const {
      rootMargin,
      thresholds,
      throttle,
      scope,
    } = intersectionObserverProps;
    return new IntersectionObserver(scope, this.intersectionHandler, {
      rootMargin,
      thresholds,
      throttle,
    });
  }

  render() {
    const { children } = this.props;
    return (
      <View ref={this.observeTargetRef} collapsable={false} {...this.props}>
        {children}
      </View>
    );
  }
}

export default IntersectionObserverView;
