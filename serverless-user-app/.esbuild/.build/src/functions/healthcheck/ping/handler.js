var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/functions/healthcheck/ping/handler.ts
var handler_exports = {};
__export(handler_exports, {
  main: () => main
});
module.exports = __toCommonJS(handler_exports);

// src/libs/apiGateway.ts
var { stringify } = JSON;
var formatResponse = (response, statusCode) => {
  return {
    statusCode,
    body: stringify(response)
  };
};

// node_modules/@middy/core/index.js
var import_node_stream = require("node:stream");
var import_promises = require("node:stream/promises");
var import_promises2 = require("node:timers/promises");
var defaultLambdaHandler = () => {
};
var defaultPlugin = {
  timeoutEarlyInMillis: 5,
  timeoutEarlyResponse: () => {
    throw new Error("Timeout");
  },
  streamifyResponse: false
};
var middy = (lambdaHandler = defaultLambdaHandler, plugin = {}) => {
  var _a;
  if (typeof lambdaHandler !== "function") {
    plugin = lambdaHandler;
    lambdaHandler = defaultLambdaHandler;
  }
  plugin = {
    ...defaultPlugin,
    ...plugin
  };
  plugin.timeoutEarly = plugin.timeoutEarlyInMillis > 0;
  (_a = plugin.beforePrefetch) == null ? void 0 : _a.call(plugin);
  const beforeMiddlewares = [];
  const afterMiddlewares = [];
  const onErrorMiddlewares = [];
  const middyHandler = (event = {}, context = {}) => {
    var _a2;
    (_a2 = plugin.requestStart) == null ? void 0 : _a2.call(plugin);
    const request = {
      event,
      context,
      response: void 0,
      error: void 0,
      internal: plugin.internal ?? {}
    };
    return runRequest(request, [
      ...beforeMiddlewares
    ], lambdaHandler, [
      ...afterMiddlewares
    ], [
      ...onErrorMiddlewares
    ], plugin);
  };
  const middy2 = plugin.streamifyResponse ? awslambda.streamifyResponse(async (event, responseStream, context) => {
    const handlerResponse = await middyHandler(event, context);
    let handlerBody = handlerResponse;
    if (handlerResponse.statusCode) {
      handlerBody = handlerResponse.body ?? "";
      responseStream = awslambda.HttpResponseStream.from(responseStream, handlerResponse);
    }
    let handlerStream;
    if (handlerBody._readableState) {
      handlerStream = handlerBody;
    } else if (typeof handlerBody === "string") {
      function* iterator(input) {
        const size = 16384;
        let position = 0;
        const length = input.length;
        while (position < length) {
          yield input.substring(position, position + size);
          position += size;
        }
      }
      handlerStream = import_node_stream.Readable.from(iterator(handlerBody));
    }
    if (!handlerStream) {
      throw new Error("handler response not a ReadableStream");
    }
    await (0, import_promises.pipeline)(handlerStream, responseStream);
  }) : middyHandler;
  middy2.use = (middlewares) => {
    if (!Array.isArray(middlewares)) {
      middlewares = [
        middlewares
      ];
    }
    for (const middleware of middlewares) {
      const { before, after, onError } = middleware;
      if (!before && !after && !onError) {
        throw new Error('Middleware must be an object containing at least one key among "before", "after", "onError"');
      }
      if (before)
        middy2.before(before);
      if (after)
        middy2.after(after);
      if (onError)
        middy2.onError(onError);
    }
    return middy2;
  };
  middy2.before = (beforeMiddleware) => {
    beforeMiddlewares.push(beforeMiddleware);
    return middy2;
  };
  middy2.after = (afterMiddleware) => {
    afterMiddlewares.unshift(afterMiddleware);
    return middy2;
  };
  middy2.onError = (onErrorMiddleware) => {
    onErrorMiddlewares.unshift(onErrorMiddleware);
    return middy2;
  };
  middy2.handler = (replaceLambdaHandler) => {
    lambdaHandler = replaceLambdaHandler;
    return middy2;
  };
  return middy2;
};
var runRequest = async (request, beforeMiddlewares, lambdaHandler, afterMiddlewares, onErrorMiddlewares, plugin) => {
  var _a, _b, _c;
  let timeoutAbort;
  const timeoutEarly = plugin.timeoutEarly && request.context.getRemainingTimeInMillis;
  try {
    await runMiddlewares(request, beforeMiddlewares, plugin);
    if (typeof request.response === "undefined") {
      (_a = plugin.beforeHandler) == null ? void 0 : _a.call(plugin);
      const handlerAbort = new AbortController();
      if (timeoutEarly)
        timeoutAbort = new AbortController();
      request.response = await Promise.race([
        lambdaHandler(request.event, request.context, {
          signal: handlerAbort.signal
        }),
        timeoutEarly ? (0, import_promises2.setTimeout)(request.context.getRemainingTimeInMillis() - plugin.timeoutEarlyInMillis, void 0, {
          signal: timeoutAbort.signal
        }).then(() => {
          handlerAbort.abort();
          return plugin.timeoutEarlyResponse();
        }) : Promise.race([])
      ]);
      timeoutAbort == null ? void 0 : timeoutAbort.abort();
      (_b = plugin.afterHandler) == null ? void 0 : _b.call(plugin);
      await runMiddlewares(request, afterMiddlewares, plugin);
    }
  } catch (e) {
    timeoutAbort == null ? void 0 : timeoutAbort.abort();
    request.response = void 0;
    request.error = e;
    try {
      await runMiddlewares(request, onErrorMiddlewares, plugin);
    } catch (e2) {
      e2.originalError = request.error;
      request.error = e2;
      throw request.error;
    }
    if (typeof request.response === "undefined")
      throw request.error;
  } finally {
    await ((_c = plugin.requestEnd) == null ? void 0 : _c.call(plugin, request));
  }
  return request.response;
};
var runMiddlewares = async (request, middlewares, plugin) => {
  var _a, _b;
  for (const nextMiddleware of middlewares) {
    (_a = plugin.beforeMiddleware) == null ? void 0 : _a.call(plugin, nextMiddleware.name);
    const res = await nextMiddleware(request);
    (_b = plugin.afterMiddleware) == null ? void 0 : _b.call(plugin, nextMiddleware.name);
    if (typeof res !== "undefined") {
      request.response = res;
      return;
    }
  }
};
var core_default = middy;

