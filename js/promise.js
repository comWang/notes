(function (){
    var PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected';
function Promise2(asyncFunc) {
    // { type, fn }[],表明是then还是catch的处理函数
    this.handlers = [];
    this.status = PENDING;
    this.value = undefined;
    this.error = undefined;
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.runHandler = this.runHandler.bind(this);
    try {
        asyncFunc(this.resolve, this.reject);
    } catch (error) {
        this.reject(error);
    }
}

Promise2.resolve = function(data) {
    if (data instanceof Promise2) {
        return data;
    }
    if (data !== null && typeof data === 'object' || typeof data === 'function') {
        // 具有thenable方法的对象
        var _then = data.then;
        return new Promise2(function(resolve){
            resolve();
        }).then(_then);
    }
    // 基本类型
    return new Promise2(function(resolve){
        resolve(data);
    });
}

Promise2.reject = function(err) {
    if (err instanceof Promise2) {
        return err;
    }
    return new Promise2(function(resolve, reject){
        reject(err);
    });
}

Promise2.prototype = {
    constructor: Promise2,
    then: function (fulfillHandler, rejectHandler){
        if (this.status === PENDING) {
            this.handlers.push({
                type: FULFILLED,
                fn: fulfillHandler
            });
            return this;
        }
        // 跳过不匹配的状态
        if (this.status === REJECTED) return this;
        // 如果已经fulfilled,则执行;
        // 同时捕获执行过程可能出现的错误
        try {
            return Promise2.resolve(fulfillHandler(this.value));
        } catch (error) {
            // 新错误覆盖之前的
            this.error = error;
            return Promise2.reject(this.error);
        }
    },
    catch: function (rejectHandler) {
        if (this.status === PENDING) {
            this.handlers.push({
                type: REJECTED,
                fn: rejectHandler
            });
            return this;
        }
        // 逻辑同then()
        if (this.status === FULFILLED) return this;
        try {
            // 捕获错误后状态变为成功
            var promise = rejectHandler(this.error);
            return Promise2.resolve(promise);
        } catch (error) {
            // 新错误覆盖之前的
            this.error = error;
            return Promise2.reject(this.error);
        }
    },
    runHandler: function () {
        if (this.status === PENDING || !this.handlers.length) return;
        var handler = null;
        while (this.handlers.length) {
            var f = this.handlers.splice(0, 1)[0];
            if (f.type === this.status) {
                handler = f.fn;
                break;
            }
        }
        // 没找到对应的handler
        // 存在未捕获的错误就抛出
        if (!handler && this.status === REJECTED) {
            throw this.error;
        } else if (!handler) {
            return;
        }

        try {
            this.value = handler(this.status === FULFILLED ? this.value : this.error);
            this.error = undefined;
            // 只要能找到handler处理状态一律fulfilled
            this.status = FULFILLED;
        } catch (error) {
            this.value = undefined;
            this.error = error;
            this.status = REJECTED;
        }
        // 循环调用直至handlers清空
        if (this.handlers.length) setTimeout(this.runHandler, 0);
    },
    resolve: function (data) {
        if (this.status === PENDING) {
            this.status = FULFILLED;
            this.value = data;
            this.error = undefined;
            setTimeout(this.runHandler, 0);
        }
    },
    reject: function (error) {
        if (this.status === PENDING) {
            this.status = REJECTED;
            this.value = undefined;
            this.error = error;
            setTimeout(this.runHandler, 0);
        }
    }
};
window.Promise2 = Promise2;
})()



// test cases
new Promise2((resolve, reject) => {
        setTimeout(() => {
            resolve('我是第一个then');
        }, 1000);
    })
    .then(data => {
        console.log(`${data}!`);
        return data;
    })
    .catch(err => {
        console.log(`${err}...`);
    })
    .then(data => {
        console.log(`${data};catch之后的then!`)
    });



new Promise2((resolve, reject) => {
    setTimeout(() => {
        reject('我是第一个catch');
    }, 2000);
})
.then(data => {
    console.log(`${data}!`)
})
.catch(err => {
    console.log(`${err}...`);
    return err;
})
.then(data => {
    console.log(`${data};catch后的then!`);
});

new Promise2((resolve, reject) => {
    setTimeout(() => {
        reject('我是第一个catch');
    }, 2000);
})
.then(data => {
    console.log(`${data}!`)
})
.catch(err => {
    console.log(`${err}...`);
    throw Error('我又在被捕获的catch中error');
})
.then(data => {
    console.log(`${data};catch后的then!`);
})
