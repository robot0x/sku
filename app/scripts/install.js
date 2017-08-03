(function() {
  var a = function(b) {
    if (typeof b == "object") {
      return b;
    }
    return document.querySelector(b);
  };
  (function(c) {
    function b(w) {
      var m = (this.os = {}),
        x = (this.browser = {}),
        e = w.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
        y = w.match(/(Android);?[\s\/]+([\d.]+)?/),
        z = !!w.match(/\(Macintosh\; Intel /),
        q = w.match(/(iPad).*OS\s([\d_]+)/),
        k = w.match(/(iPod)(.*OS\s([\d_]+))?/),
        h = !q && w.match(/(iPhone\sOS)\s([\d_]+)/),
        d = w.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        s = d && w.match(/TouchPad/),
        j = w.match(/Kindle\/([\d.]+)/),
        v = w.match(/Silk\/([\d._]+)/),
        r = w.match(/(BlackBerry).*Version\/([\d.]+)/),
        o = w.match(/(BB10).*Version\/([\d.]+)/),
        f = w.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
        p = w.match(/PlayBook/),
        u = w.match(/Chrome\/([\d.]+)/) || w.match(/CriOS\/([\d.]+)/),
        l = w.match(/Firefox\/([\d.]+)/),
        t =
          w.match(/MSIE\s([\d.]+)/) ||
          w.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
        g = !u && w.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
        n =
          g ||
          w.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/);
      if ((x.webkit = !!e)) {
        x.version = e[1];
      }
      if (y) {
        (m.android = true), (m.version = y[2]);
      }
      if (h && !k) {
        (m.ios = m.iphone = true), (m.version = h[2].replace(/_/g, "."));
      }
      if (q) {
        (m.ios = m.ipad = true), (m.version = q[2].replace(/_/g, "."));
      }
      if (k) {
        (m.ios = m.ipod = true), (m.version = k[3]
          ? k[3].replace(/_/g, ".")
          : null);
      }
      if (d) {
        (m.webos = true), (m.version = d[2]);
      }
      if (s) {
        m.touchpad = true;
      }
      if (r) {
        (m.blackberry = true), (m.version = r[2]);
      }
      if (o) {
        (m.bb10 = true), (m.version = o[2]);
      }
      if (f) {
        (m.rimtabletos = true), (m.version = f[2]);
      }
      if (p) {
        x.playbook = true;
      }
      if (j) {
        (m.kindle = true), (m.version = j[1]);
      }
      if (v) {
        (x.silk = true), (x.version = v[1]);
      }
      if (!v && m.android && w.match(/Kindle Fire/)) {
        x.silk = true;
      }
      if (u) {
        (x.chrome = true), (x.version = u[1]);
      }
      if (l) {
        (x.firefox = true), (x.version = l[1]);
      }
      if (t) {
        (x.ie = true), (x.version = t[1]);
      }
      if (n && (z || m.ios)) {
        x.safari = true;
        if (z) {
          x.version = n[1];
        }
      }
      if (g) {
        x.webview = true;
      }
      m.tablet = !!(q ||
        p ||
        (y && !w.match(/Mobile/)) ||
        (l && w.match(/Tablet/)) ||
        (t && !w.match(/Phone/) && w.match(/Touch/)));
      m.phone = !!(!m.tablet &&
        !m.ipod &&
        (y ||
          h ||
          d ||
          r ||
          o ||
          (u && w.match(/Android/)) ||
          (u && w.match(/CriOS\/([\d.]+)/)) ||
          (l && w.match(/Mobile/)) ||
          (t && w.match(/Touch/))));
    }
    if (!c.os || c.browser) {
      b.call(c, navigator.userAgent);
    }
  })(a);
  (function(c) {
    var f = (function() {
      var n = "//m.jd.com/download/downApp.html",
        q =
          "//union.m.jd.com/download/go.action?to=http%3A%2F%2Fitunes.apple.com%2Fcn%2Fapp%2Fid414245413&client=apple&unionId=12532&subunionId=m-top&key=e4dd45c0f480d8a08c4621b4fff5de74",
        e = "//3.cn/zKIUkC",
        r =
          "//a.app.qq.com/o/simple.jsp?pkgname=com.jingdong.app.mall&g_f=991850",
        p = "//3.cn/rP34ke";
      var m = "openApp.jdMobile://360buy?params=",
        h =
          "intent://m.jd.com/#Intent;scheme=openApp.jdMobile;package=com.jingdong.app.mall;end";

      function j(u) {
        return (
          "intent://m.jd.com/#Intent;scheme=" +
          u +
          ";package=com.jingdong.app.mall;end"
        );
      }

      function k() {
        var v = [];
        try {
          v.push('"m_param":' + MPing.EventSeries.getSeries());
        } catch (w) {
          v.push('"m_param":null');
        }
        var u = "{" + v.join(",") + "}";
        return m + u;
      }

      function t() {
        return c.os.ipad ? p : q;
      }

      function l(u, y) {
        var w = document.getElementsByTagName("script");
        for (i = 0; i < w.length; i++) {
          if (
            w[i].src && w[i].src.indexOf("/active/track/mping.min.js") != -1
          ) {
            y();
            return;
          }
        }
        var x = document.createElement("script");
        x.type = "text/javascript";
        x.src = u;
        x.onload = x.onreadystatechange = function() {
          if (this.readyState && this.readyState == "loading") {
            return;
          }
          y();
        };
        x.onerror = function() {
          v.removeChild(x);
          y();
        };
        var v = document.getElementsByTagName("head")[0];
        v.appendChild(x);
      }

      function g(v) {
        try {
          var w = new MPing.inputs.Click(v);
          w.event_param = "";
          var u = new MPing();
          u.send(w);
        } catch (x) {}
      }
      var o = navigator.userAgent.indexOf("MicroMessenger") >= 0;
      var s = function(y) {
        var B = null,
          v = function() {
            var D = document.createElement("iframe");
            D.style.cssText = "display:none;width:0px;height:0px;";
            document.body.appendChild(D);
            B = D;
          },
          C,
          u = c.browser.chrome,
          z = c.os.android,
          y = y || window;
        C = function() {
          if (!u) {
            v();
          }
        };
        var A = false;

        function w() {
          WeixinJSBridge.invoke(
            "getInstallState",
            {
              packageName: "com.jingdong.app.mall",
              packageUrl: "openApp.jdMobile://"
            },
            function(E) {
              var F = E.err_msg, D = 0;
              if (F.indexOf("get_install_state:yes") > -1) {
                A = true;
              }
            }
          );
        }
        if (o) {
          if (window.WeixinJSBridge && WeixinJSBridge.invoke) {
            w();
          } else {
            document.addEventListener("WeixinJSBridgeReady", w, !1);
          }
        }
        var x = {
          redirect: function(D, E) {
            if (u) {
              if (z) {
                if (E) {
                  if (E.indexOf("openapp.jdebook") >= 0) {
                    y.location.href = E || D;
                  } else {
                    y.location.href = j(E);
                  }
                } else {
                  y.location.href = h;
                }
              } else {
                y.location.href = E || D;
              }
            } else {
              B && (B.src = E || k());
            }
          },
          download: function(G, E) {
            var F = this, D = Date.now();
            if (G && D - G < F.time + 200) {
              if (z) {
                window.location.href = E || n;
                return;
              }
              if (E && E.indexOf("downApp.html") >= 0) {
                E = t();
              }
              window.location.href = E || t();
            }
          },
          timeout: null,
          time: 300,
          install: function(E, G) {
            if (o) {
              if (A) {
                y.location.href = G || k();
              } else {
                if (E && ~E.indexOf("downApp.html")) {
                  E = r;
                }
                location.href = E || r;
              }
              return;
            }
            if (c.os.ipad) {
              x.redirect(p, p);
              return;
            }
            var F = this, D = Date.now();
            if ((!c.os.ios && !c.os.android) || (!c.os.ipod && !c.os.phone)) {
              y.location.href = E || n;
              return;
            }
            F.timeout ||
              (F.timeout = setTimeout(function() {
                F.timeout = null;
                F.download(D, E);
              }, F.time));
            F.redirect(E, G);
          }
        };
        C();
        return x;
      };
      return function(B, A) {
        l("//h5.m.jd.com/active/track/mping.min.js", function() {});
        var x = c(B);
        x = x[0] || x;
        var z, y, u, w, v = s(window);
        y = function() {
          var C = x;
          var G = C.querySelector("#openJD"),
            D = C.querySelector(".openJD"),
            F = C.querySelector(".close-btn");
          var E = function(K, J, H, I) {
            K.addEventListener(J, H, false, !!I);
          };
          G &&
            E(G, "click", function(H) {
              H.preventDefault();
              H.stopPropagation();
              g("MDownLoadFloat_OpenNow");
              v.install(G.href, G.getAttribute("app_href"));
            });
          D &&
            E(D, "click", function(H) {
              H.preventDefault();
              H.stopPropagation();
              g("MDownLoadFloat_OpenNow");
              v.install(D.href, D.getAttribute("app_href"));
            });
          F &&
            E(F, "click", function(H) {
              H.preventDefault();
              H.stopPropagation();
              g("MDownLoadFloat_Close");
              localStorage.downCloseDate = Date.now();
              u();
            });
        };
        u = function() {
          x.style.display = "none";
          x = null;
        };
        z = function(D) {
          if (!window.JDClient && !window._clientVersion_) {
            var C = Date.now();
            if (
              localStorage.downCloseDate &&
              C - parseInt(localStorage.downCloseDate) < 86400000 &&
              D
            ) {
              return false;
            }
            x.style.display = "";
          }
          y();
        };
        z(A);
      };
    })();
    window.downcheck = f;
    try {
      var b = document.querySelector("#down_app");
      b && f(b, true);
    } catch (d) {}
  })(a);
})();
