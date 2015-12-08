(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.WebStorageCache = factory();
    }
}(this, function () {
    "use strict";

    var _maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC'),
        _serialize=function (item) {
            return JSON.stringify(item);
        },
        _deserialize=function (data) {
            return data && JSON.parse(data);
        },
        _isSupported=function(storage) {
            var supported = false;
            if (storage && storage.setItem ) {
                supported = true;
                var key = '__' + Math.round(Math.random() * 1e7);
                try {
                    storage.setItem(key, key);
                    storage.removeItem(key);
                } catch (err) {
                    supported = false;
                }
            }
            return supported;
        },
        _getStorage=function(storage) {
            if (typeof(storage) === 'string') {
                return window[storage];
            }
            return storage;
        },
        _isDate=function(date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        },
        _getExpDate=function(expires, now) {
            now = now || new Date();
            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    _maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }
            if (expires && !_isDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }
            return expires;
        },
        _cacheItem=function(value, exp) {
            exp = exp || _maxExpireDate;
            return {
                c : new Date().getTime(),
                e : _getExpDate(exp).getTime(),
                v: value
            }
        };



    function Store() {
        this.storage = _getStorage('localStorage');
    }

    //默认不支持localStorage的不报错，包含隐私模式下同样的不报错，让页面正常运行
    Store.prototype={
        constructor:Store,
        set: function () {},
        get: function () {},
        del: function () {},
        clearExp:function(){},
        clearAll:function(){},
        add:function(){},
        setExp:function(){},
        getExp:function(){}
    };

    if (_isSupported(_getStorage('localStorage'))) {
        Store.prototype={
            constructor:Store,
            /**
             * 设置缓存，可以设置过期时间，单位：秒
             * @param key 缓存名称
             * @param val 缓存的值，如果未定义或为null，则删除该缓存
             * @param exp 缓存的过期时间
             * @returns {*}
             */
            set: function(key, val, exp) {
                if (typeof(key) !== 'string') {
                    console.warn(key + ' used as a key, but it is not a string.');
                    key = ''+key;
                }
                if (val === undefined || val===null) {
                    return this.del(key);
                }
                try {
                    this.storage.setItem(key, _serialize(_cacheItem(_serialize(val), exp)));
                } catch (e) {
                    console.error(e);
                }
                return val;
            },

            /**
             * 获取缓存，如果已经过期，会主动删除缓存，并返回null
             * @param key 缓存名称
             * @returns {*} 缓存的值，默认已经做好序列化
             */
            get: function (key) {
                var item = _deserialize(this.storage.getItem(key));
                if(item !== null && item !== undefined) {
                    var timeNow = new Date().getTime();
                    if(timeNow < item.e) {
                        return _deserialize(item.v);
                    } else {
                        this.del(key);
                    }
                }
                return null;
            },

            /**
             *  删除指定的缓存
             * @param key 要删除缓存的主键
             * @returns {*}
             */
            del: function (key) {
                this.storage.removeItem(key);
                return key;
            },

            /**
             *  删除所有过期的缓存
             * @returns {Array}
             */
            clearExp: function() {
                var length = this.storage.length,
                    caches = [],
                    _this = this;
                for (var i = 0; i < length; i++) {
                    var key = this.storage.key(i),
                        item = _deserialize(this.get(key));

                    if(item && !item.e) {
                        if(new Date().getTime() >= item.e) {
                            caches.push(key);
                        }
                    }
                }
                caches.forEach(function(key) {
                    _this.del(key);
                });
                return caches;
            },
            /**
             *  清空缓存
             */
            clearAll: function () {
                this.storage.clear();
            },
            /**
             * 添加一条缓存，如果已经存在同样名称的缓存，则不做任何处理
             * @param key 缓存的名称
             * @param value 缓存的值
             * @param exp 过期时间 单位：秒
             */
            add: function (key, value, exp) {
                if(this.get(key) === null || this.get(key) === undefined) {
                    this.set(key, value, exp);
                }
            },
            /**
             * 设置修改缓存的过期时间
             * @param key 缓存的名称
             * @param exp 新的过期时间 单位：秒
             */
            setExp: function (key, exp) {
                var item = this.get(key);
                if(item !== null && item !== undefined) {
                    item.e = _getExpDate(exp);
                    this.set(key,_serialize(item),exp);
                }
            },
            /**
             * 获取缓存的过期时间
             * @param key 缓存的名称
             * @returns {*} 单位：秒
             */
            getExp: function(key){
                var item =this.get(key);
                return item && item.e;
            }
        }
    }
    return new Store();
}));