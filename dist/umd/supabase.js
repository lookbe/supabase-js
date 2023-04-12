!(function (e, t) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
    ? define([], t)
    : 'object' == typeof exports
    ? (exports.supabase = t())
    : (e.supabase = t())
})(self, () =>
  (() => {
    var fetch = function (input, init) {
      var parseHeaders = function (rawHeaders) {
        var headers = new Headers() // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2

        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
        preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
          var parts = line.split(':')
          var key = parts.shift().trim()

          if (key) {
            var value = parts.join(':').trim()
            headers.append(key, value)
          }
        })
        return headers
      }

      return new Promise(function (resolve, reject) {
        var request = new Request(input, init)

        if (request.signal && request.signal.aborted) {
          return reject(new DOMException('Aborted', 'AbortError'))
        }

        var xhr = new XMLHttpRequest()

        function abortXhr() {
          xhr.abort()
        }

        xhr.onload = function () {
          var specialStatus = [101, 204, 205, 304]

          var options = {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
          }
          options.url =
            'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
          var body = 'response' in xhr ? xhr.response : xhr.responseText
          resolve(new Response(specialStatus.includes(xhr.status) ? null : body, options))
        }

        xhr.onerror = function () {
          reject(new TypeError('Network request failed'))
        }

        xhr.ontimeout = function () {
          reject(new TypeError('Network request failed'))
        }

        xhr.onabort = function () {
          reject(new DOMException('Aborted', 'AbortError'))
        }

        xhr.open(request.method, request.url, true)

        if (request.credentials === 'include') {
          xhr.withCredentials = true
        } else if (request.credentials === 'omit') {
          xhr.withCredentials = false
        }

        // if ('responseType' in xhr && support.blob) {
        //   xhr.responseType = 'blob';
        // }

        request.headers.forEach(function (value, name) {
          xhr.setRequestHeader(name, value)
        })

        if (request.signal) {
          request.signal.addEventListener('abort', abortXhr)

          xhr.onreadystatechange = function () {
            // DONE (success or failure)
            if (xhr.readyState === 4) {
              request.signal.removeEventListener('abort', abortXhr)
            }
          }
        }

        xhr.send(typeof init.body === 'undefined' ? null : init.body)
      })
    }

    var URLSearchParams = (function () {
      var checkIfIteratorIsSupported = function () {
        try {
          return !!Symbol.iterator
        } catch (error) {
          return false
        }
      }

      var iteratorSupported = checkIfIteratorIsSupported()

      var createIterator = function (items) {
        var iterator = {
          next: function () {
            var value = items.shift()
            return {
              done: value === void 0,
              value: value,
            }
          },
        }

        if (iteratorSupported) {
          iterator[Symbol.iterator] = function () {
            return iterator
          }
        }

        return iterator
      }

      var serializeParam = function (value) {
        return encodeURIComponent(value).replace(/%20/g, '+')
      }

      var deserializeParam = function (value) {
        return decodeURIComponent(String(value).replace(/\+/g, ' '))
      }

      function URLSearchParams(searchString) {
        Object.defineProperty(this, '_entries', {
          writable: true,
          value: {},
        })
        var typeofSearchString = typeof searchString

        if (typeofSearchString === 'undefined') {
          // do nothing
        } else if (typeofSearchString === 'string') {
          if (searchString !== '') {
            this._fromString(searchString)
          }
        } else if (searchString instanceof URLSearchParams) {
          var _this = this
          searchString.forEach(function (value, name) {
            _this.append(name, value)
          })
        } else if (searchString !== null && typeofSearchString === 'object') {
          if (Object.prototype.toString.call(searchString) === '[object Array]') {
            for (var i = 0; i < searchString.length; i++) {
              var entry = searchString[i]
              if (
                Object.prototype.toString.call(entry) === '[object Array]' ||
                entry.length !== 2
              ) {
                this.append(entry[0], entry[1])
              } else {
                throw new TypeError(
                  'Expected [string, any] as entry at index ' + i + " of URLSearchParams's input"
                )
              }
            }
          } else {
            for (var key in searchString) {
              if (searchString.hasOwnProperty(key)) {
                this.append(key, searchString[key])
              }
            }
          }
        } else {
          throw new TypeError("Unsupported input's type for URLSearchParams")
        }
      }
      URLSearchParams.prototype.append = function (name, value) {
        if (name in this._entries) {
          this._entries[name].push(String(value))
        } else {
          this._entries[name] = [String(value)]
        }
      }

      URLSearchParams.prototype.delete = function (name) {
        delete this._entries[name]
      }

      URLSearchParams.prototype.get = function (name) {
        return name in this._entries ? this._entries[name][0] : null
      }

      URLSearchParams.prototype.getAll = function (name) {
        return name in this._entries ? this._entries[name].slice(0) : []
      }

      URLSearchParams.prototype.has = function (name) {
        return name in this._entries
      }

      URLSearchParams.prototype.set = function (name, value) {
        this._entries[name] = [String(value)]
      }

      URLSearchParams.prototype.forEach = function (callback, thisArg) {
        var entries
        for (var name in this._entries) {
          if (this._entries.hasOwnProperty(name)) {
            entries = this._entries[name]
            for (var i = 0; i < entries.length; i++) {
              callback.call(thisArg, entries[i], name, this)
            }
          }
        }
      }

      URLSearchParams.prototype.keys = function () {
        var items = []
        this.forEach(function (value, name) {
          items.push(name)
        })
        return createIterator(items)
      }

      URLSearchParams.prototype.values = function () {
        var items = []
        this.forEach(function (value) {
          items.push(value)
        })
        return createIterator(items)
      }

      URLSearchParams.prototype.entries = function () {
        var items = []
        this.forEach(function (value, name) {
          items.push([name, value])
        })
        return createIterator(items)
      }

      if (iteratorSupported) {
        URLSearchParams.prototype[Symbol.iterator] = URLSearchParams.prototype.entries
      }

      URLSearchParams.prototype.toString = function () {
        var searchArray = []
        this.forEach(function (value, name) {
          searchArray.push(serializeParam(name) + '=' + serializeParam(value))
        })
        return searchArray.join('&')
      }

      URLSearchParams.prototype.sort = function () {
        var _this = this
        var items = []
        this.forEach(function (value, name) {
          items.push([name, value])
          if (!_this._entries) {
            _this.delete(name)
          }
        })
        items.sort(function (a, b) {
          if (a[0] < b[0]) {
            return -1
          } else if (a[0] > b[0]) {
            return +1
          } else {
            return 0
          }
        })
        if (_this._entries) {
          // force reset because IE keeps keys index
          _this._entries = {}
        }
        for (var i = 0; i < items.length; i++) {
          this.append(items[i][0], items[i][1])
        }
      }
      Object.defineProperty(URLSearchParams.prototype, '_fromString', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString) {
          if (this._entries) {
            this._entries = {}
          } else {
            var keys = []
            this.forEach(function (value, name) {
              keys.push(name)
            })
            for (var i = 0; i < keys.length; i++) {
              this.delete(keys[i])
            }
          }

          searchString = searchString.replace(/^\?/, '')
          var attributes = searchString.split('&')
          var attribute
          for (var i = 0; i < attributes.length; i++) {
            attribute = attributes[i].split('=')
            this.append(
              deserializeParam(attribute[0]),
              attribute.length > 1 ? deserializeParam(attribute[1]) : ''
            )
          }
        },
      })

      return URLSearchParams
    })()

    var URL = (function () {
      var __assign =
        Object.assign ||
        function (t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i]
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
          }
          return t
        }

      function URL(url, base) {
        // var baseParts;
        // try {
        //     baseParts = URL.parse(base);
        // }
        // catch (e) {
        //     throw new Error('Invalid base URL');
        // }
        var urlParts = URL.parse(url)
        if (urlParts.protocol) {
          this._parts = __assign({}, urlParts)
        }
        // else {
        //     this._parts = {
        //         protocol: baseParts.protocol,
        //         username: baseParts.username,
        //         password: baseParts.password,
        //         hostname: baseParts.hostname,
        //         port: baseParts.port,
        //         path: urlParts.path || baseParts.path,
        //         query: urlParts.query || baseParts.query,
        //         hash: urlParts.hash,
        //     };
        // }
        // console.log(URL.parse(base), URL.parse(url), this._parts);
      }
      URL.init = function () {
        this.URLRegExp = new RegExp(
          '^' +
            this.patterns.protocol +
            '?' +
            this.patterns.authority +
            '?' +
            this.patterns.path +
            this.patterns.query +
            '?' +
            this.patterns.hash +
            '?'
        )
        this.AuthorityRegExp = new RegExp(
          '^' +
            this.patterns.authentication +
            '?' +
            this.patterns.hostname +
            this.patterns.port +
            '?$'
        )
      }
      URL.parse = function (url) {
        this.URLRegExp = new RegExp(
          '^' +
            this.patterns.protocol +
            '?' +
            this.patterns.authority +
            '?' +
            this.patterns.path +
            this.patterns.query +
            '?' +
            this.patterns.hash +
            '?'
        )
        this.AuthorityRegExp = new RegExp(
          '^' +
            this.patterns.authentication +
            '?' +
            this.patterns.hostname +
            this.patterns.port +
            '?$'
        )

        var urlMatch = this.URLRegExp.exec(url)
        if (urlMatch !== null) {
          var authorityMatch = urlMatch[2]
            ? this.AuthorityRegExp.exec(urlMatch[2])
            : [null, null, null, null, null]
          if (authorityMatch !== null) {
            return {
              protocol: urlMatch[1] || '',
              username: authorityMatch[1] || '',
              password: authorityMatch[2] || '',
              hostname: authorityMatch[3] || '',
              port: authorityMatch[4] || '',
              path: urlMatch[3] || '',
              query: urlMatch[4] || '',
              hash: urlMatch[5] || '',
            }
          }
        }
        throw new Error('Invalid URL')
      }
      Object.defineProperty(URL.prototype, 'hash', {
        get: function () {
          return this._parts.hash
        },
        set: function (value) {
          value = value.toString()
          if (value.length === 0) {
            this._parts.hash = ''
          } else {
            if (value.charAt(0) !== '#') value = '#' + value
            this._parts.hash = encodeURIComponent(value)
          }
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'host', {
        get: function () {
          return this.hostname + (this.port ? ':' + this.port : '')
        },
        set: function (value) {
          value = value.toString()
          var url = new URL('http://' + value)
          this._parts.hostname = url.hostname
          this._parts.port = url.port
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'hostname', {
        get: function () {
          return this._parts.hostname
        },
        set: function (value) {
          value = value.toString()
          this._parts.hostname = encodeURIComponent(value)
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'href', {
        get: function () {
          var authentication =
            this.username || this.password
              ? this.username + (this.password ? ':' + this.password : '') + '@'
              : ''
          return (
            this.protocol +
            '//' +
            authentication +
            this.host +
            this.pathname +
            this.search +
            this.hash
          )
        },
        set: function (value) {
          value = value.toString()
          var url = new URL(value)
          this._parts = __assign({}, url._parts)
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'origin', {
        get: function () {
          return this.protocol + '//' + this.host
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'password', {
        get: function () {
          return this._parts.password
        },
        set: function (value) {
          value = value.toString()
          this._parts.password = encodeURIComponent(value)
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'pathname', {
        get: function () {
          return this._parts.path ? this._parts.path : '/'
        },
        set: function (value) {
          value = value.toString()
          if (value.length === 0 || value.charAt(0) !== '/') value = '/' + value
          this._parts.path = encodeURIComponent(value)
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'port', {
        get: function () {
          return this._parts.port
        },
        set: function (value) {
          var port = parseInt(value)
          if (isNaN(port)) {
            this._parts.port = '0'
          } else {
            this._parts.port = Math.max(0, port % Math.pow(2, 16)).toString()
          }
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'protocol', {
        get: function () {
          return this._parts.protocol + ':'
        },
        set: function (value) {
          value = value.toString()
          if (value.length !== 0) {
            if (value.charAt(value.length - 1) === ':') {
              value = value.slice(0, -1)
            }
            this._parts.protocol = encodeURIComponent(value)
          }
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'search', {
        get: function () {
          return this._parts.query
        },
        set: function (value) {
          value = value.toString()
          if (value.charAt(0) !== '?') value = '?' + value
          this._parts.query = value
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'username', {
        get: function () {
          return this._parts.username
        },
        set: function (value) {
          value = value.toString()
          this._parts.username = encodeURIComponent(value)
        },
        enumerable: true,
        configurable: true,
      })
      Object.defineProperty(URL.prototype, 'searchParams', {
        get: function () {
          var _this = this
          var searchParams = new URLSearchParams(this.search)
          ;['append', 'delete', 'set'].forEach(function (methodName) {
            var method = searchParams[methodName]
            searchParams[methodName] = function () {
              var args = []
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i]
              }
              method.apply(searchParams, args)
              _this.search = searchParams.toString()
            }
          })
          return searchParams
        },
        enumerable: true,
        configurable: true,
      })
      URL.prototype.toString = function () {
        return this.href
      }
      // createObjectURL(object: any, options?: ObjectURLOptions): string;
      // revokeObjectURL(url: string): void;
      URL.patterns = {
        protocol: '(?:([^:/?#]+):)',
        authority: '(?://([^/?#]*))',
        path: '([^?#]*)',
        query: '(\\?[^#]*)',
        hash: '(#.*)',
        authentication: '(?:([^:]*)(?::([^@]*))?@)',
        hostname: '([^:]+)',
        port: '(?::(\\d+))',
      }
      return URL
    })()

    var e,
      t,
      r = {
        982: (e, t, r) => {
          'use strict'
          r.r(t),
            r.d(t, {
              FunctionsClient: () => a,
              FunctionsError: () => s,
              FunctionsFetchError: () => n,
              FunctionsHttpError: () => o,
              FunctionsRelayError: () => i,
            })
          class s extends Error {
            constructor(e, t = 'FunctionsError', r) {
              super(e), (super.name = t), (this.context = r)
            }
          }
          class n extends s {
            constructor(e) {
              super('Failed to send a request to the Edge Function', 'FunctionsFetchError', e)
            }
          }
          class i extends s {
            constructor(e) {
              super('Relay Error invoking the Edge Function', 'FunctionsRelayError', e)
            }
          }
          class o extends s {
            constructor(e) {
              super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', e)
            }
          }
          class a {
            constructor(e, { headers: t = {}, customFetch: s } = {}) {
              ;(this.url = e),
                (this.headers = t),
                (this.fetch = ((e) => {
                  let t
                  return (
                    (t =
                      e ||
                      ('undefined' == typeof fetch
                        ? (...e) => {
                            return (
                              (t = void 0),
                              (s = void 0),
                              (i = function* () {
                                return yield (yield Promise.resolve().then(
                                  r.t.bind(r, 98, 23)
                                )).fetch(...e)
                              }),
                              new ((n = void 0) || (n = Promise))(function (e, r) {
                                function o(e) {
                                  try {
                                    h(i.next(e))
                                  } catch (e) {
                                    r(e)
                                  }
                                }
                                function a(e) {
                                  try {
                                    h(i.throw(e))
                                  } catch (e) {
                                    r(e)
                                  }
                                }
                                function h(t) {
                                  var r
                                  t.done
                                    ? e(t.value)
                                    : ((r = t.value),
                                      r instanceof n
                                        ? r
                                        : new n(function (e) {
                                            e(r)
                                          })).then(o, a)
                                }
                                h((i = i.apply(t, s || [])).next())
                              })
                            )
                            var t, s, n, i
                          }
                        : fetch)),
                    (...e) => t(...e)
                  )
                })(s))
            }
            setAuth(e) {
              this.headers.Authorization = `Bearer ${e}`
            }
            invoke(e, t = {}) {
              var r, s, a, h, c
              return (
                (s = this),
                (a = void 0),
                (c = function* () {
                  try {
                    const { headers: s, body: a } = t
                    let h,
                      c = {}
                    a &&
                      ((s && !Object.prototype.hasOwnProperty.call(s, 'Content-Type')) || !s) &&
                      (('undefined' != typeof Blob && a instanceof Blob) || a instanceof ArrayBuffer
                        ? ((c['Content-Type'] = 'application/octet-stream'), (h = a))
                        : 'string' == typeof a
                        ? ((c['Content-Type'] = 'text/plain'), (h = a))
                        : 'undefined' != typeof FormData && a instanceof FormData
                        ? (h = a)
                        : ((c['Content-Type'] = 'application/json'), (h = JSON.stringify(a))))
                    const l = yield this.fetch(`${this.url}/${e}`, {
                        method: 'POST',
                        headers: Object.assign(
                          Object.assign(Object.assign({}, c), this.headers),
                          s
                        ),
                        body: h,
                      }).catch((e) => {
                        throw new n(e)
                      }),
                      u = l.headers.get('x-relay-error')
                    if (u && 'true' === u) throw new i(l)
                    if (!l.ok) throw new o(l)
                    let d,
                      f = (
                        null !== (r = l.headers.get('Content-Type')) && void 0 !== r
                          ? r
                          : 'text/plain'
                      )
                        .split(';')[0]
                        .trim()
                    return (
                      (d =
                        'application/json' === f
                          ? yield l.json()
                          : 'application/octet-stream' === f
                          ? yield l.blob()
                          : 'multipart/form-data' === f
                          ? yield l.formData()
                          : yield l.text()),
                      { data: d, error: null }
                    )
                  } catch (e) {
                    return { data: null, error: e }
                  }
                }),
                new ((h = void 0) || (h = Promise))(function (e, t) {
                  function r(e) {
                    try {
                      i(c.next(e))
                    } catch (e) {
                      t(e)
                    }
                  }
                  function n(e) {
                    try {
                      i(c.throw(e))
                    } catch (e) {
                      t(e)
                    }
                  }
                  function i(t) {
                    var s
                    t.done
                      ? e(t.value)
                      : ((s = t.value),
                        s instanceof h
                          ? s
                          : new h(function (e) {
                              e(s)
                            })).then(r, n)
                  }
                  i((c = c.apply(s, a || [])).next())
                })
              )
            }
          }
        },
        165: (e, t, r) => {
          'use strict'
          r.r(t),
            r.d(t, {
              AuthApiError: () => d,
              AuthError: () => l,
              AuthImplicitGrantRedirectError: () => g,
              AuthInvalidCredentialsError: () => m,
              AuthRetryableFetchError: () => b,
              AuthSessionMissingError: () => y,
              AuthUnknownError: () => p,
              CustomAuthError: () => v,
              GoTrueAdminApi: () => k,
              GoTrueClient: () => C,
              isAuthApiError: () => f,
              isAuthError: () => u,
            })
          var s = function (e, t, r, s) {
            return new (r || (r = Promise))(function (n, i) {
              function o(e) {
                try {
                  h(s.next(e))
                } catch (e) {
                  i(e)
                }
              }
              function a(e) {
                try {
                  h(s.throw(e))
                } catch (e) {
                  i(e)
                }
              }
              function h(e) {
                var t
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof r
                      ? t
                      : new r(function (e) {
                          e(t)
                        })).then(o, a)
              }
              h((s = s.apply(e, t || [])).next())
            })
          }
          const n = () => 'undefined' != typeof document
          function i(e, t) {
            var r
            t ||
              (t =
                (null === (r = null === window || void 0 === window ? void 0 : window.location) ||
                void 0 === r
                  ? void 0
                  : r.href) || ''),
              (e = e.replace(/[\[\]]/g, '\\$&'))
            const s = new RegExp('[?&#]' + e + '(=([^&#]*)|&|#|$)').exec(t)
            return s ? (s[2] ? decodeURIComponent(s[2].replace(/\+/g, ' ')) : '') : null
          }
          const o = (e) => {
              let t
              return (
                (t =
                  e ||
                  ('undefined' == typeof fetch
                    ? (...e) =>
                        s(void 0, void 0, void 0, function* () {
                          return yield (yield Promise.resolve().then(r.t.bind(r, 98, 23))).fetch(
                            ...e
                          )
                        })
                    : fetch)),
                (...e) => t(...e)
              )
            },
            a = (e, t) =>
              s(void 0, void 0, void 0, function* () {
                const r = yield e.getItem(t)
                if (!r) return null
                try {
                  return JSON.parse(r)
                } catch (e) {
                  return r
                }
              })
          class h {
            constructor() {
              this.promise = new h.promiseConstructor((e, t) => {
                ;(this.resolve = e), (this.reject = t)
              })
            }
          }
          function c(e) {
            const t = e.split('.')
            if (3 !== t.length) throw new Error('JWT is not valid: not a JWT structure')
            if (!/^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}=?$|[a-z0-9_-]{2}(==)?$)$/i.test(t[1]))
              throw new Error('JWT is not valid: payload is not in base64url format')
            const r = t[1]
            return JSON.parse(
              ((e) => {
                try {
                  return decodeURIComponent(
                    atob(e.replace(/[-]/g, '+').replace(/[_]/g, '/'))
                      .split('')
                      .map((e) => '%' + ('00' + e.charCodeAt(0).toString(16)).slice(-2))
                      .join('')
                  )
                } catch (t) {
                  if (t instanceof ReferenceError) return Buffer.from(e, 'base64').toString('utf-8')
                  throw t
                }
              })(r)
            )
          }
          h.promiseConstructor = Promise
          class l extends Error {
            constructor(e) {
              super(e), (this.__isAuthError = !0), (this.name = 'AuthError')
            }
          }
          function u(e) {
            return 'object' == typeof e && null !== e && '__isAuthError' in e
          }
          class d extends l {
            constructor(e, t) {
              super(e), (this.name = 'AuthApiError'), (this.status = t)
            }
            toJSON() {
              return { name: this.name, message: this.message, status: this.status }
            }
          }
          function f(e) {
            return u(e) && 'AuthApiError' === e.name
          }
          class p extends l {
            constructor(e, t) {
              super(e), (this.name = 'AuthUnknownError'), (this.originalError = t)
            }
          }
          class v extends l {
            constructor(e, t, r) {
              super(e), (this.name = t), (this.status = r)
            }
            toJSON() {
              return { name: this.name, message: this.message, status: this.status }
            }
          }
          class y extends v {
            constructor() {
              super('Auth session missing!', 'AuthSessionMissingError', 400)
            }
          }
          class m extends v {
            constructor(e) {
              super(e, 'AuthInvalidCredentialsError', 400)
            }
          }
          class g extends v {
            constructor(e, t = null) {
              super(e, 'AuthImplicitGrantRedirectError', 500),
                (this.details = null),
                (this.details = t)
            }
            toJSON() {
              return {
                name: this.name,
                message: this.message,
                status: this.status,
                details: this.details,
              }
            }
          }
          class b extends v {
            constructor(e, t) {
              super(e, 'AuthRetryableFetchError', t)
            }
          }
          var _ = function (e, t, r, s) {
            return new (r || (r = Promise))(function (n, i) {
              function o(e) {
                try {
                  h(s.next(e))
                } catch (e) {
                  i(e)
                }
              }
              function a(e) {
                try {
                  h(s.throw(e))
                } catch (e) {
                  i(e)
                }
              }
              function h(e) {
                var t
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof r
                      ? t
                      : new r(function (e) {
                          e(t)
                        })).then(o, a)
              }
              h((s = s.apply(e, t || [])).next())
            })
          }
          const w = (e) => e.msg || e.message || e.error_description || e.error || JSON.stringify(e)
          function E(e, t, r, s) {
            var n
            return _(this, void 0, void 0, function* () {
              const i = Object.assign({}, null == s ? void 0 : s.headers)
              ;(null == s ? void 0 : s.jwt) && (i.Authorization = `Bearer ${s.jwt}`)
              const o = null !== (n = null == s ? void 0 : s.query) && void 0 !== n ? n : {}
              ;(null == s ? void 0 : s.redirectTo) && (o.redirect_to = s.redirectTo)
              const a = Object.keys(o).length ? '?' + new URLSearchParams(o).toString() : '',
                h = yield (function (e, t, r, s, n, i) {
                  return _(this, void 0, void 0, function* () {
                    return new Promise((o, a) => {
                      e(
                        r,
                        ((e, t, r, s) => {
                          const n = { method: e, headers: (null == t ? void 0 : t.headers) || {} }
                          return 'GET' === e
                            ? n
                            : ((n.headers = Object.assign(
                                { 'Content-Type': 'application/json;charset=UTF-8' },
                                null == t ? void 0 : t.headers
                              )),
                              (n.body = JSON.stringify(s)),
                              Object.assign(Object.assign({}, n), r))
                        })(t, s, n, i)
                      )
                        .then((e) => {
                          if (!e.ok) throw e
                          return (null == s ? void 0 : s.noResolveJson) ? e : e.json()
                        })
                        .then((e) => o(e))
                        .catch((e) =>
                          ((e, t) =>
                            _(void 0, void 0, void 0, function* () {
                              var r
                              'object' == typeof (r = e) &&
                              null !== r &&
                              'status' in r &&
                              'ok' in r &&
                              'json' in r &&
                              'function' == typeof r.json
                                ? [502, 503, 504].includes(e.status)
                                  ? t(new b(w(e), e.status))
                                  : e
                                      .json()
                                      .then((r) => {
                                        t(new d(w(r), e.status || 500))
                                      })
                                      .catch((e) => {
                                        t(new p(w(e), e))
                                      })
                                : t(new b(w(e), 0))
                            }))(e, a)
                        )
                    })
                  })
                })(
                  e,
                  t,
                  r + a,
                  { headers: i, noResolveJson: null == s ? void 0 : s.noResolveJson },
                  {},
                  null == s ? void 0 : s.body
                )
              return (null == s ? void 0 : s.xform)
                ? null == s
                  ? void 0
                  : s.xform(h)
                : { data: Object.assign({}, h), error: null }
            })
          }
          function T(e) {
            var t
            let r = null
            var s
            return (
              (function (e) {
                return e.access_token && e.refresh_token && e.expires_in
              })(e) &&
                ((r = Object.assign({}, e)),
                (r.expires_at = ((s = e.expires_in), Math.round(Date.now() / 1e3) + s))),
              {
                data: { session: r, user: null !== (t = e.user) && void 0 !== t ? t : e },
                error: null,
              }
            )
          }
          function O(e) {
            var t
            return { data: { user: null !== (t = e.user) && void 0 !== t ? t : e }, error: null }
          }
          function S(e) {
            return { data: e, error: null }
          }
          function j(e) {
            const {
                action_link: t,
                email_otp: r,
                hashed_token: s,
                redirect_to: n,
                verification_type: i,
              } = e,
              o = (function (e, t) {
                var r = {}
                for (var s in e)
                  Object.prototype.hasOwnProperty.call(e, s) && t.indexOf(s) < 0 && (r[s] = e[s])
                if (null != e && 'function' == typeof Object.getOwnPropertySymbols) {
                  var n = 0
                  for (s = Object.getOwnPropertySymbols(e); n < s.length; n++)
                    t.indexOf(s[n]) < 0 &&
                      Object.prototype.propertyIsEnumerable.call(e, s[n]) &&
                      (r[s[n]] = e[s[n]])
                }
                return r
              })(e, [
                'action_link',
                'email_otp',
                'hashed_token',
                'redirect_to',
                'verification_type',
              ])
            return {
              data: {
                properties: {
                  action_link: t,
                  email_otp: r,
                  hashed_token: s,
                  redirect_to: n,
                  verification_type: i,
                },
                user: Object.assign({}, o),
              },
              error: null,
            }
          }
          function P(e) {
            return e
          }
          var x = function (e, t, r, s) {
            return new (r || (r = Promise))(function (n, i) {
              function o(e) {
                try {
                  h(s.next(e))
                } catch (e) {
                  i(e)
                }
              }
              function a(e) {
                try {
                  h(s.throw(e))
                } catch (e) {
                  i(e)
                }
              }
              function h(e) {
                var t
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof r
                      ? t
                      : new r(function (e) {
                          e(t)
                        })).then(o, a)
              }
              h((s = s.apply(e, t || [])).next())
            })
          }
          class k {
            constructor({ url: e = '', headers: t = {}, fetch: r }) {
              ;(this.url = e),
                (this.headers = t),
                (this.fetch = o(r)),
                (this.mfa = {
                  listFactors: this._listFactors.bind(this),
                  deleteFactor: this._deleteFactor.bind(this),
                })
            }
            signOut(e) {
              return x(this, void 0, void 0, function* () {
                try {
                  return (
                    yield E(this.fetch, 'POST', `${this.url}/logout`, {
                      headers: this.headers,
                      jwt: e,
                      noResolveJson: !0,
                    }),
                    { data: null, error: null }
                  )
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            inviteUserByEmail(e, t = {}) {
              return x(this, void 0, void 0, function* () {
                try {
                  return yield E(this.fetch, 'POST', `${this.url}/invite`, {
                    body: { email: e, data: t.data },
                    headers: this.headers,
                    redirectTo: t.redirectTo,
                    xform: O,
                  })
                } catch (e) {
                  if (u(e)) return { data: { user: null }, error: e }
                  throw e
                }
              })
            }
            generateLink(e) {
              return x(this, void 0, void 0, function* () {
                try {
                  const { options: t } = e,
                    r = (function (e, t) {
                      var r = {}
                      for (var s in e)
                        Object.prototype.hasOwnProperty.call(e, s) &&
                          t.indexOf(s) < 0 &&
                          (r[s] = e[s])
                      if (null != e && 'function' == typeof Object.getOwnPropertySymbols) {
                        var n = 0
                        for (s = Object.getOwnPropertySymbols(e); n < s.length; n++)
                          t.indexOf(s[n]) < 0 &&
                            Object.prototype.propertyIsEnumerable.call(e, s[n]) &&
                            (r[s[n]] = e[s[n]])
                      }
                      return r
                    })(e, ['options']),
                    s = Object.assign(Object.assign({}, r), t)
                  return (
                    'newEmail' in r &&
                      ((s.new_email = null == r ? void 0 : r.newEmail), delete s.newEmail),
                    yield E(this.fetch, 'POST', `${this.url}/admin/generate_link`, {
                      body: s,
                      headers: this.headers,
                      xform: j,
                      redirectTo: null == t ? void 0 : t.redirectTo,
                    })
                  )
                } catch (e) {
                  if (u(e)) return { data: { properties: null, user: null }, error: e }
                  throw e
                }
              })
            }
            createUser(e) {
              return x(this, void 0, void 0, function* () {
                try {
                  return yield E(this.fetch, 'POST', `${this.url}/admin/users`, {
                    body: e,
                    headers: this.headers,
                    xform: O,
                  })
                } catch (e) {
                  if (u(e)) return { data: { user: null }, error: e }
                  throw e
                }
              })
            }
            listUsers(e) {
              var t, r, s, n, i, o, a
              return x(this, void 0, void 0, function* () {
                try {
                  const h = { nextPage: null, lastPage: 0, total: 0 },
                    c = yield E(this.fetch, 'GET', `${this.url}/admin/users`, {
                      headers: this.headers,
                      noResolveJson: !0,
                      query: {
                        page:
                          null !==
                            (r =
                              null === (t = null == e ? void 0 : e.page) || void 0 === t
                                ? void 0
                                : t.toString()) && void 0 !== r
                            ? r
                            : '',
                        per_page:
                          null !==
                            (n =
                              null === (s = null == e ? void 0 : e.perPage) || void 0 === s
                                ? void 0
                                : s.toString()) && void 0 !== n
                            ? n
                            : '',
                      },
                      xform: P,
                    })
                  if (c.error) throw c.error
                  const l = yield c.json(),
                    u = null !== (i = c.headers.get('x-total-count')) && void 0 !== i ? i : 0,
                    d =
                      null !==
                        (a =
                          null === (o = c.headers.get('link')) || void 0 === o
                            ? void 0
                            : o.split(',')) && void 0 !== a
                        ? a
                        : []
                  return (
                    d.length > 0 &&
                      (d.forEach((e) => {
                        const t = parseInt(e.split(';')[0].split('=')[1].substring(0, 1)),
                          r = JSON.parse(e.split(';')[1].split('=')[1])
                        h[`${r}Page`] = t
                      }),
                      (h.total = parseInt(u))),
                    { data: Object.assign(Object.assign({}, l), h), error: null }
                  )
                } catch (e) {
                  if (u(e)) return { data: { users: [] }, error: e }
                  throw e
                }
              })
            }
            getUserById(e) {
              return x(this, void 0, void 0, function* () {
                try {
                  return yield E(this.fetch, 'GET', `${this.url}/admin/users/${e}`, {
                    headers: this.headers,
                    xform: O,
                  })
                } catch (e) {
                  if (u(e)) return { data: { user: null }, error: e }
                  throw e
                }
              })
            }
            updateUserById(e, t) {
              return x(this, void 0, void 0, function* () {
                try {
                  return yield E(this.fetch, 'PUT', `${this.url}/admin/users/${e}`, {
                    body: t,
                    headers: this.headers,
                    xform: O,
                  })
                } catch (e) {
                  if (u(e)) return { data: { user: null }, error: e }
                  throw e
                }
              })
            }
            deleteUser(e) {
              return x(this, void 0, void 0, function* () {
                try {
                  return yield E(this.fetch, 'DELETE', `${this.url}/admin/users/${e}`, {
                    headers: this.headers,
                    xform: O,
                  })
                } catch (e) {
                  if (u(e)) return { data: { user: null }, error: e }
                  throw e
                }
              })
            }
            _listFactors(e) {
              return x(this, void 0, void 0, function* () {
                try {
                  const { data: t, error: r } = yield E(
                    this.fetch,
                    'GET',
                    `${this.url}/admin/users/${e.userId}/factors`,
                    { headers: this.headers, xform: (e) => ({ data: { factors: e }, error: null }) }
                  )
                  return { data: t, error: r }
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            _deleteFactor(e) {
              return x(this, void 0, void 0, function* () {
                try {
                  return {
                    data: yield E(
                      this.fetch,
                      'DELETE',
                      `${this.url}/admin/users/${e.userId}/factors/${e.id}`,
                      { headers: this.headers }
                    ),
                    error: null,
                  }
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
          }
          const $ = {
            getItem: (e) => (n() ? globalThis.localStorage.getItem(e) : null),
            setItem: (e, t) => {
              n() && globalThis.localStorage.setItem(e, t)
            },
            removeItem: (e) => {
              n() && globalThis.localStorage.removeItem(e)
            },
          }
          var A = function (e, t, r, s) {
            return new (r || (r = Promise))(function (n, i) {
              function o(e) {
                try {
                  h(s.next(e))
                } catch (e) {
                  i(e)
                }
              }
              function a(e) {
                try {
                  h(s.throw(e))
                } catch (e) {
                  i(e)
                }
              }
              function h(e) {
                var t
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof r
                      ? t
                      : new r(function (e) {
                          e(t)
                        })).then(o, a)
              }
              h((s = s.apply(e, t || [])).next())
            })
          }
          !(function () {
            if ('object' != typeof globalThis)
              try {
                Object.defineProperty(Object.prototype, '__magic__', {
                  get: function () {
                    return this
                  },
                  configurable: !0,
                }),
                  (__magic__.globalThis = __magic__),
                  delete Object.prototype.__magic__
              } catch (e) {
                'undefined' != typeof self && (self.globalThis = self)
              }
          })()
          const R = {
            url: 'http://localhost:9999',
            storageKey: 'supabase.auth.token',
            autoRefreshToken: !0,
            persistSession: !0,
            detectSessionInUrl: !0,
            headers: { 'X-Client-Info': 'gotrue-js/2.6.1' },
          }
          class C {
            constructor(e) {
              ;(this.stateChangeEmitters = new Map()),
                (this.networkRetries = 0),
                (this.refreshingDeferred = null),
                (this.initializePromise = null),
                (this.detectSessionInUrl = !0)
              const t = Object.assign(Object.assign({}, R), e)
              ;(this.inMemorySession = null),
                (this.storageKey = t.storageKey),
                (this.autoRefreshToken = t.autoRefreshToken),
                (this.persistSession = t.persistSession),
                (this.storage = t.storage || $),
                (this.admin = new k({ url: t.url, headers: t.headers, fetch: t.fetch })),
                (this.url = t.url),
                (this.headers = t.headers),
                (this.fetch = o(t.fetch)),
                (this.detectSessionInUrl = t.detectSessionInUrl),
                this.initialize(),
                (this.mfa = {
                  verify: this._verify.bind(this),
                  enroll: this._enroll.bind(this),
                  unenroll: this._unenroll.bind(this),
                  challenge: this._challenge.bind(this),
                  listFactors: this._listFactors.bind(this),
                  challengeAndVerify: this._challengeAndVerify.bind(this),
                  getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
                })
            }
            initialize() {
              return (
                this.initializePromise || (this.initializePromise = this._initialize()),
                this.initializePromise
              )
            }
            _initialize() {
              return A(this, void 0, void 0, function* () {
                if (this.initializePromise) return this.initializePromise
                try {
                  if (this.detectSessionInUrl && this._isImplicitGrantFlow()) {
                    const { data: e, error: t } = yield this._getSessionFromUrl()
                    if (t) return yield this._removeSession(), { error: t }
                    const { session: r, redirectType: s } = e
                    return (
                      yield this._saveSession(r),
                      this._notifyAllSubscribers('SIGNED_IN', r),
                      'recovery' === s && this._notifyAllSubscribers('PASSWORD_RECOVERY', r),
                      { error: null }
                    )
                  }
                  return yield this._recoverAndRefresh(), { error: null }
                } catch (e) {
                  return u(e)
                    ? { error: e }
                    : { error: new p('Unexpected error during initialization', e) }
                } finally {
                  this._handleVisibilityChange()
                }
              })
            }
            signUp(e) {
              var t, r
              return A(this, void 0, void 0, function* () {
                try {
                  let s
                  if ((yield this._removeSession(), 'email' in e)) {
                    const { email: r, password: n, options: i } = e
                    s = yield E(this.fetch, 'POST', `${this.url}/signup`, {
                      headers: this.headers,
                      redirectTo: null == i ? void 0 : i.emailRedirectTo,
                      body: {
                        email: r,
                        password: n,
                        data: null !== (t = null == i ? void 0 : i.data) && void 0 !== t ? t : {},
                        gotrue_meta_security: {
                          captcha_token: null == i ? void 0 : i.captchaToken,
                        },
                      },
                      xform: T,
                    })
                  } else {
                    if (!('phone' in e))
                      throw new m('You must provide either an email or phone number and a password')
                    {
                      const { phone: t, password: n, options: i } = e
                      s = yield E(this.fetch, 'POST', `${this.url}/signup`, {
                        headers: this.headers,
                        body: {
                          phone: t,
                          password: n,
                          data: null !== (r = null == i ? void 0 : i.data) && void 0 !== r ? r : {},
                          gotrue_meta_security: {
                            captcha_token: null == i ? void 0 : i.captchaToken,
                          },
                        },
                        xform: T,
                      })
                    }
                  }
                  const { data: n, error: i } = s
                  if (i || !n) return { data: { user: null, session: null }, error: i }
                  const o = n.session,
                    a = n.user
                  return (
                    n.session &&
                      (yield this._saveSession(n.session),
                      this._notifyAllSubscribers('SIGNED_IN', o)),
                    { data: { user: a, session: o }, error: null }
                  )
                } catch (e) {
                  if (u(e)) return { data: { user: null, session: null }, error: e }
                  throw e
                }
              })
            }
            signInWithPassword(e) {
              var t, r
              return A(this, void 0, void 0, function* () {
                try {
                  let s
                  if ((yield this._removeSession(), 'email' in e)) {
                    const { email: r, password: n, options: i } = e
                    s = yield E(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                      headers: this.headers,
                      body: {
                        email: r,
                        password: n,
                        data: null !== (t = null == i ? void 0 : i.data) && void 0 !== t ? t : {},
                        gotrue_meta_security: {
                          captcha_token: null == i ? void 0 : i.captchaToken,
                        },
                      },
                      xform: T,
                    })
                  } else {
                    if (!('phone' in e))
                      throw new m('You must provide either an email or phone number and a password')
                    {
                      const { phone: t, password: n, options: i } = e
                      s = yield E(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                        headers: this.headers,
                        body: {
                          phone: t,
                          password: n,
                          data: null !== (r = null == i ? void 0 : i.data) && void 0 !== r ? r : {},
                          gotrue_meta_security: {
                            captcha_token: null == i ? void 0 : i.captchaToken,
                          },
                        },
                        xform: T,
                      })
                    }
                  }
                  const { data: n, error: i } = s
                  return i || !n
                    ? { data: { user: null, session: null }, error: i }
                    : (n.session &&
                        (yield this._saveSession(n.session),
                        this._notifyAllSubscribers('SIGNED_IN', n.session)),
                      { data: n, error: i })
                } catch (e) {
                  if (u(e)) return { data: { user: null, session: null }, error: e }
                  throw e
                }
              })
            }
            signInWithOAuth(e) {
              var t, r, s
              return A(this, void 0, void 0, function* () {
                return (
                  yield this._removeSession(),
                  this._handleProviderSignIn(e.provider, {
                    redirectTo: null === (t = e.options) || void 0 === t ? void 0 : t.redirectTo,
                    scopes: null === (r = e.options) || void 0 === r ? void 0 : r.scopes,
                    queryParams: null === (s = e.options) || void 0 === s ? void 0 : s.queryParams,
                  })
                )
              })
            }
            signInWithOtp(e) {
              var t, r, s, n
              return A(this, void 0, void 0, function* () {
                try {
                  if ((yield this._removeSession(), 'email' in e)) {
                    const { email: s, options: n } = e,
                      { error: i } = yield E(this.fetch, 'POST', `${this.url}/otp`, {
                        headers: this.headers,
                        body: {
                          email: s,
                          data: null !== (t = null == n ? void 0 : n.data) && void 0 !== t ? t : {},
                          create_user:
                            null === (r = null == n ? void 0 : n.shouldCreateUser) ||
                            void 0 === r ||
                            r,
                          gotrue_meta_security: {
                            captcha_token: null == n ? void 0 : n.captchaToken,
                          },
                        },
                        redirectTo: null == n ? void 0 : n.emailRedirectTo,
                      })
                    return { data: { user: null, session: null }, error: i }
                  }
                  if ('phone' in e) {
                    const { phone: t, options: r } = e,
                      { error: i } = yield E(this.fetch, 'POST', `${this.url}/otp`, {
                        headers: this.headers,
                        body: {
                          phone: t,
                          data: null !== (s = null == r ? void 0 : r.data) && void 0 !== s ? s : {},
                          create_user:
                            null === (n = null == r ? void 0 : r.shouldCreateUser) ||
                            void 0 === n ||
                            n,
                          gotrue_meta_security: {
                            captcha_token: null == r ? void 0 : r.captchaToken,
                          },
                        },
                      })
                    return { data: { user: null, session: null }, error: i }
                  }
                  throw new m('You must provide either an email or phone number.')
                } catch (e) {
                  if (u(e)) return { data: { user: null, session: null }, error: e }
                  throw e
                }
              })
            }
            verifyOtp(e) {
              var t, r
              return A(this, void 0, void 0, function* () {
                try {
                  yield this._removeSession()
                  const { data: s, error: n } = yield E(this.fetch, 'POST', `${this.url}/verify`, {
                    headers: this.headers,
                    body: Object.assign(Object.assign({}, e), {
                      gotrue_meta_security: {
                        captcha_token:
                          null === (t = e.options) || void 0 === t ? void 0 : t.captchaToken,
                      },
                    }),
                    redirectTo: null === (r = e.options) || void 0 === r ? void 0 : r.redirectTo,
                    xform: T,
                  })
                  if (n) throw n
                  if (!s) throw 'An error occurred on token verification.'
                  const i = s.session,
                    o = s.user
                  return (
                    (null == i ? void 0 : i.access_token) &&
                      (yield this._saveSession(i), this._notifyAllSubscribers('SIGNED_IN', i)),
                    { data: { user: o, session: i }, error: null }
                  )
                } catch (e) {
                  if (u(e)) return { data: { user: null, session: null }, error: e }
                  throw e
                }
              })
            }
            signInWithSSO(e) {
              var t, r, s
              return A(this, void 0, void 0, function* () {
                try {
                  return (
                    yield this._removeSession(),
                    yield E(this.fetch, 'POST', `${this.url}/sso`, {
                      body: Object.assign(
                        Object.assign(
                          Object.assign(
                            Object.assign(
                              Object.assign(
                                {},
                                'providerId' in e ? { provider_id: e.providerId } : null
                              ),
                              'domain' in e ? { domain: e.domain } : null
                            ),
                            {
                              redirect_to:
                                null !==
                                  (r =
                                    null === (t = e.options) || void 0 === t
                                      ? void 0
                                      : t.redirectTo) && void 0 !== r
                                  ? r
                                  : void 0,
                            }
                          ),
                          (
                            null === (s = null == e ? void 0 : e.options) || void 0 === s
                              ? void 0
                              : s.captchaToken
                          )
                            ? { gotrue_meta_security: { captcha_token: e.options.captchaToken } }
                            : null
                        ),
                        { skip_http_redirect: !0 }
                      ),
                      headers: this.headers,
                      xform: S,
                    })
                  )
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            getSession() {
              return A(this, void 0, void 0, function* () {
                yield this.initializePromise
                let e = null
                if (this.persistSession) {
                  const t = yield a(this.storage, this.storageKey)
                  null !== t && (this._isValidSession(t) ? (e = t) : yield this._removeSession())
                } else e = this.inMemorySession
                if (!e) return { data: { session: null }, error: null }
                if (!(e.expires_at && e.expires_at <= Date.now() / 1e3))
                  return { data: { session: e }, error: null }
                const { session: t, error: r } = yield this._callRefreshToken(e.refresh_token)
                return r
                  ? { data: { session: null }, error: r }
                  : { data: { session: t }, error: null }
              })
            }
            getUser(e) {
              var t, r
              return A(this, void 0, void 0, function* () {
                try {
                  if (!e) {
                    const { data: s, error: n } = yield this.getSession()
                    if (n) throw n
                    e =
                      null !==
                        (r = null === (t = s.session) || void 0 === t ? void 0 : t.access_token) &&
                      void 0 !== r
                        ? r
                        : void 0
                  }
                  return yield E(this.fetch, 'GET', `${this.url}/user`, {
                    headers: this.headers,
                    jwt: e,
                    xform: O,
                  })
                } catch (e) {
                  if (u(e)) return { data: { user: null }, error: e }
                  throw e
                }
              })
            }
            updateUser(e) {
              return A(this, void 0, void 0, function* () {
                try {
                  const { data: t, error: r } = yield this.getSession()
                  if (r) throw r
                  if (!t.session) throw new y()
                  const s = t.session,
                    { data: n, error: i } = yield E(this.fetch, 'PUT', `${this.url}/user`, {
                      headers: this.headers,
                      body: e,
                      jwt: s.access_token,
                      xform: O,
                    })
                  if (i) throw i
                  return (
                    (s.user = n.user),
                    yield this._saveSession(s),
                    this._notifyAllSubscribers('USER_UPDATED', s),
                    { data: { user: s.user }, error: null }
                  )
                } catch (e) {
                  if (u(e)) return { data: { user: null }, error: e }
                  throw e
                }
              })
            }
            _decodeJWT(e) {
              return c(e)
            }
            setSession(e) {
              return A(this, void 0, void 0, function* () {
                try {
                  if (!e.access_token || !e.refresh_token) throw new y()
                  const t = Date.now() / 1e3
                  let r = t,
                    s = !0,
                    n = null
                  const i = c(e.access_token)
                  if ((i.exp && ((r = i.exp), (s = r <= t)), s)) {
                    const { session: t, error: r } = yield this._callRefreshToken(e.refresh_token)
                    if (r) return { data: { user: null, session: null }, error: r }
                    if (!t) return { data: { user: null, session: null }, error: null }
                    n = t
                  } else {
                    const { data: s, error: i } = yield this.getUser(e.access_token)
                    if (i) throw i
                    ;(n = {
                      access_token: e.access_token,
                      refresh_token: e.refresh_token,
                      user: s.user,
                      token_type: 'bearer',
                      expires_in: r - t,
                      expires_at: r,
                    }),
                      yield this._saveSession(n)
                  }
                  return { data: { user: n.user, session: n }, error: null }
                } catch (e) {
                  if (u(e)) return { data: { session: null, user: null }, error: e }
                  throw e
                }
              })
            }
            refreshSession(e) {
              var t
              return A(this, void 0, void 0, function* () {
                try {
                  if (!e) {
                    const { data: r, error: s } = yield this.getSession()
                    if (s) throw s
                    e = null !== (t = r.session) && void 0 !== t ? t : void 0
                  }
                  if (!(null == e ? void 0 : e.refresh_token)) throw new y()
                  const { session: r, error: s } = yield this._callRefreshToken(e.refresh_token)
                  return s
                    ? { data: { user: null, session: null }, error: s }
                    : r
                    ? { data: { user: r.user, session: r }, error: null }
                    : { data: { user: null, session: null }, error: null }
                } catch (e) {
                  if (u(e)) return { data: { user: null, session: null }, error: e }
                  throw e
                }
              })
            }
            _getSessionFromUrl() {
              return A(this, void 0, void 0, function* () {
                try {
                  if (!n()) throw new g('No browser detected.')
                  if (!this._isImplicitGrantFlow())
                    throw new g('Not a valid implicit grant flow url.')
                  const e = i('error_description')
                  if (e) {
                    const t = i('error_code')
                    if (!t) throw new g('No error_code detected.')
                    const r = i('error')
                    if (!r) throw new g('No error detected.')
                    throw new g(e, { error: r, code: t })
                  }
                  const t = i('provider_token'),
                    r = i('provider_refresh_token'),
                    s = i('access_token')
                  if (!s) throw new g('No access_token detected.')
                  const o = i('expires_in')
                  if (!o) throw new g('No expires_in detected.')
                  const a = i('refresh_token')
                  if (!a) throw new g('No refresh_token detected.')
                  const h = i('token_type')
                  if (!h) throw new g('No token_type detected.')
                  const c = Math.round(Date.now() / 1e3) + parseInt(o),
                    { data: l, error: u } = yield this.getUser(s)
                  if (u) throw u
                  const d = l.user,
                    f = {
                      provider_token: t,
                      provider_refresh_token: r,
                      access_token: s,
                      expires_in: parseInt(o),
                      expires_at: c,
                      refresh_token: a,
                      token_type: h,
                      user: d,
                    },
                    p = i('type')
                  return (
                    (window.location.hash = ''),
                    { data: { session: f, redirectType: p }, error: null }
                  )
                } catch (e) {
                  if (u(e)) return { data: { session: null, redirectType: null }, error: e }
                  throw e
                }
              })
            }
            _isImplicitGrantFlow() {
              return n() && (Boolean(i('access_token')) || Boolean(i('error_description')))
            }
            signOut() {
              var e
              return A(this, void 0, void 0, function* () {
                const { data: t, error: r } = yield this.getSession()
                if (r) return { error: r }
                const s = null === (e = t.session) || void 0 === e ? void 0 : e.access_token
                if (s) {
                  const { error: e } = yield this.admin.signOut(s)
                  if (e && (!f(e) || (404 !== e.status && 401 !== e.status))) return { error: e }
                }
                return (
                  yield this._removeSession(),
                  this._notifyAllSubscribers('SIGNED_OUT', null),
                  { error: null }
                )
              })
            }
            onAuthStateChange(e) {
              const t = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (e) {
                  const t = (16 * Math.random()) | 0
                  return ('x' == e ? t : (3 & t) | 8).toString(16)
                }),
                r = {
                  id: t,
                  callback: e,
                  unsubscribe: () => {
                    this.stateChangeEmitters.delete(t)
                  },
                }
              return this.stateChangeEmitters.set(t, r), { data: { subscription: r } }
            }
            resetPasswordForEmail(e, t = {}) {
              return A(this, void 0, void 0, function* () {
                try {
                  return yield E(this.fetch, 'POST', `${this.url}/recover`, {
                    body: { email: e, gotrue_meta_security: { captcha_token: t.captchaToken } },
                    headers: this.headers,
                    redirectTo: t.redirectTo,
                  })
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            _refreshAccessToken(e) {
              return A(this, void 0, void 0, function* () {
                try {
                  return yield E(this.fetch, 'POST', `${this.url}/token?grant_type=refresh_token`, {
                    body: { refresh_token: e },
                    headers: this.headers,
                    xform: T,
                  })
                } catch (e) {
                  if (u(e)) return { data: { session: null, user: null }, error: e }
                  throw e
                }
              })
            }
            _isValidSession(e) {
              return (
                'object' == typeof e &&
                null !== e &&
                'access_token' in e &&
                'refresh_token' in e &&
                'expires_at' in e
              )
            }
            _handleProviderSignIn(e, t = {}) {
              const r = this._getUrlForProvider(e, {
                redirectTo: t.redirectTo,
                scopes: t.scopes,
                queryParams: t.queryParams,
              })
              return (
                n() && (window.location.href = r), { data: { provider: e, url: r }, error: null }
              )
            }
            _recoverAndRefresh() {
              var e
              return A(this, void 0, void 0, function* () {
                try {
                  const t = yield a(this.storage, this.storageKey)
                  if (!this._isValidSession(t))
                    return void (null !== t && (yield this._removeSession()))
                  const r = Math.round(Date.now() / 1e3)
                  if ((null !== (e = t.expires_at) && void 0 !== e ? e : 1 / 0) < r + 10)
                    if (this.autoRefreshToken && t.refresh_token) {
                      this.networkRetries++
                      const { error: e } = yield this._callRefreshToken(t.refresh_token)
                      if (e) {
                        if ((console.log(e.message), e instanceof b && this.networkRetries < 10))
                          return (
                            this.refreshTokenTimer && clearTimeout(this.refreshTokenTimer),
                            void (this.refreshTokenTimer = setTimeout(
                              () => this._recoverAndRefresh(),
                              100 * Math.pow(2, this.networkRetries)
                            ))
                          )
                        yield this._removeSession()
                      }
                      this.networkRetries = 0
                    } else yield this._removeSession()
                  else
                    this.persistSession && (yield this._saveSession(t)),
                      this._notifyAllSubscribers('SIGNED_IN', t)
                } catch (e) {
                  return void console.error(e)
                }
              })
            }
            _callRefreshToken(e) {
              var t, r
              return A(this, void 0, void 0, function* () {
                if (this.refreshingDeferred) return this.refreshingDeferred.promise
                try {
                  if (((this.refreshingDeferred = new h()), !e)) throw new y()
                  const { data: t, error: r } = yield this._refreshAccessToken(e)
                  if (r) throw r
                  if (!t.session) throw new y()
                  yield this._saveSession(t.session),
                    this._notifyAllSubscribers('TOKEN_REFRESHED', t.session)
                  const s = { session: t.session, error: null }
                  return this.refreshingDeferred.resolve(s), s
                } catch (e) {
                  if (u(e)) {
                    const r = { session: null, error: e }
                    return null === (t = this.refreshingDeferred) || void 0 === t || t.resolve(r), r
                  }
                  throw (null === (r = this.refreshingDeferred) || void 0 === r || r.reject(e), e)
                } finally {
                  this.refreshingDeferred = null
                }
              })
            }
            _notifyAllSubscribers(e, t) {
              this.stateChangeEmitters.forEach((r) => r.callback(e, t))
            }
            _saveSession(e) {
              return A(this, void 0, void 0, function* () {
                this.persistSession || (this.inMemorySession = e)
                const t = e.expires_at
                if (t) {
                  const e = t - Math.round(Date.now() / 1e3),
                    r = e > 10 ? 10 : 0.5
                  this._startAutoRefreshToken(1e3 * (e - r))
                }
                this.persistSession && e.expires_at && (yield this._persistSession(e))
              })
            }
            _persistSession(e) {
              return (
                (t = this.storage),
                (r = this.storageKey),
                (n = e),
                s(void 0, void 0, void 0, function* () {
                  yield t.setItem(r, JSON.stringify(n))
                })
              )
              var t, r, n
            }
            _removeSession() {
              return A(this, void 0, void 0, function* () {
                var e, t
                this.persistSession
                  ? yield ((e = this.storage),
                    (t = this.storageKey),
                    s(void 0, void 0, void 0, function* () {
                      yield e.removeItem(t)
                    }))
                  : (this.inMemorySession = null),
                  this.refreshTokenTimer && clearTimeout(this.refreshTokenTimer)
              })
            }
            _startAutoRefreshToken(e) {
              this.refreshTokenTimer && clearTimeout(this.refreshTokenTimer),
                e <= 0 ||
                  !this.autoRefreshToken ||
                  ((this.refreshTokenTimer = setTimeout(
                    () =>
                      A(this, void 0, void 0, function* () {
                        this.networkRetries++
                        const {
                          data: { session: e },
                          error: t,
                        } = yield this.getSession()
                        if (!t && e) {
                          const { error: t } = yield this._callRefreshToken(e.refresh_token)
                          t || (this.networkRetries = 0),
                            t instanceof b &&
                              this.networkRetries < 10 &&
                              this._startAutoRefreshToken(100 * Math.pow(2, this.networkRetries))
                        }
                      }),
                    e
                  )),
                  'function' == typeof this.refreshTokenTimer.unref &&
                    this.refreshTokenTimer.unref())
            }
            _handleVisibilityChange() {
              if (
                !n() ||
                !(null === window || void 0 === window ? void 0 : window.addEventListener)
              )
                return !1
              try {
                null === window ||
                  void 0 === window ||
                  window.addEventListener('visibilitychange', () =>
                    A(this, void 0, void 0, function* () {
                      'visible' === document.visibilityState &&
                        (yield this.initializePromise, yield this._recoverAndRefresh())
                    })
                  )
              } catch (e) {
                console.error('_handleVisibilityChange', e)
              }
            }
            _getUrlForProvider(e, t) {
              const r = [`provider=${encodeURIComponent(e)}`]
              if (
                ((null == t ? void 0 : t.redirectTo) &&
                  r.push(`redirect_to=${encodeURIComponent(t.redirectTo)}`),
                (null == t ? void 0 : t.scopes) && r.push(`scopes=${encodeURIComponent(t.scopes)}`),
                null == t ? void 0 : t.queryParams)
              ) {
                const e = new URLSearchParams(t.queryParams)
                r.push(e.toString())
              }
              return `${this.url}/authorize?${r.join('&')}`
            }
            _unenroll(e) {
              var t
              return A(this, void 0, void 0, function* () {
                try {
                  const { data: r, error: s } = yield this.getSession()
                  return s
                    ? { data: null, error: s }
                    : yield E(this.fetch, 'DELETE', `${this.url}/factors/${e.factorId}`, {
                        headers: this.headers,
                        jwt:
                          null === (t = null == r ? void 0 : r.session) || void 0 === t
                            ? void 0
                            : t.access_token,
                      })
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            _enroll(e) {
              var t, r
              return A(this, void 0, void 0, function* () {
                try {
                  const { data: s, error: n } = yield this.getSession()
                  if (n) return { data: null, error: n }
                  const { data: i, error: o } = yield E(this.fetch, 'POST', `${this.url}/factors`, {
                    body: {
                      friendly_name: e.friendlyName,
                      factor_type: e.factorType,
                      issuer: e.issuer,
                    },
                    headers: this.headers,
                    jwt:
                      null === (t = null == s ? void 0 : s.session) || void 0 === t
                        ? void 0
                        : t.access_token,
                  })
                  return o
                    ? { data: null, error: o }
                    : ((null === (r = null == i ? void 0 : i.totp) || void 0 === r
                        ? void 0
                        : r.qr_code) &&
                        (i.totp.qr_code = `data:image/svg+xml;utf-8,${i.totp.qr_code}`),
                      { data: i, error: null })
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            _verify(e) {
              var t
              return A(this, void 0, void 0, function* () {
                try {
                  const { data: r, error: s } = yield this.getSession()
                  if (s) return { data: null, error: s }
                  const { data: n, error: i } = yield E(
                    this.fetch,
                    'POST',
                    `${this.url}/factors/${e.factorId}/verify`,
                    {
                      body: { code: e.code, challenge_id: e.challengeId },
                      headers: this.headers,
                      jwt:
                        null === (t = null == r ? void 0 : r.session) || void 0 === t
                          ? void 0
                          : t.access_token,
                    }
                  )
                  return i
                    ? { data: null, error: i }
                    : (yield this._saveSession(
                        Object.assign(
                          { expires_at: Math.round(Date.now() / 1e3) + n.expires_in },
                          n
                        )
                      ),
                      this._notifyAllSubscribers('MFA_CHALLENGE_VERIFIED', n),
                      { data: n, error: i })
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            _challenge(e) {
              var t
              return A(this, void 0, void 0, function* () {
                try {
                  const { data: r, error: s } = yield this.getSession()
                  return s
                    ? { data: null, error: s }
                    : yield E(this.fetch, 'POST', `${this.url}/factors/${e.factorId}/challenge`, {
                        headers: this.headers,
                        jwt:
                          null === (t = null == r ? void 0 : r.session) || void 0 === t
                            ? void 0
                            : t.access_token,
                      })
                } catch (e) {
                  if (u(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            _challengeAndVerify(e) {
              return A(this, void 0, void 0, function* () {
                const { data: t, error: r } = yield this._challenge({ factorId: e.factorId })
                return r
                  ? { data: null, error: r }
                  : yield this._verify({ factorId: e.factorId, challengeId: t.id, code: e.code })
              })
            }
            _listFactors() {
              return A(this, void 0, void 0, function* () {
                const {
                  data: { user: e },
                  error: t,
                } = yield this.getUser()
                if (t) return { data: null, error: t }
                const r = (null == e ? void 0 : e.factors) || [],
                  s = r.filter((e) => 'totp' === e.factor_type && 'verified' === e.status)
                return { data: { all: r, totp: s }, error: null }
              })
            }
            _getAuthenticatorAssuranceLevel() {
              var e, t
              return A(this, void 0, void 0, function* () {
                const {
                  data: { session: r },
                  error: s,
                } = yield this.getSession()
                if (s) return { data: null, error: s }
                if (!r)
                  return {
                    data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
                    error: null,
                  }
                const n = this._decodeJWT(r.access_token)
                let i = null
                n.aal && (i = n.aal)
                let o = i
                return (
                  (null !==
                    (t =
                      null === (e = r.user.factors) || void 0 === e
                        ? void 0
                        : e.filter((e) => 'verified' === e.status)) && void 0 !== t
                    ? t
                    : []
                  ).length > 0 && (o = 'aal2'),
                  {
                    data: {
                      currentLevel: i,
                      nextLevel: o,
                      currentAuthenticationMethods: n.amr || [],
                    },
                    error: null,
                  }
                )
              })
            }
          }
        },
        189: (e, t, r) => {
          'use strict'
          r.r(t),
            r.d(t, {
              PostgrestBuilder: () => i,
              PostgrestClient: () => l,
              PostgrestFilterBuilder: () => a,
              PostgrestQueryBuilder: () => h,
              PostgrestTransformBuilder: () => o,
            })
          var s = r(98),
            n = r.n(s)
          class i {
            constructor(e) {
              ;(this.shouldThrowOnError = !1),
                (this.method = e.method),
                (this.url = e.url),
                (this.headers = e.headers),
                (this.schema = e.schema),
                (this.body = e.body),
                (this.shouldThrowOnError = e.shouldThrowOnError),
                (this.signal = e.signal),
                (this.allowEmpty = e.allowEmpty),
                e.fetch
                  ? (this.fetch = e.fetch)
                  : 'undefined' == typeof fetch
                  ? (this.fetch = n())
                  : (this.fetch = fetch)
            }
            throwOnError() {
              return (this.shouldThrowOnError = !0), this
            }
            then(e, t) {
              void 0 === this.schema ||
                (['GET', 'HEAD'].includes(this.method)
                  ? (this.headers['Accept-Profile'] = this.schema)
                  : (this.headers['Content-Profile'] = this.schema)),
                'GET' !== this.method &&
                  'HEAD' !== this.method &&
                  (this.headers['Content-Type'] = 'application/json')
              let r = (0, this.fetch)(this.url.toString(), {
                method: this.method,
                headers: this.headers,
                body: JSON.stringify(this.body),
                signal: this.signal,
              }).then((e) => {
                return (
                  (t = this),
                  (r = void 0),
                  (n = function* () {
                    var t, r, s
                    let n = null,
                      i = null,
                      o = null,
                      a = e.status,
                      h = e.statusText
                    if (e.ok) {
                      if ('HEAD' !== this.method) {
                        const t = yield e.text()
                        '' === t ||
                          (i =
                            'text/csv' === this.headers.Accept ||
                            (this.headers.Accept &&
                              this.headers.Accept.includes('application/vnd.pgrst.plan+text'))
                              ? t
                              : JSON.parse(t))
                      }
                      const s =
                          null === (t = this.headers.Prefer) || void 0 === t
                            ? void 0
                            : t.match(/count=(exact|planned|estimated)/),
                        n =
                          null === (r = e.headers.get('content-range')) || void 0 === r
                            ? void 0
                            : r.split('/')
                      s && n && n.length > 1 && (o = parseInt(n[1]))
                    } else {
                      const t = yield e.text()
                      try {
                        ;(n = JSON.parse(t)),
                          Array.isArray(n) &&
                            404 === e.status &&
                            ((i = []), (n = null), (a = 200), (h = 'OK'))
                      } catch (r) {
                        404 === e.status && '' === t
                          ? ((a = 204), (h = 'No Content'))
                          : (n = { message: t })
                      }
                      if (
                        (n &&
                          this.allowEmpty &&
                          (null === (s = null == n ? void 0 : n.details) || void 0 === s
                            ? void 0
                            : s.includes('Results contain 0 rows')) &&
                          ((n = null), (a = 200), (h = 'OK')),
                        n && this.shouldThrowOnError)
                      )
                        throw n
                    }
                    return { error: n, data: i, count: o, status: a, statusText: h }
                  }),
                  new ((s = void 0) || (s = Promise))(function (e, i) {
                    function o(e) {
                      try {
                        h(n.next(e))
                      } catch (e) {
                        i(e)
                      }
                    }
                    function a(e) {
                      try {
                        h(n.throw(e))
                      } catch (e) {
                        i(e)
                      }
                    }
                    function h(t) {
                      var r
                      t.done
                        ? e(t.value)
                        : ((r = t.value),
                          r instanceof s
                            ? r
                            : new s(function (e) {
                                e(r)
                              })).then(o, a)
                    }
                    h((n = n.apply(t, r || [])).next())
                  })
                )
                var t, r, s, n
              })
              return (
                this.shouldThrowOnError ||
                  (r = r.catch((e) => ({
                    error: {
                      message: `FetchError: ${e.message}`,
                      details: '',
                      hint: '',
                      code: e.code || '',
                    },
                    data: null,
                    count: null,
                    status: 0,
                    statusText: '',
                  }))),
                r.then(e, t)
              )
            }
          }
          class o extends i {
            select(e) {
              let t = !1
              const r = (null != e ? e : '*')
                .split('')
                .map((e) => (/\s/.test(e) && !t ? '' : ('"' === e && (t = !t), e)))
                .join('')
              return (
                this.url.searchParams.set('select', r),
                this.headers.Prefer && (this.headers.Prefer += ','),
                (this.headers.Prefer += 'return=representation'),
                this
              )
            }
            order(e, { ascending: t = !0, nullsFirst: r, foreignTable: s } = {}) {
              const n = s ? `${s}.order` : 'order',
                i = this.url.searchParams.get(n)
              return (
                this.url.searchParams.set(
                  n,
                  `${i ? `${i},` : ''}${e}.${t ? 'asc' : 'desc'}${
                    void 0 === r ? '' : r ? '.nullsfirst' : '.nullslast'
                  }`
                ),
                this
              )
            }
            limit(e, { foreignTable: t } = {}) {
              const r = void 0 === t ? 'limit' : `${t}.limit`
              return this.url.searchParams.set(r, `${e}`), this
            }
            range(e, t, { foreignTable: r } = {}) {
              const s = void 0 === r ? 'offset' : `${r}.offset`,
                n = void 0 === r ? 'limit' : `${r}.limit`
              return (
                this.url.searchParams.set(s, `${e}`),
                this.url.searchParams.set(n, '' + (t - e + 1)),
                this
              )
            }
            abortSignal(e) {
              return (this.signal = e), this
            }
            single() {
              return (this.headers.Accept = 'application/vnd.pgrst.object+json'), this
            }
            maybeSingle() {
              return (
                (this.headers.Accept = 'application/vnd.pgrst.object+json'),
                (this.allowEmpty = !0),
                this
              )
            }
            csv() {
              return (this.headers.Accept = 'text/csv'), this
            }
            geojson() {
              return (this.headers.Accept = 'application/geo+json'), this
            }
            explain({
              analyze: e = !1,
              verbose: t = !1,
              settings: r = !1,
              buffers: s = !1,
              wal: n = !1,
              format: i = 'text',
            } = {}) {
              const o = [
                  e ? 'analyze' : null,
                  t ? 'verbose' : null,
                  r ? 'settings' : null,
                  s ? 'buffers' : null,
                  n ? 'wal' : null,
                ]
                  .filter(Boolean)
                  .join('|'),
                a = this.headers.Accept
              return (
                (this.headers.Accept = `application/vnd.pgrst.plan+${i}; for="${a}"; options=${o};`),
                this
              )
            }
            rollback() {
              var e
              return (
                (null !== (e = this.headers.Prefer) && void 0 !== e ? e : '').trim().length > 0
                  ? (this.headers.Prefer += ',tx=rollback')
                  : (this.headers.Prefer = 'tx=rollback'),
                this
              )
            }
            returns() {
              return this
            }
          }
          class a extends o {
            eq(e, t) {
              return this.url.searchParams.append(e, `eq.${t}`), this
            }
            neq(e, t) {
              return this.url.searchParams.append(e, `neq.${t}`), this
            }
            gt(e, t) {
              return this.url.searchParams.append(e, `gt.${t}`), this
            }
            gte(e, t) {
              return this.url.searchParams.append(e, `gte.${t}`), this
            }
            lt(e, t) {
              return this.url.searchParams.append(e, `lt.${t}`), this
            }
            lte(e, t) {
              return this.url.searchParams.append(e, `lte.${t}`), this
            }
            like(e, t) {
              return this.url.searchParams.append(e, `like.${t}`), this
            }
            ilike(e, t) {
              return this.url.searchParams.append(e, `ilike.${t}`), this
            }
            is(e, t) {
              return this.url.searchParams.append(e, `is.${t}`), this
            }
            in(e, t) {
              const r = t
                .map((e) =>
                  'string' == typeof e && new RegExp('[,()]').test(e) ? `"${e}"` : `${e}`
                )
                .join(',')
              return this.url.searchParams.append(e, `in.(${r})`), this
            }
            contains(e, t) {
              return (
                'string' == typeof t
                  ? this.url.searchParams.append(e, `cs.${t}`)
                  : Array.isArray(t)
                  ? this.url.searchParams.append(e, `cs.{${t.join(',')}}`)
                  : this.url.searchParams.append(e, `cs.${JSON.stringify(t)}`),
                this
              )
            }
            containedBy(e, t) {
              return (
                'string' == typeof t
                  ? this.url.searchParams.append(e, `cd.${t}`)
                  : Array.isArray(t)
                  ? this.url.searchParams.append(e, `cd.{${t.join(',')}}`)
                  : this.url.searchParams.append(e, `cd.${JSON.stringify(t)}`),
                this
              )
            }
            rangeGt(e, t) {
              return this.url.searchParams.append(e, `sr.${t}`), this
            }
            rangeGte(e, t) {
              return this.url.searchParams.append(e, `nxl.${t}`), this
            }
            rangeLt(e, t) {
              return this.url.searchParams.append(e, `sl.${t}`), this
            }
            rangeLte(e, t) {
              return this.url.searchParams.append(e, `nxr.${t}`), this
            }
            rangeAdjacent(e, t) {
              return this.url.searchParams.append(e, `adj.${t}`), this
            }
            overlaps(e, t) {
              return (
                'string' == typeof t
                  ? this.url.searchParams.append(e, `ov.${t}`)
                  : this.url.searchParams.append(e, `ov.{${t.join(',')}}`),
                this
              )
            }
            textSearch(e, t, { config: r, type: s } = {}) {
              let n = ''
              'plain' === s
                ? (n = 'pl')
                : 'phrase' === s
                ? (n = 'ph')
                : 'websearch' === s && (n = 'w')
              const i = void 0 === r ? '' : `(${r})`
              return this.url.searchParams.append(e, `${n}fts${i}.${t}`), this
            }
            match(e) {
              return (
                Object.entries(e).forEach(([e, t]) => {
                  this.url.searchParams.append(e, `eq.${t}`)
                }),
                this
              )
            }
            not(e, t, r) {
              return this.url.searchParams.append(e, `not.${t}.${r}`), this
            }
            or(e, { foreignTable: t } = {}) {
              const r = t ? `${t}.or` : 'or'
              return this.url.searchParams.append(r, `(${e})`), this
            }
            filter(e, t, r) {
              return this.url.searchParams.append(e, `${t}.${r}`), this
            }
          }
          class h {
            constructor(e, { headers: t = {}, schema: r, fetch: s }) {
              ;(this.url = e), (this.headers = t), (this.schema = r), (this.fetch = s)
            }
            select(e, { head: t = !1, count: r } = {}) {
              const s = t ? 'HEAD' : 'GET'
              let n = !1
              const i = (null != e ? e : '*')
                .split('')
                .map((e) => (/\s/.test(e) && !n ? '' : ('"' === e && (n = !n), e)))
                .join('')
              return (
                this.url.searchParams.set('select', i),
                r && (this.headers.Prefer = `count=${r}`),
                new a({
                  method: s,
                  url: this.url,
                  headers: this.headers,
                  schema: this.schema,
                  fetch: this.fetch,
                  allowEmpty: !1,
                })
              )
            }
            insert(e, { count: t } = {}) {
              const r = [],
                s = e
              if (
                (t && r.push(`count=${t}`),
                this.headers.Prefer && r.unshift(this.headers.Prefer),
                (this.headers.Prefer = r.join(',')),
                Array.isArray(e))
              ) {
                const t = e.reduce((e, t) => e.concat(Object.keys(t)), [])
                if (t.length > 0) {
                  const e = [...Array.from(new Set(t))].map((e) => `"${e}"`)
                  this.url.searchParams.set('columns', e.join(','))
                }
              }
              return new a({
                method: 'POST',
                url: this.url,
                headers: this.headers,
                schema: this.schema,
                body: s,
                fetch: this.fetch,
                allowEmpty: !1,
              })
            }
            upsert(e, { onConflict: t, ignoreDuplicates: r = !1, count: s } = {}) {
              const n = [`resolution=${r ? 'ignore' : 'merge'}-duplicates`]
              void 0 !== t && this.url.searchParams.set('on_conflict', t)
              const i = e
              return (
                s && n.push(`count=${s}`),
                this.headers.Prefer && n.unshift(this.headers.Prefer),
                (this.headers.Prefer = n.join(',')),
                new a({
                  method: 'POST',
                  url: this.url,
                  headers: this.headers,
                  schema: this.schema,
                  body: i,
                  fetch: this.fetch,
                  allowEmpty: !1,
                })
              )
            }
            update(e, { count: t } = {}) {
              const r = [],
                s = e
              return (
                t && r.push(`count=${t}`),
                this.headers.Prefer && r.unshift(this.headers.Prefer),
                (this.headers.Prefer = r.join(',')),
                new a({
                  method: 'PATCH',
                  url: this.url,
                  headers: this.headers,
                  schema: this.schema,
                  body: s,
                  fetch: this.fetch,
                  allowEmpty: !1,
                })
              )
            }
            delete({ count: e } = {}) {
              const t = []
              return (
                e && t.push(`count=${e}`),
                this.headers.Prefer && t.unshift(this.headers.Prefer),
                (this.headers.Prefer = t.join(',')),
                new a({
                  method: 'DELETE',
                  url: this.url,
                  headers: this.headers,
                  schema: this.schema,
                  fetch: this.fetch,
                  allowEmpty: !1,
                })
              )
            }
          }
          const c = { 'X-Client-Info': 'postgrest-js/1.1.1' }
          class l {
            constructor(e, { headers: t = {}, schema: r, fetch: s } = {}) {
              ;(this.url = e),
                (this.headers = Object.assign(Object.assign({}, c), t)),
                (this.schema = r),
                (this.fetch = s)
            }
            from(e) {
              const t = new URL(`${this.url}/${e}`)
              return new h(t, {
                headers: Object.assign({}, this.headers),
                schema: this.schema,
                fetch: this.fetch,
              })
            }
            rpc(e, t = {}, { head: r = !1, count: s } = {}) {
              let n
              const i = new URL(`${this.url}/rpc/${e}`)
              let o
              r
                ? ((n = 'HEAD'),
                  Object.entries(t).forEach(([e, t]) => {
                    i.searchParams.append(e, `${t}`)
                  }))
                : ((n = 'POST'), (o = t))
              const h = Object.assign({}, this.headers)
              return (
                s && (h.Prefer = `count=${s}`),
                new a({
                  method: n,
                  url: i,
                  headers: h,
                  schema: this.schema,
                  body: o,
                  fetch: this.fetch,
                  allowEmpty: !1,
                })
              )
            }
          }
        },
        73: (e, t, r) => {
          'use strict'
          r.r(t),
            r.d(t, {
              REALTIME_LISTEN_TYPES: () => j,
              REALTIME_POSTGRES_CHANGES_LISTEN_EVENT: () => S,
              REALTIME_PRESENCE_LISTEN_EVENTS: () => l,
              REALTIME_SUBSCRIBE_STATES: () => P,
              RealtimeChannel: () => k,
              RealtimeClient: () => A,
              RealtimePresence: () => v,
            })
          var s = r(840)
          const n = { 'X-Client-Info': 'realtime-js/2.1.0' }
          var i, o, a, h, c, l, u
          !(function (e) {
            ;(e[(e.connecting = 0)] = 'connecting'),
              (e[(e.open = 1)] = 'open'),
              (e[(e.closing = 2)] = 'closing'),
              (e[(e.closed = 3)] = 'closed')
          })(i || (i = {})),
            (function (e) {
              ;(e.closed = 'closed'),
                (e.errored = 'errored'),
                (e.joined = 'joined'),
                (e.joining = 'joining'),
                (e.leaving = 'leaving')
            })(o || (o = {})),
            (function (e) {
              ;(e.close = 'phx_close'),
                (e.error = 'phx_error'),
                (e.join = 'phx_join'),
                (e.reply = 'phx_reply'),
                (e.leave = 'phx_leave'),
                (e.access_token = 'access_token')
            })(a || (a = {})),
            (function (e) {
              e.websocket = 'websocket'
            })(h || (h = {})),
            (function (e) {
              ;(e.Connecting = 'connecting'),
                (e.Open = 'open'),
                (e.Closing = 'closing'),
                (e.Closed = 'closed')
            })(c || (c = {}))
          class d {
            constructor(e, t) {
              ;(this.callback = e),
                (this.timerCalc = t),
                (this.timer = void 0),
                (this.tries = 0),
                (this.callback = e),
                (this.timerCalc = t)
            }
            reset() {
              ;(this.tries = 0), clearTimeout(this.timer)
            }
            scheduleTimeout() {
              clearTimeout(this.timer),
                (this.timer = setTimeout(() => {
                  ;(this.tries = this.tries + 1), this.callback()
                }, this.timerCalc(this.tries + 1)))
            }
          }
          class f {
            constructor() {
              this.HEADER_LENGTH = 1
            }
            decode(e, t) {
              return e.constructor === ArrayBuffer
                ? t(this._binaryDecode(e))
                : t('string' == typeof e ? JSON.parse(e) : {})
            }
            _binaryDecode(e) {
              const t = new DataView(e),
                r = new TextDecoder()
              return this._decodeBroadcast(e, t, r)
            }
            _decodeBroadcast(e, t, r) {
              const s = t.getUint8(1),
                n = t.getUint8(2)
              let i = this.HEADER_LENGTH + 2
              const o = r.decode(e.slice(i, i + s))
              i += s
              const a = r.decode(e.slice(i, i + n))
              return (
                (i += n),
                {
                  ref: null,
                  topic: o,
                  event: a,
                  payload: JSON.parse(r.decode(e.slice(i, e.byteLength))),
                }
              )
            }
          }
          class p {
            constructor(e, t, r = {}, s = 1e4) {
              ;(this.channel = e),
                (this.event = t),
                (this.payload = r),
                (this.timeout = s),
                (this.sent = !1),
                (this.timeoutTimer = void 0),
                (this.ref = ''),
                (this.receivedResp = null),
                (this.recHooks = []),
                (this.refEvent = null),
                (this.rateLimited = !1)
            }
            resend(e) {
              ;(this.timeout = e),
                this._cancelRefEvent(),
                (this.ref = ''),
                (this.refEvent = null),
                (this.receivedResp = null),
                (this.sent = !1),
                this.send()
            }
            send() {
              this._hasReceived('timeout') ||
                (this.startTimeout(),
                (this.sent = !0),
                'rate limited' ===
                  this.channel.socket.push({
                    topic: this.channel.topic,
                    event: this.event,
                    payload: this.payload,
                    ref: this.ref,
                    join_ref: this.channel._joinRef(),
                  }) && (this.rateLimited = !0))
            }
            updatePayload(e) {
              this.payload = Object.assign(Object.assign({}, this.payload), e)
            }
            receive(e, t) {
              var r
              return (
                this._hasReceived(e) &&
                  t(null === (r = this.receivedResp) || void 0 === r ? void 0 : r.response),
                this.recHooks.push({ status: e, callback: t }),
                this
              )
            }
            startTimeout() {
              this.timeoutTimer ||
                ((this.ref = this.channel.socket._makeRef()),
                (this.refEvent = this.channel._replyEventName(this.ref)),
                this.channel._on(this.refEvent, {}, (e) => {
                  this._cancelRefEvent(),
                    this._cancelTimeout(),
                    (this.receivedResp = e),
                    this._matchReceive(e)
                }),
                (this.timeoutTimer = setTimeout(() => {
                  this.trigger('timeout', {})
                }, this.timeout)))
            }
            trigger(e, t) {
              this.refEvent && this.channel._trigger(this.refEvent, { status: e, response: t })
            }
            destroy() {
              this._cancelRefEvent(), this._cancelTimeout()
            }
            _cancelRefEvent() {
              this.refEvent && this.channel._off(this.refEvent, {})
            }
            _cancelTimeout() {
              clearTimeout(this.timeoutTimer), (this.timeoutTimer = void 0)
            }
            _matchReceive({ status: e, response: t }) {
              this.recHooks.filter((t) => t.status === e).forEach((e) => e.callback(t))
            }
            _hasReceived(e) {
              return this.receivedResp && this.receivedResp.status === e
            }
          }
          !(function (e) {
            ;(e.SYNC = 'sync'), (e.JOIN = 'join'), (e.LEAVE = 'leave')
          })(l || (l = {}))
          class v {
            constructor(e, t) {
              ;(this.channel = e),
                (this.state = {}),
                (this.pendingDiffs = []),
                (this.joinRef = null),
                (this.caller = { onJoin: () => {}, onLeave: () => {}, onSync: () => {} })
              const r = (null == t ? void 0 : t.events) || {
                state: 'presence_state',
                diff: 'presence_diff',
              }
              this.channel._on(r.state, {}, (e) => {
                const { onJoin: t, onLeave: r, onSync: s } = this.caller
                ;(this.joinRef = this.channel._joinRef()),
                  (this.state = v.syncState(this.state, e, t, r)),
                  this.pendingDiffs.forEach((e) => {
                    this.state = v.syncDiff(this.state, e, t, r)
                  }),
                  (this.pendingDiffs = []),
                  s()
              }),
                this.channel._on(r.diff, {}, (e) => {
                  const { onJoin: t, onLeave: r, onSync: s } = this.caller
                  this.inPendingSyncState()
                    ? this.pendingDiffs.push(e)
                    : ((this.state = v.syncDiff(this.state, e, t, r)), s())
                }),
                this.onJoin((e, t, r) => {
                  this.channel._trigger('presence', {
                    event: 'join',
                    key: e,
                    currentPresences: t,
                    newPresences: r,
                  })
                }),
                this.onLeave((e, t, r) => {
                  this.channel._trigger('presence', {
                    event: 'leave',
                    key: e,
                    currentPresences: t,
                    leftPresences: r,
                  })
                }),
                this.onSync(() => {
                  this.channel._trigger('presence', { event: 'sync' })
                })
            }
            static syncState(e, t, r, s) {
              const n = this.cloneDeep(e),
                i = this.transformState(t),
                o = {},
                a = {}
              return (
                this.map(n, (e, t) => {
                  i[e] || (a[e] = t)
                }),
                this.map(i, (e, t) => {
                  const r = n[e]
                  if (r) {
                    const s = t.map((e) => e.presence_ref),
                      n = r.map((e) => e.presence_ref),
                      i = t.filter((e) => n.indexOf(e.presence_ref) < 0),
                      h = r.filter((e) => s.indexOf(e.presence_ref) < 0)
                    i.length > 0 && (o[e] = i), h.length > 0 && (a[e] = h)
                  } else o[e] = t
                }),
                this.syncDiff(n, { joins: o, leaves: a }, r, s)
              )
            }
            static syncDiff(e, t, r, s) {
              const { joins: n, leaves: i } = {
                joins: this.transformState(t.joins),
                leaves: this.transformState(t.leaves),
              }
              return (
                r || (r = () => {}),
                s || (s = () => {}),
                this.map(n, (t, s) => {
                  var n
                  const i = null !== (n = e[t]) && void 0 !== n ? n : []
                  if (((e[t] = this.cloneDeep(s)), i.length > 0)) {
                    const r = e[t].map((e) => e.presence_ref),
                      s = i.filter((e) => r.indexOf(e.presence_ref) < 0)
                    e[t].unshift(...s)
                  }
                  r(t, i, s)
                }),
                this.map(i, (t, r) => {
                  let n = e[t]
                  if (!n) return
                  const i = r.map((e) => e.presence_ref)
                  ;(n = n.filter((e) => i.indexOf(e.presence_ref) < 0)),
                    (e[t] = n),
                    s(t, n, r),
                    0 === n.length && delete e[t]
                }),
                e
              )
            }
            static map(e, t) {
              return Object.getOwnPropertyNames(e).map((r) => t(r, e[r]))
            }
            static transformState(e) {
              return (
                (e = this.cloneDeep(e)),
                Object.getOwnPropertyNames(e).reduce((t, r) => {
                  const s = e[r]
                  return (
                    (t[r] =
                      'metas' in s
                        ? s.metas.map(
                            (e) => (
                              (e.presence_ref = e.phx_ref),
                              delete e.phx_ref,
                              delete e.phx_ref_prev,
                              e
                            )
                          )
                        : s),
                    t
                  )
                }, {})
              )
            }
            static cloneDeep(e) {
              return JSON.parse(JSON.stringify(e))
            }
            onJoin(e) {
              this.caller.onJoin = e
            }
            onLeave(e) {
              this.caller.onLeave = e
            }
            onSync(e) {
              this.caller.onSync = e
            }
            inPendingSyncState() {
              return !this.joinRef || this.joinRef !== this.channel._joinRef()
            }
          }
          !(function (e) {
            ;(e.abstime = 'abstime'),
              (e.bool = 'bool'),
              (e.date = 'date'),
              (e.daterange = 'daterange'),
              (e.float4 = 'float4'),
              (e.float8 = 'float8'),
              (e.int2 = 'int2'),
              (e.int4 = 'int4'),
              (e.int4range = 'int4range'),
              (e.int8 = 'int8'),
              (e.int8range = 'int8range'),
              (e.json = 'json'),
              (e.jsonb = 'jsonb'),
              (e.money = 'money'),
              (e.numeric = 'numeric'),
              (e.oid = 'oid'),
              (e.reltime = 'reltime'),
              (e.text = 'text'),
              (e.time = 'time'),
              (e.timestamp = 'timestamp'),
              (e.timestamptz = 'timestamptz'),
              (e.timetz = 'timetz'),
              (e.tsrange = 'tsrange'),
              (e.tstzrange = 'tstzrange')
          })(u || (u = {}))
          const y = (e, t, r = {}) => {
              var s
              const n = null !== (s = r.skipTypes) && void 0 !== s ? s : []
              return Object.keys(t).reduce((r, s) => ((r[s] = m(s, e, t, n)), r), {})
            },
            m = (e, t, r, s) => {
              const n = t.find((t) => t.name === e),
                i = null == n ? void 0 : n.type,
                o = r[e]
              return i && !s.includes(i) ? g(i, o) : b(o)
            },
            g = (e, t) => {
              if ('_' === e.charAt(0)) {
                const r = e.slice(1, e.length)
                return T(t, r)
              }
              switch (e) {
                case u.bool:
                  return _(t)
                case u.float4:
                case u.float8:
                case u.int2:
                case u.int4:
                case u.int8:
                case u.numeric:
                case u.oid:
                  return w(t)
                case u.json:
                case u.jsonb:
                  return E(t)
                case u.timestamp:
                  return O(t)
                case u.abstime:
                case u.date:
                case u.daterange:
                case u.int4range:
                case u.int8range:
                case u.money:
                case u.reltime:
                case u.text:
                case u.time:
                case u.timestamptz:
                case u.timetz:
                case u.tsrange:
                case u.tstzrange:
                default:
                  return b(t)
              }
            },
            b = (e) => e,
            _ = (e) => {
              switch (e) {
                case 't':
                  return !0
                case 'f':
                  return !1
                default:
                  return e
              }
            },
            w = (e) => {
              if ('string' == typeof e) {
                const t = parseFloat(e)
                if (!Number.isNaN(t)) return t
              }
              return e
            },
            E = (e) => {
              if ('string' == typeof e)
                try {
                  return JSON.parse(e)
                } catch (t) {
                  return console.log(`JSON parse error: ${t}`), e
                }
              return e
            },
            T = (e, t) => {
              if ('string' != typeof e) return e
              const r = e.length - 1,
                s = e[r]
              if ('{' === e[0] && '}' === s) {
                let s
                const n = e.slice(1, r)
                try {
                  s = JSON.parse('[' + n + ']')
                } catch (e) {
                  s = n ? n.split(',') : []
                }
                return s.map((e) => g(t, e))
              }
              return e
            },
            O = (e) => ('string' == typeof e ? e.replace(' ', 'T') : e)
          var S,
            j,
            P,
            x = function (e, t, r, s) {
              return new (r || (r = Promise))(function (n, i) {
                function o(e) {
                  try {
                    h(s.next(e))
                  } catch (e) {
                    i(e)
                  }
                }
                function a(e) {
                  try {
                    h(s.throw(e))
                  } catch (e) {
                    i(e)
                  }
                }
                function h(e) {
                  var t
                  e.done
                    ? n(e.value)
                    : ((t = e.value),
                      t instanceof r
                        ? t
                        : new r(function (e) {
                            e(t)
                          })).then(o, a)
                }
                h((s = s.apply(e, t || [])).next())
              })
            }
          !(function (e) {
            ;(e.ALL = '*'), (e.INSERT = 'INSERT'), (e.UPDATE = 'UPDATE'), (e.DELETE = 'DELETE')
          })(S || (S = {})),
            (function (e) {
              ;(e.BROADCAST = 'broadcast'),
                (e.PRESENCE = 'presence'),
                (e.POSTGRES_CHANGES = 'postgres_changes')
            })(j || (j = {})),
            (function (e) {
              ;(e.SUBSCRIBED = 'SUBSCRIBED'),
                (e.TIMED_OUT = 'TIMED_OUT'),
                (e.CLOSED = 'CLOSED'),
                (e.CHANNEL_ERROR = 'CHANNEL_ERROR')
            })(P || (P = {}))
          class k {
            constructor(e, t = { config: {} }, r) {
              ;(this.topic = e),
                (this.params = t),
                (this.socket = r),
                (this.bindings = {}),
                (this.state = o.closed),
                (this.joinedOnce = !1),
                (this.pushBuffer = []),
                (this.params.config = Object.assign(
                  { broadcast: { ack: !1, self: !1 }, presence: { key: '' } },
                  t.config
                )),
                (this.timeout = this.socket.timeout),
                (this.joinPush = new p(this, a.join, this.params, this.timeout)),
                (this.rejoinTimer = new d(
                  () => this._rejoinUntilConnected(),
                  this.socket.reconnectAfterMs
                )),
                this.joinPush.receive('ok', () => {
                  ;(this.state = o.joined),
                    this.rejoinTimer.reset(),
                    this.pushBuffer.forEach((e) => e.send()),
                    (this.pushBuffer = [])
                }),
                this._onClose(() => {
                  this.rejoinTimer.reset(),
                    this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`),
                    (this.state = o.closed),
                    this.socket._remove(this)
                }),
                this._onError((e) => {
                  this._isLeaving() ||
                    this._isClosed() ||
                    (this.socket.log('channel', `error ${this.topic}`, e),
                    (this.state = o.errored),
                    this.rejoinTimer.scheduleTimeout())
                }),
                this.joinPush.receive('timeout', () => {
                  this._isJoining() &&
                    (this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout),
                    (this.state = o.errored),
                    this.rejoinTimer.scheduleTimeout())
                }),
                this._on(a.reply, {}, (e, t) => {
                  this._trigger(this._replyEventName(t), e)
                }),
                (this.presence = new v(this))
            }
            subscribe(e, t = this.timeout) {
              var r, s
              if (this.joinedOnce)
                throw "tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance"
              {
                const {
                  config: { broadcast: n, presence: i },
                } = this.params
                this._onError((t) => e && e('CHANNEL_ERROR', t)),
                  this._onClose(() => e && e('CLOSED'))
                const o = {},
                  a = {
                    broadcast: n,
                    presence: i,
                    postgres_changes:
                      null !==
                        (s =
                          null === (r = this.bindings.postgres_changes) || void 0 === r
                            ? void 0
                            : r.map((e) => e.filter)) && void 0 !== s
                        ? s
                        : [],
                  }
                this.socket.accessToken && (o.access_token = this.socket.accessToken),
                  this.updateJoinPayload(Object.assign({ config: a }, o)),
                  (this.joinedOnce = !0),
                  this._rejoin(t),
                  this.joinPush
                    .receive('ok', ({ postgres_changes: t }) => {
                      var r
                      if (
                        (this.socket.accessToken && this.socket.setAuth(this.socket.accessToken),
                        void 0 !== t)
                      ) {
                        const s = this.bindings.postgres_changes,
                          n = null !== (r = null == s ? void 0 : s.length) && void 0 !== r ? r : 0,
                          i = []
                        for (let r = 0; r < n; r++) {
                          const n = s[r],
                            {
                              filter: { event: o, schema: a, table: h, filter: c },
                            } = n,
                            l = t && t[r]
                          if (
                            !l ||
                            l.event !== o ||
                            l.schema !== a ||
                            l.table !== h ||
                            l.filter !== c
                          )
                            return (
                              this.unsubscribe(),
                              void (
                                e &&
                                e(
                                  'CHANNEL_ERROR',
                                  new Error(
                                    'mismatch between server and client bindings for postgres changes'
                                  )
                                )
                              )
                            )
                          i.push(Object.assign(Object.assign({}, n), { id: l.id }))
                        }
                        return (this.bindings.postgres_changes = i), void (e && e('SUBSCRIBED'))
                      }
                      e && e('SUBSCRIBED')
                    })
                    .receive('error', (t) => {
                      e &&
                        e(
                          'CHANNEL_ERROR',
                          new Error(JSON.stringify(Object.values(t).join(', ') || 'error'))
                        )
                    })
                    .receive('timeout', () => {
                      e && e('TIMED_OUT')
                    })
              }
              return this
            }
            presenceState() {
              return this.presence.state
            }
            track(e, t = {}) {
              return x(this, void 0, void 0, function* () {
                return yield this.send(
                  { type: 'presence', event: 'track', payload: e },
                  t.timeout || this.timeout
                )
              })
            }
            untrack(e = {}) {
              return x(this, void 0, void 0, function* () {
                return yield this.send({ type: 'presence', event: 'untrack' }, e)
              })
            }
            on(e, t, r) {
              return this._on(e, t, r)
            }
            send(e, t = {}) {
              return new Promise((r) => {
                var s, n, i
                const o = this._push(e.type, e, t.timeout || this.timeout)
                o.rateLimited && r('rate limited'),
                  'broadcast' !== e.type ||
                    (null ===
                      (i =
                        null ===
                          (n = null === (s = this.params) || void 0 === s ? void 0 : s.config) ||
                        void 0 === n
                          ? void 0
                          : n.broadcast) || void 0 === i
                      ? void 0
                      : i.ack) ||
                    r('ok'),
                  o.receive('ok', () => r('ok')),
                  o.receive('timeout', () => r('timed out'))
              })
            }
            updateJoinPayload(e) {
              this.joinPush.updatePayload(e)
            }
            unsubscribe(e = this.timeout) {
              this.state = o.leaving
              const t = () => {
                this.socket.log('channel', `leave ${this.topic}`),
                  this._trigger(a.close, 'leave', this._joinRef())
              }
              return (
                this.rejoinTimer.reset(),
                this.joinPush.destroy(),
                new Promise((r) => {
                  const s = new p(this, a.leave, {}, e)
                  s
                    .receive('ok', () => {
                      t(), r('ok')
                    })
                    .receive('timeout', () => {
                      t(), r('timed out')
                    })
                    .receive('error', () => {
                      r('error')
                    }),
                    s.send(),
                    this._canPush() || s.trigger('ok', {})
                })
              )
            }
            _push(e, t, r = this.timeout) {
              if (!this.joinedOnce)
                throw `tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`
              let s = new p(this, e, t, r)
              return this._canPush() ? s.send() : (s.startTimeout(), this.pushBuffer.push(s)), s
            }
            _onMessage(e, t, r) {
              return t
            }
            _isMember(e) {
              return this.topic === e
            }
            _joinRef() {
              return this.joinPush.ref
            }
            _trigger(e, t, r) {
              var s, n
              const i = e.toLocaleLowerCase(),
                { close: o, error: h, leave: c, join: l } = a
              if (r && [o, h, c, l].indexOf(i) >= 0 && r !== this._joinRef()) return
              let u = this._onMessage(i, t, r)
              if (t && !u)
                throw 'channel onMessage callbacks must return the payload, modified or unmodified'
              ;['insert', 'update', 'delete'].includes(i)
                ? null === (s = this.bindings.postgres_changes) ||
                  void 0 === s ||
                  s
                    .filter((e) => {
                      var t, r, s
                      return (
                        '*' === (null === (t = e.filter) || void 0 === t ? void 0 : t.event) ||
                        (null ===
                          (s = null === (r = e.filter) || void 0 === r ? void 0 : r.event) ||
                        void 0 === s
                          ? void 0
                          : s.toLocaleLowerCase()) === i
                      )
                    })
                    .map((e) => e.callback(u, r))
                : null === (n = this.bindings[i]) ||
                  void 0 === n ||
                  n
                    .filter((e) => {
                      var r, s, n, o, a, h
                      if (['broadcast', 'presence', 'postgres_changes'].includes(i)) {
                        if ('id' in e) {
                          const i = e.id,
                            o = null === (r = e.filter) || void 0 === r ? void 0 : r.event
                          return (
                            i &&
                            (null === (s = t.ids) || void 0 === s ? void 0 : s.includes(i)) &&
                            ('*' === o ||
                              (null == o ? void 0 : o.toLocaleLowerCase()) ===
                                (null === (n = t.data) || void 0 === n
                                  ? void 0
                                  : n.type.toLocaleLowerCase()))
                          )
                        }
                        {
                          const r =
                            null ===
                              (a =
                                null === (o = null == e ? void 0 : e.filter) || void 0 === o
                                  ? void 0
                                  : o.event) || void 0 === a
                              ? void 0
                              : a.toLocaleLowerCase()
                          return (
                            '*' === r ||
                            r ===
                              (null === (h = null == t ? void 0 : t.event) || void 0 === h
                                ? void 0
                                : h.toLocaleLowerCase())
                          )
                        }
                      }
                      return e.type.toLocaleLowerCase() === i
                    })
                    .map((e) => {
                      if ('object' == typeof u && 'ids' in u) {
                        const e = u.data,
                          { schema: t, table: r, commit_timestamp: s, type: n, errors: i } = e,
                          o = {
                            schema: t,
                            table: r,
                            commit_timestamp: s,
                            eventType: n,
                            new: {},
                            old: {},
                            errors: i,
                          }
                        u = Object.assign(Object.assign({}, o), this._getPayloadRecords(e))
                      }
                      e.callback(u, r)
                    })
            }
            _isClosed() {
              return this.state === o.closed
            }
            _isJoined() {
              return this.state === o.joined
            }
            _isJoining() {
              return this.state === o.joining
            }
            _isLeaving() {
              return this.state === o.leaving
            }
            _replyEventName(e) {
              return `chan_reply_${e}`
            }
            _on(e, t, r) {
              const s = e.toLocaleLowerCase(),
                n = { type: s, filter: t, callback: r }
              return this.bindings[s] ? this.bindings[s].push(n) : (this.bindings[s] = [n]), this
            }
            _off(e, t) {
              const r = e.toLocaleLowerCase()
              return (
                (this.bindings[r] = this.bindings[r].filter((e) => {
                  var s
                  return !(
                    (null === (s = e.type) || void 0 === s ? void 0 : s.toLocaleLowerCase()) ===
                      r && k.isEqual(e.filter, t)
                  )
                })),
                this
              )
            }
            static isEqual(e, t) {
              if (Object.keys(e).length !== Object.keys(t).length) return !1
              for (const r in e) if (e[r] !== t[r]) return !1
              return !0
            }
            _rejoinUntilConnected() {
              this.rejoinTimer.scheduleTimeout(), this.socket.isConnected() && this._rejoin()
            }
            _onClose(e) {
              this._on(a.close, {}, e)
            }
            _onError(e) {
              this._on(a.error, {}, (t) => e(t))
            }
            _canPush() {
              return this.socket.isConnected() && this._isJoined()
            }
            _rejoin(e = this.timeout) {
              this._isLeaving() ||
                (this.socket._leaveOpenTopic(this.topic),
                (this.state = o.joining),
                this.joinPush.resend(e))
            }
            _getPayloadRecords(e) {
              const t = { new: {}, old: {} }
              return (
                ('INSERT' !== e.type && 'UPDATE' !== e.type) || (t.new = y(e.columns, e.record)),
                ('UPDATE' !== e.type && 'DELETE' !== e.type) ||
                  (t.old = y(e.columns, e.old_record)),
                t
              )
            }
          }
          const $ = () => {}
          class A {
            constructor(e, t) {
              var r
              ;(this.accessToken = null),
                (this.channels = []),
                (this.endPoint = ''),
                (this.headers = n),
                (this.params = {}),
                (this.timeout = 1e4),
                (this.transport = s.w3cwebsocket),
                (this.heartbeatIntervalMs = 3e4),
                (this.heartbeatTimer = void 0),
                (this.pendingHeartbeatRef = null),
                (this.ref = 0),
                (this.logger = $),
                (this.conn = null),
                (this.sendBuffer = []),
                (this.serializer = new f()),
                (this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] }),
                (this.eventsPerSecondLimitMs = 100),
                (this.inThrottle = !1),
                (this.endPoint = `${e}/${h.websocket}`),
                (null == t ? void 0 : t.params) && (this.params = t.params),
                (null == t ? void 0 : t.headers) &&
                  (this.headers = Object.assign(Object.assign({}, this.headers), t.headers)),
                (null == t ? void 0 : t.timeout) && (this.timeout = t.timeout),
                (null == t ? void 0 : t.logger) && (this.logger = t.logger),
                (null == t ? void 0 : t.transport) && (this.transport = t.transport),
                (null == t ? void 0 : t.heartbeatIntervalMs) &&
                  (this.heartbeatIntervalMs = t.heartbeatIntervalMs)
              const i =
                null === (r = null == t ? void 0 : t.params) || void 0 === r
                  ? void 0
                  : r.eventsPerSecond
              i && (this.eventsPerSecondLimitMs = Math.floor(1e3 / i)),
                (this.reconnectAfterMs = (null == t ? void 0 : t.reconnectAfterMs)
                  ? t.reconnectAfterMs
                  : (e) => [1e3, 2e3, 5e3, 1e4][e - 1] || 1e4),
                (this.encode = (null == t ? void 0 : t.encode)
                  ? t.encode
                  : (e, t) => t(JSON.stringify(e))),
                (this.decode = (null == t ? void 0 : t.decode)
                  ? t.decode
                  : this.serializer.decode.bind(this.serializer)),
                (this.reconnectTimer = new d(() => {
                  return (
                    (e = this),
                    (t = void 0),
                    (s = function* () {
                      this.disconnect(), this.connect()
                    }),
                    new ((r = void 0) || (r = Promise))(function (n, i) {
                      function o(e) {
                        try {
                          h(s.next(e))
                        } catch (e) {
                          i(e)
                        }
                      }
                      function a(e) {
                        try {
                          h(s.throw(e))
                        } catch (e) {
                          i(e)
                        }
                      }
                      function h(e) {
                        var t
                        e.done
                          ? n(e.value)
                          : ((t = e.value),
                            t instanceof r
                              ? t
                              : new r(function (e) {
                                  e(t)
                                })).then(o, a)
                      }
                      h((s = s.apply(e, t || [])).next())
                    })
                  )
                  var e, t, r, s
                }, this.reconnectAfterMs))
            }
            connect() {
              this.conn ||
                ((this.conn = new this.transport(this._endPointURL(), [], null, this.headers)),
                this.conn &&
                  ((this.conn.binaryType = 'arraybuffer'),
                  (this.conn.onopen = () => this._onConnOpen()),
                  (this.conn.onerror = (e) => this._onConnError(e)),
                  (this.conn.onmessage = (e) => this._onConnMessage(e)),
                  (this.conn.onclose = (e) => this._onConnClose(e))))
            }
            disconnect(e, t) {
              this.conn &&
                ((this.conn.onclose = function () {}),
                e ? this.conn.close(e, null != t ? t : '') : this.conn.close(),
                (this.conn = null),
                this.heartbeatTimer && clearInterval(this.heartbeatTimer),
                this.reconnectTimer.reset())
            }
            getChannels() {
              return this.channels
            }
            removeChannel(e) {
              return e
                .unsubscribe()
                .then((e) => (0 === this.channels.length && this.disconnect(), e))
            }
            removeAllChannels() {
              return Promise.all(this.channels.map((e) => e.unsubscribe())).then(
                (e) => (this.disconnect(), e)
              )
            }
            log(e, t, r) {
              this.logger(e, t, r)
            }
            connectionState() {
              switch (this.conn && this.conn.readyState) {
                case i.connecting:
                  return c.Connecting
                case i.open:
                  return c.Open
                case i.closing:
                  return c.Closing
                default:
                  return c.Closed
              }
            }
            isConnected() {
              return this.connectionState() === c.Open
            }
            channel(e, t = { config: {} }) {
              this.isConnected() || this.connect()
              const r = new k(`realtime:${e}`, t, this)
              return this.channels.push(r), r
            }
            push(e) {
              const { topic: t, event: r, payload: s, ref: n } = e
              let i = () => {
                this.encode(e, (e) => {
                  var t
                  null === (t = this.conn) || void 0 === t || t.send(e)
                })
              }
              if ((this.log('push', `${t} ${r} (${n})`, s), this.isConnected()))
                if (['broadcast', 'presence', 'postgres_changes'].includes(r)) {
                  if (this._throttle(i)()) return 'rate limited'
                } else i()
              else this.sendBuffer.push(i)
            }
            setAuth(e) {
              ;(this.accessToken = e),
                this.channels.forEach((t) => {
                  e && t.updateJoinPayload({ access_token: e }),
                    t.joinedOnce && t._isJoined() && t._push(a.access_token, { access_token: e })
                })
            }
            _makeRef() {
              let e = this.ref + 1
              return e === this.ref ? (this.ref = 0) : (this.ref = e), this.ref.toString()
            }
            _leaveOpenTopic(e) {
              let t = this.channels.find((t) => t.topic === e && (t._isJoined() || t._isJoining()))
              t && (this.log('transport', `leaving duplicate topic "${e}"`), t.unsubscribe())
            }
            _remove(e) {
              this.channels = this.channels.filter((t) => t._joinRef() !== e._joinRef())
            }
            _endPointURL() {
              return this._appendParams(
                this.endPoint,
                Object.assign({}, this.params, { vsn: '1.0.0' })
              )
            }
            _onConnMessage(e) {
              this.decode(e.data, (e) => {
                let { topic: t, event: r, payload: s, ref: n } = e
                ;((n && n === this.pendingHeartbeatRef) || r === (null == s ? void 0 : s.type)) &&
                  (this.pendingHeartbeatRef = null),
                  this.log(
                    'receive',
                    `${s.status || ''} ${t} ${r} ${(n && '(' + n + ')') || ''}`,
                    s
                  ),
                  this.channels.filter((e) => e._isMember(t)).forEach((e) => e._trigger(r, s, n)),
                  this.stateChangeCallbacks.message.forEach((t) => t(e))
              })
            }
            _onConnOpen() {
              this.log('transport', `connected to ${this._endPointURL()}`),
                this._flushSendBuffer(),
                this.reconnectTimer.reset(),
                this.heartbeatTimer && clearInterval(this.heartbeatTimer),
                (this.heartbeatTimer = setInterval(
                  () => this._sendHeartbeat(),
                  this.heartbeatIntervalMs
                )),
                this.stateChangeCallbacks.open.forEach((e) => e())
            }
            _onConnClose(e) {
              this.log('transport', 'close', e),
                this._triggerChanError(),
                this.heartbeatTimer && clearInterval(this.heartbeatTimer),
                this.reconnectTimer.scheduleTimeout(),
                this.stateChangeCallbacks.close.forEach((t) => t(e))
            }
            _onConnError(e) {
              this.log('transport', e.message),
                this._triggerChanError(),
                this.stateChangeCallbacks.error.forEach((t) => t(e))
            }
            _triggerChanError() {
              this.channels.forEach((e) => e._trigger(a.error))
            }
            _appendParams(e, t) {
              if (0 === Object.keys(t).length) return e
              const r = e.match(/\?/) ? '&' : '?'
              return `${e}${r}${new URLSearchParams(t)}`
            }
            _flushSendBuffer() {
              this.isConnected() &&
                this.sendBuffer.length > 0 &&
                (this.sendBuffer.forEach((e) => e()), (this.sendBuffer = []))
            }
            _sendHeartbeat() {
              var e
              if (this.isConnected()) {
                if (this.pendingHeartbeatRef)
                  return (
                    (this.pendingHeartbeatRef = null),
                    this.log(
                      'transport',
                      'heartbeat timeout. Attempting to re-establish connection'
                    ),
                    void (
                      null === (e = this.conn) ||
                      void 0 === e ||
                      e.close(1e3, 'hearbeat timeout')
                    )
                  )
                ;(this.pendingHeartbeatRef = this._makeRef()),
                  this.push({
                    topic: 'phoenix',
                    event: 'heartbeat',
                    payload: {},
                    ref: this.pendingHeartbeatRef,
                  }),
                  this.setAuth(this.accessToken)
              }
            }
            _throttle(e, t = this.eventsPerSecondLimitMs) {
              return () =>
                !!this.inThrottle ||
                (e(),
                (this.inThrottle = !0),
                setTimeout(() => {
                  this.inThrottle = !1
                }, t),
                !1)
            }
          }
        },
        752: (e, t, r) => {
          'use strict'
          r.r(t),
            r.d(t, {
              StorageApiError: () => i,
              StorageClient: () => w,
              StorageError: () => s,
              StorageUnknownError: () => o,
              isStorageError: () => n,
            })
          class s extends Error {
            constructor(e) {
              super(e), (this.__isStorageError = !0), (this.name = 'StorageError')
            }
          }
          function n(e) {
            return 'object' == typeof e && null !== e && '__isStorageError' in e
          }
          class i extends s {
            constructor(e, t) {
              super(e), (this.name = 'StorageApiError'), (this.status = t)
            }
            toJSON() {
              return { name: this.name, message: this.message, status: this.status }
            }
          }
          class o extends s {
            constructor(e, t) {
              super(e), (this.name = 'StorageUnknownError'), (this.originalError = t)
            }
          }
          var a = function (e, t, r, s) {
            return new (r || (r = Promise))(function (n, i) {
              function o(e) {
                try {
                  h(s.next(e))
                } catch (e) {
                  i(e)
                }
              }
              function a(e) {
                try {
                  h(s.throw(e))
                } catch (e) {
                  i(e)
                }
              }
              function h(e) {
                var t
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof r
                      ? t
                      : new r(function (e) {
                          e(t)
                        })).then(o, a)
              }
              h((s = s.apply(e, t || [])).next())
            })
          }
          const h = (e) => {
            let t
            return (
              (t =
                e ||
                ('undefined' == typeof fetch
                  ? (...e) =>
                      a(void 0, void 0, void 0, function* () {
                        return yield (yield Promise.resolve().then(r.t.bind(r, 98, 23))).fetch(...e)
                      })
                  : fetch)),
              (...e) => t(...e)
            )
          }
          var c = function (e, t, r, s) {
            return new (r || (r = Promise))(function (n, i) {
              function o(e) {
                try {
                  h(s.next(e))
                } catch (e) {
                  i(e)
                }
              }
              function a(e) {
                try {
                  h(s.throw(e))
                } catch (e) {
                  i(e)
                }
              }
              function h(e) {
                var t
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof r
                      ? t
                      : new r(function (e) {
                          e(t)
                        })).then(o, a)
              }
              h((s = s.apply(e, t || [])).next())
            })
          }
          const l = (e) => e.msg || e.message || e.error_description || e.error || JSON.stringify(e)
          function u(e, t, s, n, h, u) {
            return c(this, void 0, void 0, function* () {
              return new Promise((d, f) => {
                e(
                  s,
                  ((e, t, r, s) => {
                    const n = { method: e, headers: (null == t ? void 0 : t.headers) || {} }
                    return 'GET' === e
                      ? n
                      : ((n.headers = Object.assign(
                          { 'Content-Type': 'application/json' },
                          null == t ? void 0 : t.headers
                        )),
                        (n.body = JSON.stringify(s)),
                        Object.assign(Object.assign({}, n), r))
                  })(t, n, h, u)
                )
                  .then((e) => {
                    if (!e.ok) throw e
                    return (null == n ? void 0 : n.noResolveJson) ? e : e.json()
                  })
                  .then((e) => d(e))
                  .catch((e) =>
                    ((e, t) =>
                      c(void 0, void 0, void 0, function* () {
                        const s = yield a(void 0, void 0, void 0, function* () {
                          return 'undefined' == typeof Response
                            ? (yield Promise.resolve().then(r.t.bind(r, 98, 23))).Response
                            : Response
                        })
                        e instanceof s
                          ? e.json().then((r) => {
                              t(new i(l(r), e.status || 500))
                            })
                          : t(new o(l(e), e))
                      }))(e, f)
                  )
              })
            })
          }
          function d(e, t, r, s) {
            return c(this, void 0, void 0, function* () {
              return u(e, 'GET', t, r, s)
            })
          }
          function f(e, t, r, s, n) {
            return c(this, void 0, void 0, function* () {
              return u(e, 'POST', t, s, n, r)
            })
          }
          function p(e, t, r, s, n) {
            return c(this, void 0, void 0, function* () {
              return u(e, 'DELETE', t, s, n, r)
            })
          }
          var v = function (e, t, r, s) {
            return new (r || (r = Promise))(function (n, i) {
              function o(e) {
                try {
                  h(s.next(e))
                } catch (e) {
                  i(e)
                }
              }
              function a(e) {
                try {
                  h(s.throw(e))
                } catch (e) {
                  i(e)
                }
              }
              function h(e) {
                var t
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof r
                      ? t
                      : new r(function (e) {
                          e(t)
                        })).then(o, a)
              }
              h((s = s.apply(e, t || [])).next())
            })
          }
          const y = { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } },
            m = { cacheControl: '3600', contentType: 'text/plain;charset=UTF-8', upsert: !1 }
          class g {
            constructor(e, t = {}, r, s) {
              ;(this.url = e), (this.headers = t), (this.bucketId = r), (this.fetch = h(s))
            }
            uploadOrUpdate(e, t, r, s) {
              return v(this, void 0, void 0, function* () {
                try {
                  let n
                  const i = Object.assign(Object.assign({}, m), s),
                    o = Object.assign(
                      Object.assign({}, this.headers),
                      'POST' === e && { 'x-upsert': String(i.upsert) }
                    )
                  'undefined' != typeof Blob && r instanceof Blob
                    ? ((n = new FormData()),
                      n.append('cacheControl', i.cacheControl),
                      n.append('', r))
                    : 'undefined' != typeof FormData && r instanceof FormData
                    ? ((n = r), n.append('cacheControl', i.cacheControl))
                    : ((n = r),
                      (o['cache-control'] = `max-age=${i.cacheControl}`),
                      (o['content-type'] = i.contentType))
                  const a = this._removeEmptyFolders(t),
                    h = this._getFinalPath(a),
                    c = yield this.fetch(`${this.url}/object/${h}`, {
                      method: e,
                      body: n,
                      headers: o,
                    })
                  return c.ok
                    ? { data: { path: a }, error: null }
                    : { data: null, error: yield c.json() }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            upload(e, t, r) {
              return v(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('POST', e, t, r)
              })
            }
            update(e, t, r) {
              return v(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('PUT', e, t, r)
              })
            }
            move(e, t) {
              return v(this, void 0, void 0, function* () {
                try {
                  return {
                    data: yield f(
                      this.fetch,
                      `${this.url}/object/move`,
                      { bucketId: this.bucketId, sourceKey: e, destinationKey: t },
                      { headers: this.headers }
                    ),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            copy(e, t) {
              return v(this, void 0, void 0, function* () {
                try {
                  return {
                    data: {
                      path: (yield f(
                        this.fetch,
                        `${this.url}/object/copy`,
                        { bucketId: this.bucketId, sourceKey: e, destinationKey: t },
                        { headers: this.headers }
                      )).Key,
                    },
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            createSignedUrl(e, t, r) {
              return v(this, void 0, void 0, function* () {
                try {
                  let s = this._getFinalPath(e),
                    n = yield f(
                      this.fetch,
                      `${this.url}/object/sign/${s}`,
                      Object.assign(
                        { expiresIn: t },
                        (null == r ? void 0 : r.transform) ? { transform: r.transform } : {}
                      ),
                      { headers: this.headers }
                    )
                  const i = (null == r ? void 0 : r.download)
                    ? `&download=${!0 === r.download ? '' : r.download}`
                    : ''
                  return (
                    (n = { signedUrl: encodeURI(`${this.url}${n.signedURL}${i}`) }),
                    { data: n, error: null }
                  )
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            createSignedUrls(e, t, r) {
              return v(this, void 0, void 0, function* () {
                try {
                  const s = yield f(
                      this.fetch,
                      `${this.url}/object/sign/${this.bucketId}`,
                      { expiresIn: t, paths: e },
                      { headers: this.headers }
                    ),
                    n = (null == r ? void 0 : r.download)
                      ? `&download=${!0 === r.download ? '' : r.download}`
                      : ''
                  return {
                    data: s.map((e) =>
                      Object.assign(Object.assign({}, e), {
                        signedUrl: e.signedURL ? encodeURI(`${this.url}${e.signedURL}${n}`) : null,
                      })
                    ),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            download(e, t) {
              return v(this, void 0, void 0, function* () {
                const r =
                    void 0 !== (null == t ? void 0 : t.transform)
                      ? 'render/image/authenticated'
                      : 'object',
                  s = this.transformOptsToQueryString((null == t ? void 0 : t.transform) || {}),
                  i = s ? `?${s}` : ''
                try {
                  const t = this._getFinalPath(e),
                    s = yield d(this.fetch, `${this.url}/${r}/${t}${i}`, {
                      headers: this.headers,
                      noResolveJson: !0,
                    })
                  return { data: yield s.blob(), error: null }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            getPublicUrl(e, t) {
              const r = this._getFinalPath(e),
                s = [],
                n = (null == t ? void 0 : t.download)
                  ? `download=${!0 === t.download ? '' : t.download}`
                  : ''
              '' !== n && s.push(n)
              const i = void 0 !== (null == t ? void 0 : t.transform) ? 'render/image' : 'object',
                o = this.transformOptsToQueryString((null == t ? void 0 : t.transform) || {})
              '' !== o && s.push(o)
              let a = s.join('&')
              return (
                '' !== a && (a = `?${a}`),
                { data: { publicUrl: encodeURI(`${this.url}/${i}/public/${r}${a}`) } }
              )
            }
            remove(e) {
              return v(this, void 0, void 0, function* () {
                try {
                  return {
                    data: yield p(
                      this.fetch,
                      `${this.url}/object/${this.bucketId}`,
                      { prefixes: e },
                      { headers: this.headers }
                    ),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            list(e, t, r) {
              return v(this, void 0, void 0, function* () {
                try {
                  const s = Object.assign(Object.assign(Object.assign({}, y), t), {
                    prefix: e || '',
                  })
                  return {
                    data: yield f(
                      this.fetch,
                      `${this.url}/object/list/${this.bucketId}`,
                      s,
                      { headers: this.headers },
                      r
                    ),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            _getFinalPath(e) {
              return `${this.bucketId}/${e}`
            }
            _removeEmptyFolders(e) {
              return e.replace(/^\/|\/$/g, '').replace(/\/+/g, '/')
            }
            transformOptsToQueryString(e) {
              const t = []
              return (
                e.width && t.push(`width=${e.width}`),
                e.height && t.push(`height=${e.height}`),
                e.resize && t.push(`resize=${e.resize}`),
                t.join('&')
              )
            }
          }
          const b = { 'X-Client-Info': 'storage-js/2.1.0' }
          var _ = function (e, t, r, s) {
            return new (r || (r = Promise))(function (n, i) {
              function o(e) {
                try {
                  h(s.next(e))
                } catch (e) {
                  i(e)
                }
              }
              function a(e) {
                try {
                  h(s.throw(e))
                } catch (e) {
                  i(e)
                }
              }
              function h(e) {
                var t
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof r
                      ? t
                      : new r(function (e) {
                          e(t)
                        })).then(o, a)
              }
              h((s = s.apply(e, t || [])).next())
            })
          }
          class w extends class {
            constructor(e, t = {}, r) {
              ;(this.url = e),
                (this.headers = Object.assign(Object.assign({}, b), t)),
                (this.fetch = h(r))
            }
            listBuckets() {
              return _(this, void 0, void 0, function* () {
                try {
                  return {
                    data: yield d(this.fetch, `${this.url}/bucket`, { headers: this.headers }),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            getBucket(e) {
              return _(this, void 0, void 0, function* () {
                try {
                  return {
                    data: yield d(this.fetch, `${this.url}/bucket/${e}`, { headers: this.headers }),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            createBucket(e, t = { public: !1 }) {
              return _(this, void 0, void 0, function* () {
                try {
                  return {
                    data: yield f(
                      this.fetch,
                      `${this.url}/bucket`,
                      { id: e, name: e, public: t.public },
                      { headers: this.headers }
                    ),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            updateBucket(e, t) {
              return _(this, void 0, void 0, function* () {
                try {
                  const r = yield (function (e, t, r, s, n) {
                    return c(this, void 0, void 0, function* () {
                      return u(e, 'PUT', t, s, undefined, r)
                    })
                  })(
                    this.fetch,
                    `${this.url}/bucket/${e}`,
                    { id: e, name: e, public: t.public },
                    { headers: this.headers }
                  )
                  return { data: r, error: null }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            emptyBucket(e) {
              return _(this, void 0, void 0, function* () {
                try {
                  return {
                    data: yield f(
                      this.fetch,
                      `${this.url}/bucket/${e}/empty`,
                      {},
                      { headers: this.headers }
                    ),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
            deleteBucket(e) {
              return _(this, void 0, void 0, function* () {
                try {
                  return {
                    data: yield p(
                      this.fetch,
                      `${this.url}/bucket/${e}`,
                      {},
                      { headers: this.headers }
                    ),
                    error: null,
                  }
                } catch (e) {
                  if (n(e)) return { data: null, error: e }
                  throw e
                }
              })
            }
          } {
            constructor(e, t = {}, r) {
              super(e, t, r)
            }
            from(e) {
              return new g(this.url, this.headers, e, this.fetch)
            }
          }
        },
        98: function (e, t) {
          var r = 'undefined' != typeof self ? self : this,
            s = (function () {
              function e() {
                ;(this.fetch = !1), (this.DOMException = r.DOMException)
              }
              return (e.prototype = r), new e()
            })()
          !(function (e) {
            !(function (t) {
              var r = 'URLSearchParams' in e,
                s = 'Symbol' in e && 'iterator' in Symbol,
                n =
                  'FileReader' in e &&
                  'Blob' in e &&
                  (function () {
                    try {
                      return new Blob(), !0
                    } catch (e) {
                      return !1
                    }
                  })(),
                i = 'FormData' in e,
                o = 'ArrayBuffer' in e
              if (o)
                var a = [
                    '[object Int8Array]',
                    '[object Uint8Array]',
                    '[object Uint8ClampedArray]',
                    '[object Int16Array]',
                    '[object Uint16Array]',
                    '[object Int32Array]',
                    '[object Uint32Array]',
                    '[object Float32Array]',
                    '[object Float64Array]',
                  ],
                  h =
                    ArrayBuffer.isView ||
                    function (e) {
                      return e && a.indexOf(Object.prototype.toString.call(e)) > -1
                    }
              function c(e) {
                if (('string' != typeof e && (e = String(e)), /[^a-z0-9\-#$%&'*+.^_`|~]/i.test(e)))
                  throw new TypeError('Invalid character in header field name')
                return e.toLowerCase()
              }
              function l(e) {
                return 'string' != typeof e && (e = String(e)), e
              }
              function u(e) {
                var t = {
                  next: function () {
                    var t = e.shift()
                    return { done: void 0 === t, value: t }
                  },
                }
                return (
                  s &&
                    (t[Symbol.iterator] = function () {
                      return t
                    }),
                  t
                )
              }
              function d(e) {
                ;(this.map = {}),
                  e instanceof d
                    ? e.forEach(function (e, t) {
                        this.append(t, e)
                      }, this)
                    : Array.isArray(e)
                    ? e.forEach(function (e) {
                        this.append(e[0], e[1])
                      }, this)
                    : e &&
                      Object.getOwnPropertyNames(e).forEach(function (t) {
                        this.append(t, e[t])
                      }, this)
              }
              function f(e) {
                if (e.bodyUsed) return Promise.reject(new TypeError('Already read'))
                e.bodyUsed = !0
              }
              function p(e) {
                return new Promise(function (t, r) {
                  ;(e.onload = function () {
                    t(e.result)
                  }),
                    (e.onerror = function () {
                      r(e.error)
                    })
                })
              }
              function v(e) {
                var t = new FileReader(),
                  r = p(t)
                return t.readAsArrayBuffer(e), r
              }
              function y(e) {
                if (e.slice) return e.slice(0)
                var t = new Uint8Array(e.byteLength)
                return t.set(new Uint8Array(e)), t.buffer
              }
              function m() {
                return (
                  (this.bodyUsed = !1),
                  (this._initBody = function (e) {
                    var t
                    ;(this._bodyInit = e),
                      e
                        ? 'string' == typeof e
                          ? (this._bodyText = e)
                          : n && Blob.prototype.isPrototypeOf(e)
                          ? (this._bodyBlob = e)
                          : i && FormData.prototype.isPrototypeOf(e)
                          ? (this._bodyFormData = e)
                          : r && URLSearchParams.prototype.isPrototypeOf(e)
                          ? (this._bodyText = e.toString())
                          : o && n && (t = e) && DataView.prototype.isPrototypeOf(t)
                          ? ((this._bodyArrayBuffer = y(e.buffer)),
                            (this._bodyInit = new Blob([this._bodyArrayBuffer])))
                          : o && (ArrayBuffer.prototype.isPrototypeOf(e) || h(e))
                          ? (this._bodyArrayBuffer = y(e))
                          : (this._bodyText = e = Object.prototype.toString.call(e))
                        : (this._bodyText = ''),
                      this.headers.get('content-type') ||
                        ('string' == typeof e
                          ? this.headers.set('content-type', 'text/plain;charset=UTF-8')
                          : this._bodyBlob && this._bodyBlob.type
                          ? this.headers.set('content-type', this._bodyBlob.type)
                          : r &&
                            URLSearchParams.prototype.isPrototypeOf(e) &&
                            this.headers.set(
                              'content-type',
                              'application/x-www-form-urlencoded;charset=UTF-8'
                            ))
                  }),
                  n &&
                    ((this.blob = function () {
                      var e = f(this)
                      if (e) return e
                      if (this._bodyBlob) return Promise.resolve(this._bodyBlob)
                      if (this._bodyArrayBuffer)
                        return Promise.resolve(new Blob([this._bodyArrayBuffer]))
                      if (this._bodyFormData)
                        throw new Error('could not read FormData body as blob')
                      return Promise.resolve(new Blob([this._bodyText]))
                    }),
                    (this.arrayBuffer = function () {
                      return this._bodyArrayBuffer
                        ? f(this) || Promise.resolve(this._bodyArrayBuffer)
                        : this.blob().then(v)
                    })),
                  (this.text = function () {
                    var e,
                      t,
                      r,
                      s = f(this)
                    if (s) return s
                    if (this._bodyBlob)
                      return (
                        (e = this._bodyBlob), (r = p((t = new FileReader()))), t.readAsText(e), r
                      )
                    if (this._bodyArrayBuffer)
                      return Promise.resolve(
                        (function (e) {
                          for (
                            var t = new Uint8Array(e), r = new Array(t.length), s = 0;
                            s < t.length;
                            s++
                          )
                            r[s] = String.fromCharCode(t[s])
                          return r.join('')
                        })(this._bodyArrayBuffer)
                      )
                    if (this._bodyFormData) throw new Error('could not read FormData body as text')
                    return Promise.resolve(this._bodyText)
                  }),
                  i &&
                    (this.formData = function () {
                      return this.text().then(_)
                    }),
                  (this.json = function () {
                    return this.text().then(JSON.parse)
                  }),
                  this
                )
              }
              ;(d.prototype.append = function (e, t) {
                ;(e = c(e)), (t = l(t))
                var r = this.map[e]
                this.map[e] = r ? r + ', ' + t : t
              }),
                (d.prototype.delete = function (e) {
                  delete this.map[c(e)]
                }),
                (d.prototype.get = function (e) {
                  return (e = c(e)), this.has(e) ? this.map[e] : null
                }),
                (d.prototype.has = function (e) {
                  return this.map.hasOwnProperty(c(e))
                }),
                (d.prototype.set = function (e, t) {
                  this.map[c(e)] = l(t)
                }),
                (d.prototype.forEach = function (e, t) {
                  for (var r in this.map)
                    this.map.hasOwnProperty(r) && e.call(t, this.map[r], r, this)
                }),
                (d.prototype.keys = function () {
                  var e = []
                  return (
                    this.forEach(function (t, r) {
                      e.push(r)
                    }),
                    u(e)
                  )
                }),
                (d.prototype.values = function () {
                  var e = []
                  return (
                    this.forEach(function (t) {
                      e.push(t)
                    }),
                    u(e)
                  )
                }),
                (d.prototype.entries = function () {
                  var e = []
                  return (
                    this.forEach(function (t, r) {
                      e.push([r, t])
                    }),
                    u(e)
                  )
                }),
                s && (d.prototype[Symbol.iterator] = d.prototype.entries)
              var g = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']
              function b(e, t) {
                var r,
                  s,
                  n = (t = t || {}).body
                if (e instanceof b) {
                  if (e.bodyUsed) throw new TypeError('Already read')
                  ;(this.url = e.url),
                    (this.credentials = e.credentials),
                    t.headers || (this.headers = new d(e.headers)),
                    (this.method = e.method),
                    (this.mode = e.mode),
                    (this.signal = e.signal),
                    n || null == e._bodyInit || ((n = e._bodyInit), (e.bodyUsed = !0))
                } else this.url = String(e)
                if (
                  ((this.credentials = t.credentials || this.credentials || 'same-origin'),
                  (!t.headers && this.headers) || (this.headers = new d(t.headers)),
                  (this.method =
                    ((s = (r = t.method || this.method || 'GET').toUpperCase()),
                    g.indexOf(s) > -1 ? s : r)),
                  (this.mode = t.mode || this.mode || null),
                  (this.signal = t.signal || this.signal),
                  (this.referrer = null),
                  ('GET' === this.method || 'HEAD' === this.method) && n)
                )
                  throw new TypeError('Body not allowed for GET or HEAD requests')
                this._initBody(n)
              }
              function _(e) {
                var t = new FormData()
                return (
                  e
                    .trim()
                    .split('&')
                    .forEach(function (e) {
                      if (e) {
                        var r = e.split('='),
                          s = r.shift().replace(/\+/g, ' '),
                          n = r.join('=').replace(/\+/g, ' ')
                        t.append(decodeURIComponent(s), decodeURIComponent(n))
                      }
                    }),
                  t
                )
              }
              function w(e, t) {
                t || (t = {}),
                  (this.type = 'default'),
                  (this.status = void 0 === t.status ? 200 : t.status),
                  (this.ok = this.status >= 200 && this.status < 300),
                  (this.statusText = 'statusText' in t ? t.statusText : 'OK'),
                  (this.headers = new d(t.headers)),
                  (this.url = t.url || ''),
                  this._initBody(e)
              }
              ;(b.prototype.clone = function () {
                return new b(this, { body: this._bodyInit })
              }),
                m.call(b.prototype),
                m.call(w.prototype),
                (w.prototype.clone = function () {
                  return new w(this._bodyInit, {
                    status: this.status,
                    statusText: this.statusText,
                    headers: new d(this.headers),
                    url: this.url,
                  })
                }),
                (w.error = function () {
                  var e = new w(null, { status: 0, statusText: '' })
                  return (e.type = 'error'), e
                })
              var E = [301, 302, 303, 307, 308]
              ;(w.redirect = function (e, t) {
                if (-1 === E.indexOf(t)) throw new RangeError('Invalid status code')
                return new w(null, { status: t, headers: { location: e } })
              }),
                (t.DOMException = e.DOMException)
              try {
                new t.DOMException()
              } catch (e) {
                ;(t.DOMException = function (e, t) {
                  ;(this.message = e), (this.name = t)
                  var r = Error(e)
                  this.stack = r.stack
                }),
                  (t.DOMException.prototype = Object.create(Error.prototype)),
                  (t.DOMException.prototype.constructor = t.DOMException)
              }
              function T(e, r) {
                return new Promise(function (s, i) {
                  var o = new b(e, r)
                  if (o.signal && o.signal.aborted)
                    return i(new t.DOMException('Aborted', 'AbortError'))
                  var a = new XMLHttpRequest()
                  function h() {
                    a.abort()
                  }
                  ;(a.onload = function () {
                    var e,
                      t,
                      r = {
                        status: a.status,
                        statusText: a.statusText,
                        headers:
                          ((e = a.getAllResponseHeaders() || ''),
                          (t = new d()),
                          e
                            .replace(/\r?\n[\t ]+/g, ' ')
                            .split(/\r?\n/)
                            .forEach(function (e) {
                              var r = e.split(':'),
                                s = r.shift().trim()
                              if (s) {
                                var n = r.join(':').trim()
                                t.append(s, n)
                              }
                            }),
                          t),
                      }
                    r.url = 'responseURL' in a ? a.responseURL : r.headers.get('X-Request-URL')
                    var n = 'response' in a ? a.response : a.responseText
                    s(new w(n, r))
                  }),
                    (a.onerror = function () {
                      i(new TypeError('Network request failed'))
                    }),
                    (a.ontimeout = function () {
                      i(new TypeError('Network request failed'))
                    }),
                    (a.onabort = function () {
                      i(new t.DOMException('Aborted', 'AbortError'))
                    }),
                    a.open(o.method, o.url, !0),
                    'include' === o.credentials
                      ? (a.withCredentials = !0)
                      : 'omit' === o.credentials && (a.withCredentials = !1),
                    'responseType' in a && n && (a.responseType = 'blob'),
                    o.headers.forEach(function (e, t) {
                      a.setRequestHeader(t, e)
                    }),
                    o.signal &&
                      (o.signal.addEventListener('abort', h),
                      (a.onreadystatechange = function () {
                        4 === a.readyState && o.signal.removeEventListener('abort', h)
                      })),
                    a.send(void 0 === o._bodyInit ? null : o._bodyInit)
                })
              }
              ;(T.polyfill = !0),
                e.fetch || ((e.fetch = T), (e.Headers = d), (e.Request = b), (e.Response = w)),
                (t.Headers = d),
                (t.Request = b),
                (t.Response = w),
                (t.fetch = T),
                Object.defineProperty(t, '__esModule', { value: !0 })
            })({})
          })(s),
            (s.fetch.ponyfill = !0),
            delete s.fetch.polyfill
          var n = s
          ;((t = n.fetch).default = n.fetch),
            (t.fetch = n.fetch),
            (t.Headers = n.Headers),
            (t.Request = n.Request),
            (t.Response = n.Response),
            (e.exports = t)
        },
        284: (e) => {
          var t = function () {
            if ('object' == typeof self && self) return self
            if ('object' == typeof window && window) return window
            throw new Error('Unable to resolve global `this`')
          }
          e.exports = (function () {
            if (this) return this
            if ('object' == typeof globalThis && globalThis) return globalThis
            try {
              Object.defineProperty(Object.prototype, '__global__', {
                get: function () {
                  return this
                },
                configurable: !0,
              })
            } catch (e) {
              return t()
            }
            try {
              return __global__ || t()
            } finally {
              delete Object.prototype.__global__
            }
          })()
        },
        296: function (e, t, r) {
          'use strict'
          var s =
            (this && this.__awaiter) ||
            function (e, t, r, s) {
              return new (r || (r = Promise))(function (n, i) {
                function o(e) {
                  try {
                    h(s.next(e))
                  } catch (e) {
                    i(e)
                  }
                }
                function a(e) {
                  try {
                    h(s.throw(e))
                  } catch (e) {
                    i(e)
                  }
                }
                function h(e) {
                  var t
                  e.done
                    ? n(e.value)
                    : ((t = e.value),
                      t instanceof r
                        ? t
                        : new r(function (e) {
                            e(t)
                          })).then(o, a)
                }
                h((s = s.apply(e, t || [])).next())
              })
            }
          Object.defineProperty(t, '__esModule', { value: !0 })
          const n = r(982),
            i = r(189),
            o = r(73),
            a = r(752),
            h = r(678),
            c = r(716),
            l = r(610),
            u = r(283),
            d = { headers: h.DEFAULT_HEADERS },
            f = { schema: 'public' },
            p = { autoRefreshToken: !0, persistSession: !0, detectSessionInUrl: !0 },
            v = {}
          t.default = class {
            constructor(e, t, r) {
              var s, n, o, a, h, u, y, m
              if (((this.supabaseUrl = e), (this.supabaseKey = t), !e))
                throw new Error('supabaseUrl is required.')
              if (!t) throw new Error('supabaseKey is required.')
              const g = (0, l.stripTrailingSlash)(e)
              if (
                ((this.realtimeUrl = `${g}/realtime/v1`.replace(/^http/i, 'ws')),
                (this.authUrl = `${g}/auth/v1`),
                (this.storageUrl = `${g}/storage/v1`),
                g.match(/(supabase\.co)|(supabase\.in)/))
              ) {
                const e = g.split('.')
                this.functionsUrl = `${e[0]}.functions.${e[1]}.${e[2]}`
              } else this.functionsUrl = `${g}/functions/v1`
              const b = `sb-${new URL(this.authUrl).hostname.split('.')[0]}-auth-token`,
                _ = {
                  db: f,
                  realtime: v,
                  auth: Object.assign(Object.assign({}, p), { storageKey: b }),
                  global: d,
                },
                w = (0, l.applySettingDefaults)(null != r ? r : {}, _)
              ;(this.storageKey =
                null !== (n = null === (s = w.auth) || void 0 === s ? void 0 : s.storageKey) &&
                void 0 !== n
                  ? n
                  : ''),
                (this.headers =
                  null !== (a = null === (o = w.global) || void 0 === o ? void 0 : o.headers) &&
                  void 0 !== a
                    ? a
                    : {}),
                (this.auth = this._initSupabaseAuthClient(
                  null !== (h = w.auth) && void 0 !== h ? h : {},
                  this.headers,
                  null === (u = w.global) || void 0 === u ? void 0 : u.fetch
                )),
                (this.fetch = (0, c.fetchWithAuth)(
                  t,
                  this._getAccessToken.bind(this),
                  null === (y = w.global) || void 0 === y ? void 0 : y.fetch
                )),
                (this.realtime = this._initRealtimeClient(
                  Object.assign({ headers: this.headers }, w.realtime)
                )),
                (this.rest = new i.PostgrestClient(`${g}/rest/v1`, {
                  headers: this.headers,
                  schema: null === (m = w.db) || void 0 === m ? void 0 : m.schema,
                  fetch: this.fetch,
                })),
                this._listenForAuthEvents()
            }
            get functions() {
              return new n.FunctionsClient(this.functionsUrl, {
                headers: this.headers,
                customFetch: this.fetch,
              })
            }
            get storage() {
              return new a.StorageClient(this.storageUrl, this.headers, this.fetch)
            }
            from(e) {
              return this.rest.from(e)
            }
            rpc(e, t = {}, r) {
              return this.rest.rpc(e, t, r)
            }
            channel(e, t = { config: {} }) {
              return this.realtime.channel(e, t)
            }
            getChannels() {
              return this.realtime.getChannels()
            }
            removeChannel(e) {
              return this.realtime.removeChannel(e)
            }
            removeAllChannels() {
              return this.realtime.removeAllChannels()
            }
            _getAccessToken() {
              var e, t
              return s(this, void 0, void 0, function* () {
                const { data: r } = yield this.auth.getSession()
                return null !==
                  (t = null === (e = r.session) || void 0 === e ? void 0 : e.access_token) &&
                  void 0 !== t
                  ? t
                  : null
              })
            }
            _initSupabaseAuthClient(
              {
                autoRefreshToken: e,
                persistSession: t,
                detectSessionInUrl: r,
                storage: s,
                storageKey: n,
              },
              i,
              o
            ) {
              const a = {
                Authorization: `Bearer ${this.supabaseKey}`,
                apikey: `${this.supabaseKey}`,
              }
              return new u.SupabaseAuthClient({
                url: this.authUrl,
                headers: Object.assign(Object.assign({}, a), i),
                storageKey: n,
                autoRefreshToken: e,
                persistSession: t,
                detectSessionInUrl: r,
                storage: s,
                fetch: o,
              })
            }
            _initRealtimeClient(e) {
              return new o.RealtimeClient(
                this.realtimeUrl,
                Object.assign(Object.assign({}, e), {
                  params: Object.assign(
                    { apikey: this.supabaseKey },
                    null == e ? void 0 : e.params
                  ),
                })
              )
            }
            _listenForAuthEvents() {
              return this.auth.onAuthStateChange((e, t) => {
                this._handleTokenChanged(e, null == t ? void 0 : t.access_token, 'CLIENT')
              })
            }
            _handleTokenChanged(e, t, r) {
              ;('TOKEN_REFRESHED' !== e && 'SIGNED_IN' !== e) || this.changedAccessToken === t
                ? ('SIGNED_OUT' !== e && 'USER_DELETED' !== e) ||
                  (this.realtime.setAuth(this.supabaseKey),
                  'STORAGE' == r && this.auth.signOut(),
                  (this.changedAccessToken = void 0))
                : (this.realtime.setAuth(null != t ? t : null), (this.changedAccessToken = t))
            }
          }
        },
        341: function (e, t, r) {
          'use strict'
          var s =
              (this && this.__createBinding) ||
              (Object.create
                ? function (e, t, r, s) {
                    void 0 === s && (s = r)
                    var n = Object.getOwnPropertyDescriptor(t, r)
                    ;(n && !('get' in n ? !t.__esModule : n.writable || n.configurable)) ||
                      (n = {
                        enumerable: !0,
                        get: function () {
                          return t[r]
                        },
                      }),
                      Object.defineProperty(e, s, n)
                  }
                : function (e, t, r, s) {
                    void 0 === s && (s = r), (e[s] = t[r])
                  }),
            n =
              (this && this.__exportStar) ||
              function (e, t) {
                for (var r in e)
                  'default' === r || Object.prototype.hasOwnProperty.call(t, r) || s(t, e, r)
              },
            i =
              (this && this.__importDefault) ||
              function (e) {
                return e && e.__esModule ? e : { default: e }
              }
          Object.defineProperty(t, '__esModule', { value: !0 }),
            (t.createClient =
              t.SupabaseClient =
              t.FunctionsError =
              t.FunctionsRelayError =
              t.FunctionsFetchError =
              t.FunctionsHttpError =
                void 0)
          const o = i(r(296))
          n(r(165), t)
          var a = r(982)
          Object.defineProperty(t, 'FunctionsHttpError', {
            enumerable: !0,
            get: function () {
              return a.FunctionsHttpError
            },
          }),
            Object.defineProperty(t, 'FunctionsFetchError', {
              enumerable: !0,
              get: function () {
                return a.FunctionsFetchError
              },
            }),
            Object.defineProperty(t, 'FunctionsRelayError', {
              enumerable: !0,
              get: function () {
                return a.FunctionsRelayError
              },
            }),
            Object.defineProperty(t, 'FunctionsError', {
              enumerable: !0,
              get: function () {
                return a.FunctionsError
              },
            }),
            n(r(73), t)
          var h = r(296)
          Object.defineProperty(t, 'SupabaseClient', {
            enumerable: !0,
            get: function () {
              return i(h).default
            },
          }),
            (t.createClient = (e, t, r) => new o.default(e, t, r))
        },
        283: (e, t, r) => {
          'use strict'
          Object.defineProperty(t, '__esModule', { value: !0 }), (t.SupabaseAuthClient = void 0)
          const s = r(165)
          class n extends s.GoTrueClient {
            constructor(e) {
              super(e)
            }
          }
          t.SupabaseAuthClient = n
        },
        678: (e, t, r) => {
          'use strict'
          Object.defineProperty(t, '__esModule', { value: !0 }), (t.DEFAULT_HEADERS = void 0)
          const s = r(506)
          t.DEFAULT_HEADERS = { 'X-Client-Info': `supabase-js/${s.version}` }
        },
        716: function (e, t, r) {
          'use strict'
          var s =
              (this && this.__createBinding) ||
              (Object.create
                ? function (e, t, r, s) {
                    void 0 === s && (s = r)
                    var n = Object.getOwnPropertyDescriptor(t, r)
                    ;(n && !('get' in n ? !t.__esModule : n.writable || n.configurable)) ||
                      (n = {
                        enumerable: !0,
                        get: function () {
                          return t[r]
                        },
                      }),
                      Object.defineProperty(e, s, n)
                  }
                : function (e, t, r, s) {
                    void 0 === s && (s = r), (e[s] = t[r])
                  }),
            n =
              (this && this.__setModuleDefault) ||
              (Object.create
                ? function (e, t) {
                    Object.defineProperty(e, 'default', { enumerable: !0, value: t })
                  }
                : function (e, t) {
                    e.default = t
                  }),
            i =
              (this && this.__importStar) ||
              function (e) {
                if (e && e.__esModule) return e
                var t = {}
                if (null != e)
                  for (var r in e)
                    'default' !== r && Object.prototype.hasOwnProperty.call(e, r) && s(t, e, r)
                return n(t, e), t
              },
            o =
              (this && this.__awaiter) ||
              function (e, t, r, s) {
                return new (r || (r = Promise))(function (n, i) {
                  function o(e) {
                    try {
                      h(s.next(e))
                    } catch (e) {
                      i(e)
                    }
                  }
                  function a(e) {
                    try {
                      h(s.throw(e))
                    } catch (e) {
                      i(e)
                    }
                  }
                  function h(e) {
                    var t
                    e.done
                      ? n(e.value)
                      : ((t = e.value),
                        t instanceof r
                          ? t
                          : new r(function (e) {
                              e(t)
                            })).then(o, a)
                  }
                  h((s = s.apply(e, t || [])).next())
                })
              }
          Object.defineProperty(t, '__esModule', { value: !0 }),
            (t.fetchWithAuth = t.resolveHeadersConstructor = t.resolveFetch = void 0)
          const a = i(r(98))
          ;(t.resolveFetch = (e) => {
            let t
            return (t = e || ('undefined' == typeof fetch ? a.default : fetch)), (...e) => t(...e)
          }),
            (t.resolveHeadersConstructor = () =>
              'undefined' == typeof Headers ? a.Headers : Headers),
            (t.fetchWithAuth = (e, r, s) => {
              const n = (0, t.resolveFetch)(s),
                i = (0, t.resolveHeadersConstructor)()
              return (t, s) =>
                o(void 0, void 0, void 0, function* () {
                  var o
                  const a = null !== (o = yield r()) && void 0 !== o ? o : e
                  let h = new i(null == s ? void 0 : s.headers)
                  return (
                    h.has('apikey') || h.set('apikey', e),
                    h.has('Authorization') || h.set('Authorization', `Bearer ${a}`),
                    n(t, Object.assign(Object.assign({}, s), { headers: h }))
                  )
                })
            })
        },
        610: (e, t) => {
          'use strict'
          Object.defineProperty(t, '__esModule', { value: !0 }),
            (t.applySettingDefaults = t.isBrowser = t.stripTrailingSlash = t.uuid = void 0),
            (t.uuid = function () {
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (e) {
                var t = (16 * Math.random()) | 0
                return ('x' == e ? t : (3 & t) | 8).toString(16)
              })
            }),
            (t.stripTrailingSlash = function (e) {
              return e.replace(/\/$/, '')
            }),
            (t.isBrowser = () => 'undefined' != typeof window),
            (t.applySettingDefaults = function (e, t) {
              const { db: r, auth: s, realtime: n, global: i } = e,
                { db: o, auth: a, realtime: h, global: c } = t
              return {
                db: Object.assign(Object.assign({}, o), r),
                auth: Object.assign(Object.assign({}, a), s),
                realtime: Object.assign(Object.assign({}, h), n),
                global: Object.assign(Object.assign({}, c), i),
              }
            })
        },
        506: (e, t) => {
          'use strict'
          Object.defineProperty(t, '__esModule', { value: !0 }),
            (t.version = void 0),
            (t.version = '0.0.0-automated')
        },
        840: (e, t, r) => {
          var s
          if ('object' == typeof globalThis) s = globalThis
          else
            try {
              s = r(284)
            } catch (e) {
            } finally {
              if ((s || 'undefined' == typeof window || (s = window), !s))
                throw new Error('Could not determine global this')
            }
          var n = s.WebSocket || s.MozWebSocket,
            i = r(387)
          function o(e, t) {
            return t ? new n(e, t) : new n(e)
          }
          n &&
            ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function (e) {
              Object.defineProperty(o, e, {
                get: function () {
                  return n[e]
                },
              })
            }),
            (e.exports = { w3cwebsocket: n ? o : null, version: i })
        },
        387: (e, t, r) => {
          e.exports = r(794).version
        },
        794: (e) => {
          'use strict'
          e.exports = { version: '1.0.34' }
        },
      },
      s = {}
    function n(e) {
      var t = s[e]
      if (void 0 !== t) return t.exports
      var i = (s[e] = { exports: {} })
      return r[e].call(i.exports, i, i.exports, n), i.exports
    }
    return (
      (n.n = (e) => {
        var t = e && e.__esModule ? () => e.default : () => e
        return n.d(t, { a: t }), t
      }),
      (t = Object.getPrototypeOf ? (e) => Object.getPrototypeOf(e) : (e) => e.__proto__),
      (n.t = function (r, s) {
        if ((1 & s && (r = this(r)), 8 & s)) return r
        if ('object' == typeof r && r) {
          if (4 & s && r.__esModule) return r
          if (16 & s && 'function' == typeof r.then) return r
        }
        var i = Object.create(null)
        n.r(i)
        var o = {}
        e = e || [null, t({}), t([]), t(t)]
        for (var a = 2 & s && r; 'object' == typeof a && !~e.indexOf(a); a = t(a))
          Object.getOwnPropertyNames(a).forEach((e) => (o[e] = () => r[e]))
        return (o.default = () => r), n.d(i, o), i
      }),
      (n.d = (e, t) => {
        for (var r in t)
          n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, { enumerable: !0, get: t[r] })
      }),
      (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
      (n.r = (e) => {
        'undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(e, '__esModule', { value: !0 })
      }),
      n(341)
    )
  })()
)
