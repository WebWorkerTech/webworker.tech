import { defineClientConfig } from "@vuepress/client";
import { addIcons } from "oh-vue-icons";
import {
  FaFortAwesome,
  FaSatelliteDish,
  FaTag,
  OiRocket,
  RiLinkM,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiFacebookBoxFill,
  RiTwitterFill,
  RiZhihuLine,
  HiMail,
  FaPaw,
  AiCv,
  AiGoogleScholarSquare,
} from "oh-vue-icons/icons";
import { onMounted } from "vue";
import { useScriptTag } from "@vueuse/core";

addIcons(
  FaFortAwesome,
  FaSatelliteDish,
  FaTag,
  OiRocket,
  RiLinkM,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiFacebookBoxFill,
  RiTwitterFill,
  RiZhihuLine,
  HiMail,
  FaPaw,
  AiCv,
  AiGoogleScholarSquare
);

const fetchSign = async (url = "") => {
  //  使用 fetch post https://api.webworker.tech/wechat-ww-config
  // body.url = url
  console.log("url", url);
  const res = await fetch("https://api.webworker.tech/wechat-ww-config", {
    method: "POST",
    body: JSON.stringify({ url }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data;
};

export default defineClientConfig({
  enhance(ctx) {
    // 每次 router 变化后重新获取 api
    // ctx.router.beforeEach(async (to, from) => {
    //   console.log("onRouteChange", to, from);
    //   if (to.fullPath === from.fullPath) return;
    //   const url = location.origin + to.fullPath;
    //   const res = await fetchSign(url);
    //   console.log(window.wx);
    //   // const url =
    //   // ctx.siteData.themeConfig.api = getApi(to.path);
    // });
  },
  setup() {
    useScriptTag(
      "/sdk/jweixin-1.6.0.js",
      // on script tag loaded.
      async (el) => {
        const url = location.href.split("#")[0];
        const res = await fetchSign(url);
        console.log("res", res);

        if (res.status) {
          wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: res.data.appId, // 必填，公众号的唯一标识
            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
            signature: res.data.signature, // 必填，签名
            jsApiList: ["updateAppMessageShareData", "updateTimelineShareData"], // 必填，需要使用的JS接口列表
          });
          wx.ready(function () {
            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
            console.log("wx.ready ready");
            wx.checkJsApi({
              jsApiList: [
                "updateAppMessageShareData",
                "updateTimelineShareData",
              ], // 需要检测的JS接口列表，所有JS接口列表见附录2,
              success: function (res) {
                // 以键值对的形式返回，可用的api值true，不可用为false
                // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                console.log("checkJsApi res", res);
              },
            });

            wx.updateAppMessageShareData({
              title: "自定义标题", // 分享标题
              desc: "自定义描述", // 分享描述
              link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: "/img/logo-650.png", // 分享图标
              success: function () {
                // 设置成功
                console.log("注册");
              },
              fail: function (err) {
                console.log("注册失败", err);
              },
            });

            wx.updateTimelineShareData({
              title: "自定义标题2", // 分享标题
              link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: "/img/logo-650.png", // 分享图标
              success: function () {
                // 设置成功
                // 设置成功
                console.log("设置朋友圈成功");
              },
            });
          });
          wx.error(function (res) {
            console.log("error", res);
          });
        }
      }
    );
  },
});
