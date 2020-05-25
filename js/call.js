function say() {
    console.log('Hello,' + this.person);
}

Function.prototype.call2 = function(env, ...args) {
    if (typeof env !== 'object') throw TypeError('Invalid parameter in 1');
    const _ = env !== null ? env : window;
    _.fn = this;
    _.fn(...args);
    delete _.fn;
}

var obj = {
    person: 'Rose'
};
var person = 'Jack';
say.call2(obj);