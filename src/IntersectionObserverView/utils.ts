import isEqual from 'lodash/isEqual';
import {
  kDefaultRootMargin,
  kDefaultThresholds,
  RootMargin,
} from '../IntersectionObserver';

export interface IntersectionObserverRequiredProps {
  scope: string;
  rootMargin?: RootMargin;
  thresholds?: Array<number>;
  throttle?: number;
}

export function compareProps(
  prevProps: IntersectionObserverRequiredProps,
  newProps: IntersectionObserverRequiredProps,
) {
  const isSameScope = prevProps.scope === newProps.scope;
  const isSameThrottle = prevProps.throttle === newProps.throttle;
  const prevRootMargin = prevProps.rootMargin || kDefaultRootMargin;
  const newRootMargin = newProps.rootMargin || kDefaultRootMargin;
  const isSameRootMargin = isEqual(prevRootMargin, newRootMargin);
  const prevThresholds = prevProps.thresholds || kDefaultThresholds;
  const newThresholds = newProps.thresholds || kDefaultThresholds;
  const isSameThresholds = isEqual(prevThresholds, newThresholds);
  return isSameScope && isSameThrottle && isSameRootMargin && isSameThresholds;
}

export default {
  compareProps,
};
