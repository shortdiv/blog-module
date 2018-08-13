'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('babel-polyfill');
var path = _interopDefault(require('path'));
var slug = _interopDefault(require('slug'));
var pify = _interopDefault(require('pify'));
var glob = _interopDefault(require('glob'));
var fs = _interopDefault(require('fs'));
var fm = _interopDefault(require('front-matter'));
var Markdown = _interopDefault(require('markdown-it'));
var Prism = _interopDefault(require('prismjs'));
var cheer = _interopDefault(require('cheerio'));
var express = require('express');
var chalk = _interopDefault(require('chalk'));
var webpack = require('webpack');

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var toString = Object.prototype.toString;

var isPlainObj = function (x) {
	var prototype;
	return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
};

var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.propertyIsEnumerable;
var defineProperty = function defineProperty(obj, name, value) {
	return Object.defineProperty(obj, name, {
		value: value,
		writable: true,
		enumerable: true,
		configurable: true
	});
};

var globalThis = commonjsGlobal;
var defaultMergeOpts = {
	concatArrays: false
};

var getEnumerableOwnPropertyKeys = function getEnumerableOwnPropertyKeys(value) {
	var keys = [];

	for (var key in value) {
		if (hasOwnProperty.call(value, key)) {
			keys.push(key);
		}
	}

	/* istanbul ignore else  */
	if (Object.getOwnPropertySymbols) {
		var symbols = Object.getOwnPropertySymbols(value);

		for (var i = 0; i < symbols.length; i++) {
			if (propIsEnumerable.call(value, symbols[i])) {
				keys.push(symbols[i]);
			}
		}
	}

	return keys;
};

function clone(value) {
	if (Array.isArray(value)) {
		return cloneArray(value);
	}

	if (isPlainObj(value)) {
		return cloneOptionObject(value);
	}

	return value;
}

function cloneArray(array) {
	var result = array.slice(0, 0);

	getEnumerableOwnPropertyKeys(array).forEach(function (key) {
		defineProperty(result, key, clone(array[key]));
	});

	return result;
}

function cloneOptionObject(obj) {
	var result = Object.getPrototypeOf(obj) === null ? Object.create(null) : {};

	getEnumerableOwnPropertyKeys(obj).forEach(function (key) {
		defineProperty(result, key, clone(obj[key]));
	});

	return result;
}

/**
 * @param merged {already cloned}
 * @return {cloned Object}
 */
var mergeKeys = function mergeKeys(merged, source, keys, mergeOpts) {
	keys.forEach(function (key) {
		// Do not recurse into prototype chain of merged
		if (key in merged && merged[key] !== Object.getPrototypeOf(merged)) {
			defineProperty(merged, key, merge(merged[key], source[key], mergeOpts));
		} else {
			defineProperty(merged, key, clone(source[key]));
		}
	});

	return merged;
};

/**
 * @param merged {already cloned}
 * @return {cloned Object}
 *
 * see [Array.prototype.concat ( ...arguments )](http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat)
 */
var concatArrays = function concatArrays(merged, source, mergeOpts) {
	var result = merged.slice(0, 0);
	var resultIndex = 0;

	[merged, source].forEach(function (array) {
		var indices = [];

		// `result.concat(array)` with cloning
		for (var k = 0; k < array.length; k++) {
			if (!hasOwnProperty.call(array, k)) {
				continue;
			}

			indices.push(String(k));

			if (array === merged) {
				// Already cloned
				defineProperty(result, resultIndex++, array[k]);
			} else {
				defineProperty(result, resultIndex++, clone(array[k]));
			}
		}

		// Merge non-index keys
		result = mergeKeys(result, array, getEnumerableOwnPropertyKeys(array).filter(function (key) {
			return indices.indexOf(key) === -1;
		}), mergeOpts);
	});

	return result;
};

/**
 * @param merged {already cloned}
 * @return {cloned Object}
 */
function merge(merged, source, mergeOpts) {
	if (mergeOpts.concatArrays && Array.isArray(merged) && Array.isArray(source)) {
		return concatArrays(merged, source, mergeOpts);
	}

	if (!isPlainObj(source) || !isPlainObj(merged)) {
		return clone(source);
	}

	return mergeKeys(merged, source, getEnumerableOwnPropertyKeys(source), mergeOpts);
}