// node_modules/@middy/util/index.js
var createErrorRegexp = /[^a-zA-Z]/g;
var HttpError = class extends Error {
  constructor(code, message, options = {}) {
    if (message && typeof message !== "string") {
      options = message;
      message = void 0;
    }
    message ??= httpErrorCodes[code];
    super(message, options);
    const name = httpErrorCodes[code].replace(createErrorRegexp, "");
    this.name = name.substr(-5) !== "Error" ? name + "Error" : name;
    this.status = this.statusCode = code;
    this.expose = options.expose ?? code < 500;
  }
};
var createError = (code, message, properties = {}) => {
  return new HttpError(code, message, properties);
};
var httpErrorCodes = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "(Unused)",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Unordered Collection",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  509: "Bandwidth Limit Exceeded",
  510: "Not Extended",
  511: "Network Authentication Required"
};

// node_modules/@middy/http-json-body-parser/index.js
var mimePattern = /^application\/(.+\+)?json($|;.+)/;
var defaults = {
  reviver: void 0,
  disableContentTypeError: true
};
var httpJsonBodyParserMiddleware = (opts = {}) => {
  const options = {
    ...defaults,
    ...opts
  };
  const httpJsonBodyParserMiddlewareBefore = async (request) => {
    const { headers, body } = request.event;
    const contentType = headers["Content-Type"] ?? headers["content-type"];
    if (!mimePattern.test(contentType)) {
      if (options.disableContentTypeError) {
        return;
      }
      throw createError(415, "Unsupported Media Type", {
        cause: contentType
      });
    }
    try {
      const data = request.event.isBase64Encoded ? Buffer.from(body, "base64").toString() : body;
      request.event.body = JSON.parse(data, options.reviver);
    } catch (cause) {
      throw createError(415, "Invalid or malformed JSON was provided", {
        cause
      });
    }
  };
  return {
    before: httpJsonBodyParserMiddlewareBefore
  };
};
var http_json_body_parser_default = httpJsonBodyParserMiddleware;

// src/libs/lambda.ts
var middyfy = (handler2) => {
  return core_default(handler2).use(http_json_body_parser_default());
};

// src/functions/healthcheck/ping/handler.ts
var handler = async () => {
  try {
    return formatResponse({ message: "pong" }, 200);
  } catch (error) {
    return formatResponse({ error }, 500);
  }
};
var main = middyfy(handler);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
//# sourceMappingURL=handler.js.map
