export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  let propertyToMonitor = ""; // 变量用于存储输入框值

  // 监听来自前端页面的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "startMonitoring") {
      propertyToMonitor = message.property;
      console.log("Received property to monitor:", propertyToMonitor);
    }
  });

  // 监听标签页更新事件
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
      console.log("Tab updated", tabId);
      console.log("页面加载完毕, 要监听的值为: ", propertyToMonitor);
      browser.scripting
        .executeScript({
          target: { tabId: tabId },
          func: (property: string) => {
            let internalValue: any;
            const handler = {
              get: (target: any, prop: string) => {
                if (prop === property) {
                  console.log(`Getting window.${property}`);
                  return internalValue;
                }
                return Reflect.get(target, prop);
              },
              set: (target: any, prop: string, value: any) => {
                if (prop === property) {
                  console.debug(`Setting window.${property} to`, value);
                  internalValue = value;
                  return true;
                }
                return Reflect.set(target, prop, value);
              },
            };

            (window as any)[property] = "initial"; // 初始化变量以确保 Proxy 正常工作
            window = new Proxy(window, handler);
            console.log(`Hook set for window.${property}`);
          },
          args: [propertyToMonitor],
        })
        .then(() => {
          console.log("Content script injected.");
        })
        .catch((err) => {
          console.error("Error injecting content script:", err);
        });
    }
  });
});
