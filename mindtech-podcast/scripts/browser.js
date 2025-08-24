// 获取最近订阅者
const subscribers = Array.from(
  document.querySelectorAll('img.css-n0uoul.e169k0uu11'),
)
  .map((i) => i.src)
  .splice(0, 7)
