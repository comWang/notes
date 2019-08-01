# react全家桶简单总结
学习react全家桶一星期有余，在此简单总结。
## 1. React
> -  `React.[Component/PureComponent]` 
> - `React.createContex()`
React组件即返回JSX元素的函数，可以是普通函数，也可以是React类。类的写法如下：
```javascript
   class MyComponent extends React.Component{
       render(){
        //    ..codes
        return(<h1>hello world</h1>)
       }
   }
```
如果需要在constructor中使用this关键字，则要先调用`super()`。每次state,props的改变都会触发更新，无论改变后的值是否与之前相同。若要避免这种情况，使用PureComponent类（基于浅比较）。
React组件创建后有三个过程：mount,update,unmount,每个过程都有相应的生命周期钩子(lifecycle hook)。因为单向数据流，父子之间能通讯，那么同级之间就彼此隔离。因此只能使用组件提升（lifting）,即创建父组件，双方利用父组件作为中间人通讯。React组件返回值称为ReactElement，首字母必须大写，类似于html元素，能够有属性值，所有的属性都存放在一个props对象作为参数传递给React组件内部。属性值可以是函数，因此在内部调用该属性值可以触发函数。
```javascript
//ReactElement:
<Example onDo={doSomething} />
//inside:
({onDo})=>(<p onClick={onDo}></p>)

```
上面的p被点击后触发doSomething函数。
当React app变得庞大后，组件间通讯必然变得频繁，为了方便，引入上下文。
```javascript
const Context = React.createContext(defaultValue);
const a={};
<Context.Provider value={a}>
  <Context.Consumer />
  <Context.Consumer />
</Context.Provider>
```
相当于向内部所有Comsumer传递props=value。这也是React-Redux中`Provider`组件的由来。
## 2. Redux
> - `Redux.createStore()`
> - `store.dispatch()`

Redux认为所有数据集中存放在`store`,`store`是各个时刻`state`的集合，state每次只能新增，不能更改，每次对store的访问只是获得那个时刻的state。组件函数通过访问某个时刻的`state`进行更新，当组件需要回传数据给`store`时，不能直接操作，需要一个代理，他就是`Reducer`,回传数据被定义为一个`action`(动作),`store.dispacth(action)`就是发送动作给Reducer，Reducer根据动作类型返回一个新的state存在store中。通常如果动作复杂，就不直接dispatch一个action,而是定义一个工厂函数用于格式化生产action，因此经常用`dispatch(createActions(...params))`的写法。

```javascript
const store = Redux.createStore();
store.dispatch(action)
//or
store.dispacth(createActions(...params));
```
## 3. React-Redux
> - `{connect()}`
> - `{Provider}`

React组件负责展示UI，称之为 展示组件（presentation component）,`connect`是一个函数，就是React里的高阶组件（HOC），用于将展示组件和数据混合成一个新的组件，称之为容器组件(container component)。容器组件就是展示组件加上一层数据。
```javascript
import {connect} from 'react-redux';
const ContainerComponent=connect(mapStateToProps,mapDispathToProps)(PresentationComponent);
```
因为所有的React组件只接受props作为参数进行渲染，因此还需要将state数据与props对应起来（因为所有数据都由store统一管理，因此props也不例外）。mapStateToProps,mapDispathToProps分别返回对象，2个对象合起来作为props对象。

```javascript
<Provider store={store}>
<App />
</Provider>
```
经过`connect()`连接产生的容器组件，会自动作为Provider的consumer，当store中产生新的state后便会把新的state传给所有容器组件(如果connect只有一个参数,则还会自动传递dispatch方法,类似于事件监听中Event参数)。