var mergeOptions = function () {
	var mergeOpts = merge(clone(defaultMergeOpts), this !== globalThis && this || {}, defaultMergeOpts);
	var merged = { foobar: {} };

	for (var i = 0; i < arguments.length; i++) {
		var option = arguments[i];

		if (option === undefined) {
			continue;
		}

		if (!isPlainObj(option)) {
			throw new TypeError('`' + option + '` is not an Option Object');
		}

		merged = merge(merged, { foobar: option }, mergeOpts);
	}

	return merged.foobar;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};









var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var Container = function () {
  function Container() {
    var sort = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (a, b) {
      return a.id < b.id;
    };
    classCallCheck(this, Container);

    Object.defineProperties(this, {
      _sort: { value: sort },
      _items: { value: {} },
      _dirty: { value: false, writable: true },
      _sorted: { value: [], writable: true }
    });
  }

  createClass(Container, [{
    key: "addItem",
    value: function addItem(item) {
      this._items[item.id] = item;
      this._dirty = true;
    }
  }, {
    key: "getItem",
    value: function getItem(id) {
      return this._items[id];
    }
  }, {
    key: "items",
    get: function get$$1() {
      if (this._dirty === true) {
        this._sorted = Object.values(this._items).sort(this._sort);
      }

      return this._sorted;
    }
  }, {
    key: "length",
    get: function get$$1() {
      return Object.keys(this._items).length;
    }
  }]);
  return Container;
}();

var Tag = function () {
  function Tag(name) {
    classCallCheck(this, Tag);

    this.id = slug(name, { lower: true });
    this.name = name;
    Object.defineProperties(this, {
      _articles: { value: new Container() }
    });
  }
  /** @private */


  createClass(Tag, [{
    key: 'addArticle',
    value: function addArticle(article) {
      this._articles.addItem(article);
    }
  }, {
    key: 'toPlainObject',
    value: function toPlainObject() {
      return { id: this.id, name: this.name, articles: this.articles.map(function (article) {
          return article.preview;
        }) };
    }
  }, {
    key: 'articles',
    get: function get$$1() {
      return this._articles.items;
    }
  }]);
  return Tag;
}();

var ucword = function ucword(any) {
  return any.replace(/[-_]+/g, ' ').replace(/(?:^|\s)([a-z])/g, function (m) {
    return m.toUpperCase();
  });
};

