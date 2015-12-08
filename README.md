# store
## localstorage本地缓存方案

### 解决数据过期问题

本地实际应用建议绑定当前的用户，解决不能用户看到不同的缓存，可以做下适当的包装，比如：

```javascript
setCache:function(key,value,exp){
    //过期时间默认1天
    exp=exp||86400;
    store.set(key+'_'+curUserID, value,exp);
    
},

getCache:function(key){
    return store.get(key+'_'+curUserID);
}
```

### todo：

另外还又可以尝试结合一些简单的加解密技术，来保证客户端缓存数据的相对安全，但势必会造成性能上的损失。

## 简单API

### 设置缓存
```javascript
//简单的缓存
store.set('a',{a:1,b:2})

//增加过期时间：单位是秒
store.set('a',{a:1,b:2},3600)

//清除指定缓存
store.set('a',null)
//或者
sotre.set('a');//为了代码的可读性，不建议这样使用
```

### 获取缓存的数据
```javascript
store.get('a')
//log：{a:1,b:2}
```

### 删除指定缓存
```javascript
store.del('a');
```

### 删除所有过期的缓存
```javascript
store.clearExp();
```

### 清除所有缓存
```javascript
store.clearAll()
```

### 添加一个缓存
```javascript
//和set的区别是，这个会检测是否已经存在同名的缓存，如果存在，就不做任何处理
// 单set是会覆盖当前值的
store.add('b',{c:1,d:1},3600)
```
### 设置缓存的过期时间
```javascript
//过期时间由原来的1小时，变成了2小时，并且是从创建时间计算的
store.setExp('a',7200)
```

### 读取缓存的过期时间
```javascript
store.getExp('a')
```

