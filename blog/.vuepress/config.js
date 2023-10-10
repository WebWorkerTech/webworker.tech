const { gungnirTheme: selfTheme } = require("vuepress-theme-gungnir");
const { viteBundler } = require("@vuepress/bundler-vite");

module.exports = {
  title: "Web Worker 播客 | 程序员学习笔记",
  description: "几个前端程序员闲聊的音频播客节目",

  head: [
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
    [
      "script",
      {},
      `var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?730d98883d647e81275c612f00bc58e2";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();`,
    ],
    // style css .link-item .content a .desc height 2em
    ["style", {}, ".link-item .content a .desc{height:2em}"],
    [
      "script",
      {
        src: "https://identity.netlify.com/v1/netlify-identity-widget.js",
      },
    ],
    [
      "scirpt",
      {},
      `if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }`,
    ],
  ],
  bundler: viteBundler(),
  plugins: [],

  theme: selfTheme({
    home: "/",

    docsDir: "blog",
    docsBranch: "master",
    logo: "/img/logo-650.png",
    repo: "WebWorkerFM/fm/",
    navbar: [
      {
        text: "首页",
        link: "/",
      },

      {
        text: "标签",
        link: "/tags/",
      },
      {
        text: "Web Worker 的朋友们",
        link: "/friends/",
      },

      {
        text: "小宇宙",
        link: "https://www.xiaoyuzhoufm.com/podcast/613753ef23c82a9a1ccfdf35",
      },
      {
        text: "RSS",
        link: "https://feed.xyzfm.space/rv449dl9kqka",
      },
    ],
    sidebar: {
      "/guide/": [
        {
          title: "Guide",
          collapsable: false,
          children: ["", "using-vue"],
        },
      ],
    },

    navbarTitle: "Web Worker",
    personalInfo: {
      name: "Web Worker 播客",
      avatar: "/img/logo-650.png",
      description: "几个前端程序员闲聊的音频播客节目",
      sns: {
        github: "WebWorkerFM",

        email: "Otto@webworker.tech",
        // 小宇宙: {
        //   icon: "",
        //   link: "",
        //   // iconScale?: number;
        // },
      },
    },
    homeHeaderImages: [
      {
        path: "/img/index.jpg",
        mask: "rgba(40, 57, 101, .5)",
      },
    ],
    pages: {
      tags: {
        // 可选：标签页副标题
        subtitle: "吼哇朋友们，这是标签页",
        // 可选：标签页封面图路径和蒙版
        bgImage: {
          path: "/img/index.jpg",
          mask: "rgba(211, 136, 37, .5)",
        },
      },
      friends: {
        // 可选：链接页副标题
        title: "Friends",
        subtitle: "Web Worker 的朋友们",

        // 可选：链接页封面图路径和蒙版
        bgImage: {
          path: "/img/index.jpg",
          mask: "rgba(64, 118, 190, 0.5)",
        },
      },
    },
    footer: `
      &copy; <a href="https://github.com/WebWorkerFM/fm" target="_blank">Web Worker</a> 2021-2022
      <a href="https://beian.miit.gov.cn/" target="_blank">京ICP备17060663号-3</a>
      <br>
      Powered by <a href="https://v2.vuepress.vuejs.org" target="_blank">VuePress</a> &
      <a href="https://github.com/Renovamen/vuepress-theme-gungnir" target="_blank">Gungnir</a>
    `,
  }),

  dest: "blog/dist",
  // plugins: ["@vuepress/plugin-back-to-top", "@vuepress/plugin-medium-zoom"],
};