var Article = function () {

  /** @namespace blog.__markdown */

  // eslint-disable-line camelcase
  function Article(filename) {
    classCallCheck(this, Article);

    Object.defineProperties(this, {
      filename: { value: filename },
      _tags: { value: [], writable: true },
      _collection: { value: null, writable: true }
    });
    this.id = slug(path.basename(filename.replace(/\.md$/, '')), { lower: true });
    this.slug = this.id.replace(/^[\d]{4}-[\d]{2}-[\d]{2}-/, '');
    this.highlightedLanguages = [];
  }
  /** @private */
  // eslint-disable-line camelcase


  createClass(Article, [{
    key: 'create',


    /**
     * Create article from markdown.
     * @param options
     * @param blog
     * @returns {Promise.<Article>}
     */
    value: function () {
      var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options, blog) {
        var marked, _fm, attributes, body;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                marked = this._createMarkdownRenderer(options, blog);
                _context.next = 3;
                return pify(fs.readFile)(this.filename, { encoding: 'utf-8' });

              case 3:
                this.source = _context.sent;
                _fm = fm(this.source), attributes = _fm.attributes, body = _fm.body;


                this.rendered = marked.render(body);
                this.attributes = this._prepareAttributes(attributes, options);

                if (this.attributes.collection) {
                  this._collection = blog.getCollection(this.attributes.collection);
                  this.attributes.collection = this._collection;
                } else if (path.dirname(this.filename) !== options.path) {
                  this._collection = blog.getCollection(ucword(path.basename(path.dirname(this.filename))));
                  this.attributes.collection = this._collection;
                }
                this._tags = this.attributes.tags.map(function (tag) {
                  return blog.getTag(tag);
                });
                this.attributes.tags = this._tags;

                this.title = attributes.title;
                this.description = attributes.description || '';
                this.photo = attributes.photo;
                this.keywords = this.attributes.tags.map(function (tag) {
                  return tag.name;
                });
                /* eslint-disable camelcase */
                this.published_at = this.attributes.date;
                this.updated_at = this.attributes.updated_at;
                this.year = this.published_at.getFullYear();
                this.month = this.published_at.getUTCMonth() + 1;
                this.day = this.published_at.getDate() + 1;
                /* eslint-enable camelcase */

                return _context.abrupt('return', this);

              case 20:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return create;
    }()

    /**
     * Tags/Categories, the article belongs to
     * @returns {Tag[]}
     */

  }, {
    key: '_createMarkdownRenderer',


    /**
     * Create instance of MarkdownIt.
     * @param options
     * @param blog
     * @returns {MarkdownIt}
     * @private
     */
    value: function _createMarkdownRenderer(options, blog) {
      var _this = this;

      var plugins = options.markdown.plugins || [];

      var marked = new Markdown(_extends({
        html: true,
        linkify: true,
        breaks: true
      }, options.markdown, {
        highlight: function highlight(code, lang) {
          if (!_this.highlightedLanguages.includes(lang)) {
            _this.highlightedLanguages.push(lang);
          }

          if ('highlight' in options) {
            return options.highlight(code, lang);
          }

          return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup);
        }
      }));

      Array.isArray(plugins) && plugins.forEach(function (plugin) {
        return marked.use(plugin);
      });

      return marked;
    }

    /**
     * Fix missing article attributes.
     * @param attributes
     * @returns {Object}
     * @private
     */

  }, {
    key: '_prepareAttributes',
    value: function _prepareAttributes(attributes) {
      var s = cheer.load(this.rendered);
      var stats = fs.statSync(this.filename);
      var text = function text(query) {
        var matches = s(query);

        if (matches.length) return matches.first().text();
      };

      if (!('title' in attributes) || !attributes.title) {
        attributes.title = text('h1') || text('h2') || text('h3');
      }

      if (!('date' in attributes)) {
        attributes.date = new Date(stats.ctime);
      }

      attributes.date = new Date(attributes.date);

      if (!('updated_at' in attributes)) {
        attributes.updated_at = new Date(stats.mtime); // eslint-disable-line camelcase
      }

      attributes.updated_at = new Date(attributes.updated_at);

      attributes.updated_at = new Date(attributes.updated_at); // eslint-disable-line camelcase

      if (!('description' in attributes) || !attributes.description) {
        attributes.description = text('p');
      }

      if (!('tags' in attributes)) {
        attributes.tags = [];
      } else if (!Array.isArray(attributes.tags)) {
        attributes.tags = [attributes.tags];
      }

      if (!('photo' in attributes)) {
        attributes.photo = s('img.cover').attr('src') || s('img').attr('src');
      }

      return attributes;
    }
  }, {
    key: 'tags',
    get: function get$$1() {
      return this._tags;
    }

    /**
     * Collection/Series, the article is part of.
     * @returns {Collection|null}
     */

  }, {
    key: 'collection',
    get: function get$$1() {
      return this._collection;
    }

    /**
     * Minimal article info.
     * @returns {{id: string, title: string, description: string, photo: string, published_at: Date}}
     */

  }, {
    key: 'preview',
    get: function get$$1() {
      return {
        id: this.id,
        slug: this.slug,
        collection: this.collection && this.collection.id,
        title: this.title,
        description: this.description,
        photo: this.photo,
        published_at: this.published_at // eslint-disable-line camelcase
      };
    }
  }], [{
    key: 'create',
    value: function () {
      var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(filename, options, blog) {
        var article;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                article = new Article(filename);
                _context2.next = 3;
                return article.create(options, blog);

              case 3:
                return _context2.abrupt('return', article);

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function create(_x3, _x4, _x5) {
        return _ref2.apply(this, arguments);
      }

      return create;
    }()
  }]);
  return Article;
}();

var Collection = function () {
  function Collection(name) {
    classCallCheck(this, Collection);

    this.id = slug(name, { lower: true });
    this.name = name;
    Object.defineProperties(this, {
      _articles: { value: new Container() }
    });
  }
  /** @private */


  createClass(Collection, [{
    key: 'addArticle',
    value: function addArticle(article) {
      this._articles.addItem(article);
    }
  }, {
    key: 'toPlainObject',
    value: function toPlainObject() {
      return { id: this.id, name: this.name, articles: this.articles.map(function (article) {
          return article.preview;
        }) };
    }
  }, {
    key: 'articles',
    get: function get$$1() {
      return this._articles.items;
    }
  }]);
  return Collection;
}();

