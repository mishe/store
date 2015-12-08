# store
localstorage本地缓存方案 解决数据过期问题

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

todo：另外还又可以尝试结合一些简单的加解密技术，来保证客户端缓存数据的相对安全，但势必会造成性能上的损失。

