"use strict"
function isPrimary(x){
    if(typeof x==="string"||typeof x==="number"||typeof x==="null"||typeof x==="undefined")return true;
    return false;
}

function defineProperty(obj,key,instance){
    let value=obj[key];
    const config={
        configurable:true,
        enumerable:true,
        get:function (){
            console.log('您获取了值');
            return value;
        },
        set:function (newVal){
            if(instance.observer&&typeof instance.observer.fire==='function'){
                instance.observer.notify();
                //触发回调函数
                instance.observer.fire(newVal,value);
            }
            value=newVal;
        }
    };

    Object.defineProperty(obj,key,config); 
  
}

function defineReactive(obj,_obj,instance){
    if(Array.isArray(obj)){console.log(obj+'is array not object!');return _obj;}
    else if(typeof obj==='object'){
        for(let i in obj){
            if(isPrimary(obj[i])){
                _obj[i]=obj[i];
                defineProperty(_obj,i,instance); 
            }else{
                _obj[i]={};
                defineReactive(obj[i],_obj[i],instance);
            }
    
        }
    }else{console.log('it must be an object about: '+obj)}
    return _obj;
}

//将对象（属性）注册为发布商
let Dep=function(prop){
    //所有的观察者
    //指向这个对象（属性），以便确认这个实例是唯一的，不会重复注册
    this.watchers=[];
    this.target=prop;
    Dep.deps.push(this);
};
//收集所有依赖实例
Dep.deps=[];
Dep.prototype={
    constructor:Dep,
    addSub (x){this.watchers.push(x)},
    removeSub (x){
        for(let i=0;i<this.watchers.length;i++){
            if(watchers[i]===x)this.watchers.splice(i,1);
        }
    },
    fire (newVal,oldVal){
        for(let i=0;i<this.watchers.length;i++){
            let callback=this.watchers[i];
            if(typeof callback==='function') callback(newVal,oldVal);
        }
    },
    notify (){console.log('我内部的值发生了改变')}
};


//全局唯一，表示依赖实例的个数
let uid=0;
let Observe=function(o,callback){
    for(let i=0;i<uid;i++){
        let target=Dep.deps[i]?Dep.deps[i].target:Dep.deps[i];
        if(target===o){Dep.deps[i].addSub(callback);return Dep.deps[i]._r;}
    }

    //observer属性将o注册为发布商并指向这个实例
    //同时Observe()对这个实例进行深层次遍历，以便这个实例能够接收来自内部的变化及时广播
    this.observer=new Dep(o);
    this.observer._r=this;
    uid++;
    this.observer.addSub(callback);
    return defineReactive(o,this,this);
};


//测试用例
let o={id:1,name:'QQ',child:{color:'red'}};
let z=new Observe(o,()=>{console.log('hahahha')});
let x=new Observe(o,()=>{console.log('miamiamia')});