function format(template, resource) {
  var keys = Object.keys(resource);

  keys.forEach(function (key) {
    if (['number', 'string'].includes(_typeof(resource[key]))) {
      template = template.replace(new RegExp(':' + key, 'gi'), slug('' + resource[key]));
    }
  });

  return template.replace(/\/?:[^/]+/g, '');
}

function compare(a, b) {
  return Object.keys(a).every(function (key) {
    return a[key] === b[key];
  });
}

function find(items, query) {
  return items.find(function (item) {
    return compare(query, item);
  });
}

var Blog = function () {
  function Blog() {
    classCallCheck(this, Blog);

    this.patterns = [];
    this._articles = new Container();
    this._tags = new Container();
    this._dirty = true;
    this._collections = new Container();
  }

  createClass(Blog, [{
    key: 'addSource',
    value: function addSource(pattern) {
      this.patterns.push(pattern);
      this._dirty = true;
    }
  }, {
    key: 'create',
    value: function () {
      var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(options) {
        var _this = this;

        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(this._dirty || force)) {
                  _context3.next = 4;
                  break;
                }

                this._options = options;
                _context3.next = 4;
                return Promise.all(this.patterns.map(function () {
                  var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(pattern) {
                    var files;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.next = 2;
                            return pify(glob)(pattern);

                          case 2:
                            files = _context2.sent;
                            _context2.next = 5;
                            return Promise.all(files.map(function () {
                              var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(filename) {
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                  while (1) {
                                    switch (_context.prev = _context.next) {
                                      case 0:
                                        return _context.abrupt('return', _this._addArticle(filename));

                                      case 1:
                                      case 'end':
                                        return _context.stop();
                                    }
                                  }
                                }, _callee, _this);
                              }));

                              return function (_x4) {
                                return _ref3.apply(this, arguments);
                              };
                            }()));

                          case 5:
                          case 'end':
                            return _context2.stop();
                        }
                      }
                    }, _callee2, _this);
                  }));

                  return function (_x3) {
                    return _ref2.apply(this, arguments);
                  };
                }()));

              case 4:
                this._dirty = false;

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function create(_x) {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'generate',
    value: function () {
      var _ref4 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(options) {
        var _this2 = this;

        var templates, output, resolve;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                resolve = function resolve(filename) {
                  return (options.api.prefix + '/' + filename).replace(/\/+/g, '/').replace(/\/+$/, '') + '.json';
                };

                templates = options.templates;
                _context4.next = 4;
                return this.create(options);

              case 4:
                output = {};


                this.articles.forEach(function (article) {
                  output[format(resolve(templates.article), article)] = _this2.addPaginationLinks(article);
                });
                this.tags.forEach(function (tag) {
                  output[format(resolve(templates.tag), tag)] = tag.toPlainObject();
                });
                this.collections.forEach(function (collection) {
                  output[format(resolve(templates.collection), collection)] = collection.toPlainObject();
                });

                output[resolve(templates.indexArticles)] = this.articles.map(function (article) {
                  return article.preview;
                });
                output[resolve(templates.indexTags)] = this.tags;
                output[resolve(templates.indexCollections)] = this.collections;

                return _context4.abrupt('return', output);

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function generate(_x5) {
        return _ref4.apply(this, arguments);
      }

      return generate;
    }()
  }, {
    key: 'addPaginationLinks',
    value: function addPaginationLinks(article) {
      var json = JSON.parse(JSON.stringify(article));
      var next = this.getNextArticle(article);
      var prev = this.getPrevArticle(article);

      if (next) {
        json.next = next.preview;
      }

      if (prev) {
        json.prev = prev.preview;
      }

      return json;
    }
  }, {
    key: '_addArticle',
    value: function () {
      var _ref5 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(filename) {
        var article;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return Article.create(filename, this._options, this);

              case 2:
                article = _context5.sent;


                this._articles.addItem(article);
                article.tags.forEach(function (tag) {
                  return tag.addArticle(article);
                });
                article.collection && article.collection.addArticle(article);

                return _context5.abrupt('return', article);

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _addArticle(_x6) {
        return _ref5.apply(this, arguments);
      }

      return _addArticle;
    }()
  }, {
    key: 'getArticle',
    value: function getArticle(id) {
      return this._articles.getItem(id);
    }
  }, {
    key: 'getNextArticle',
    value: function getNextArticle(id) {
      var article = typeof id === 'string' ? this.getArticle(id) : id;
      var index = this.articles.findIndex(function (other) {
        return article.id === other.id;
      });

      return index > 0 ? this.articles[index - 1] : null;
    }
  }, {
    key: 'getPrevArticle',
    value: function getPrevArticle(id) {
      var article = typeof id === 'string' ? this.getArticle(id) : id;
      var index = this.articles.findIndex(function (other) {
        return article.id === other.id;
      });

      return index + 1 < this.articles.length ? this.articles[index + 1] : null;
    }
  }, {
    key: 'getCollection',
    value: function getCollection(name) {
      var id = slug(name, { lower: true });
      var collection = this._collections.getItem(id);

      if (!collection) {
        collection = new Collection(name);
        this._collections.addItem(collection);
      }

      return collection;
    }
  }, {
    key: 'getTag',
    value: function getTag(name) {
      var id = slug(name, { lower: true });
      var tag = this._tags.getItem(id);

      if (!tag) {
        tag = new Tag(name);
        this._tags.addItem(tag);
      }

      return tag;
    }
  }, {
    key: 'findArticle',
    value: function findArticle(params) {
      return find(this.articles, params);
    }
  }, {
    key: 'findTag',
    value: function findTag(params) {
      return find(this.tags, params);
    }
  }, {
    key: 'findCollection',
    value: function findCollection(params) {
      return find(this.collections, params);
    }
  }, {
    key: 'context',
    set: function set$$1(context) {
      this._context = context;
    }
  }, {
    key: 'options',
    set: function set$$1(options) {
      this._options = options;
    }
  }, {
    key: 'articles',
    get: function get$$1() {
      return this._articles.items;
    }
  }, {
    key: 'tags',
    get: function get$$1() {
      return this._tags.items;
    }
  }, {
    key: 'collections',
    get: function get$$1() {
      return this._collections.items;
    }
  }]);
  return Blog;
}();

