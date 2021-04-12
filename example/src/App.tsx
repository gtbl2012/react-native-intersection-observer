import React, { useCallback } from 'react';

import { Text, ScrollView } from 'react-native';
import {
  IntersectionObserver,
  IntersectionObserverView,
} from 'react-native-intersection-observer';

export default function App() {
  const onScroll = useCallback(() => {
    IntersectionObserver.emitEvent('example');
  }, []);

  const onIntersectionChange = useCallback((entry) => {
    console.log('onIntersectionChange', entry);
  }, []);

  return (
    <ScrollView onScroll={onScroll}>
      <IntersectionObserverView
        scope="example"
        thresholds={[0.5]}
        onIntersectionChange={onIntersectionChange}
      >
        <Text>Something you want to check exposure</Text>
      </IntersectionObserverView>
    </ScrollView>
  );
}
