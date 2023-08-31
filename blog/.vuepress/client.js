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
    // if (!!window && !!document) {
    //   let _title = document.title.split(" | ")[0];
    //   if (_title.toLocaleLowerCase() === "home") {
    //     _title = "Web Worker 播客";
    //   }
    //   useScriptTag(
    //     "/sdk/jweixin-1.6.0.js",
    //     // on script tag loaded.
    //     async (el) => {
    //       const url = location.href.split("#")[0];
    //       const res = await fetchSign(url);
    //       console.log("res", res);
    //       if (res.status) {
    //         wx.config({
    //           // debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    //           appId: res.data.appId, // 必填，公众号的唯一标识
    //           timestamp: res.data.timestamp, // 必填，生成签名的时间戳
    //           nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
    //           signature: res.data.signature, // 必填，签名
    //           jsApiList: [
    //             "updateAppMessageShareData",
    //             "updateTimelineShareData",
    //             // "getNetworkType",
    //             "onMenuShareTimeline",
    //             "onMenuShareAppMessage",
    //           ], // 必填，需要使用的JS接口列表
    //         });
    //         wx.ready(function () {
    //           // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    //           console.log("wx.ready ready");
    //           wx.checkJsApi({
    //             jsApiList: [
    //               "updateAppMessageShareData",
    //               "updateTimelineShareData",
    //               "onMenuShareTimeline",
    //               "onMenuShareAppMessage",
    //               // "getNetworkType",
    //             ], // 需要检测的JS接口列表，所有JS接口列表见附录2,
    //             success(res) {
    //               // 以键值对的形式返回，可用的api值true，不可用为false
    //               // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
    //               console.log("checkJsApi res", res);
    //             },
    //             fail(err) {
    //               console.log("checkJsApi err", err);
    //             },
    //           });
    //           // wx.onMenuShareTimeline({
    //           //   title: _title, // 分享标题
    //           //   link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    //           //   imgUrl: location.origin + "/img/logo-650.png", // 分享图标
    //           //   success: function () {
    //           //     // console.log("注册");
    //           //   },
    //           // });
    //           // wx.onMenuShareAppMessage({
    //           //   title: _title, // 分享标题
    //           //   desc: "自定义描述", // 分享描述
    //           //   link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    //           //   imgUrl: location.origin + "/img/logo-650.png", // 分享图标
    //           //   type: "link", // 分享类型,music、video或link，不填默认为link
    //           //   dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
    //           //   success: function () {
    //           //     // 用户点击了分享后执行的回调函数
    //           //     // console.log("注册");
    //           //   },
    //           //   fail(err) {
    //           //     console.log("注册失败", err);
    //           //   },
    //           // });
    //           // wx.updateAppMessageShareData({
    //           //   title: "自定义标题", // 分享标题
    //           //   desc: "自定义描述", // 分享描述
    //           //   link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    //           //   imgUrl: location.origin + "/img/logo-650.png", // 分享图标
    //           //   success() {
    //           //     // 设置成功
    //           //     console.log("注册");
    //           //   },
    //           //   fail(err) {
    //           //     console.log("注册失败", err);
    //           //   },
    //           // });
    //           // wx.updateTimelineShareData({
    //           //   title: "自定义标题2", // 分享标题
    //           //   link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    //           //   imgUrl: location.origin + "/img/logo-650.png", // 分享图标
    //           //   success() {
    //           //     // 设置成功
    //           //     // 设置成功
    //           //     console.log("设置朋友圈成功");
    //           //   },
    //           //   fail(err) {
    //           //     console.log("注册失败", err);
    //           //   },
    //           // });
    //           // wx.getNetworkType({
    //           //   success(res) {
    //           //     var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
    //           //     console.log("networkType", networkType);
    //           //   },
    //           //   fail(err) {
    //           //     console.log("getNetworkType err", err);
    //           //   },
    //           // });
    //         });
    //         wx.error(function (res) {
    //           console.log("error", res);
    //         });
    //       }
    //     }
    //   );
    // }
  },
});