var blog = new Blog();

var resolve = function resolve(filename) {
  return path.resolve(__dirname, '../src/app', filename);
};

var routes = [{
  name: '@nuxtjs/blog:index',
  path: '/blog',
  component: resolve('./pages/Blog.vue')
}, {
  name: '@nuxtjs/blog:page',
  path: '/blog/pages/:page',
  component: resolve('./pages/Blog.vue')
}, {
  name: '@nuxtjs/blog:tag',
  path: '/blog/tags/:id/:page?',
  component: resolve('./pages/Tag.vue')
}, {
  name: '@nuxtjs/blog:collection',
  path: '/blog/collections/:id/:page?',
  component: resolve('./pages/Collection.vue')
}, {
  name: '@nuxtjs/blog:article',
  path: '/blog/:collection?/:id',
  component: resolve('./pages/Article.vue')
}];

var registerRoutes = function (options, router, r) {
  options.routes.forEach(function (route) {
    var index = routes.findIndex(function (r) {
      return r.name === route.name;
    });

    if (index > -1) Object.assign(routes[index], route);
  });

  router.push.apply(router, toConsumableArray(routes.map(function (route) {
    return _extends({}, route, { component: r(route.component) });
  })));
};

var send404 = function send404(res) {
  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  res.end();
};

var sendJson = function sendJson(content, res) {
  if (!content) {
    console.log('  ' + chalk.blue('blog:api') + ' ' + chalk.red('Not found'));

    return send404(res);
  }

  content = JSON.stringify(content, null, 2);
  console.log('  ' + chalk.blue('blog:api') + ' ' + chalk.green('application/json'));
  console.log('  ' + chalk.blue('blog:api') + ' ' + JSON.stringify(content).substr(0, 40) + '...}');
  res.setHeader('Content-Type', 'application/json');
  res.end(content, 'utf-8');
};

