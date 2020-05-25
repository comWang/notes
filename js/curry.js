function sum3(a, b, c) {
    return a + b + c;
}
function curry(fn, ...rest) {
    return function t(...params) {
        const args = [...rest, ...params]
        if (args.length >= fn.length) return fn(...args);
        return curry(fn, ...args);
    }
}

const curry2 = (fn, ...rest) => (...params) => {
    if (rest.length + params.length >= fn.length) return fn(...rest, ...params);
    return curry2(fn, ...rest, ...params);
}

const fn = curry(sum3);
const fn2 = curry2(sum3);

