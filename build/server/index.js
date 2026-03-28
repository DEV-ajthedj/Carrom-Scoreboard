import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function meta({}) {
  return [{
    title: "CACA | Capital Area Carrom Association"
  }, {
    name: "description",
    content: "Official homepage of Capital Area Carrom Association with tournaments, rankings, and live scoreboard access."
  }];
}
const upcomingEvents = [{
  title: "Capital Spring Open 2026",
  date: "April 20, 2026",
  venue: "CACA Indoor Arena",
  format: "Singles + Doubles"
}, {
  title: "District Team Challenge",
  date: "May 12, 2026",
  venue: "City Sports Hall",
  format: "Team Knockout"
}, {
  title: "Junior Development Cup",
  date: "June 2, 2026",
  venue: "North Pavilion",
  format: "U-18 Development Series"
}];
const pastTournaments = [{
  title: "Winter Masters 2025",
  champion: "R. Sharma",
  runnersUp: "A. Patel",
  year: "2025"
}, {
  title: "Capital Invitational",
  champion: "K. Das",
  runnersUp: "S. Khan",
  year: "2025"
}, {
  title: "Monsoon League Finals",
  champion: "M. Roy",
  runnersUp: "P. Mehta",
  year: "2024"
}, {
  title: "CACA Club Championship",
  champion: "T. Fernandes",
  runnersUp: "D. Nair",
  year: "2024"
}];
const rankings = [{
  name: "R. Sharma",
  points: 1280,
  rank: 1
}, {
  name: "K. Das",
  points: 1215,
  rank: 2
}, {
  name: "A. Patel",
  points: 1172,
  rank: 3
}, {
  name: "S. Khan",
  points: 1139,
  rank: 4
}];
const galleryTiles = ["Final Board Moments", "Junior Coaching Camp", "Doubles Medal Ceremony", "Association Volunteers", "Regional League Night", "Practice Session Highlights"];
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsxs("main", {
    className: "caca-page",
    children: [/* @__PURE__ */ jsx("section", {
      className: "hero-shell",
      id: "top",
      children: /* @__PURE__ */ jsxs("div", {
        className: "mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8",
        children: [/* @__PURE__ */ jsxs("header", {
          className: "mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface)] px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-xs uppercase tracking-[0.28em] text-[var(--caca-ink-soft)]",
              children: "Carrom Association Portal"
            }), /* @__PURE__ */ jsx("p", {
              className: "font-display text-2xl leading-none text-[var(--caca-ink)]",
              children: "CACA"
            })]
          }), /* @__PURE__ */ jsxs("nav", {
            "aria-label": "Primary actions",
            className: "flex flex-wrap gap-2",
            children: [/* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-muted",
              href: "#auth",
              children: "Login"
            }), /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-muted",
              href: "#auth",
              children: "Signup"
            }), /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-secondary",
              href: "#upcoming-events",
              children: "Register Event"
            }), /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-primary",
              href: "#live-scoreboard",
              children: "View Live Scoreboard"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "fade-up max-w-3xl",
          children: [/* @__PURE__ */ jsx("p", {
            className: "mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--caca-accent)]",
            children: "Official Home"
          }), /* @__PURE__ */ jsx("h1", {
            className: "font-display text-6xl leading-none text-[var(--caca-ink)] sm:text-7xl md:text-8xl",
            children: "CACA"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-lg font-semibold text-[var(--caca-ink-soft)] sm:text-xl",
            children: "Capital Area Carrom Association"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-5 max-w-2xl text-base leading-relaxed text-[var(--caca-ink-soft)] sm:text-lg",
            children: "Advancing disciplined, competitive, and community-driven carrom across the capital region through structured tournaments, player development, and transparent rankings."
          }), /* @__PURE__ */ jsxs("div", {
            className: "mt-8 flex flex-wrap gap-3",
            children: [/* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-primary",
              href: "#live-scoreboard",
              children: "Open Scoreboard"
            }), /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-secondary",
              href: "#upcoming-events",
              children: "Register Tournament"
            }), /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-muted",
              href: "#contact",
              children: "Contact CACA"
            })]
          })]
        })]
      })
    }), /* @__PURE__ */ jsx("section", {
      className: "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16",
      id: "about",
      children: /* @__PURE__ */ jsxs("article", {
        className: "section-surface fade-up grid gap-8 p-6 md:grid-cols-[1.35fr_1fr] md:p-8",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "section-kicker",
            children: "About The Association"
          }), /* @__PURE__ */ jsx("h2", {
            className: "section-title",
            children: "A formal platform for competitive carrom"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 text-[var(--caca-ink-soft)]",
            children: "Capital Area Carrom Association (CACA) organizes sanctioned tournaments, supports player development pathways, and promotes fair play standards across clubs and independent athletes."
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 text-[var(--caca-ink-soft)]",
            children: "The association maintains structured fixtures, transparent standings, and a member-first ecosystem that encourages both elite performance and grassroots participation."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-5",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "text-sm font-semibold uppercase tracking-[0.2em] text-[var(--caca-ink-soft)]",
            children: "Association Focus"
          }), /* @__PURE__ */ jsxs("ul", {
            className: "mt-4 space-y-3 text-sm text-[var(--caca-ink-soft)] sm:text-base",
            children: [/* @__PURE__ */ jsx("li", {
              children: "Sanctioned tournaments and league standards"
            }), /* @__PURE__ */ jsx("li", {
              children: "Junior and open division development programs"
            }), /* @__PURE__ */ jsx("li", {
              children: "Transparent ranking methodology and player records"
            }), /* @__PURE__ */ jsx("li", {
              children: "City-wide community participation initiatives"
            })]
          })]
        })]
      })
    }), /* @__PURE__ */ jsxs("section", {
      className: "mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12",
      id: "upcoming-events",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-5 flex items-end justify-between gap-3",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "section-kicker",
            children: "Upcoming Tournaments"
          }), /* @__PURE__ */ jsx("h2", {
            className: "section-title",
            children: "Register for the next fixtures"
          })]
        }), /* @__PURE__ */ jsx("a", {
          className: "caca-btn caca-btn-secondary",
          href: "#upcoming-events",
          children: "Register"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "grid gap-4 md:grid-cols-3",
        children: upcomingEvents.map((event, index) => /* @__PURE__ */ jsxs("article", {
          className: "section-surface fade-up p-5",
          style: {
            animationDelay: `${index * 80}ms`
          },
          children: [/* @__PURE__ */ jsx("h3", {
            className: "text-xl font-semibold text-[var(--caca-ink)]",
            children: event.title
          }), /* @__PURE__ */ jsxs("p", {
            className: "mt-3 text-sm text-[var(--caca-ink-soft)]",
            children: ["Date: ", event.date]
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-sm text-[var(--caca-ink-soft)]",
            children: ["Venue: ", event.venue]
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-sm text-[var(--caca-ink-soft)]",
            children: ["Format: ", event.format]
          })]
        }, event.title))
      })]
    }), /* @__PURE__ */ jsxs("section", {
      className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-5",
        children: [/* @__PURE__ */ jsx("p", {
          className: "section-kicker",
          children: "Past Tournaments"
        }), /* @__PURE__ */ jsx("h2", {
          className: "section-title",
          children: "Recent championship records"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "section-surface overflow-hidden p-2 sm:p-3",
        children: /* @__PURE__ */ jsx("div", {
          className: "overflow-x-auto",
          children: /* @__PURE__ */ jsxs("table", {
            className: "min-w-full text-left text-sm text-[var(--caca-ink-soft)]",
            children: [/* @__PURE__ */ jsx("thead", {
              children: /* @__PURE__ */ jsxs("tr", {
                className: "border-b border-[var(--caca-border)] text-xs uppercase tracking-[0.18em] text-[var(--caca-ink)]",
                children: [/* @__PURE__ */ jsx("th", {
                  className: "px-4 py-3",
                  children: "Tournament"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-4 py-3",
                  children: "Champion"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-4 py-3",
                  children: "Runner-Up"
                }), /* @__PURE__ */ jsx("th", {
                  className: "px-4 py-3",
                  children: "Year"
                })]
              })
            }), /* @__PURE__ */ jsx("tbody", {
              children: pastTournaments.map((event) => /* @__PURE__ */ jsxs("tr", {
                className: "border-b border-[var(--caca-border)]/70",
                children: [/* @__PURE__ */ jsx("td", {
                  className: "px-4 py-3 font-medium text-[var(--caca-ink)]",
                  children: event.title
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-4 py-3",
                  children: event.champion
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-4 py-3",
                  children: event.runnersUp
                }), /* @__PURE__ */ jsx("td", {
                  className: "px-4 py-3",
                  children: event.year
                })]
              }, event.title))
            })]
          })
        })
      })]
    }), /* @__PURE__ */ jsxs("section", {
      className: "mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12",
      children: [/* @__PURE__ */ jsxs("article", {
        className: "section-surface fade-up p-6",
        id: "live-scoreboard",
        children: [/* @__PURE__ */ jsx("p", {
          className: "section-kicker",
          children: "Live Scoreboard Preview"
        }), /* @__PURE__ */ jsx("h2", {
          className: "section-title",
          children: "Match table snapshot"
        }), /* @__PURE__ */ jsxs("div", {
          className: "mt-5 rounded-xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-4",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-[var(--caca-ink-soft)]",
            children: "Board 1"
          }), /* @__PURE__ */ jsxs("p", {
            className: "mt-1 text-2xl font-semibold text-[var(--caca-ink)]",
            children: ["R. Sharma ", /* @__PURE__ */ jsx("span", {
              className: "text-[var(--caca-accent)]",
              children: "22"
            }), " - 18 A. Patel"]
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-sm text-[var(--caca-ink-soft)]",
            children: "Status: In progress (placeholder feed)"
          })]
        }), /* @__PURE__ */ jsx("a", {
          className: "caca-btn caca-btn-primary mt-6",
          href: "#live-scoreboard",
          children: "Open Full Scoreboard"
        })]
      }), /* @__PURE__ */ jsxs("article", {
        className: "section-surface fade-up p-6",
        children: [/* @__PURE__ */ jsx("p", {
          className: "section-kicker",
          children: "Rankings"
        }), /* @__PURE__ */ jsx("h2", {
          className: "section-title",
          children: "Top players leaderboard"
        }), /* @__PURE__ */ jsx("ol", {
          className: "mt-5 space-y-3",
          children: rankings.map((player) => /* @__PURE__ */ jsxs("li", {
            className: "flex items-center justify-between rounded-xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] px-4 py-3",
            children: [/* @__PURE__ */ jsxs("p", {
              className: "font-medium text-[var(--caca-ink)]",
              children: ["#", player.rank, " ", player.name]
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-sm text-[var(--caca-ink-soft)]",
              children: [player.points, " pts"]
            })]
          }, player.name))
        })]
      })]
    }), /* @__PURE__ */ jsxs("section", {
      className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-5",
        children: [/* @__PURE__ */ jsx("p", {
          className: "section-kicker",
          children: "Photo Gallery"
        }), /* @__PURE__ */ jsx("h2", {
          className: "section-title",
          children: "Association highlights"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        children: galleryTiles.map((tile) => /* @__PURE__ */ jsxs("article", {
          className: "gallery-tile",
          children: [/* @__PURE__ */ jsx("div", {
            className: "gallery-tile-art",
            "aria-hidden": "true"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--caca-ink-soft)]",
            children: tile
          })]
        }, tile))
      })]
    }), /* @__PURE__ */ jsx("section", {
      className: "mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-16",
      id: "contact",
      children: /* @__PURE__ */ jsxs("div", {
        className: "section-surface grid gap-6 p-6 md:grid-cols-2 md:p-8",
        children: [/* @__PURE__ */ jsxs("article", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "section-kicker",
            children: "Contact + Location"
          }), /* @__PURE__ */ jsx("h2", {
            className: "section-title",
            children: "Reach Capital Area Carrom Association"
          }), /* @__PURE__ */ jsxs("p", {
            className: "mt-4 text-[var(--caca-ink-soft)]",
            children: ["Email: office@caca.org (placeholder)", /* @__PURE__ */ jsx("br", {}), "Phone: +1 (000) 555-0144 (placeholder)"]
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 text-[var(--caca-ink-soft)]",
            children: "Address: 101 Carrom Square, Capital District, CA 00000 (placeholder)"
          }), /* @__PURE__ */ jsxs("div", {
            className: "mt-6 flex flex-wrap gap-3",
            id: "auth",
            children: [/* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-muted",
              href: "#auth",
              children: "Login"
            }), /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-muted",
              href: "#auth",
              children: "Signup"
            }), /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-secondary",
              href: "#contact",
              children: "Contact Us"
            })]
          })]
        }), /* @__PURE__ */ jsxs("article", {
          className: "rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-4",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm font-semibold uppercase tracking-[0.18em] text-[var(--caca-ink-soft)]",
            children: "Location Map"
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-3 grid min-h-56 place-items-center rounded-xl border border-dashed border-[var(--caca-border)] bg-[var(--caca-surface)] p-4 text-center text-sm text-[var(--caca-ink-soft)]",
            children: "Map placeholder for association venue and tournament hall."
          })]
        })]
      })
    }), /* @__PURE__ */ jsx("footer", {
      className: "border-t border-[var(--caca-border)] bg-[var(--caca-surface)]/80 py-6",
      children: /* @__PURE__ */ jsxs("div", {
        className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-[var(--caca-ink-soft)] sm:px-6 lg:px-8",
        children: [/* @__PURE__ */ jsx("p", {
          children: "© 2026 CACA. All rights reserved."
        }), /* @__PURE__ */ jsx("a", {
          className: "font-medium text-[var(--caca-ink)] hover:text-[var(--caca-accent)]",
          href: "#top",
          children: "Back to top"
        })]
      })
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-qDkKCGQ3.js", "imports": ["/assets/chunk-UVKPFVEO-BwactrwG.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-DkU0zowO.js", "imports": ["/assets/chunk-UVKPFVEO-BwactrwG.js"], "css": ["/assets/root-C8kkRIZp.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-DMYw03Re.js", "imports": ["/assets/chunk-UVKPFVEO-BwactrwG.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-99bd893d.js", "version": "99bd893d", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_passThroughRequests": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