var sendFile = function sendFile(filename, res) {
  console.log('   Resolved file: ' + filename);
  fs.exists(filename, function (exists) {
    if (exists) {
      console.log('   Found required file. Attempting response.');
      fs.readFile(filename, { encoding: 'utf-8' }, function (error, content) {
        if (error) {
          console.log('   Failed to send response.', error);
          res.statusCode = 500;
          res.statusMessage = 'Internal Server Error';
          res.end(error.stack || String(error));
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(content, 'utf-8');
        console.log('   Response sent successfully.');
      });
    } else {
      return send404(res);
    }
  });
};

var registerRotues = function (router, context, options) {
  function request(url) {
    console.log('  ' + chalk.blue('blog:api') + ' ' + chalk.green('GET') + ' /' + options.api.prefix + url);

    return url;
  }

  function resolve(filename) {
    return path.resolve(options.distDir, (options.api.prefix + '/' + filename).replace(/\/+/, '/').replace(/\/+$/, '') + '.json');
  }

  var templates = options.templates;
  var dev = function dev() {
    if (context.nuxt.options.dev) {
      console.log('  ' + chalk.blue('blog:api') + ' ... running in dev mode');
      return true;
    }
  };
  router.get(templates.indexArticles, function (req, res) {
    var url = request(format(templates.indexArticles, req.params));

    if (dev()) {
      blog.create(options, true).then(function () {
        return sendJson(blog.articles.map(function (article) {
          return article.preview;
        }), res);
      });
      return;
    }

    sendFile(resolve(url), res);
  });
  router.get(templates.indexTags, function (req, res) {
    var url = request(format(templates.indexTags, req.params));

    if (dev()) {
      blog.create(options, true).then(function () {
        return sendJson(blog.tags, res);
      });
      return;
    }

    sendFile(resolve(url), res);
  });
  router.get(templates.tag, function (req, res) {
    var url = request(format(templates.tag, req.params));
    if (dev()) {
      blog.create(options, true).then(function () {
        return sendJson(blog.findTag(req.params).toPlainObject(), res);
      });
      return;
    }
    sendFile(resolve(url), res);
  });
  router.get(templates.indexCollections, function (req, res) {
    var url = request(format(templates.indexCollections, req.params));

    if (dev()) {
      blog.create(options, true).then(function () {
        return sendJson(blog.collections, res);
      });
      return;
    }

    sendFile(resolve(url), res);
  });
  router.get(templates.collection, function (req, res) {
    var url = request(format(templates.collection, req.params));
    if (dev()) {
      blog.create(options, true).then(function () {
        return sendJson(blog.findCollection(req.params).toPlainObject(), res);
      });
      return;
    }
    sendFile(resolve(url), res);
  });
  router.get(templates.article, function (req, res) {
    var url = request(format(templates.article, req.params));

    if (dev()) {
      blog.create(options, true).then(function () {
        return sendJson(blog.addPaginationLinks(blog.findArticle(req.params)), res);
      });
      return;
    }

    sendFile(resolve(url), res);
  });

  console.log('   ' + chalk.blue('blog:api') + ' Listening on /' + options.api.prefix);
  context.addServerMiddleware({
    path: '/' + options.api.prefix,
    handler: router
  });
};

var serve = function (context, options) {
        var router = express.Router();
        var generateDir = context.nuxt.options.generate && context.nuxt.options.generate.dir && path.resolve(options.rootDir, context.nuxt.options.generate.dir) || path.resolve(options.rootDir, 'dist');
        options.distDir = path.resolve(generateDir, '_nuxt');

        registerRotues(router, context, options);
};

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var isBuffer_1 = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
};

function isBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0));
}

var flat_1 = createCommonjsModule(function (module) {
var flat = module.exports = flatten;
flatten.flatten = flatten;
flatten.unflatten = unflatten;

function flatten(target, opts) {
  opts = opts || {};

  var delimiter = opts.delimiter || '.';
  var maxDepth = opts.maxDepth;
  var output = {};

  function step(object, prev, currentDepth) {
    currentDepth = currentDepth ? currentDepth : 1;
    Object.keys(object).forEach(function (key) {
      var value = object[key];
      var isarray = opts.safe && Array.isArray(value);
      var type = Object.prototype.toString.call(value);
      var isbuffer = isBuffer_1(value);
      var isobject = type === "[object Object]" || type === "[object Array]";

      var newKey = prev ? prev + delimiter + key : key;

      if (!isarray && !isbuffer && isobject && Object.keys(value).length && (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1);
      }

      output[newKey] = value;
    });
  }

  step(target);

  return output;
}

function unflatten(target, opts) {
  opts = opts || {};

  var delimiter = opts.delimiter || '.';
  var overwrite = opts.overwrite || false;
  var result = {};

  var isbuffer = isBuffer_1(target);
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target;
  }

  // safely ensure that the key is
  // an integer.
  function getkey(key) {
    var parsedKey = Number(key);

    return isNaN(parsedKey) || key.indexOf('.') !== -1 ? key : parsedKey;
  }

  Object.keys(target).forEach(function (key) {
    var split = key.split(delimiter);
    var key1 = getkey(split.shift());
    var key2 = getkey(split[0]);
    var recipient = result;

    while (key2 !== undefined) {
      var type = Object.prototype.toString.call(recipient[key1]);
      var isobject = type === "[object Object]" || type === "[object Array]";

      // do not write over falsey, non-undefined values if overwrite is false
      if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
        return;
      }

      if (overwrite && !isobject || !overwrite && recipient[key1] == null) {
        recipient[key1] = typeof key2 === 'number' && !opts.object ? [] : {};
      }

      recipient = recipient[key1];
      if (split.length > 0) {
        key1 = getkey(split.shift());
        key2 = getkey(split[0]);
      }
    }

    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts);
  });

  return result;
}
});

