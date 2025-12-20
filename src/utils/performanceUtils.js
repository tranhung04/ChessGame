/**
 * Performance Utilities
 * Helper functions for optimizing React Native performance
 */

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoize function results
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 */
export function memoize(func) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Batch state updates to minimize re-renders
 * @param {Function} callback - Callback with state updates
 * @returns {Promise} Promise that resolves after batch update
 */
export function batchUpdate(callback) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      callback();
      resolve();
    });
  });
}

/**
 * Lazy load component
 * @param {Function} importFunc - Dynamic import function
 * @returns {Object} Lazy component
 */
export function lazyLoad(importFunc) {
  return React.lazy(importFunc);
}

/**
 * Check if two objects are shallowly equal
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} True if equal
 */
export function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Deep compare two values
 * @param {*} val1 - First value
 * @param {*} val2 - Second value
 * @returns {boolean} True if equal
 */
export function deepEqual(val1, val2) {
  if (val1 === val2) {
    return true;
  }

  if (
    typeof val1 !== 'object' ||
    val1 === null ||
    typeof val2 !== 'object' ||
    val2 === null
  ) {
    return false;
  }

  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) {
      return false;
    }
    
    for (let i = 0; i < val1.length; i++) {
      if (!deepEqual(val1[i], val2[i])) {
        return false;
      }
    }
    
    return true;
  }

  const keys1 = Object.keys(val1);
  const keys2 = Object.keys(val2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!deepEqual(val1[key], val2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Create a custom comparison function for React.memo
 * @param {Array<string>} keys - Keys to compare
 * @returns {Function} Comparison function
 */
export function createMemoComparison(keys) {
  return (prevProps, nextProps) => {
    for (let key of keys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Measure component render time
 * @param {string} componentName - Component name
 * @returns {Function} Profiler callback
 */
export function measureRenderTime(componentName) {
  return (id, phase, actualDuration) => {
    if (actualDuration > 16) { // More than one frame (60fps)
      console.warn(
        `${componentName} ${phase} took ${actualDuration.toFixed(2)}ms`
      );
    }
  };
}

/**
 * Optimize image loading
 * @param {string} uri - Image URI
 * @param {Object} options - Optimization options
 * @returns {Object} Optimized image props
 */
export function optimizeImage(uri, options = {}) {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  // For local images, return as-is
  if (!uri.startsWith('http')) {
    return { uri };
  }

  // For remote images, add optimization parameters
  const url = new URL(uri);
  
  if (width) url.searchParams.set('w', width);
  if (height) url.searchParams.set('h', height);
  url.searchParams.set('q', quality);
  url.searchParams.set('fm', format);

  return {
    uri: url.toString(),
    cache: 'force-cache'
  };
}

/**
 * Virtualize list data
 * @param {Array} data - Full data array
 * @param {number} visibleRange - Number of visible items
 * @param {number} currentIndex - Current scroll index
 * @returns {Array} Virtualized data
 */
export function virtualizeData(data, visibleRange, currentIndex) {
  const start = Math.max(0, currentIndex - visibleRange);
  const end = Math.min(data.length, currentIndex + visibleRange * 2);
  
  return data.slice(start, end);
}

/**
 * Calculate optimal chunk size for large lists
 * @param {number} totalItems - Total number of items
 * @param {number} itemHeight - Height of each item
 * @param {number} screenHeight - Screen height
 * @returns {number} Optimal chunk size
 */
export function calculateChunkSize(totalItems, itemHeight, screenHeight) {
  const visibleItems = Math.ceil(screenHeight / itemHeight);
  const bufferMultiplier = 2; // Load 2x visible items
  
  return Math.min(totalItems, visibleItems * bufferMultiplier);
}

/**
 * Preload images
 * @param {Array<string>} imageUris - Array of image URIs
 * @returns {Promise} Promise that resolves when all images are loaded
 */
export async function preloadImages(imageUris) {
  const { Image } = require('react-native');
  
  const promises = imageUris.map(uri => {
    return Image.prefetch(uri);
  });
  
  return Promise.all(promises);
}

/**
 * Clear memory cache
 */
export function clearMemoryCache() {
  // Clear any in-memory caches
  if (global.gc) {
    global.gc();
  }
}

/**
 * Monitor memory usage
 * @returns {Object} Memory usage info
 */
export function getMemoryUsage() {
  if (global.performance && global.performance.memory) {
    return {
      usedJSHeapSize: global.performance.memory.usedJSHeapSize,
      totalJSHeapSize: global.performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: global.performance.memory.jsHeapSizeLimit
    };
  }
  
  return null;
}

/**
 * Optimize FlatList props
 * @param {Object} options - Optimization options
 * @returns {Object} Optimized FlatList props
 */
export function optimizeFlatList(options = {}) {
  const {
    itemHeight = 100,
    screenHeight = 800
  } = options;

  return {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: Math.ceil(screenHeight / itemHeight),
    windowSize: 5,
    getItemLayout: (data, index) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index
    })
  };
}
