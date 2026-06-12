import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress options
NProgress.configure({
  showSpinner: false,
  minimum: 0.15,
  speed: 300,
});

export function TopProgressBar({ trigger }: { trigger: any }) {
  useEffect(() => {
    // Start progress bar
    NProgress.start();

    // Schedule completion of progress bar
    const timer = setTimeout(() => {
      NProgress.done();
    }, 250);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [trigger]);

  return null;
}
