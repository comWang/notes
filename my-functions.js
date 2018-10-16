const isArray = (a) => {
    const res = Object.prototype.toString.call(a).toLowerCase();
    if (res === '[object array]') return true;
    return false;
};


// 接受url,返回包含所有请求参数的对象
// url格式: *example?id=8&name=0
const getUrlObj = (urlString) => {
    function UrlObj(url) {
        const params = url.substr(url.indexOf('?') + 1, url.length);
        const array = params.split('&');
        for (let i = array.length - 1; i >= 0; i--) {
            const boundary = array[i].indexOf('=');
            const key = array[i].substr(0, boundary);
            const value = array[i].substr(boundary + 1, array[i].length);
            this[key] = value;
        }
    }
    return new UrlObj(urlString);
};


// 1.给定一个原始值和数组,返回该值首次出现在数组中的位置,否则返回-1
// 2.给定一个单一属性对象{key = value}和一个数组,返回与该对象同属性-值的对象首次出现的位置,否则返回-1
// 基于浅比较,只接受查询对象的第一个key-value,其余值将被忽略
const dataFrom = (ele, array) => {
    if (!Array.isArray(array)) throw new TypeError('unexpected value,you should pass array');
    if (typeof ele === 'object') {
        if (Array.isArray(ele)) throw new TypeError('the first param may be object or basic value');
        const key = Object.keys(ele)[0];
        for (let j = 0; j < array.length; j++) {
            if (typeof array[j] !== 'object' || Array.isArray(array[j])) throw new TypeError('the member of second param may be object or basic value');
            if (ele[key] === array[j][key]) return j;
        }
    } else { // 查询值为基础类型
        for (let i = 0; i < array.length; i++) {
            if (array[i] === ele) return i;
        }
    }

    return -1;
};


// 获得参数的拷贝,基于深比较
// 暂不考虑es6新引入的数据类型
const cloneStructor = (data) => {
    let tem;
    if (typeof data === 'object' && isArray(data)) {
        tem = [];
        for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== 'object') tem.push(data[i]);
            else tem.push(cloneStructor(data[i]));
        }
    } else if (typeof data === 'object') {
        tem = {};
        const keys = Object.keys(data);
        for (let j = 0; j < keys.length; j++) {
            const key = keys[j];
            if (typeof data[key] !== 'object') tem[key] = data[key];
            else tem[key] = cloneStructor(data[key]);
        }
    }
    return tem || data;
};


// 给出属性值列表和需要排序的数组
// 将数组按照列表里值出现的相对顺序排序
// 基于浅比较
const sort = (list, a) => {
    const b = [];
    const res = [];
    if (!Array.isArray(list) || !Array.isArray(a)) throw new TypeError('Both params must be array');
    list.forEach((item, i) => {
        a.forEach((obj) => {
            if (obj.type === item) b[i] = obj;
        });
    });
    // 去除多余的数组元素
    for (let j = b.length - 1; j >= 0; j--) {
        if (b[j] !== undefined) res.unshift(b[j]);
    }
    return res;
};


/**
 *@description: 字符串过滤器,链式调用
 *@param: ( rules: Objct ) 过滤规则。要求过滤函数接受一个string类型参数并返回一个字符串
 */

const CharFilter = function CharFilter(rules) {
    if (rules !== undefined && (typeof rules !== 'object' || isArray(rules))) throw new TypeError('传入的自定义规则必须为object');

    // 默认过滤规则集
    const defaultRules = {
        onlyNumber(s) {
            const result = s.replace(/[^\d]/g, '');
            return result;
        },
    };

    const $rules = Object.assign(defaultRules, rules);
    const keys = Object.keys($rules);
    this.result = null;
    this.handlers = [];
    this.rules = $rules;
    // 添加自定义规则
    keys.forEach((key) => {
        const func = $rules[key];
        if (typeof func !== 'function') throw new TypeError(`${key} 必须是一个函数:`);
        function fn() {
            this.handlers.push(key);
            return this;
        }
        fn.bind(this);
        // 进行链式调用时实际是调用改写后的方法
        // 从传入的规则集中添加处理方法(为防止覆盖关键方法这里进行检验)
        if (!/(constructor)|(start)|(end)/.test(key)) this[key] = fn;
    });
};

CharFilter.prototype = {
    constructor: CharFilter,
    start(s) {
        if (typeof s !== 'string') throw new TypeError('传入的参数类型应为string');
        this.result = s;
        return this;
    },
    // 如果传入了true,则在每次过滤前将数据打印出来
    end(optional) {
        if (this.result === null) throw new TypeError('请在处理前调用start()函数');
        return this.handlers.reduce((accumulator, handleName) => {
            const handle = this.rules[handleName];
            if (typeof accumulator !== 'string') throw new TypeError(`过滤函数接收了一个不期待的类型值: ${handleName}`);
            if (optional === true) console.log(`Before ${handleName}(),the value is ${accumulator}.`);
            return handle(accumulator);
        }, this.result);
    },
};


const func = {};
export {
    getUrlObj,
    dataFrom,
    cloneStructor,
    sort,
    CharFilter,
};
export default func;