function toPlainObject(any) {
  if (Array.isArray(any)) {
    return any.map(function (item) {
      return JSON.parse(JSON.stringify(item));
    });
  }

  return JSON.parse(JSON.stringify(any));
}

var generate = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var paths;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return blog.create();

        case 2:
          paths = [];

          routes.forEach(function (route) {
            switch (route.name) {
              case '@nuxtjs/blog:index':
                paths.push({
                  route: route.path,
                  payload: toPlainObject(blog.articles.map(function (article) {
                    return article.preview;
                  }))
                });
                break;
              case '@nuxtjs/blog:article':
                paths.push.apply(paths, toConsumableArray(blog.articles.map(function (article) {
                  return {
                    route: format(route.path, article),
                    payload: toPlainObject(article)
                  };
                })));
                break;
              case '@nuxtjs/blog:tag':
                paths.push.apply(paths, toConsumableArray(blog.tags.map(function (tag) {
                  return {
                    route: format(route.path, tag),
                    payload: toPlainObject(tag.toPlainObject())
                  };
                })));
                break;
              case '@nuxtjs/blog:collection':
                paths.push.apply(paths, toConsumableArray(blog.collections.map(function (collection) {
                  return {
                    route: format(route.path, collection),
                    payload: toPlainObject(collection.toPlainObject())
                  };
                })));
                break;
              default:
              // -- Ignore!
            }
          });

          return _context.abrupt('return', paths);

        case 5:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
}));

function makeResource(object) {
  var content = JSON.stringify(object, null, process.env.NODE_ENV === 'production' ? 0 : 2);

  return { source: function source() {
      return content;
    }, size: function size() {
      return content.length;
    } };
}

function defineOptions(options, context) {
  var flattened = flat_1(Object.assign({}, options));
  var define = {};
  Object.keys(flattened).forEach(function (key) {
    define['process.env.__NUXT_BLOG__.' + key] = JSON.stringify(flattened[key]);
  });
  context.options.build.plugins.push(new webpack.DefinePlugin(define));
}

function compileBlog(options, context) {
  context.options.build.plugins.push({
    apply: function apply(compiler) {
      compiler.plugin('emit', function (compilation, cb) {
        blog.generate(options).then(function (files) {
          Object.keys(files).forEach(function (filename) {
            compilation.assets[filename] = makeResource(files[filename]);
          });
          cb();
        }).catch(function (exception) {
          console.log(' |> Compilation failed.', exception);
        });
      });
    }
  });
}

function override(options, cb) {
  var _this = this;

  if (options.generate === undefined) options.generate = {};
  if (Array.isArray(options.generate.routes)) {
    var routes = options.generate.routes;
    options.generate.routes = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.t0 = routes;
              _context.next = 3;
              return cb();

            case 3:
              _context.t1 = _context.sent;
              return _context.abrupt('return', _context.t0.concat.call(_context.t0, _context.t1));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));
  } else if (typeof options.generate.routes === 'function') {
    var original = options.generate.routes;
    options.generate.routes = function () {
      var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = [];
                _context2.next = 3;
                return original.apply(undefined, _args2);

              case 3:
                _context2.t1 = _context2.sent;
                _context2.next = 6;
                return cb();

              case 6:
                _context2.t2 = _context2.sent;
                return _context2.abrupt('return', _context2.t0.concat.call(_context2.t0, _context2.t1, _context2.t2));

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this);
      }));

      return function () {
        return _ref2.apply(this, arguments);
      };
    }();
  } else {
    options.generate.routes = cb;
  }
}

