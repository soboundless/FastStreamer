
// 监听全局未捕获错误
window.addEventListener('error', function (event) {
  // 过滤非关键错误（如资源加载失败）
  if (event.message.includes('Uncaught')) {
    window.location.href = 'page/Login.html?err=' + encodeURIComponent(event.message);
  }

  return false; // 阻止默认错误提示
});

// 监听未处理的Promise拒绝
window.addEventListener('unhandledrejection', function (event) {
  window.location.href = 'page/Login.html?err=' + encodeURIComponent(event.reason);
});