var build = function (context, options) {
  compileBlog(options, context);
  defineOptions(options, context);
  override(context.options, function () {
    return generate(options, context);
  });
};

var name = "@nuxtjs/blog";
var version = "0.0.1-6";
var description = "Build a nuxt blog";
var main = "./dist/blog-module.js";
var module$1 = "./src/index.js";
var repository = "https://github.com/nuxt-community/blog-module";
var author = "Rahul Kadyan <hi@znck.me>";
var license = "MIT";
var scripts = { "lint": "eslint --ext .vue,.js,.json .", "lint:fix": "eslint --fix --ext .vue,.js,.json .", "precommit": "yarn run lint", "build": "rollup -c", "prepublishOnly": "npm run build", "postpublish": "git push && git push --tags" };
var dependencies = { "babel-polyfill": "^6.23.0", "babel-plugin-transform-object-rest-spread": "^6.23.0", "chalk": "2.0.1", "cheerio": "^1.0.0-rc.1", "express": "^4.15.3", "flat": "^2.0.1", "front-matter": "^2.1.2", "glob": "latest", "markdown-it": "8.3.1", "markdown-it-decorate": "1.2.2", "markdown-it-emoji": "1.4.0", "merge-options": "^1.0.0", "node-sass": "^4.5.3", "pify": "^3.0.0", "prismjs": "^1.6.0", "sass-loader": "^6.0.6", "slug": "^0.9.1", "vue-disqus": "^2.0.3", "webpack": "^3.0.0" };
var devDependencies = { "babel-plugin-transform-flow-strip-types": "^6.22.0", "babel-preset-env": "^1.5.2", "babel-preset-es2015-rollup": "^3.0.0", "babel-preset-vue-app": "^1.2.0", "eslint": "4.1.1", "eslint-config-vue-app": "^1.3.3", "eslint-plugin-json": "^1.2.0", "rollup": "0.43.0", "rollup-plugin-babel": "^2.7.1", "rollup-plugin-commonjs": "^8.0.2", "rollup-plugin-json": "^2.3.0", "rollup-plugin-node-resolve": "^3.0.0" };
var peerDependencies = { "@nuxtjs/axios": "*" };
var meta = {
	name: name,
	version: version,
	description: description,
	main: main,
	module: module$1,
	repository: repository,
	author: author,
	license: license,
	scripts: scripts,
	dependencies: dependencies,
	devDependencies: devDependencies,
	peerDependencies: peerDependencies,
	"jsnext:main": "./src/index.js"
};

function NuxtModule(options) {
  var defaults = {
    base: 'http://localhost:3000',
    comments: false,
    static: true,
    dir: 'blog',
    api: {
      prefix: 'api/blog'
    },
    templates: {
      article: '/posts/:id',
      tag: '/tags/:id',
      collection: '/collections/:id',
      indexArticles: '/',
      indexTags: '/tags',
      indexCollections: '/collections'
    },
    routes: routes,
    disqus: {
      url: options.base || 'http://localhost:3000',
      shortname: undefined,
      api_key: undefined, // eslint-disable-line camelcase
      sso_config: undefined // eslint-disable-line camelcase
    },
    twitter: null,
    og: null,
    fb: null,
    markdown: {
      plugins: [require('markdown-it-decorate'), require('markdown-it-emoji')]
    }
  };
  var nuxtOptions = this.nuxt.options;

  options = mergeOptions(defaults, options, {
    static: nuxtOptions.dev ? false : options.static,
    base: nuxtOptions.dev ? options.devBase || defaults.base : options.base || ''
  });
  options.rootDir = nuxtOptions.rootDir;
  options.path = path.resolve(nuxtOptions.rootDir, options.dir);

  blog.context = this;
  blog.addSource(options.path + '/**/*.md');

  // Register blog routes.
  this.extendRoutes(function () {
    for (var _len = arguments.length, any = Array(_len), _key = 0; _key < _len; _key++) {
      any[_key] = arguments[_key];
    }

    return registerRoutes.apply(undefined, [options].concat(any));
  });
  // Register api server.
  serve(this, options);
  // Register build process.
  build(this, options);
  // Register layout.
  // this.
}

NuxtModule.meta = meta;

module.exports = NuxtModule;
