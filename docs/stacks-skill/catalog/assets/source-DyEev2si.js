var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,o)=>(o=n==null?{}:e(i(n)),s(r||!n||!n.__esModule||!a.call(n,`default`)?t(o,`default`,{value:n,enumerable:!0}):o,n)),l=o((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.for(`react.view_transition`),m=Symbol.iterator;function h(e){return typeof e!=`object`||!e?null:(e=m&&e[m]||e[`@@iterator`],typeof e==`function`?e:null)}var g={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},_=Object.assign,v={};function y(e,t,n){this.props=e,this.context=t,this.refs=v,this.updater=n||g}y.prototype.isReactComponent={},y.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},y.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function b(){}b.prototype=y.prototype;function x(e,t,n){this.props=e,this.context=t,this.refs=v,this.updater=n||g}var S=x.prototype=new b;S.constructor=x,_(S,y.prototype),S.isPureReactComponent=!0;var C=Array.isArray;function w(){}var T={H:null,A:null,T:null,S:null},E=Object.prototype.hasOwnProperty;function D(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function O(e,t){return D(e.type,t,e.props)}function k(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function A(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var j=/\/+/g;function M(e,t){return typeof e==`object`&&e&&e.key!=null?A(``+e.key):t.toString(36)}function N(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(w,w):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function P(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,P(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+M(e,0):a,C(o)?(i=``,c!=null&&(i=c.replace(j,`$&/`)+`/`),P(o,r,i,``,function(e){return e})):o!=null&&(k(o)&&(o=O(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(j,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(C(e))for(var u=0;u<e.length;u++)a=e[u],s=l+M(a,u),c+=P(a,r,i,s,o);else if(u=h(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+M(a,u++),c+=P(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return P(N(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function F(e,t,n){if(e==null)return e;var r=[],i=0;return P(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function I(e){if(e._status===-1){var t=e._result,n=t();n.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t,n.status===void 0&&(n.status=`fulfilled`,n.value=t))},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t,n.status===void 0&&(n.status=`rejected`,n.reason=t))}),e._status===-1&&(e._status=0,e._result=n)}if(e._status===1)return e._result.default;throw e._result}var L=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)};function ee(e){var t=T.T,n={};n.types=t===null?null:t.types,T.T=n;try{var r=e(),i=T.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(w,L)}catch(e){L(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),T.T=t}}function R(e){var t=T.T;if(t!==null){var n=t.types;n===null?t.types=[e]:n.indexOf(e)===-1&&n.push(e)}else ee(R.bind(null,e))}var te={map:F,forEach:function(e,t,n){F(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return F(e,function(){t++}),t},toArray:function(e){return F(e,function(e){return e})||[]},only:function(e){if(!k(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=te,e.Component=y,e.Fragment=r,e.Profiler=a,e.PureComponent=x,e.StrictMode=i,e.Suspense=l,e.ViewTransition=p,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=T,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return T.H.useMemoCache(e)}},e.addTransitionType=R,e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=_({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!E.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return D(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)E.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return D(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=k,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:I}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=ee,e.unstable_useCacheRefresh=function(){return T.H.useCacheRefresh()},e.use=function(e){return T.H.use(e)},e.useActionState=function(e,t,n){return T.H.useActionState(e,t,n)},e.useCallback=function(e,t){return T.H.useCallback(e,t)},e.useContext=function(e){return T.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return T.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return T.H.useEffect(e,t)},e.useEffectEvent=function(e){return T.H.useEffectEvent(e)},e.useId=function(){return T.H.useId()},e.useImperativeHandle=function(e,t,n){return T.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return T.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return T.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return T.H.useMemo(e,t)},e.useOptimistic=function(e,t){return T.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return T.H.useReducer(e,t,n)},e.useRef=function(e){return T.H.useRef(e)},e.useState=function(e){return T.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return T.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return T.H.useTransition()},e.version=`19.3.1`})),u=o(((e,t)=>{t.exports=l()})),d=c(u(),1),f=d.use,p=d.useLayoutEffect;function m(e){return e[e.length-1]}function h(e,t){return typeof e==`function`?e(t):e}var g=Object.prototype.hasOwnProperty;function _(e){for(let t in e)if(g.call(e,t))return!0;return!1}var v=()=>Object.create(null),y=(e,t)=>b(e,t,!0);function b(e,t,n,r=0){if(e===t)return e;if(r++>500)return t;let i=Array.isArray(e)&&Array.isArray(t);if(!i&&!(x(e)&&x(t)))return t;let a=Object.keys(e),o=a.length,s=Object.keys(t),c=s.length;if(i?o!==e.length||c!==t.length||o&&m(a)!==`${o-1}`||c&&m(s)!==`${c-1}`:o!==Object.getOwnPropertyNames(e).length||c!==Object.getOwnPropertyNames(t).length||Object.getOwnPropertySymbols(t).length)return t;let l=0,u,d,f;if(i){for(;l<c&&(f=l,d=e[f],u=t[f],u=d===u?d:typeof d==`object`?b(d,u,n,r):u,u===d);l++);if(l===c&&o===c)return e}else{let i=o===c,p=!0;for(;l<c;l++){f=s[l],d=e[f];let o=t[f];u=d===o?d:typeof d==`object`?b(d,o,n,r):o,i&&=u===d&&(a[l]===f||g.call(e,f)),p&&=Object.is(u,o),a[l]=u}if(i)return Object.getOwnPropertySymbols(e).length?t:e;if(p)return t}let p=i?s.fill(0):n?v():{};for(let o=0;o<c;o++)f=i?o:s[o],i?(d=e[f],o>l&&(u=t[f],u=d===u?d:typeof d==`object`?b(d,u,n,r):u),p[f]=o<l?d:u):p[f]=a[o];return p}function x(e){return!e||typeof e!=`object`?!1:(Object.getPrototypeOf(e)?.constructor??Object)===Object}function S(e,t,n,r){if(e===t)return!0;if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return!1;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=t[i];if(a!==o&&!S(a,o,n,r))return!1}return!0}if(x(e)&&x(t)){if(n){for(let i in t)if((r||t[i]!==void 0)&&!S(e[i],t[i],n,r))return!1;return!0}let i=0;if(r)i=Object.keys(e).length;else for(let t in e)e[t]!==void 0&&i++;for(let a in t)if((r||t[a]!==void 0)&&(i--===0||!S(e[a],t[a],n,r)))return!1;return i===0}return!1}function C(e){return typeof e?.message==`string`?e.message.startsWith(`Failed to fetch dynamically imported module`)||e.message.startsWith(`error loading dynamically imported module`)||e.message.startsWith(`Importing a module script failed`):!1}var w=/[\x00-\x1f\x7f"<>`{}]/g;function T(e){return e.replace(w,e=>`%`+e.charCodeAt(0).toString(16).toUpperCase().padStart(2,`0`))}function E(e){let t;try{t=decodeURI(e)}catch{t=e.replaceAll(/%[0-9A-F]{2}/gi,e=>{try{return decodeURI(e)}catch{return e}})}return T(t)}var D=[`http:`,`https:`,`mailto:`,`tel:`];function O(e){if(e[0]!==`/`&&e.includes(`:`))return/^[\x00-\x20]*([a-z][a-z\d+.\t\n\r-]*:)/i.exec(e)?.[1]?.replace(/[\t\n\r]/g,``).toLowerCase()}var k=/^[\x00-\x20]*[\\/][\t\n\r]*[\\/]/;function A(e,t){if(!e)return!1;if(k.test(e))return!0;let n=O(e);return n?!t.has(n):!1}function j(e){if(!e)return e;let t=e;if(/[%\\\x00-\x1f\x7f]/.test(e)){let n=/%25|%5C/gi,r=0,i;for(t=``;(i=n.exec(e))!==null;)t+=E(e.slice(r,i.index))+i[0],r=n.lastIndex;t+=E(r?e.slice(r):e)}return t}function M(e){return/[\s\u0080-\uFFFF]/.test(e)?e.replace(/\s|[^\u0000-\u007F]/gu,encodeURIComponent):e}function N(e,t){if(e===t)return!0;if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function P(){throw Error(`Invariant failed`)}function F(e){return e.replace(/\/{2,}/g,`/`)}function I(e){return e===`/`?e:e.replace(/^\/+/,``)}function L(e){let t=e.length;return t>1&&e[t-1]===`/`?e.replace(/\/+$/,``):e}function ee(e){return L(I(e))}function R(e,t){return e?.endsWith(`/`)&&e!==`/`&&e!==`${t}/`?e.slice(0,-1):e}function te(e,t,n=`never`,r){if(t.includes(`//`)&&(t=F(t)),t.startsWith(`/`))return t.length===1||n===`preserve`?t:n===`always`?t.endsWith(`/`)?t:`${t}/`:t.endsWith(`/`)?t.slice(0,-1):t;let i=t===`.`,a;if(r){a=i?e:e+`\0`+t;let n=r.get(a);if(n)return n}let o;if(i)o=e.split(`/`);else{for(e.includes(`//`)&&(e=F(e)),o=e.split(`/`);o.length>1&&m(o)===``;)o.pop();let n=t.split(`/`);for(let e=0,t=n.length;e<t;e++){let r=n[e];r===``?e?e===t-1&&o.push(r):o=[r]:r===`..`?o.length>1?o.pop():o=[``]:r===`.`||o.push(r)}}o.length>1&&(m(o)===``?n===`never`&&o.pop():n===`always`&&o.push(``));let s=o.join(`/`),c=(i?F(s):s)||`/`;return a&&r&&r.set(a,c),c}function ne(e){let t=new Map(e.map(e=>[encodeURIComponent(e),e])),n=new RegExp([...t.keys()].join(`|`).replace(/[.*()]/g,`\\$&`),`g`);return e=>e.replace(n,e=>t.get(e)??e)}function re(e){return e==null||e===``}function ie(e,t,n){if(typeof t!=`string`)return``+(t??void 0);let r=e===`_splat`;if(r&&(!t||/^[a-zA-Z0-9\-._~!/]*$/.test(t)))return t;let i=encodeURIComponent(t);return r&&(i=i.replaceAll(`%2F`,`/`)),n?n(i):i}function ae(e,t,n,r,i){let a=e.endsWith(`/`)?`/`:``,o=``;for(let e of t){if(typeof e==`string`){o+=e;continue}let[t,s,c,l]=e,u=t===2,d=u&&l!==void 0?l+a:l,f=n[s];if(t!==3||f!=null){if(i&&(i[s]=f,u&&(i[`*`]=f)),u&&re(f)){if(c===`/`&&!d)continue;f=``}o+=c+ie(s,f,r)+(d||``)}}return o+a||`/`}function oe(e={}){if(e.isNotFound=!0,e.throw)throw e;return e}function se(e){return e?.isNotFound===!0}function ce(){try{return sessionStorage}catch{return}}var le=`tsr-scroll-restoration-v1_3`,ue=ce();function de(){try{return JSON.parse(ue?.getItem(`tsr-scroll-restoration-v1_3`)||`{}`)}catch{return{}}}var fe=de(),pe=`data-scroll-restoration-id`,me=e=>e.state.__TSR_key||e.href;function he(e){let t=e.getAttribute(pe);if(t)return`[${pe}="${t}"]`;let n=``,r=e,i;for(;i=r.parentNode;){let e=1,t=r;for(;t=t.previousElementSibling;)e++;let a=`${r.localName}:nth-child(${e})`;n=n?`${a} > ${n}`:a,r=i}return n}var ge=!1,_e=`window`;function ve(e){try{return typeof e==`function`?e():document.querySelector(e)}catch{}}function ye(e){let t=new Set;for(let n of e){if(n===_e)continue;let e=ve(n);e&&t.add(e)}return t}function be(e,t){let n=t??e.options.scrollRestoration,r=e._scroll;n&&(r.e=!0);let i=e.options.getScrollRestorationKey||me,a=new Set,o=e=>{let t=fe[e]||={};for(let e of a)e===document?t[_e]={scrollX,scrollY}:e.isConnected&&(t[he(e)]={scrollX:e.scrollLeft,scrollY:e.scrollTop})};n&&!r.s&&(r.s=!0,ge=!1,history.scrollRestoration=`manual`,document.addEventListener(`scroll`,e=>{ge||a.add(e.target)},!0),e.subscribe(`onBeforeLoad`,e=>{e.fromLocation&&o(i(e.fromLocation)),a.clear()}),addEventListener(`pagehide`,()=>{history.scrollRestoration=`auto`,o(i(e.stores.resolvedLocation.get()??e.stores.location.get()));try{ue?.setItem(le,JSON.stringify(fe))}catch{}}),addEventListener(`pageshow`,e=>{e.persisted&&(history.scrollRestoration=`manual`)})),r.r||(r.r=!0,e.subscribe(`onRendered`,t=>{let n=e.options.scrollRestorationBehavior,o=e.options.scrollToTopSelectors,s=r.n,c=r.h,l;if(a.clear(),r.n=!0,r.h=!1,typeof e.options.scrollRestoration==`function`&&!e.options.scrollRestoration({location:e.latestLocation}))return;let u=i(t.toLocation),d=t.fromLocation&&i(t.fromLocation);if(r.e&&d&&d!==u){let e=fe[d];if(e){let t=fe[u];for(let n in e){if(n===_e){if(s)continue}else{let e=ve(n);if(!e||s&&o&&(l??=ye(o),l.has(e)))continue}t||=fe[u]={},t[n]??=e[n]}}}ge=!0;try{let e=t.toLocation.hash,i=t.toLocation.state.__hashScrollIntoViewOptions??!0,a=!1;if(s){!e&&o&&(l??=ye(o));let t=e&&i&&c,s=r.e?fe[u]:void 0;if(s)for(let e in s){let{scrollX:r,scrollY:i}=s[e];if(e===_e){if(t)continue;scrollTo({top:i,left:r,behavior:n}),a=!0}else{let t=ve(e);t&&(t.scrollLeft=r,t.scrollTop=i,l?.delete(t))}}if(!e){let e={top:0,left:0,behavior:n};if(a||scrollTo(e),l)for(let t of l)t.scrollTo(e)}}!a&&e&&i&&document.getElementById(e)?.scrollIntoView(i)}finally{ge=!1}}))}function xe(e,t=String){let n;for(let r in e){let i=e[r];i!==void 0&&(n||=new URLSearchParams).set(r,t(i))}return n?n.toString():``}function Se(e){return e?e===`false`?!1:e===`true`?!0:e*0==0&&+e+``===e?+e:e:``}function Ce(e){let t=new URLSearchParams(e),n=Object.create(null);for(let[e,r]of t.entries()){let t=n[e];t==null?n[e]=Se(r):Array.isArray(t)?t.push(Se(r)):n[e]=[t,Se(r)]}return n}var we=/^(?:\s|["[{\d-]|fa|nu|tr)/,Te=De(JSON.parse),Ee=Oe(JSON.stringify,JSON.parse);function De(e){let t=e===JSON.parse;return n=>{n[0]===`?`&&(n=n.slice(1));let r=Ce(n);for(let n in r){let i=r[n];if(typeof i==`string`){if(t&&!we.test(i))continue;try{r[n]=e(i)}catch{}}}return r}}function Oe(e,t){let n=t===JSON.parse;function r(r){if(r&&typeof r==`object`)try{return e(r)}catch{}else if(t&&typeof r==`string`){if(n&&!we.test(r))return r;try{return t(r),e(r)}catch{}}return r}return e=>{let t=xe(e,r);return t?`?${t}`:``}}var ke=`__root__`;function Ae(e){e.statusCode=e.statusCode||e.code||307;let t=new Headers(e.headers);e.href&&t.get(`Location`)===null&&t.set(`Location`,e.href);let n=new Response(null,{status:e.statusCode,headers:t});if(n.options=e,e.throw)throw n;return n}function je(e){return e instanceof Response&&!!e.options}function Me(e){let t=new Map,n,r;return{get(e){let n=t.get(e);if(n)return n.visited=!0,n.value},set(i,a){let o=t.get(i);if(o){o.value=a;return}if(t.size>=e){let e=n?.next().value;for(;!e||e.visited;)e?e.visited=!1:n=t.values(),e=n.next().value;e===r&&(n=void 0),t.delete(e.key)}let s={key:i,value:a,visited:!1};r=s,t.set(i,s)},clear(){t.clear(),n=void 0,r=void 0}}}var z=4,Ne=5;function Pe(e){let t=e.names;if(t)return t;let n=[];for(let t of e)typeof t!=`string`&&n.push(t[1]);return e.names=n}function Fe(e,t,n){let r=e.slice(t,n);if(r.charCodeAt(0)===36)return r.length===1?[2,`_splat`,``,void 0]:[1,r.slice(1),``,``];let i=r.indexOf(`{`);if(i>=0){let a=r.indexOf(`}`,i),o=r.charCodeAt(i+1)===45,s=i+(o?3:2);if(a>=0&&r.charCodeAt(s-1)===36&&(!o||s<a)){let c=r.slice(s,a);return[o?3:c?1:2,c||`_splat`,r.slice(0,i),e.slice(t+a+1,c?n:e.length)]}}return r}function Ie(e,t,n,r,i,a){let o=n,s=t.fullPath??t.from,c=t.options,l=s.length,u=s.endsWith(`/`)?l-1:l,d=c?.caseSensitive??e,f=c?.params?.parse??c?.parseParams,p,h=a?n-1:0;if(!r||s.includes(`$`)){p=a?.slice()??[];let e=m(p);e&&typeof e!=`string`&&e[0]===2&&(p[p.length-1]=[e[0],e[1],e[2],e[3]===void 0?void 0:e[3]+s.substring(n-(s[n-2]===`/`?2:1),u)],h=l)}for(;o<l;){let e=o,t=s.indexOf(`/`,e),n=t===-1?l:t,a=Fe(s,e,n);o=n+1;let c;if(typeof a==`string`){if(!r)continue;let e=a,t;d?t=r.static??=new Map:(e=a.toLowerCase(),t=r.staticInsensitive??=new Map);let n=t.get(e);if(n)c=n;else{let n=B(r);c=n,t.set(e,n)}}else{let t=a[0],m=a[2],g=a[3]??``;if(t===2&&(n=l,o=n+1),p&&h<n&&(h<e-1&&p.push(s.slice(h,e-1)),a[2]=`/`+m,t===2&&a[3]!==void 0&&u<l&&(a[3]=g.slice(0,-1)),p.push(a),h=n),!r)continue;let _=d&&!!(m||g);d||(m=m.toLowerCase(),g=g.toLowerCase());let v=t===1?r.dynamic??=[]:t===3?r.optional??=[]:r.wildcard??=[],y=t!==2&&!f&&v.find(e=>!e.parse&&e.caseSensitive===_&&e.prefix===m&&e.suffix===g);if(y)c=y;else{let e=B(r,t,_,m,g);c=e,v.push(e),v.length===2&&i?.push(v)}}r=c}p&&h<u&&p.push(s.slice(h,u));let g=p?.slice();if(!r)return g;if(f&&t.children&&!t.isRoot&&t.id&&t.id.charCodeAt(t.id.lastIndexOf(`/`)+1)===95){let e=B(r,Ne);(r.pathless??=[]).push(e),r=e}let _=(t.path||!t.children)&&!t.isRoot;if(_&&u<l){let e=B(r,z);r.index=e,r=e}return r.parse=f??null,r.priority=c?.params?.priority??0,r.route||(r.data=g,_&&(r.route=t)),[r,o,g]}function Le(e,t){if(e.parse&&!t.parse)return-1;if(!e.parse&&t.parse)return 1;if(e.parse&&t.parse&&(e.priority||t.priority))return t.priority-e.priority;if(e.prefix&&t.prefix&&e.prefix!==t.prefix){if(e.prefix.startsWith(t.prefix))return-1;if(t.prefix.startsWith(e.prefix))return 1}if(e.suffix&&t.suffix&&e.suffix!==t.suffix){if(e.suffix.endsWith(t.suffix))return-1;if(t.suffix.endsWith(e.suffix))return 1}return e.prefix&&!t.prefix?-1:!e.prefix&&t.prefix?1:e.suffix&&!t.suffix?-1:!e.suffix&&t.suffix?1:e.caseSensitive&&!t.caseSensitive?-1:!e.caseSensitive&&t.caseSensitive?1:0}function B(e,t=0,n,r,i){return{kind:t,depth:e?e.depth+1:0,pathless:null,index:null,static:null,staticInsensitive:null,dynamic:null,optional:null,wildcard:null,route:null,data:void 0,parent:e,parse:null,priority:0,caseSensitive:n,prefix:r,suffix:i}}function Re(e,t){let n=B(),r=[];function i(e,t,n,a){let[o,s,c]=Ie(!1,e,t,n,r,a);if(e.children)for(let t of e.children)i(t,s,o,c)}for(let t of e)i(t,1,n);for(let e of r)e.sort(Le);t.masksTree=n,t.flatCache=Me(1e3)}function ze(e,t){e||=`/`;let n=t.flatCache.get(e);if(n!==void 0)return n;let r=Ue(e,t.masksTree);return t.flatCache.set(e,r),r}function Be(e,t,n,r,i){e||=`/`,r||=`/`;let a=t?`case\0${e}`:e,o=i.singleCache.get(a);return o||(o=B(),Ie(t,{from:e},1,o),i.singleCache.set(a,o)),Ue(r,o,n)}function Ve(e,t,n=!1){let r=n?e:`nofuzz\0${e}`,i=t.matchCache.get(r);if(i!==void 0)return i;e||=`/`;let a;try{a=Ue(e,t.segmentTree,n)}catch(e){if(e instanceof URIError)a=null;else throw e}return a&&(a.branch=Ge(a.route)),t.matchCache.set(r,a),a}function He(e,t=!1){let n=B(),r=[],i={},a={},o=0;function s(e,n,c,l){if(e.init(o),e.id in i&&P(),i[e.id]=e,o!==0&&e.path){let t=L(e.fullPath);(!a[t]||e.fullPath.endsWith(`/`))&&(a[t]=e)}o++;let[u,d,f]=Ie(t,e,n,c,r,l);if(e._interpolation=f,e.children)for(let t of e.children)s(t,d,u,f)}s(e,1,n);for(let e of r)e.sort(Le);return{processedTree:{segmentTree:n,singleCache:Me(1e3),matchCache:Me(1e3),flatCache:null,masksTree:null},routesById:i,routesByPath:a}}function Ue(e,t,n=!1){let r=e.split(`/`),i=qe(e,r,t,n);if(!i)return null;let[a]=We(e,r,i);return{route:i.node.route,rawParams:a}}function We(e,t,n){let r=Ke(n.node),i=n.node.data&&Pe(n.node.data),a=Object.create(null),o=n.extract?.part??0,s=n.extract?.node??0,c=n.extract?.path??0,l=n.extract?.param??0;for(;s<r.length;o++,s++,c++){let u=r[s];if(u.kind===z)break;if(u.kind===Ne){o--,c--;continue}let d=t[o],f=c;if(d&&(c+=d.length),u.kind===1||u.kind===3){let e=i[l++];if(u.kind===3&&n.skipped&1<<s){o--,c=f-1;continue}let t=u.suffix||u.prefix?d.substring(u.prefix.length,d.length-u.suffix.length):d;(t||u.kind===1)&&(a[e]=decodeURIComponent(t))}else if(u.kind===2){let t=u,n=e.substring(f+t.prefix.length,e.length-t.suffix.length),r=decodeURIComponent(n);a[`*`]=r,a._splat=r;break}}return n.rawParams&&Object.assign(a,n.rawParams),[a,{part:o,node:s,path:c,param:l}]}function Ge(e){let t=[e];for(;e.parentRoute;)e=e.parentRoute,t.push(e);return t.reverse(),t}function Ke(e){let t=Array(e.depth+1);do t[e.depth]=e,e=e.parent;while(e);return t}function qe(e,t,n,r){if(e===`/`&&n.index)return{node:n.index,skipped:0};let i=!m(t),a=i&&e!==`/`,o=t.length-+!!i,s=[{node:n,index:1,skipped:0,statics:0,dynamics:0,optionals:0}],c=null,l=null;for(;s.length;){let n=s.pop(),{node:i,index:u,skipped:d,statics:f,dynamics:p,optionals:m}=n,{extract:h,rawParams:g}=n;if(i.kind===2&&i.route&&!Ze(l,n))continue;if(i.parse){if(!Xe(e,t,n))continue;g=n.rawParams,h=n.extract}r&&i.route&&i.kind!==z&&Ze(c,n)&&(c=n);let _=u===o;if(_&&(i.route&&(!a||i.kind===z||i.kind===2)&&Ze(l,n)&&(l=n),!i.optional&&!i.wildcard&&!i.index&&!i.pathless))continue;let v=_?void 0:t[u],y;if(_&&i.index){let n={node:i.index,index:u,skipped:d,statics:f,dynamics:p,optionals:m,extract:h,rawParams:g},r=!0;if(i.index.parse&&(Xe(e,t,n)||(r=!1)),r){if(!p&&!m&&!d&&Ye(f,o))return n;Ze(l,n)&&(l=n)}}if(i.wildcard)for(let e=i.wildcard.length-1;e>=0;e--){let n=i.wildcard[e],{prefix:r,suffix:a}=n;if(!r||!_&&(n.caseSensitive?v:y??=v.toLowerCase()).startsWith(r)){if(a){if(_)continue;let e=t.slice(u).join(`/`),i=e.slice(-a.length);if((n.caseSensitive?i:i.toLowerCase())!==a||e.length-a.length<r.length)continue}s.push({node:n,index:o,skipped:d,statics:f,dynamics:p,optionals:m,extract:h,rawParams:g})}}if(i.optional){let e=d|1<<i.depth+1;for(let t=i.optional.length-1;t>=0;t--){let n=i.optional[t];s.push({node:n,index:u,skipped:e,statics:f,dynamics:p,optionals:m,extract:h,rawParams:g})}if(!_)for(let e=i.optional.length-1;e>=0;e--){let t=i.optional[e],{prefix:n,suffix:r}=t;if(n||r){let e=t.caseSensitive?v:y??=v.toLowerCase();if(n&&!e.startsWith(n)||r&&e.indexOf(r,e.length-r.length)<n.length)continue}s.push({node:t,index:u+1,skipped:d,statics:f,dynamics:p,optionals:m+Je(o,u),extract:h,rawParams:g})}}if(!_&&i.dynamic&&v)for(let e=i.dynamic.length-1;e>=0;e--){let t=i.dynamic[e],{prefix:n,suffix:r}=t;if(n||r){let e=t.caseSensitive?v:y??=v.toLowerCase();if(n&&!e.startsWith(n)||r&&e.indexOf(r,e.length-r.length)<n.length)continue}s.push({node:t,index:u+1,skipped:d,statics:f,dynamics:p+Je(o,u),optionals:m,extract:h,rawParams:g})}if(!_&&i.staticInsensitive){let e=i.staticInsensitive.get(y??=v.toLowerCase());e&&s.push({node:e,index:u+1,skipped:d,statics:f+Je(o,u),dynamics:p,optionals:m,extract:h,rawParams:g})}if(!_&&i.static){let e=i.static.get(v);e&&s.push({node:e,index:u+1,skipped:d,statics:f+Je(o,u),dynamics:p,optionals:m,extract:h,rawParams:g})}if(i.pathless)for(let e=i.pathless.length-1;e>=0;e--){let t=i.pathless[e];s.push({node:t,index:u,skipped:d,statics:f,dynamics:p,optionals:m,extract:h,rawParams:g})}}if(l)return l;if(r&&c){let n=c.index;for(let e=0;e<c.index;e++)n+=t[e].length;let r=n===e.length?`/`:e.slice(n);return c.rawParams??=Object.create(null),c.rawParams[`**`]=decodeURIComponent(r),c}return null}function Je(e,t){return 2**(e-t-1)}function Ye(e,t){return e===2**(t-1)-1}function Xe(e,t,n){let r,i;try{[r,i]=We(e,t,n)}catch{return null}if(n.rawParams=r,n.extract=i,!n.node.parse)return!0;try{if(n.node.parse(r)===!1)return null}catch{}return!0}function Ze(e,t){return!e||t.statics>e.statics||t.statics===e.statics&&(t.dynamics>e.dynamics||t.dynamics===e.dynamics&&(t.optionals>e.optionals||t.optionals===e.optionals&&((t.node.kind===z)>(e.node.kind===z)||t.node.kind===z==(e.node.kind===z)&&t.node.depth>e.node.depth)))}function Qe(e,t,n){let r=ee(e),i=`/${r}`,a=t?i:i.toLowerCase(),o=`${a}/`,s={input:({url:e})=>{let n=t?e.pathname:e.pathname.toLowerCase();return n===a?e.pathname=`/`:n.startsWith(o)&&(e.pathname=e.pathname.slice(i.length)),e},output:({url:e})=>(e.pathname=F(`/${r}${e.pathname}`),e)};return n?{input:({url:e})=>$e(n,s.input({url:e})),output:({url:e})=>s.output({url:et(n,e)})}:s}function $e(e,t){let n=e?.input?.({url:t});if(n){if(typeof n==`string`)return new URL(n);if(n instanceof URL)return n}return t}function et(e,t){let n=e?.output?.({url:t});if(n){if(typeof n==`string`)return new URL(n);if(n instanceof URL)return n}return t}function tt(e){let t=e;return{get(){return t},set(e){t=h(e,t)}}}function nt(e){return{get(){return e()}}}function rt(e,t){let{createMutableStore:n,createReadonlyStore:r,batch:i}=t,a=new Map,o=n(`idle`),s=n(e),c=n(void 0),l=n([]),u=r(()=>l.get().map(e=>a.get(e).get())),d=r(()=>({status:o.get(),isLoading:o.get()===`pending`,matches:u.get(),location:s.get(),resolvedLocation:c.get()}));function f(e){let t=a.get(e);return t||(t=n(void 0),a.set(e,t)),t}let p={status:o,location:s,resolvedLocation:c,ids:l,matches:u,byRoute:a,__store:d,getMatchStore:f,setMatches:m};function m(e){let t=l.get(),n=e.map(e=>e.routeId);i(()=>{N(t,n)||l.set(n);for(let e of t)n.includes(e)||a.get(e).set(()=>void 0);for(let t of e){let e=f(t.routeId);e.get()!==t&&e.set(t)}})}return p}var V=`__TSR_index`,it=`popstate`,at=`beforeunload`,ot=/^[\x00-\x20]*(?:[\\/][\t\n\r]*){2,}/;function st(e){let t=ot.exec(e);return t?`/`+e.slice(t[0].length):e}function ct(e){return/[\x00-\x1f\x7f]/.test(e)&&(e=e.replace(/[\x00-\x1f\x7f]/g,e=>`	
\r`.includes(e)?``:encodeURIComponent(e))),st(e)}function lt(e){let t=e.getLocation(),n=new Set,r=r=>{t=e.getLocation(),n.forEach(e=>e({location:t,action:r}))},i=n=>{e.notifyOnIndexChange??!0?r(n):t=e.getLocation()},a=async n=>{let r=n.navigateOpts?.ignoreBlocker?void 0:e.getBlockers?.();if(typeof document<`u`&&r?.length&&(n.type===`PUSH`||n.type===`REPLACE`))for(let i of r){let r=pt(n.path,n.state);if(await i.blockerFn({currentLocation:t,nextLocation:r,action:n.type})){e.onBlocked?.();return}}n.task()};return{get location(){return t},get length(){return e.getLength()},subscribers:n,subscribe:e=>(n.add(e),()=>{n.delete(e)}),push:(n,i,o)=>{let s=t.state[V];i=ut(s+1,i),a({task:()=>{e.pushState(n,i),r({type:`PUSH`})},navigateOpts:o,type:`PUSH`,path:n,state:i})},replace:(n,i,o)=>{let s=t.state[V];i=ut(s,i),a({task:()=>{e.replaceState(n,i),r({type:`REPLACE`})},navigateOpts:o,type:`REPLACE`,path:n,state:i})},go:(t,n)=>{a({task:()=>{e.go(t,n?.ignoreBlocker??!1),i({type:`GO`,index:t})},navigateOpts:n,type:`GO`})},back:t=>{a({task:()=>{e.back(t?.ignoreBlocker??!1),i({type:`BACK`})},navigateOpts:t,type:`BACK`})},forward:t=>{a({task:()=>{e.forward(t?.ignoreBlocker??!1),i({type:`FORWARD`})},navigateOpts:t,type:`FORWARD`})},canGoBack:()=>t.state[V]!==0,createHref:t=>e.createHref(t),block:t=>{if(!e.setBlockers)return()=>{};let n=e.getBlockers?.()??[];return e.setBlockers([...n,t]),()=>{let n=e.getBlockers?.()??[];e.setBlockers?.(n.filter(e=>e!==t))}},flush:()=>e.flush?.(),destroy:()=>e.destroy?.(),notify:r,_getBlockers:()=>e.getBlockers?.()??[]}}function ut(e,t){let n=mt();return{...t,key:n,__TSR_key:n,[V]:e}}function dt(e){let t=e?.window??(typeof document<`u`?window:void 0),n=t.history.pushState,r=t.history.replaceState,i=[],a=()=>i,o=e=>i=e,s=t=>ct(e?.createHref?e.createHref(t):t),c=e?.parseLocation??(()=>pt(`${t.location.pathname}${t.location.search}${t.location.hash}`,t.history.state));if(!t.history.state?.__TSR_key&&!t.history.state?.key){let e=mt();t.history.replaceState({[V]:0,key:e,__TSR_key:e},``)}let l=c(),u,d=!1,f=!1,p=!1,m=!1,h=()=>l,g,_=()=>{g&&(S._ignoreSubscribers=!0,(g[2]?t.history.pushState:t.history.replaceState)(g[1],``,g[0]),S._ignoreSubscribers=!1,g=void 0,u=void 0)},v=(t,n,r)=>{let i=e?.createHref?s(n):void 0,a=!!g;a||(u=l),l=pt(n,r),g=[i??l.href,r,g?.[2]||t],a||queueMicrotask(()=>_())},y=e=>{l=c(),S.notify({type:e})},b=async()=>{if(m=!1,f){f=!1;return}let e=c(),n=e.state[V]-l.state[V],r=n===1,i=n===-1,o=!r&&!i||d;d=!1;let s=o?`GO`:i?`BACK`:`FORWARD`,u=o?{type:`GO`,index:n}:{type:i?`BACK`:`FORWARD`};if(p)p=!1;else{let r=a();if(typeof document<`u`&&r.length){for(let i of r)if(await i.blockerFn({currentLocation:l,nextLocation:e,action:s})){f=!0,t.history.go(-n),S.notify(u);return}}}l=c(),S.notify(u)},x=e=>{if(m){m=!1;return}let t=!1,n=a();if(typeof document<`u`&&n.length)for(let e of n){let n=e.enableBeforeUnload??!0;if(n===!0||typeof n==`function`&&n()===!0){t=!0;break}}if(t)return e.preventDefault(),e.returnValue=``},S=lt({getLocation:h,getLength:()=>t.history.length,pushState:(e,t)=>v(!0,e,t),replaceState:(e,t)=>v(!1,e,t),back:e=>(e&&(p=!0,m=!0),t.history.back()),forward:e=>{e&&(p=!0,m=!0),t.history.forward()},go:(e,n)=>{d=!0,n&&(p=!0,m=!0),t.history.go(e)},createHref:s,flush:_,destroy:()=>{t.history.pushState=n,t.history.replaceState=r,t.removeEventListener(at,x,{capture:!0}),t.removeEventListener(it,b)},onBlocked:()=>{u&&l!==u&&(l=u)},getBlockers:a,setBlockers:o,notifyOnIndexChange:!1});return S._ignoreNextBeforeUnload=e=>{m=!1;try{e=new URL(e,t.document.baseURI).href,m=/^https?:/.test(e)&&(!e.includes(`#`)||e.split(`#`)[0]!==t.location.href.split(`#`)[0])}catch{}},t.addEventListener(at,x,{capture:!0}),t.addEventListener(it,b),t.history.pushState=function(...e){let r=n.apply(t.history,e);return S._ignoreSubscribers||y(`PUSH`),r},t.history.replaceState=function(...e){let n=r.apply(t.history,e);return S._ignoreSubscribers||y(`REPLACE`),n},S}function ft(e){let t=e?.window??(typeof document<`u`?window:void 0);return dt({window:t,parseLocation:()=>{let e=t.location.hash,n=e.indexOf(`#`,1);return n<0&&(n=e.length),pt(`${e?e.slice(1,n):`/`}${t.location.search}${e.slice(n)}`,t.history.state)},createHref:e=>`${t.location.pathname}${t.location.search}#${e}`})}function pt(e,t){let n=ct(e),r=n.indexOf(`#`),i=n.indexOf(`?`);if(!t){let e=mt();t={[V]:0,key:e,__TSR_key:e}}return{href:n,pathname:n.slice(0,r>-1?i>-1?Math.min(r,i):r:i>-1?i:n.length),hash:r>-1?n.slice(r):``,search:i>-1?n.slice(i,r===-1?void 0:r):``,state:t}}function mt(){return(Math.random()+1).toString(36).slice(7)}function ht(e,t){return e.protocol!==`http:`&&e.protocol!==`https:`||e.origin!==t||!!e.username||!!e.password}function gt(e){return e.pathname+e.search+e.hash}function _t(e){return e.options.loader||e.options.beforeLoad||e.lazyFn||e.options.component?.preload||e.options.pendingComponent?.preload}function vt(e,t){return{fromLocation:t,toLocation:e,pathChanged:t?.pathname!==e.pathname,hrefChanged:t?.href!==e.href,hashChanged:t?.hash!==e.hash}}function yt({key:e,__TSR_key:t,__TSR_index:n,__hashScrollIntoViewOptions:r,...i}){return i}function bt(e){return e.findIndex(e=>e.status===`error`||e.status===`notFound`||e._notFound)+1}function xt(e,t,n,r,i,a){r&&(t=t.slice(0,r)),i&&(n=n.slice(0,i));for(let r of t){if(a&&e._tx!==a)return;n.some(e=>e.routeId===r.routeId)||e.routesById[r.routeId].options.onLeave?.(r)}for(let r of n){if(a&&e._tx!==a)return;e.routesById[r.routeId].options[t.some(e=>e.routeId===r.routeId)?`onStay`:`onEnter`]?.(r)}}var St=class{constructor(e,t){this.tempLocationKey=`${Math.round(Math.random()*1e7)}`,this._scroll={n:!0},this.subscribers=new Set,this._cache=new Map,this._committed=[],this.startTransition=async e=>(e(),!1),this.update=e=>{let t=this.options;this.options={...t,...e},this.isServer=this.options.isServer??!1??typeof document>`u`,this.staticLocations=new WeakMap,this.protocolAllowlist=new Set(this.options.protocolAllowlist),(!this.history||this.options.history&&this.options.history!==this.history)&&(this.history=this.options.history?this.options.history:dt()),this.origin=this.options.origin,this.origin||=window?.origin&&window.origin!==`null`?window.origin:`http://localhost`;let n=this.options.basepath??`/`,r=this.options.rewrite,i=this.basepath!==n||t?.rewrite!==r||t?.caseSensitive!==this.options.caseSensitive;if(i&&(this.basepath=n,this.rewrite=n!==`/`&&ee(n)?Qe(n,this.options.caseSensitive,r):r),this.history&&this.updateLatestLocation(),this.options.routeTree!==this.routeTree){this.routeTree=this.options.routeTree;let e;e=this.buildRouteTree(),this.setRoutes(e)}if(this.stores)i&&this.stores.location.set(this.latestLocation);else if(this.latestLocation){let e=this.getStoreConfig(this);this.batch=e.batch,this.stores=rt(this.latestLocation,e),be(this)}},this.updateLatestLocation=()=>{this.latestLocation=this.parseLocation(this.history.location,this.latestLocation)},this.buildRouteTree=()=>{let e=He(this.routeTree,this.options.caseSensitive);return this.options.routeMasks&&Re(this.options.routeMasks,e.processedTree),{...e,resolvePathCache:Me(1e3)}},this.subscribe=(e,t)=>{let n={eventType:e,fn:t};return this.subscribers.add(n),()=>{this.subscribers.delete(n)}},this.emit=e=>{for(let t of this.subscribers)if(t.eventType===e.type)try{t.fn(e)}catch(e){console.error(e)}},this.parseLocation=(e,t)=>{let n=({pathname:e,search:n,hash:r,href:i},a)=>{if(!this.rewrite&&!/[ \x00-\x1f\x7f\u0080-\uffff]/.test(e)){let i=this.options.parseSearch(n),o=this.options.stringifySearch(i);return{href:e+o+r,publicHref:e+o+r,pathname:j(e),external:!1,searchStr:o,search:y(t?.search,i),hash:j(r.slice(1)),state:b(t?.state,a)}}let o=$e(this.rewrite,new URL(i,this.origin)),s=this.options.parseSearch(o.search),c=this.options.stringifySearch(s);return o.search=c,{href:o.href.replace(o.origin,``),publicHref:i,pathname:j(st(o.pathname)),external:!!this.rewrite&&ht(o,this.origin),searchStr:c,search:y(t?.search,s),hash:j(o.hash.slice(1)),state:b(t?.state,a)}},r=n(e,e.state),{__tempLocation:i,__tempKey:a}=r.state;if(i&&(!a||a===this.tempLocationKey)){let e=n(i,{...i.state,__tempLocation:void 0,key:r.state.key,__TSR_key:r.state.__TSR_key});return e.maskedLocation=r,e}return r},this.matchRoutes=(e,t,n)=>typeof e==`string`?this.matchRoutesInternal({pathname:e,search:t},n):this.matchRoutesInternal(e,t),this.getMatchedRoutes=e=>{let t=Object.create(null),n=Ve(L(e),this.processedTree,!0);return n&&Object.assign(t,n.rawParams),[n?.branch||[this.routesById.__root__],t,n?.route]},this.buildLocation=e=>{{let t=this.staticLocations.get(e);if(t)return t}let t=!1,n=(n={})=>{if(n.href){let e=pt(n.href,{});n={...n,to:$e(this.rewrite,new URL(e.pathname,this.origin)).pathname,search:this.options.parseSearch(e.search),hash:e.hash.slice(1)}}let r=e._fromLocation||this._pendingLocation||this.latestLocation,i,a=()=>(t=!0,r),o=()=>i??=this.matchRoutesLightweight(a()),s=n.to?`${n.to}`:`.`,c=te(s[0]===`/`?``:n.unsafeRelative===`path`?a().pathname:n.from??o()[1],s,this.options.trailingSlash,this.resolvePathCache),l=this.routesByPath[L(c)],u=c.includes(`$`),d;if(l)d=l._branch??=Ge(l);else if(u)d=[];else{let[e,t,n]=this.getMatchedRoutes(c);d=e,this.options.notFoundRoute&&(!n||n.path!==`/`&&t[`**`])&&(d=[...d,this.options.notFoundRoute])}let f=u?l?._interpolation??Ie(!1,{fullPath:c},0):void 0,p;for(let e of d){let t=e.options.params?.stringify??e.options.stringifyParams;if(t){let e=o()[3];if(p??=Dt(n.params,e),!_(p))break;p===e&&(p=Object.assign(v(),p));try{Object.assign(p,t(p))}catch{}}}p??=Dt(n.params,Ot(n.params,f)?o()[3]:kt);let m=e.leaveParams?c:st(j(f?ae(c,f,p,this.pathParamsDecoder):c)),h=At(d,e._includeValidateSearch),g=()=>{let t=o()[2];if(e._includeValidateSearch&&this.options.search?.strict){let e={};d.forEach(n=>{if(n.options.validateSearch)try{Object.assign(e,Et(n.options.validateSearch,{...e,...t}))}catch{}}),t=e}return t},y=h.length?jt(h,g(),n):n.search===!0?g():typeof n.search==`function`?n.search(g()):n.search||kt,b=this.options.stringifySearch(y),x=n.hash===!0?a().hash:typeof n.hash==`function`?n.hash(a().hash):n.hash||void 0,S=x?`#${x}`:``,C=n.state?n.state===!0?a().state:typeof n.state==`function`?n.state(a().state):n.state:kt,w=`${m}${b}${S}`,T,E,D=!1;if(this.rewrite){let e=new URL(w,this.origin),t=e.origin,n=et(this.rewrite,e);T=gt(e),ht(n,t)?(E=n.href,D=!0):E=st(gt(n))}else T=M(w),E=T;return{publicHref:E,href:T,pathname:m,search:y,searchStr:b,state:C,hash:x??``,external:D,unmaskOnReload:n.unmaskOnReload}},r=n(e);if(e.mask)r.maskedLocation=n({from:e.from,...e.mask});else if(this.options.routeMasks){let t=ze(r.pathname,this.processedTree);if(t){let i=Object.assign(v(),t.rawParams),{from:a,params:o,...s}=t.route,c=Dt(o,i);r.maskedLocation=n({from:e.from,...s,params:c})}}return!t&&e._fromLocation&&this.staticLocations.set(e,r),r},this.commitLocation=async({viewTransition:e,ignoreBlocker:t,...n})=>{let r=n.maskedLocation??n;if(r.external)return Ct(this,r.publicHref,{replace:n.replace,ignoreBlocker:t});let i,a=L(this.latestLocation.href)===L(n.href)&&S(yt(n.state),yt(this.latestLocation.state)),o=this._commitPromise,s,c=new Promise(e=>{s=e});if(c.resolve=()=>{s(),o?.resolve()},this._commitPromise=c,a)this.load();else{let{maskedLocation:r,hashScrollIntoView:a,...o}=n;r&&(o={...r,state:{...r.state,__tempKey:void 0,__tempLocation:{...o,search:o.searchStr,state:{...o.state,__tempKey:void 0,__tempLocation:void 0,__TSR_key:void 0,key:void 0}}}},(o.unmaskOnReload??this.options.unmaskOnReload??!1)&&(o.state.__tempKey=this.tempLocationKey)),o.state={...o.state,__hashScrollIntoViewOptions:a??this.options.defaultHashScrollIntoView??!0},this.shouldViewTransition=e,i=n.replace?`REPLACE`:`PUSH`,this.history[i===`REPLACE`?`replace`:`push`](o.publicHref,o.state,{ignoreBlocker:t}),this.history.subscribers.size||this.load({action:{type:i}})}return this._scroll.n=n.resetScroll??!0,this._commitPromise},this.buildAndCommitLocation=({replace:e,resetScroll:t,hashScrollIntoView:n,viewTransition:r,ignoreBlocker:i,...a}={})=>{let o=this.buildLocation({...a,_includeValidateSearch:!0});this._pendingLocation=o;let s=this.commitLocation({...o,viewTransition:r,replace:e,resetScroll:t,hashScrollIntoView:n,ignoreBlocker:i});return queueMicrotask(()=>{this._pendingLocation===o&&(this._pendingLocation=void 0)}),s},this.navigate=async({to:e,reloadDocument:t,href:n,publicHref:r,...i})=>{let a=n?O(n):void 0;if(a||t){if(e!==void 0||!n){let t=this.buildLocation({to:e,...i}),a=t.maskedLocation??t;n??=a.publicHref,r??=a.publicHref}let t=!a&&r?r:n;return Ct(this,t,i)}return this.buildAndCommitLocation({...i,href:n,to:e,_isNavigate:!0})},this.load=async e=>{this.updateLatestLocation(),e?.action&&(this._scroll.h=e.action.type===`PUSH`||e.action.type===`REPLACE`),await hn(this,e)},this.startViewTransition=e=>{let t=this.shouldViewTransition??this.options.defaultViewTransition;if(this.shouldViewTransition=void 0,t&&typeof document.startViewTransition==`function`){let n;if(typeof t==`object`&&window.CSS?.supports?.(`selector(:active-view-transition-type(a))`)){let r=this.latestLocation,i=this.stores.resolvedLocation.get(),a=typeof t.types==`function`?t.types(vt(r,i)):t.types;if(a===!1)return e();n={update:e,types:a}}else n=e;return document.startViewTransition(n).updateCallbackDone}return e()},this.invalidate=e=>{let t=this._committed,n=e?.filter,r=this._preloads,i=new Set,a=e=>{(!n||n(e))&&i.add(e.id)};t.forEach(a),this._cache.forEach(a),r?.forEach(e=>e.forEach(a)),this._tx?.[3].forEach(a);let o=[];for(let[e,t]of r??[])t.some(e=>i.has(e.id))&&(r.delete(e),o.push(e));let s=t=>{if(i.has(t.id)){let n=this.routesById[t.routeId],r={...t,invalid:!0,...(e?.forcePending||t.status===`error`||t.status===`notFound`)&&_t(n)?{status:`pending`,error:void 0}:void 0};return t._flight=void 0,r}return t};this._committed=t.map(s);for(let[t,n]of this._cache)i.has(t)&&(n.invalid=!0,e?.forcePending&&(n.status=`pending`));for(let e of i){let t=this._flights?.get(e);this._flights?.delete(e),t&&!t[2]&&o.push(t[1])}for(let e of o)e.abort();return this.shouldViewTransition=!1,this.load({sync:e?.sync})},this.resolveRedirect=e=>{let t=e.options,n=e.headers.get(`Location`)||t.href;if(!n){let e=this.buildLocation(t);n=(e.maskedLocation??e).publicHref||`/`}let r;if(k.test(n)||(r=O(n))&&!this.protocolAllowlist.has(r))throw Error(`Redirect blocked: unsafe protocol`);if(r===`http:`||r===`https:`){let e=new URL(n);e.pathname.startsWith(`//`)?n=e.href:ht(e,this.origin)||(n=gt(e),r=void 0)}return r&&(t.reloadDocument=!0),t.href=n,e.headers.set(`Location`,n),e},this.clearCache=e=>{let t=this._cache,n=this._preloads,r=e?.filter,i=[],a=[];for(let[e,n]of t)(!r||r(n))&&(a.push(e),i.push(n));let o=[];for(let[e,t]of n??[])(!r||t.some(r))&&(o.push(e),i.push(...t));for(let e of a)t.delete(e);for(let e of o)n.delete(e);for(let e of i){let t=e._flight;e._flight=void 0,t&&!--t[2]&&(this._flights?.get(e.id)===t&&this._flights.delete(e.id),o.push(t[1]))}for(let e of o)e.abort()},this.loadRouteChunk=H,this.preloadRoute=e=>gn(this,e),this.matchRoute=(e,t)=>{let n={...e,to:e.to?te(e.from||``,e.to,this.options.trailingSlash,this.resolvePathCache):void 0,params:e.params||{},leaveParams:!0},r=this.buildLocation(n),i=this.stores.status.get()===`pending`;if(t?.pending&&!i)return!1;let a=t?.pending??!i?this.latestLocation:this.stores.resolvedLocation.get()||this.stores.location.get(),o=Be(r.pathname,t?.caseSensitive??!1,t?.fuzzy??!1,a.pathname,this.processedTree);return!o||e.params&&!S(o.rawParams,e.params,!0)?!1:t?.includeSearch??!0?S(a.search,r.search,!0)?o.rawParams:!1:o.rawParams},this.getStoreConfig=t,e.pathParamsAllowedCharacters?.length&&(this.pathParamsDecoder=ne(e.pathParamsAllowedCharacters)),this.update({defaultPreloadDelay:50,defaultPendingMs:1e3,defaultPendingMinMs:500,context:void 0,...e,caseSensitive:e.caseSensitive??!1,notFoundMode:e.notFoundMode??`fuzzy`,stringifySearch:e.stringifySearch??Ee,parseSearch:e.parseSearch??Te,protocolAllowlist:e.protocolAllowlist??D}),self.__TSR_ROUTER__=this}isShell(){return!!this.options.isShell}get state(){return this.stores.__store.get()}setRoutes(e){Object.assign(this,e),this.lightweightCache=new WeakMap,this.staticLocations=new WeakMap;let t=this.options.notFoundRoute;t&&(t.init(99999999999),this.routesById[t.id]!==t&&(t._interpolation=Ie(!1,t,0)),this.routesById[t.id]=t)}matchRoutesInternal(e,t){let[n,r,i]=this.getMatchedRoutes(e.pathname),a=n,o=!1;(i?i.path!==`/`&&r[`**`]:L(e.pathname))&&(this.options.notFoundRoute?a=[...a,this.options.notFoundRoute]:o=!0);let s=o?Mt(this.options.notFoundMode,a):void 0,c=Array(a.length),l=this._committed,u=(e,t)=>{let n=l[t];return n?.routeId===e.id?n:e===this.options.notFoundRoute?l.find(t=>t.routeId===e.id):void 0},d;for(let n=0;n<a.length;n++){let i=a[n],o=c[n-1],l,f,p;{let n=o?.search??e.search,r=o?._strictSearch??void 0;try{let e=Et(i.options.validateSearch,{...n})??void 0;l={...n,...e},f={...r,...e}}catch(e){let r=e;if(e instanceof wt||(r=new wt(e.message,{cause:e})),t?.throwOnError)throw r;l=n,f={},p=r}}let m=``,h=``;try{m=i.options.loaderDeps?.({search:l})??``,h=m&&JSON.stringify(m)||``}catch(e){if(t?.throwOnError)throw e;p??=e}let g=v(),_=i._interpolation?ae(i.fullPath,i._interpolation,r,this.pathParamsDecoder,g):i.fullPath,x=i.id+_+h,S=u(i,n),C=this._cache.get(x)??(S?.id===x?S:void 0);d=C?._strictParams??Object.assign(g,d);let w;if(!C)try{Nt(i,d)}catch(e){if(w=se(e)||je(e)?e:new Tt(e.message,{cause:e}),t?.throwOnError)throw w}let T=S?`stay`:`enter`,E;if(C)E={...C,cause:T,search:y(S?S.search:C.search,l),_strictSearch:f,searchError:p};else{let e=_t(i)?`pending`:`success`;E={id:x,ssr:i.options.ssr,index:n,routeId:i.id,params:S?.params??d,_strictParams:d,pathname:_,updatedAt:Date.now(),search:S?y(S.search,l):l,_strictSearch:f,searchError:p,status:e,isFetching:!1,error:void 0,paramsError:w,context:{},abortController:t?._controller??new AbortController,cause:T,loaderDeps:S?b(S.loaderDeps,m):m,invalid:!1,preload:!1,staticData:i.options.staticData||{},fullPath:i.fullPath}}let D=s===i.id;E._notFound&&!D&&(E.error=void 0),E._notFound=D,c[n]=E}for(let e=0;e<c.length;e++){let n=c[e];n.params=n.cause===`stay`?y(n.params,d):d,t?._controller&&(n.context={})}return c}matchRoutesLightweight(e){let t=m(this.stores.ids.get()),n=t?this.stores.byRoute.get(t).get():void 0,r=n?.id,i=this.lightweightCache.get(e);if(i&&i[0]===r)return i[1];let[a,o]=this.getMatchedRoutes(e.pathname),s=m(a),c={...e.search};for(let e of a)try{Object.assign(c,Et(e.options.validateSearch,c))}catch{}let l=n&&n.routeId===s.id&&n.pathname===e.pathname,u;if(l)u=n.params;else{let e=o;for(let t of a)try{Nt(t,e)}catch{}u=e}let d=[a,s.fullPath,c,u];return this.lightweightCache.set(e,[r,d]),d}};async function Ct(e,t,{replace:n,ignoreBlocker:r}){if(!A(t,e.protocolAllowlist)){if(!r){let t=e.history._getBlockers();for(let r of t)if(r?.blockerFn&&await r.blockerFn({currentLocation:e.history.location,nextLocation:e.history.location,action:n?`REPLACE`:`PUSH`}))return}e.history._ignoreNextBeforeUnload?.(t),n?window.location.replace(t):window.location.href=t}}var wt=class extends Error{},Tt=class extends Error{};function Et(e,t){if(e==null)return{};if(`~standard`in e){let n=e[`~standard`].validate(t);if(n instanceof Promise)throw new wt(`Async validation not supported`);if(n.issues)throw new wt(JSON.stringify(n.issues,void 0,2),{cause:n});return n.value}return`parse`in e?e.parse(t):typeof e==`function`?e(t):{}}function Dt(e,t){if(e===void 0||e===!0)return t;let n=Object.create(null);return e===!1||e===null?n:typeof e==`function`?(Object.assign(n,t),Object.assign(n,e(n))):Object.assign(n,t,e)}function Ot(e,t){return typeof e==`function`?!0:!t||e===!1||e===null?!1:e===void 0||e===!0||t.some(t=>typeof t!=`string`&&!g.call(e,t[1]))}var kt=Object.freeze({});function At(e,t){let n=[];for(let r=0;r<e.length;r++){let i=e[r].options;`search`in i?i.search?.middlewares&&n.push(...i.search.middlewares):(i.preSearchFilters||i.postSearchFilters)&&n.push(({search:e,next:t})=>{let n=t(i.preSearchFilters?i.preSearchFilters.reduce((e,t)=>t(e),e):e);return i.postSearchFilters?i.postSearchFilters.reduce((e,t)=>t(e),n):n});let a=i.validateSearch;t&&a&&n.push(({search:e,next:t,meta:n})=>{let r=t(e);try{let e=Et(a,r);if(n&&e)for(let t in e)t in r||(n.defaulted||=new Map).set(t,e[t]);return{...r,...e}}catch{}return r})}return n}function jt(e,t,n){let r=(t,i,a)=>{if(t>=e.length){if(!n.search)return{};if(n.search===!0)return i;let e=h(n.search,i);return a&&(a.explicit=e),e}return e[t]({search:i,next:(e,n)=>{if(n){let n=a||{};return{search:r(t+1,e,n),meta:n}}return r(t+1,e,a)},meta:a})};return r(0,t)}function Mt(e,t){if(e!==`root`){let e;for(let n=t.length-1;n>=0;n--){let r=t[n];if(r.options.notFoundComponent)return r.id;e||=r.children&&r.id}if(e)return e}return ke}function Nt(e,t){let n=e.options.params?.parse??e.options.parseParams;n&&Object.assign(t,n(t))}function Pt(e,t){return e.options[t]?.preload?.()}function Ft(e,t){let n=Pt(e,`component`),r=Pt(e,`pendingComponent`);return t&&(r?r=r.then(t):t()),n&&r?Promise.all([n,r]).then(()=>{}):n??r}function H(e,t,n){let r=()=>t===!1?void 0:t?Pt(e,t):Ft(e,n),i=e._lazy;if(i)return i===!0?r():i.then(r);if(!e.lazyFn)return r();let a=e.lazyFn().then(t=>{{let{id:n,...r}=t.options;Object.assign(e.options,r),e._lazy=!0}},t=>{throw e._lazy=void 0,t});return e._lazy=a,a.then(r)}function It(e){let t=e.findIndex(e=>e.status!==`success`||e._notFound)+1;return t&&t<e.length?e.slice(0,t):e}function Lt(e,t,n){let r=e._tx;return t&&r?.[2]===n&&!r[3].some(e=>e.routeId===t)}var U=0,W=1,Rt=2,G=3,K=[4];function zt(e){return typeof e[0]==`number`}function q(e,t){return t.aborted?Promise.race([Promise.reject(t),e]):new Promise((n,r)=>{let i=()=>r(t);t.addEventListener(`abort`,i,{once:!0}),Promise.resolve(e).then(n,r).then(()=>t.removeEventListener(`abort`,i))})}function J(e,t){return e.routesById[t.routeId]}function Bt(e,t,n){return je(e)?[G,e]:se(e)?(e.routeId||=n,[Rt,e]):t?(typeof e?.then==`function`&&(e=Error(`A Promise was thrown`,{cause:e})),[W,e]):[U,e]}function Vt(e,t){let n=Bt(t,!0,e.id);if(n[0]!==W)return n;try{e.options.onError?.(n[1])}catch(t){n=Bt(t,!0,e.id)}return n}function Ht(e,t,n,r,i){return i[0].signal.aborted?K:tn(e,t,n,Vt(n,r),i)}async function Ut(e,t,n,r,i,a){let[o,s]=t,c=n[0].signal,l=!!n[3];for(let i=n[6]??0;i<r;i++){let r=s[i],u=J(e,r);r.abortController=n[0];let d=s[i-1]?.context??e.options.context??{},f={params:r.params,location:o,navigate:t=>e.navigate({...t,_fromLocation:o}),buildLocation:e.buildLocation,cause:l?`preload`:r.cause,abortController:n[0],preload:l,matches:s,routeId:u.id};try{let e=r._ctx||=u.options.context?u.options.context({...f,deps:r.loaderDeps,context:d})||{}:void 0;r.context={...d,...e}}catch(a){return Y(e,r),[i,Ht(e,t,u,a,n)]}if(c.aborted)return[i,K];let p=r.paramsError??r.searchError;if(p!==void 0)return Y(e,r),[i,Ht(e,t,u,p,n)];let m=u.options.beforeLoad;if(!m)continue;let h=r.status;i>=a&&(r.status=`pending`,n[7]?.());try{Kt(e,r,`beforeLoad`,n[0]);let a=m({...f,search:r.search,context:r.context,...e.options.additionalContext}),o=await(typeof a?.then==`function`?q(a,c):a);if(c.aborted)return[i,K];let s=tn(e,t,u,Bt(o,!1,u.id),n);if(s[0]!==U)return Y(e,r),[i,s];r.context={...r.context,...o}}catch(a){return Y(e,r),[i,Ht(e,t,u,a,n)]}finally{r.status=h,Kt(e,r,!1,n[0])}}i()}function Wt(e,t,n){if(!(!n||--n[2])){if(e._flights?.get(t.id)===n){let n=e._tx;if(n&&!n[0].signal.aborted&&!n[3].includes(t)&&n[3].some(e=>e.id===t.id)&&n[3].some(e=>e.isFetching===`beforeLoad`))return;e._flights.delete(t.id)}return n[1]}}function Y(e,t){let n=t._flight;t._flight=void 0,Wt(e,t,n)?.abort()}function X(e,t,n,r){let i=[];for(let a of t)if(!n?.includes(a)){let t=a._flight;if(a._flight=void 0,r&&t?.[2]===1&&e._flights?.get(a.id)===t&&n?.some(e=>e.id===a.id))t[2]=0;else{let n=Wt(e,a,t);n&&i.push(n)}}for(let e of i)e.abort()}function Gt(e){for(let t of e){let e=t._flight;e&&e[2]++}}function Kt(e,t,n,r){if(t.isFetching=n,r&&e._tx?.[0]!==r)return;let i=e.stores.byRoute.get(t.routeId),a=i?.get();a?.id===t.id&&i.set({...a,isFetching:n})}function qt(e,t,n,r,i,a,o){let s=t[0];return{params:n.params,location:s,navigate:t=>e.navigate({...t,_fromLocation:s}),cause:o?`preload`:n.cause,abortController:i,preload:o,deps:n.loaderDeps,parentMatchPromise:a,context:n.context,route:r,...e.options.additionalContext}}async function Jt(e,t,n,r,i,a,o){let s=o[0],c=s.signal;if(c.aborted)return K;if(!i)return[U,void 0];let l=n._flight;Kt(e,n,`loader`,s);try{if(!l){let s=new AbortController;l=[Promise.resolve().then(()=>i(qt(e,t,n,r,s,a,!!o[3]))).then(e=>Bt(e,!1,r.id),e=>Bt(e,!0,r.id)).then(t=>(t[0]!==U&&e._flights?.get(n.id)===l&&(e._flights.delete(n.id),l[2]||s.abort()),t[0]===W&&l[2]?Vt(r,t[1]):t)),s,1],(e._flights??=new Map).set(n.id,l)}return n._flight=l,n.abortController=l[1],tn(e,t,r,await q(l[0],c),o)}catch(t){if(t!==c||!c.aborted)throw t;return Y(e,n),K}finally{Kt(e,n,!1,s)}}function Yt(e,t,n){t[0]!==G&&(e.status=`success`,e.error=void 0,t[0]===U?(e.loaderData=t[1],e.invalid=!1,e.updatedAt=Date.now(),e.preload=n):e.invalid=!0)}function Xt(e,t,n){let r=e._cache.get(t.id);if(r!==n||e._committed.some(e=>e.id===t.id&&e._flight===t._flight))return;let i={...t,_notFound:void 0,context:{}};i._flight&&i._flight[2]++,e._cache.set(t.id,i),r&&Y(e,r)}function Zt(e,t){return t[0]===W||t[0]===Rt?{...e,status:t[0]===W?`error`:`notFound`,error:t[1],_flight:void 0}:e}function Qt(e,t,n,r,i,a,o){let s=t[1][n],c=J(e,s),l=!!a[3],u=e._cache.get(s.id),d,f=!1,p;try{if(s.status===`success`&&(d=c.options.shouldReload,typeof d==`function`&&(d=d(qt(e,t,s,c,a[0],i,l))),a[0].signal.aborted&&(p=K)),!p){if(s.status!==`success`)f=!0;else{let t=l||s.preload?c.options.preloadStaleTime??e.options.defaultPreloadStaleTime??3e4:c.options.staleTime??e.options.defaultStaleTime??0;f=!!(s.invalid||d||d===void 0&&Date.now()-s.updatedAt>=t&&(a[5]||s.cause===`enter`||a[2].some(e=>e.routeId===s.routeId&&e.id!==s.id)))}}}catch(n){s.invalid=!0,Y(e,s),p=Ht(e,t,c,n,a)}let m=c.options.loader,h=typeof m==`function`,g=h?m:m?.handler,_=!l||c.options.preload!==!1,v=_&&m?e._flights?.get(s.id):void 0;v===s._flight||p?v=void 0:v&&!f&&!l&&d===void 0?f=!0:f||(v=void 0);let y=!(!m||!f||s.status!==`success`||l||a[4]||((h?void 0:m.staleReloadMode)??e.options.defaultStaleReloadMode)===`blocking`),b=f&&_,x=b&&!y&&(s.status!==`success`||!!m),S=n>=o?a[7]:void 0,C=c.lazyFn&&c._lazy!==!0?S:void 0;if(b&&!m&&(s.invalid=!1,s.updatedAt=Date.now()),v&&v[2]++,x){let t=s._flight;s._flight=v,Wt(e,s,t)?.abort(),n>=o&&(s.status=`pending`),S?.()}b||(s.isFetching=!1);let w=!p&&x?Jt(e,t,s,c,g,i,a).then(t=>(Yt(s,t,l),t[0]===U&&(m&&!a[0].signal.aborted&&Xt(e,s,u),n>=o&&(s.status=`pending`)),t)):Promise.resolve(p??[U,s.loaderData]),T=(async()=>{try{let e=H(c,void 0,C);e&&await q(e,a[0].signal)}catch(r){if(!t[1].some((e,t)=>t<=n&&(e.status===`error`||e.status===`notFound`||e._notFound)))return[n,Ht(e,t,c,r,a)]}let r=await w;x&&r[0]===U&&s.status===`pending`&&!a[0].signal.aborted&&(s.status=`success`,S?.())})();if(r.push([n,w,T]),!y)return w.then(e=>Zt(s,e));let E={...s,status:`pending`,preload:!1,_flight:v};s.invalid=!1,s.isFetching=`loader`;let D=Jt(e,t,E,c,g,i,a).then(e=>(s.isFetching=!1,Yt(E,e,!1),e));return(t[2]??=[]).push([n,D,T,E]),D.then(e=>Zt(E,e))}async function $t(e,t,n,r,i=0){let a=n?.[1][1],o=a?.routeId?t.findIndex(e=>e.routeId===a.routeId):n?.[0]??t.length-1;o<0&&(o=0);for(let n=o;n>=0;n--){let i=J(e,t[n]);try{let e=H(i,!1);e&&await q(e,r)}catch(e){if(e===r&&r.aborted)throw e}if(i.options.notFoundComponent)return n}return a?.routeId?o:i}function Z(e,t){t[2]&&=(X(e,t[2].map(e=>e[3])),void 0)}async function en(e,t,n,r){let i;try{await Promise.all(e.map(e=>e[1].then(async t=>{let a=e[0];if(!(r&&a>=await r)){if(t[0]>=G)throw[a,t];!i&&t[0]!==U&&(i=[a,t],await Promise.all((n??[]).map(e=>{if(!(e[0]<=a))return e[1].then(t=>{if(t[0]===G)throw[e[0],t]})})))}})))}catch(e){return e}return t??i}function tn(e,t,n,r,i,a){for(;r[0]===G;){let o=r[1],s=o.options;try{if((s.href||o.headers.has(`Location`))&&(e.resolveRedirect(o),s.reloadDocument)||(s.reloadDocument?i[3]:i[1]>=20))return r;let n=e.buildLocation({...s,_fromLocation:t[0],_includeValidateSearch:!0}),a=n.maskedLocation??n;if(a.external){let t=o.clone();return t.options={...s},t.headers.set(`Location`,a.publicHref),e.resolveRedirect(t),i[3]?[G,t]:[G,t,a]}return[G,o,n]}catch(e){r=a?[W,e]:Vt(n,e),a=!0}}return r}async function nn(e,t,n,r,i,a){let o=t[1],s=await i,c=!1,l=o.findIndex(e=>e._notFound),u=t=>t[1][0]===Rt?$t(e,o,t,r.signal):t[0],d=l<0?o.length:l;if((s?.[1][0]??0)>=G)d=0;else if(s){d=s[2]??=await u(s);for(let e of n){if(e[0]>=d)break;let t=await e[1];if(t[0]!==U&&t[0]<G&&!(`loaderData`in o[e[0]])){s=[e[0],t],d=s[2]=await u(s);break}}}for(let e of n){if(e[0]>=d)break;let t=await e[2];if(t){s=t;break}}if((s?.[1][0]??0)>=G){let n=s[1];if(n[0]!==G||n[1].options.reloadDocument||n[2])return Z(e,t),n;c=!0,s=[0,[W,Error(`Too many redirects`)]]}let f=s?s[2]??await u(s):l;if(f>=0){let i=s?.[1],l=i?.[0],u=o[f],d=i?.[1],p=()=>{i&&(u._notFound=void 0,l===W?u.status=`error`:(d.routeId=u.routeId,u.routeId===e.routeTree.id?(u.status=`success`,u._notFound=!0):u.status=`notFound`),u.error=d,u.isFetching=!1)};p(),i||a?.();let m=J(e,u);try{await q(i?Promise.resolve().then(()=>H(m,l===W?`errorComponent`:`notFoundComponent`)):Promise.all([H(m),H(m,`notFoundComponent`)]),r.signal)}catch(n){if(n===r.signal&&r.signal.aborted)return Z(e,t),K}i?c&&(r.abort(),await Promise.all([...n.map(e=>e[1]),...n.map(e=>e[2]),...(t[2]??[]).map(e=>e[1])]),Z(e,t),X(e,o),p()):u.status=`success`}return t}async function rn(e,t,n,r=0,i=t[1].length){let a=t[1];for(let t=r;t<i;t++){let r=a[t],i=J(e,r).options;if(i.head||i.scripts)try{let t={ssr:e.options.ssr,matches:a,match:r,params:r.params,loaderData:r.loaderData},[o,s]=await q(Promise.all([i.head?.(t),i.scripts?.(t)]),n);r.meta=o?.meta,r.links=o?.links,r.headScripts=o?.scripts,r.styles=o?.styles,r.scripts=s}catch(e){if(e===n&&n.aborted)break;console.error(e)}if(r.status!==`success`||r._notFound)break}return t}async function an(e,t,n,r){let i=[t,n],a=r[0].signal,o;try{let t=e.stores.matches.get(),s=n.findIndex(e=>e._notFound);if(e.options.notFoundMode!==`root`&&s>=0){let t=await $t(e,n,void 0,a,s);n[s]._notFound=void 0,n[t]._notFound=!0,s=t}let c=s<0?n.length:s+1,l=0;for(;l<c&&l!==s;){let e=n[l],i=r[2][l],a=t[l];if(i?.id!==e.id||i.status!==`success`||e.preload||a?.id!==e.id||a.status!==`success`||(l++,i._notFound||a._notFound))break}let u=[],d=r[6]??0,f=d?Promise.resolve(n[d-1]):void 0,p=()=>{for(let t=d;t<c&&!a.aborted;t++)f=Qt(e,i,t,u,f,r,l)},m=await Ut(e,i,r,c,p,l);if(m){if(r[4]=!0,c=m[0],m[1][0]===Rt){let t=await $t(e,n,m,a);m[2]=t,c=Math.min(c,t+1)}else m[1][0]>=G&&(c=0);p()}if(!a.aborted&&!r[3]){let t=[];for(let[n,r]of e._flights??[])r[2]||(e._flights.delete(n),t.push(r[1]));for(let e of t)e.abort()}let h=nn(e,i,u,r[0],en(u,m,i[2]),r[7]);i[2]?.length&&(i[3]=en(i[2],void 0,void 0,h.then(e=>zt(e)?0:It(n).length,()=>0))),o=await h}catch(t){if(Z(e,i),t===a&&a.aborted)return K;throw t}return zt(o)?o:rn(e,o,a,r[6]===n.length?r[6]:0)}function on(e,t){if(e._tx!==t)return;let n=t[3],r=e.stores.matches.get(),i=e._pending;for(let a=0;a<n.length;a++){let o=n[a],s=o.status===`success`&&!o._notFound,c=r[a]?.id===o.id&&r[a]?.status===`pending`;if(s&&!c)continue;let l=J(e,o),u=s||o.invalid?0:l.options.pendingMs??e.options.defaultPendingMs,d=l.options.pendingComponent??e.options.defaultPendingComponent;if(!d||typeof u!=`number`||u===1/0){i&&(i[0]=t,i[2]=0,i[4]=!0);return}let f=l.options.pendingMinMs??e.options.defaultPendingMinMs??0,p=!1;if(i?.[1]===o.id?(p=i[0]!==t,i[0]=t):(clearTimeout(i?.[3]),e._pending=i=void 0),i||(e._pending=i=[t,o.id,c?Date.now()+f:t[4]+u,void 0,c||void 0,d]),i[4]&&!p&&i[5]===d)return;if(i[5]=d,!i[4]){clearTimeout(i[3]);let n=i[2]-Date.now();if(n>0){i[3]=setTimeout(()=>on(e,t),n);return}i[2]=0}let m=n.map(e=>({...e,_flight:void 0}));m[a].status=`pending`;let h=i[4]=e.startTransition(()=>e.stores.setMatches(m),m).then(t=>(t&&e._pending===i&&i[4]===h&&!i[2]&&(i[2]=Date.now()+f),t));return}}function sn(e,t){let n=e._pending;e._tx!==t&&e._tx?.[3].some(e=>e.id===n?.[1])||(clearTimeout(n?.[3]),e._pending=void 0)}async function cn(e,t){let n=e._pending;if(!n)return;clearTimeout(n[3]);let r=n[2]-Date.now();if(!n[4]||r<=0||!It(t[3]).some(e=>e.id===n[1]))return;let i;try{await q(new Promise(e=>{i=setTimeout(e,r)}),t[0].signal)}catch{}clearTimeout(i)}function ln(e,t){e._committed=t,e.stores.setMatches(t)}function un(e,t,n,r){let i=e._committed,a=e._lifecycleEnd,o=e._cache;for(let e of n)e.preload=!1,r&&(e._assetEnd=void 0);let s=It(n).length,c=new Map;{let t=Date.now(),r=new Set;for(let e=0;e<n.length;e++){let t=n[e];(e<s||t.status===`success`)&&r.add(t.id)}for(let n of[...i,...o.values()]){if(n.status!==`success`||r.has(n.id))continue;let i=J(e,n);!i.options.loader||t-n.updatedAt>=(n.preload?i.options.preloadGcTime??e.options.defaultPreloadGcTime??3e5:i.options.gcTime??e.options.defaultGcTime??3e5)||c.set(n.id,o.get(n.id)===n?n:{...n,_flight:void 0,isFetching:!1,context:{}})}}t[3]=[],e._cache=c;let l=e._lifecycleEnd=bt(n);ln(e,n),X(e,[...o.values(),...i].filter(e=>e._flight&&c.get(e.id)!==e),n),xt(e,i,n,a,l,t)}async function dn(e,t){let n=e._tx;for(;n&&n!==t;)t=n,await n[5],n=e._tx}function fn(e,t,n){let r=n[1].options,i=n[2];if(!i)return e.navigate({...r,replace:!0,ignoreBlocker:!0});if(r.reloadDocument)return e.navigate({href:(i.maskedLocation??i).publicHref,reloadDocument:!0,replace:!0,ignoreBlocker:!0});i._redirects=t[1]+1,e._pendingLocation=i;let a=e.commitLocation({...i,viewTransition:r.viewTransition,replace:!0,resetScroll:r.resetScroll,hashScrollIntoView:r.hashScrollIntoView,ignoreBlocker:!0});return queueMicrotask(()=>{e._pendingLocation===i&&(e._pendingLocation=void 0)}),a}async function pn(e,t,n,r,i){let a=n.map(e=>({...e}));Gt(a);for(let t of r)Y(e,a[t[0]]),a[t[0]]=t[3];let o=[t[2],a],s;try{s=await nn(e,o,r,t[0],i)}catch(t){throw X(e,a),t}if(zt(s))X(e,a),s[0]===G&&e._tx===t&&e._committed===n&&await fn(e,t,s);else if(await rn(e,s,t[0].signal),e._tx!==t||e._committed!==n)X(e,a);else{for(let t of a){let n=e._cache.get(t.id);n?._flight&&n._flight===t._flight&&(e._cache.delete(t.id),Y(e,n))}ln(e,a),X(e,n,a)}}async function mn(e,t,n,r,i,a){let o=await an(e,t[2],t[3],[t[0],t[1],e._committed,void 0,i,n,a,r]);if(zt(o)){let n=o[0]===G&&e._tx===t;if((!n||o[1].options.reloadDocument)&&sn(e,t),X(e,t[3]),t[3]=[],!n)return;if(e._tx!==t){sn(e,t);return}await fn(e,t,o);return}let s=o[1];if(e._tx===t&&await cn(e,t),e._tx!==t){sn(e,t),X(e,s),Z(e,o);return}let c=t[2],l=vt(c,e.stores.resolvedLocation.get()),u=o[2];await e.startViewTransition(async()=>{if(e._tx===t&&await cn(e,t),e._tx!==t){sn(e,t),X(e,s),Z(e,o);return}let n=await e.startTransition(()=>{sn(e,t),un(e,t,s,a),e._tx===t&&(e.emit({type:`onLoad`,...l}),e._tx===t&&e.emit({type:`onBeforeRouteMount`,...l}))},s);e._tx===t?(u?.length&&pn(e,t,s,u,o[3]).catch(console.error),e.batch(()=>{e.stores.resolvedLocation.set(c),e.stores.status.set(`idle`),e._tx===t&&e.emit({type:`onResolved`,...l}),n&&e._tx===t&&e.emit({type:`onRendered`,...l})}),e._tx===t&&(e._commitPromise?.resolve(),e._commitPromise=void 0)):Z(e,o)})}async function hn(e,t){let n=e._tx,r=e.stores.resolvedLocation.get(),i=r??e.stores.location.get(),a=e.latestLocation,o=e._pendingLocation,s=o?.href===a.href?o._redirects??0:0,c=e._handoff,l=c?.[0](),u=new AbortController,d=e._preflight;if(e._preflight=u,l||c?.[1](),d?.abort(),!u.signal.aborted){let t=vt(a,r);e.emit({type:`onBeforeNavigate`,...t}),u.signal.aborted||e.emit({type:`onBeforeLoad`,...t})}if(u.signal.aborted){await dn(e,n);return}let f=i.href===a.href,p=u,m=e.matchRoutes(a,{_controller:u});Gt(m);let h=l?c[1](m):void 0;if(h?p=l:l?.abort(),u.signal.aborted){X(e,m),await dn(e,n);return}e._preflight=void 0;let g,_=()=>mn(e,y,f,()=>on(e,y),t?.sync,h),v=t?.sync?new Promise(e=>g=e):Promise.resolve().then(_),y=[p,s,a,m,Date.now(),v.then(()=>dn(e,y))];if(e._tx=y,n){for(let t of e.stores.matches.get()){if(e._tx!==y)break;t.isFetching&&Kt(e,t,!1)}n[0].abort(),X(e,n[3],y[3],!0)}e._tx===y?(e.batch(()=>{e.stores.status.set(`pending`),e.stores.location.set(a)}),(h||!e._committed.length&&m[0]?.status!==`success`&&!m.some(e=>e._notFound))&&on(e,y),g?.(_()),await y[5]):(X(e,y[3]),y[3]=[],g?.(),await dn(e,y))}async function gn(e,t){let n=e.buildLocation(t);for(let t=0;;t++){let r=e._committed,i=new AbortController,a,o,s;try{try{a=e.matchRoutes(n,{_controller:i}),Gt(a),o=(e._preloads??=new Map).set(i,a),s=await an(e,n,a,[i,t,r,!0])}finally{o&&(o=o.delete(i),X(e,a)),i.abort()}if(!zt(s))return s[1];if(!o||s.length<3)return;n=s[2]}catch(e){se(e)||console.error(e);return}}}var _n=`Error preloading route! ☝️`,vn=class{get to(){return this._to}get id(){return this._id}get path(){return this._path}get fullPath(){return this._fullPath}constructor(e){if(this.init=e=>{this.originalIndex=e,this._branch=void 0;let t=this.options,n=!t?.path&&!t?.id;this.parentRoute=this.options.getParentRoute?.(),n?this._path=ke:this.parentRoute||P();let r=n?ke:t?.path;r&&r!==`/`&&(r=I(r));let i=t?.id||r,a=n?ke:F((this.parentRoute.id===`__root__`?``:this.parentRoute.id)+`/`+(i??``));r===`__root__`&&(r=`/`);let o=a===`__root__`?`/`:r===void 0?this.parentRoute.fullPath:F(this.parentRoute.fullPath+`/`+r);this._path=r,this._id=a,this._fullPath=o,this._to=L(o)},this.addChildren=e=>this._addFileChildren(e),this._addFileChildren=e=>(Array.isArray(e)&&(this.children=e),typeof e==`object`&&e&&(this.children=Object.values(e)),this),this._addFileTypes=()=>this,this.updateLoader=e=>(Object.assign(this.options,e),this),this.update=e=>(Object.assign(this.options,e),this),this.lazy=e=>(this.lazyFn=e,this),this.redirect=e=>Ae({from:this.fullPath,...e}),this.options=e||{},this.isRoot=!e?.getParentRoute,e?.id&&e?.path)throw Error(`Route cannot have both an 'id' and a 'path' option.`)}},yn=class extends vn{constructor(e){super(e)}},bn=o((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),xn=o(((e,t)=>{t.exports=bn()})),Sn=d.createContext(null);function Cn(e){return d.useContext(Sn)}function wn(e,t){let n=e.stores.location,r=new Set,i,a,o=n=>{Lt(e,t,n)||(i=n,r.forEach(e=>e()))};return[()=>i??n.get(),e=>(r.size||(i=n.get(),a=n.subscribe(o).unsubscribe),r.add(e),()=>{r.delete(e),r.size||(a(),i=void 0)})]}var Tn=d.createContext(void 0),En=d.createContext(void 0),Dn=o((e=>{var t=u();function n(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var r=typeof Object.is==`function`?Object.is:n,i=t.useState,a=t.useEffect,o=t.useLayoutEffect,s=t.useDebugValue;function c(e,t){var n=t(),r=i({inst:{value:n,getSnapshot:t}}),c=r[0].inst,u=r[1];return o(function(){c.value=n,c.getSnapshot=t,l(c)&&u({inst:c})},[e,n,t]),a(function(){return l(c)&&u({inst:c}),e(function(){l(c)&&u({inst:c})})},[e]),s(n),n}function l(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!r(e,n)}catch{return!0}}function d(e,t){return t()}var f=typeof window>`u`||window.document===void 0||window.document.createElement===void 0?d:c;e.useSyncExternalStore=t.useSyncExternalStore===void 0?f:t.useSyncExternalStore})),On=o(((e,t)=>{t.exports=Dn()})),kn=o((e=>{var t=u(),n=On();function r(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var i=typeof Object.is==`function`?Object.is:r,a=n.useSyncExternalStore,o=t.useRef,s=t.useEffect,c=t.useMemo,l=t.useDebugValue;e.useSyncExternalStoreWithSelector=function(e,t,n,r,u){var d=o(null);if(d.current===null){var f={hasValue:!1,value:null};d.current=f}else f=d.current;d=c(function(){function e(e){if(!a){if(a=!0,o=e,e=r(e),u!==void 0&&f.hasValue){var t=f.value;if(u(t,e))return s=t}return s=e}if(t=s,i(o,e))return t;var n=r(e);return u!==void 0&&u(t,n)?(o=e,t):(o=e,s=n)}var a=!1,o,s,c=n===void 0?null:n;return[function(){return e(t())},c===null?void 0:function(){return e(c())}]},[t,n,r,u]);var p=a(e,d[0],d[1]);return s(function(){f.hasValue=!0,f.value=p},[p]),l(p),p}})),An=o(((e,t)=>{t.exports=kn()}))();function jn(e,t){return e===t}function Mn(e,t=e=>e,n){let r=n?.compare??jn,i=(0,d.useCallback)(t=>{let{unsubscribe:n}=e.subscribe(t);return n},[e]),a=(0,d.useCallback)(()=>e.get(),[e]);return(0,An.useSyncExternalStoreWithSelector)(i,a,a,t,r)}var Nn={};function Pn(e,t){let n=d.useRef();return r=>{let i=e?.select?e.select(r):r;return e?.structuralSharing??t.options.defaultStructuralSharing?n.current=b(n.current,i):i}}function Q(e){let t=Cn(),n=d.useContext(e.from?En:Tn),r=e.from??n,i=t.stores.getMatchStore(r),a=Pn(e,t),o=Mn(i,e=>e?a(e):Nn);if(o!==Nn)return o;(e.shouldThrow??!0)&&P()}function Fn(e){return Q({from:e.from,strict:e.strict,structuralSharing:e.structuralSharing,select:t=>e.select?e.select(t.loaderData):t.loaderData})}function In(e){let{select:t,...n}=e;return Q({...n,select:e=>t?t(e.loaderDeps):e.loaderDeps})}function Ln(e){return Q({from:e.from,shouldThrow:e.shouldThrow,structuralSharing:e.structuralSharing,strict:e.strict,select:t=>{let n=e.strict===!1?t.params:t._strictParams;return e.select?e.select(n):n}})}function Rn(e){return Q({from:e.from,strict:e.strict,shouldThrow:e.shouldThrow,structuralSharing:e.structuralSharing,select:t=>e.select?e.select(t.search):t.search})}function zn(e){let t=Cn();return d.useCallback(n=>t.navigate({...n,from:n.from??e?.from}),[e?.from,t])}function Bn(e){return Q({...e,select:t=>e.select?e.select(t.context):t.context})}var Vn=xn();function Hn(...e){let t=d.useRef(e),n=t.current;return e.forEach((e,t)=>{S(n[t],e,!1,!0)||(n[t]=e)}),t.current}function Un(e,t){e.preloadRoute(t).catch(e=>{console.warn(e),console.warn(_n)})}function Wn(e,t){let n=typeof e==`string`&&O(e);if(n)return t.has(n)?e:null}function Gn(e,t,n,r){let i=R(e.pathname,r),a=R(t.pathname,r);return(n?.exact?i!==a:!i.startsWith(a)||i.length!==a.length&&i[a.length]!==`/`)||(n?.includeSearch??!0)&&!S(e.search,t.search,!n?.exact,n?.explicitUndefined)?!1:!n?.includeHash||e.hash===t.hash}function Kn(e,t,n){let r=Cn(),i=d.useRef(null),a=d.useCallback(e=>{if(i.current=e,typeof t==`function`)return t(e);t&&(t.current=e)},[t]),{activeOptions:o,to:s,preload:c,preloadDelay:l,disabled:u,target:f,onClick:p,onBlur:m,onFocus:h,onMouseEnter:g,onMouseLeave:_,onTouchStart:v}=e,[y,b,x]=Hn(e.search,e.params,o),S=d.useContext(Tn),C=(r.stores._linkScopes??={})[S]??=wn(r,S),[w,T,E]=d.useMemo(()=>{let t=Wn(s,r.protocolAllowlist);if(t!==void 0){let n=[t??void 0];return[e,()=>n]}let n={...e},i,a,o,c=()=>{let e=C[0]();if(e!==i){n._fromLocation=e;let t=r.buildLocation(n),o=$n(t,r,u),s=u||o&&!O(o)?Gn(e,t,x,r.basepath):void 0;a&&a[0]===o&&a[1]===s||(a=[o,s]),i=e}return a};return[n,c,x?.includeHash&&(()=>{let e=c();return e[1]?o??=[e[0],!1]:e})]},[r,C,e.from,e.hash,e.href,s,y,b,e.state,e.mask,e.unsafeRelative,x,u]),[D,k]=d.useSyncExternalStore(C[1],T,E||T),A=k===void 0&&D,j=u||D===void 0,M=d.useRef(!1),N=e.reloadDocument||A||j?!1:c??r.options.defaultPreload,P=l??r.options.defaultPreloadDelay??0,F=d.useCallback(e=>{let t=e?.isIntersecting;t??N===`intent`?P?i.t??=setTimeout(()=>{i.t=void 0,Un(r,w)},P):Un(r,w):t===!1&&Qn(i)},[r,w,i,N,P]);d.useEffect(()=>{if(!N)return;N===`render`&&!M.current&&(M.current=!0,Un(r,w));let e=!0,t;return N===`viewport`&&i.current&&typeof IntersectionObserver==`function`&&(t=new IntersectionObserver(t=>{e&&F(t.pop())},{rootMargin:`100px`}),t.observe(i.current)),()=>{e=!1,t?.disconnect(),Qn(i)}},[r,w,N,F,i]);let I=Xn(e,n);if(I.ref=t?a:i,A)return I.href=A,I;let L=t=>{let n=f??t.currentTarget.getAttribute(`target`);j||t.metaKey||t.altKey||t.ctrlKey||t.shiftKey||t.defaultPrevented||n&&n!==`_self`||t.button!==0||(t.preventDefault(),Qn(i),r.navigate({...e,_fromLocation:w._fromLocation}))},ee=()=>{N===`intent`&&Un(r,w)},R=()=>{N===`intent`&&Qn(i)};return I.onClick=$(p,L),I.onBlur=$(m,R),I.onFocus=$(h,F),I.onMouseEnter=$(g,F),I.onMouseLeave=$(_,R),I.onTouchStart=$(v,ee),Zn(I,e,k,D,j,n)}var qn={},Jn={className:`active`},Yn=new Set([`to`,`params`,`search`,`hash`,`state`,`mask`,`from`,`unsafeRelative`,`reloadDocument`,`preload`,`preloadDelay`,`preloadIntentProximity`,`hashScrollIntoView`,`replace`,`startTransition`,`resetScroll`,`viewTransition`,`ignoreBlocker`,`activeProps`,`inactiveProps`,`activeOptions`,`_asChild`]);function Xn(e,t){let n={};for(let r in e)Yn.has(r)||r===`type`&&t!==void 0||r===`disabled`&&t===`a`||(n[r]=e[r]);return n}function Zn(e,t,n,r,i,a){let{activeProps:o,inactiveProps:s,className:c,style:l,target:u}=t,d=h(n?o:s,{})??(n?Jn:qn);Object.assign(e,d),e.href=r,a!==`a`&&(e.disabled=i),e.target=u;let f=d.style;(l||f)&&(e.style=l&&f?{...l,...f}:l||f);let p=d.className;return(c||p)&&(e.className=c?p?`${c} ${p}`:c:p),i&&(e.role=`link`,e[`aria-disabled`]=!0),n&&(e[`data-status`]=`active`,e[`aria-current`]=`page`),e}var Qn=e=>{clearTimeout(e.t),e.t=void 0},$=(e,t)=>e?n=>n.defaultPrevented||(e(n),n.defaultPrevented||t(n)):t;function $n(e,t,n){if(n)return;let r=e.maskedLocation??e,i=r.external?r.publicHref:t.history.createHref(r.publicHref)||`/`;if(!r.external&&i===r.publicHref||!A(i,t.protocolAllowlist))return i}var er=d.memo(d.forwardRef((e,t)=>{let n=e._asChild||`a`,r=Kn(e,t,n),i=typeof e.children==`function`?e.children({isActive:r[`data-status`]===`active`}):e.children;return d.createElement(n,r,i)}),tr);function tr(e,t){let n=0;for(let r in t)if(n++,e[r]!==t[r]&&(!Yn.has(r)||!S(e[r],t[r],!1,!0)))return!1;for(let t in e)n--;return n===0}var nr=class extends vn{constructor(e){super(e),this.useMatch=e=>Q({...e,from:this.id}),this.useRouteContext=e=>Bn({...e,from:this.id}),this.useSearch=e=>Rn({...e,from:this.id}),this.useParams=e=>Ln({...e,from:this.id}),this.useLoaderDeps=e=>In({...e,from:this.id}),this.useLoaderData=e=>Fn({...e,from:this.id}),this.useNavigate=()=>zn({from:this.fullPath}),this.Link=d.forwardRef((e,t)=>(0,Vn.jsx)(er,{ref:t,from:this.fullPath,...e}))}};function rr(e){return new nr(e)}var ir=class extends yn{constructor(e){super(e),this.useMatch=e=>Q({...e,from:this.id}),this.useRouteContext=e=>Bn({...e,from:this.id}),this.useSearch=e=>Rn({...e,from:this.id}),this.useParams=e=>Ln({...e,from:this.id}),this.useLoaderDeps=e=>In({...e,from:this.id}),this.useLoaderData=e=>Fn({...e,from:this.id}),this.useNavigate=()=>zn({from:this.fullPath}),this.Link=d.forwardRef((e,t)=>(0,Vn.jsx)(er,{ref:t,from:this.fullPath,...e}))}};function ar(e){return new ir(e)}function or(e){return e=>{let t=rr(e);return t.isRoot=!1,t}}function sr(e,t){let n,r,i,a=()=>(n||=(i=void 0,e().then(e=>{n=void 0,o.preload=void 0,r=e[t??`default`]}).catch(e=>{n=void 0,i=e})),n),o=function(e){if(i){if(C(i)&&typeof sessionStorage<`u`){let e=`tanstack_router_reload:${i.message}`;if(!sessionStorage.getItem(e))throw sessionStorage.setItem(e,`1`),window.location.reload(),new Promise(()=>{})}throw i}if(!r){if(f)f(a());else throw a()}return d.createElement(r,e)};return o.preload=a,o}var cr=`modulepreload`,lr=function(e,t){return new URL(e,t).href},ur={},dr=function(e){return e.pathname.endsWith(`.css`)},fr=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},pr=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=lr(t,n);let r=s(t),i=dr(r);return fr(ur,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:cr,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},mr=`data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%20128'%3e%3cg%20fill='%2300acd7'%20fill-rule='evenodd'%3e%3cpath%20d='M11.156%2054.829c-.243%200-.303-.122-.182-.303l1.273-1.637c.12-.182.424-.303.666-.303H34.55c.243%200%20.303.182.182.364l-1.03%201.576c-.121.181-.424.363-.606.363zM2.004%2060.404c-.242%200-.303-.12-.182-.303l1.273-1.636c.121-.182.424-.303.667-.303h27.636c.242%200%20.364.182.303.364l-.485%201.454c-.06.243-.303.364-.545.364zM16.67%2065.98c-.242%200-.302-.182-.181-.364l.848-1.515c.122-.182.364-.363.607-.363h12.12c.243%200%20.364.181.364.424l-.12%201.454c0%20.243-.243.425-.425.425zM79.58%2053.738c-3.819.97-6.425%201.697-10.182%202.666-.91.243-.97.303-1.758-.606-.909-1.03-1.576-1.697-2.848-2.303-3.819-1.878-7.516-1.333-10.97.91-4.121%202.666-6.242%206.605-6.182%2011.514.06%204.849%203.394%208.849%208.182%209.516%204.121.545%207.576-.91%2010.303-4%20.545-.667%201.03-1.394%201.636-2.243H56.064c-1.272%200-1.575-.788-1.151-1.818.788-1.879%202.242-5.03%203.09-6.606.183-.364.607-.97%201.516-.97h22.06c-.12%201.637-.12%203.273-.363%204.91-.667%204.363-2.303%208.363-4.97%2011.878-4.364%205.758-10.06%209.333-17.273%2010.303-5.939.788-11.454-.364-16.302-4-4.485-3.394-7.03-7.879-7.697-13.454-.788-6.606%201.151-12.546%205.151-17.758%204.303-5.636%2010-9.212%2016.97-10.485%205.697-1.03%2011.151-.363%2016.06%202.97%203.212%202.121%205.515%205.03%207.03%208.545.364.546.122.849-.606%201.03z'/%3e%3cpath%20d='M99.64%2087.253c-5.515-.122-10.546-1.697-14.788-5.334-3.576-3.09-5.818-7.03-6.545-11.697-1.091-6.848.787-12.909%204.909-18.302%204.424-5.819%209.757-8.849%2016.97-10.122%206.181-1.09%2012-.484%2017.272%203.091%204.788%203.273%207.757%207.697%208.545%2013.515%201.03%208.182-1.333%2014.849-6.97%2020.546-4%204.06-8.909%206.606-14.545%207.757-1.636.303-3.273.364-4.848.546zm14.424-24.485c-.06-.788-.06-1.394-.182-2-1.09-6-6.606-9.394-12.363-8.06-5.637%201.272-9.273%204.848-10.606%2010.545-1.091%204.727%201.212%209.515%205.575%2011.454%203.334%201.455%206.667%201.273%209.879-.363%204.788-2.485%207.394-6.364%207.697-11.576z'%20fill-rule='nonzero'/%3e%3c/g%3e%3c/svg%3e`,hr=`data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%20128'%3e%3cpath%20fill='%230074BD'%20d='M47.617%2098.12s-4.767%202.774%203.397%203.71c9.892%201.13%2014.947.968%2025.845-1.092%200%200%202.871%201.795%206.873%203.351-24.439%2010.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348%203.959%202.823%204.805c10.567%201.091%2018.91%201.18%2033.354-1.6%200%200%201.993%202.025%205.132%203.131-29.542%208.64-62.446.68-41.309-6.336z'/%3e%3cpath%20fill='%23EA2D2E'%20d='M69.802%2061.271c6.025%206.935-1.58%2013.17-1.58%2013.17s15.289-7.891%208.269-17.777c-6.559-9.215-11.587-13.792%2015.635-29.58%200%20.001-42.731%2010.67-22.324%2034.187z'/%3e%3cpath%20fill='%230074BD'%20d='M102.123%20108.229s3.529%202.91-3.888%205.159c-14.102%204.272-58.706%205.56-71.094.171-4.451-1.938%203.899-4.625%206.526-5.192%202.739-.593%204.303-.485%204.303-.485-4.953-3.487-32.013%206.85-13.743%209.815%2049.821%208.076%2090.817-3.637%2077.896-9.468zM49.912%2070.294s-22.686%205.389-8.033%207.348c6.188.828%2018.518.638%2030.011-.326%209.39-.789%2018.813-2.474%2018.813-2.474s-3.308%201.419-5.704%203.053c-23.042%206.061-67.544%203.238-54.731-2.958%2010.832-5.239%2019.644-4.643%2019.644-4.643zm40.697%2022.747c23.421-12.167%2012.591-23.86%205.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079%202-1.543c14.953-5.255%2026.451%2015.503-4.823%2023.725%200-.002.359-.327.468-.617z'/%3e%3cpath%20fill='%23EA2D2E'%20d='M76.491%201.587S89.459%2014.563%2064.188%2034.51c-20.266%2016.006-4.621%2025.13-.007%2035.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041%2028.42%2081.722%2022.195%2076.491%201.587z'/%3e%3cpath%20fill='%230074BD'%20d='M52.214%20126.021c22.476%201.437%2057-.8%2057.817-11.436%200%200-1.571%204.032-18.577%207.231-19.186%203.612-42.854%203.191-56.887.874%200%20.001%202.875%202.381%2017.647%203.331z'/%3e%3c/svg%3e`,gr=`data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%20128'%3e%3cdefs%3e%3clinearGradient%20id='a'%20x1='500.003'%20x2='-.097'%20y1='579.106'%20y2='1079.206'%20gradientTransform='translate(15.534%20-96.774)%20scale(.1939)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='.003'%20stop-color='%23e44857'/%3e%3cstop%20offset='.469'%20stop-color='%23c711e1'/%3e%3cstop%20offset='1'%20stop-color='%237f52ff'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20fill='url(%23a)'%20d='M112.484%20112.484H15.516V15.516h96.968L64%2064Zm0%200'/%3e%3c/svg%3e`,_r=`data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%20128'%3e%3cpath%20fill='url(%23a)'%20d='M66.958.825a6.07%206.07%200%200%200-6.035%200L11.103%2029.76c-1.895%201.072-2.96%203.095-2.96%205.24v57.988c0%202.143%201.183%204.167%202.958%205.24l49.82%2028.934a6.07%206.07%200%200%200%206.036%200l49.82-28.935c1.894-1.072%202.958-3.096%202.958-5.24V35c0-2.144-1.183-4.167-2.958-5.24z'/%3e%3cpath%20fill='url(%23b)'%20d='M116.897%2029.76%2066.841.825A8.161%208.161%200%200%200%2065.302.23L9.21%2096.798a6.251%206.251%200%200%200%201.657%201.43l50.057%2028.934c1.42.833%203.076%201.072%204.615.595l52.66-96.925a3.702%203.702%200%200%200-1.302-1.072z'/%3e%3cpath%20fill='url(%23c)'%20d='M116.898%2098.225c1.42-.833%202.485-2.262%202.958-3.81L65.066.108c-1.42-.238-2.959-.119-4.26.715L11.104%2029.639l53.606%2098.355c.71-.12%201.54-.358%202.25-.715z'/%3e%3cdefs%3e%3clinearGradient%20id='a'%20x1='34.513'%20x2='27.157'%20y1='15.535'%20y2='30.448'%20gradientTransform='translate(-129.242%20-73.715)%20scale(6.18523)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%233F873F'/%3e%3cstop%20offset='.33'%20stop-color='%233F8B3D'/%3e%3cstop%20offset='.637'%20stop-color='%233E9638'/%3e%3cstop%20offset='.934'%20stop-color='%233DA92E'/%3e%3cstop%20offset='1'%20stop-color='%233DAE2B'/%3e%3c/linearGradient%3e%3clinearGradient%20id='b'%20x1='30.009'%20x2='50.533'%20y1='23.359'%20y2='8.288'%20gradientTransform='translate(-129.242%20-73.715)%20scale(6.18523)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='.138'%20stop-color='%233F873F'/%3e%3cstop%20offset='.402'%20stop-color='%2352A044'/%3e%3cstop%20offset='.713'%20stop-color='%2364B749'/%3e%3cstop%20offset='.908'%20stop-color='%236ABF4B'/%3e%3c/linearGradient%3e%3clinearGradient%20id='c'%20x1='21.917'%20x2='40.555'%20y1='22.261'%20y2='22.261'%20gradientTransform='translate(-129.242%20-73.715)%20scale(6.18523)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='.092'%20stop-color='%236ABF4B'/%3e%3cstop%20offset='.287'%20stop-color='%2364B749'/%3e%3cstop%20offset='.598'%20stop-color='%2352A044'/%3e%3cstop%20offset='.862'%20stop-color='%233F873F'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e`,vr=`data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%20128'%3e%3clinearGradient%20id='python-original-a'%20gradientUnits='userSpaceOnUse'%20x1='70.252'%20y1='1237.476'%20x2='170.659'%20y2='1151.089'%20gradientTransform='matrix(.563%200%200%20-.568%20-29.215%20707.817)'%3e%3cstop%20offset='0'%20stop-color='%235A9FD4'/%3e%3cstop%20offset='1'%20stop-color='%23306998'/%3e%3c/linearGradient%3e%3clinearGradient%20id='python-original-b'%20gradientUnits='userSpaceOnUse'%20x1='209.474'%20y1='1098.811'%20x2='173.62'%20y2='1149.537'%20gradientTransform='matrix(.563%200%200%20-.568%20-29.215%20707.817)'%3e%3cstop%20offset='0'%20stop-color='%23FFD43B'/%3e%3cstop%20offset='1'%20stop-color='%23FFE873'/%3e%3c/linearGradient%3e%3cpath%20fill='url(%23python-original-a)'%20d='M63.391%201.988c-4.222.02-8.252.379-11.8%201.007-10.45%201.846-12.346%205.71-12.346%2012.837v9.411h24.693v3.137H29.977c-7.176%200-13.46%204.313-15.426%2012.521-2.268%209.405-2.368%2015.275%200%2025.096%201.755%207.311%205.947%2012.519%2013.124%2012.519h8.491V67.234c0-8.151%207.051-15.34%2015.426-15.34h24.665c6.866%200%2012.346-5.654%2012.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037%209.557c2.55%200%204.634%202.117%204.634%204.721%200%202.593-2.083%204.69-4.634%204.69-2.56%200-4.633-2.097-4.633-4.69-.001-2.604%202.073-4.721%204.633-4.721z'%20transform='translate(0%2010.26)'/%3e%3cpath%20fill='url(%23python-original-b)'%20d='M91.682%2028.38v10.966c0%208.5-7.208%2015.655-15.426%2015.655H51.591c-6.756%200-12.346%205.783-12.346%2012.549v23.515c0%206.691%205.818%2010.628%2012.346%2012.547%207.816%202.297%2015.312%202.713%2024.665%200%206.216-1.801%2012.346-5.423%2012.346-12.547v-9.412H63.938v-3.138h37.012c7.176%200%209.852-5.005%2012.348-12.519%202.578-7.735%202.467-15.174%200-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809%2087.927c2.561%200%204.634%202.097%204.634%204.692%200%202.602-2.074%204.719-4.634%204.719-2.55%200-4.633-2.117-4.633-4.719%200-2.595%202.083-4.692%204.633-4.692z'%20transform='translate(0%2010.26)'/%3e%3cradialGradient%20id='python-original-c'%20cx='1825.678'%20cy='444.45'%20r='26.743'%20gradientTransform='matrix(0%20-.24%20-1.055%200%20532.979%20557.576)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='0'%20stop-color='%23B8B8B8'%20stop-opacity='.498'/%3e%3cstop%20offset='1'%20stop-color='%237F7F7F'%20stop-opacity='0'/%3e%3c/radialGradient%3e%3cpath%20opacity='.444'%20fill='url(%23python-original-c)'%20d='M97.309%20119.597c0%203.543-14.816%206.416-33.091%206.416-18.276%200-33.092-2.873-33.092-6.416%200-3.544%2014.815-6.417%2033.092-6.417%2018.275%200%2033.091%202.872%2033.091%206.417z'/%3e%3c/svg%3e`,yr=new URL(`rust-MUxGu8Uq.svg`,import.meta.url).href,br=Object.assign({"../../assets/logos/go.svg":mr,"../../assets/logos/java.svg":hr,"../../assets/logos/kotlin.svg":gr,"../../assets/logos/nodejs.svg":_r,"../../assets/logos/python.svg":vr,"../../assets/logos/rust.svg":yr,"../../assets/logos/scala.svg":`data:image/svg+xml,%3csvg%20version='1.0'%20viewBox='0%200%20128%20128'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M25%20110.437V94.874h5.616c3.113%200%208.052-.203%2011.03-.474l5.278-.406-7.038-1.894c-3.924-1.015-8.864-2.504-10.961-3.316L25%2087.364V55.627h6.293c3.383%200%208.323-.203%2010.894-.473l4.737-.406-8.323-2.233C34%2051.366%2029.128%2049.809%2027.639%2049.2L25%2047.982v-30.72l2.098-.473c1.15-.203%203.992-.406%206.293-.406%2011.367%200%2038.366-3.722%2051.628-7.105%209.27-2.436%2015.698-4.872%2017.931-6.902%201.15-1.015%201.218-.406%201.218%2014.548v15.63l-1.624%201.219-1.624%201.285%203.248%202.842v33.9l-1.624%201.218-1.624%201.286%203.248%202.842v33.9l-1.76%201.353c-1.894%201.489-9.202%203.993-17.524%206.09C71.892%20121.737%2040.157%20126%2029.33%20126H25z'%20fill='%23390d09'/%3e%3cg%20fill='%23de3423'%3e%3cpath%20d='M25%20110.572V95.077l11.842-.474c12.315-.473%2021.45-1.488%2034.847-3.789%2015.225-2.639%2030.246-7.375%2031.803-10.082.406-.677.676%204.534.676%2014.616v15.698l-1.76%201.353c-1.894%201.489-9.202%203.993-17.524%206.09C71.892%20121.737%2040.157%20126%2029.33%20126H25zM25%2071.327V55.83l11.842-.406c13.127-.541%2023.344-1.691%2036.877-4.195%2015.157-2.842%2028.96-7.443%2029.976-9.947.203-.473.406%206.09.406%2014.616.067%2013.533-.068%2015.698-1.083%2016.78-2.368%202.64-20.638%207.376-39.449%2010.286-11.435%201.76-30.381%203.79-35.66%203.79H25zM25%2032.352V17.195l2.098-.406c1.15-.203%203.992-.406%206.293-.406%2011.367%200%2038.366-3.722%2051.628-7.105%209.27-2.436%2015.698-4.872%2017.931-6.902%201.15-1.015%201.218-.406%201.218%2014.48%200%2014.548-.067%2015.63-1.285%2016.714-1.827%201.691-14.345%205.548-24.09%207.51-15.765%203.113-41.951%206.429-50.883%206.429H25z'/%3e%3c/g%3e%3c/svg%3e`,"../../assets/logos/ts.svg":`data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%20128'%3e%3cpath%20fill='%23fff'%20d='M22.67%2047h99.67v73.67H22.67z'/%3e%3cpath%20data-name='original'%20fill='%23007acc'%20d='M1.5%2063.91v62.5h125v-125H1.5zm100.73-5a15.56%2015.56%200%20017.82%204.5%2020.58%2020.58%200%20013%204c0%20.16-5.4%203.81-8.69%205.85-.12.08-.6-.44-1.13-1.23a7.09%207.09%200%2000-5.87-3.53c-3.79-.26-6.23%201.73-6.21%205a4.58%204.58%200%2000.54%202.34c.83%201.73%202.38%202.76%207.24%204.86%208.95%203.85%2012.78%206.39%2015.16%2010%202.66%204%203.25%2010.46%201.45%2015.24-2%205.2-6.9%208.73-13.83%209.9a38.32%2038.32%200%2001-9.52-.1%2023%2023%200%2001-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34%209.34%200%20011.15-.73L82%20101l3.59-2.08.75%201.11a16.78%2016.78%200%20004.74%204.54c4%202.1%209.46%201.81%2012.16-.62a5.43%205.43%200%2000.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48%2016.48%200%2001-3.43-6.25%2025%2025%200%2001-.22-8c1.33-6.23%206-10.58%2012.82-11.87a31.66%2031.66%200%20019.49.26zm-29.34%205.24v5.12H56.66v46.23H45.15V69.26H28.88v-5a49.19%2049.19%200%2001.12-5.17C29.08%2059%2039%2059%2051%2059h21.83z'/%3e%3c/svg%3e`});function xr(e){return br[`../../assets/logos/${e}.svg`]}var Sr={java:`#e76f00`,scala:`#dc322f`,kotlin:`#7f52ff`,ts:`#3178c6`,nodejs:`#3c873a`,rust:`#b7410e`,go:`#00add8`,python:`#3776ab`};function Cr(e){return Sr[e]??`#475569`}var wr=`# go stack

## Stack
* Go 1.26.x
* Modular code with packages
* Proper types

## Idiomatic Go
* Return \`error\` as the last value and check it right away. Wrap with \`fmt.Errorf("context: %w", err)\`.
* Use \`errors.Is\` and \`errors.As\`, never compare error strings.
* Accept interfaces, return structs. Define the interface in the package that uses it, not the one that implements it.
* Keep interfaces small: one or two methods.
* Pass \`context.Context\` as the first parameter of anything that does IO.
* Use the standard library first: \`net/http\` with method patterns in \`ServeMux\`, \`log/slog\`, \`encoding/json\`, \`database/sql\`.
* Package names are short, lower case, singular, with no \`util\`, \`common\` or \`helpers\`.
* Make the zero value useful. Use constructors (\`NewX\`) only when setup is needed.
* Use generics only when the same code would be repeated for several types.
* Do not start goroutines you cannot stop. Every goroutine has an exit through \`ctx\` or a closed channel.
* Use table driven tests.
* Run \`go vet\` and \`gofmt\` before saying it is done.

## Principles in Go
* Separation of concerns: \`cmd/app\` for \`main\`, \`internal/<feature>\` for handlers, services and stores. Handlers do not touch \`database/sql\`.
* DRY: shared logic goes into a function in the owning package. Do not create a \`utils\` package.
* Interfaces: consumers define the small interface they need. Constructors take it as a parameter.

## Centralization rules in Go
* Logging: one centralized \`logx\` package is the only place that builds the logger. It wraps \`slog\` with a handler that always adds the common fields from the \`context.Context\`: correlation id, request path, user id and service name. A middleware reads or creates the \`X-Correlation-Id\` header and puts it in the context. The shared HTTP client forwards it on outbound calls. All logs use the \`...Context\` methods (\`InfoContext\`, \`ErrorContext\`). No \`fmt.Println\`, \`log.Printf\` or a second \`slog.New\`.
* HTTP client: one \`*http.Client\` with timeouts, wrapped in a small client type with the base URL. Every outbound REST call goes through it. Never use \`http.Get\` or \`http.DefaultClient\`.
* Config: one \`Config\` struct loaded in \`main\`. No \`os.Getenv\` deep in the code.
* Errors: sentinel and typed errors per package, mapped to HTTP status in one middleware or helper.
* Database: one \`*sql.DB\` opened in \`main\` and passed to stores.
* Time: inject a \`func() time.Time\` or a \`Clock\` interface.

## Bad vs Good

### 1. Error wrapping
Bad
\`\`\`go
user, err := store.Get(ctx, id)
if err != nil {
    return nil, errors.New("failed")
}
\`\`\`
Good
\`\`\`go
user, err := store.Get(ctx, id)
if err != nil {
    return nil, fmt.Errorf("get user %s: %w", id, err)
}
\`\`\`

### 2. Comparing errors
Bad
\`\`\`go
if err.Error() == "sql: no rows in result set" {
    return nil, nil
}
\`\`\`
Good
\`\`\`go
if errors.Is(err, sql.ErrNoRows) {
    return nil, ErrUserNotFound
}
\`\`\`

### 3. Ignored error
Bad
\`\`\`go
data, _ := json.Marshal(order)
w.Write(data)
\`\`\`
Good
\`\`\`go
if err := json.NewEncoder(w).Encode(order); err != nil {
    logger.ErrorContext(ctx, "encode order", "err", err)
}
\`\`\`

### 4. Interface defined by the consumer
Bad
\`\`\`go
package store

type UserStore interface {
    Get(ctx context.Context, id string) (User, error)
    List(ctx context.Context) ([]User, error)
    Save(ctx context.Context, u User) error
    Delete(ctx context.Context, id string) error
}
\`\`\`
Good
\`\`\`go
package billing

type userGetter interface {
    Get(ctx context.Context, id string) (user.User, error)
}

type Service struct {
    users userGetter
}

func NewService(users userGetter) *Service {
    return &Service{users: users}
}
\`\`\`

### 5. Context
Bad
\`\`\`go
func (s *Store) Get(id string) (User, error) {
    row := s.db.QueryRow("select id, name from users where id = $1", id)
}
\`\`\`
Good
\`\`\`go
func (s *Store) Get(ctx context.Context, id string) (User, error) {
    row := s.db.QueryRowContext(ctx, "select id, name from users where id = $1", id)
}
\`\`\`

### 6. Logging
Bad
\`\`\`go
fmt.Println("order created", order.ID)
\`\`\`
\`\`\`go
slog.Info("order created", "order_id", order.ID)
\`\`\`
Good
\`\`\`go
package logx

type ctxKey struct{}

const Header = "X-Correlation-Id"

type Fields struct {
    CorrelationID string
    Path          string
    UserID        string
}

func With(ctx context.Context, f Fields) context.Context {
    return context.WithValue(ctx, ctxKey{}, f)
}

type handler struct {
    slog.Handler
    service string
}

func (h handler) Handle(ctx context.Context, r slog.Record) error {
    f, _ := ctx.Value(ctxKey{}).(Fields)
    r.AddAttrs(
        slog.String("correlation_id", f.CorrelationID),
        slog.String("path", f.Path),
        slog.String("user_id", f.UserID),
        slog.String("service", h.service),
    )
    return h.Handler.Handle(ctx, r)
}

func New(service string) *slog.Logger {
    return slog.New(handler{Handler: slog.NewJSONHandler(os.Stdout, nil), service: service})
}

func Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        id := r.Header.Get(Header)
        if id == "" {
            id = rand.Text()
        }
        w.Header().Set(Header, id)
        ctx := With(r.Context(), Fields{CorrelationID: id, Path: r.URL.Path})
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
\`\`\`
\`\`\`go
s.logger.InfoContext(ctx, "order created", "order_id", order.ID)
\`\`\`

### 7. Centralized HTTP client
Bad
\`\`\`go
func Rate(currency string) (Rate, error) {
    resp, err := http.Get("https://rates.internal/rates/" + currency)
}
\`\`\`
Good
\`\`\`go
type Client struct {
    http    *http.Client
    baseURL string
}

func NewClient(baseURL string, timeout time.Duration) *Client {
    return &Client{http: &http.Client{Timeout: timeout}, baseURL: baseURL}
}

func (c *Client) GetJSON(ctx context.Context, path string, out any) error {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
    if err != nil {
        return fmt.Errorf("build request %s: %w", path, err)
    }
    resp, err := c.http.Do(req)
    if err != nil {
        return fmt.Errorf("get %s: %w", path, err)
    }
    defer resp.Body.Close()
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("get %s: status %d", path, resp.StatusCode)
    }
    return json.NewDecoder(resp.Body).Decode(out)
}

func (g *RatesGateway) Rate(ctx context.Context, currency string) (Rate, error) {
    var r Rate
    err := g.client.GetJSON(ctx, "/rates/"+currency, &r)
    return r, err
}
\`\`\`

### 8. Standard router
Bad
\`\`\`go
http.HandleFunc("/orders/", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        w.WriteHeader(405)
        return
    }
    id := strings.TrimPrefix(r.URL.Path, "/orders/")
})
\`\`\`
Good
\`\`\`go
mux := http.NewServeMux()
mux.HandleFunc("GET /orders/{id}", h.getOrder)

func (h *Handler) getOrder(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
}
\`\`\`

### 9. Utils package
Bad
\`\`\`go
package utils

func FormatMoney(cents int64) string
func ParseUserID(s string) string
\`\`\`
Good
\`\`\`go
package money

func (c Cents) String() string

package user

func ParseID(s string) (ID, error)
\`\`\`

### 10. Goroutine leak
Bad
\`\`\`go
go func() {
    for {
        poll()
        time.Sleep(time.Second)
    }
}()
\`\`\`
Good
\`\`\`go
go func() {
    ticker := time.NewTicker(time.Second)
    defer ticker.Stop()
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            poll(ctx)
        }
    }
}()
\`\`\`

### 11. Configuration
Bad
\`\`\`go
func (s *Store) Open() error {
    db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))
}
\`\`\`
Good
\`\`\`go
type Config struct {
    DatabaseURL string
    Port        int
}

func Load() (Config, error) {
    port, err := strconv.Atoi(os.Getenv("PORT"))
    if err != nil {
        return Config{}, fmt.Errorf("PORT: %w", err)
    }
    url := os.Getenv("DATABASE_URL")
    if url == "" {
        return Config{}, errors.New("DATABASE_URL is required")
    }
    return Config{DatabaseURL: url, Port: port}, nil
}
\`\`\`

### 12. Table driven tests
Bad
\`\`\`go
func TestFee(t *testing.T) {
    if Fee(Express) != 20 {
        t.Fail()
    }
    if Fee(Standard) != 5 {
        t.Fail()
    }
}
\`\`\`
Good
\`\`\`go
func TestFee(t *testing.T) {
    tests := []struct {
        name string
        in   Shipping
        want int
    }{
        {"express costs more for next day delivery", Express, 20},
        {"standard is the cheap default", Standard, 5},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            if got := Fee(tt.in); got != tt.want {
                t.Errorf("Fee(%v) = %d, want %d", tt.in, got, tt.want)
            }
        })
    }
}
\`\`\`

### 13. Typed constants
Bad
\`\`\`go
func Fee(kind string) int
\`\`\`
Good
\`\`\`go
type Shipping int

const (
    Standard Shipping = iota
    Express
)

func Fee(kind Shipping) int
\`\`\`

### 14. Errors mapped in one place
Bad
\`\`\`go
if err != nil {
    http.Error(w, err.Error(), 500)
    return
}
\`\`\`
Good
\`\`\`go
func writeError(ctx context.Context, w http.ResponseWriter, logger *slog.Logger, err error) {
    switch {
    case errors.Is(err, ErrNotFound):
        http.Error(w, "not found", http.StatusNotFound)
    case errors.Is(err, ErrInvalid):
        http.Error(w, "invalid request", http.StatusBadRequest)
    default:
        logger.ErrorContext(ctx, "request failed", "err", err)
        http.Error(w, "internal error", http.StatusInternalServerError)
    }
}
\`\`\`
`,Tr=`# java stack

## Stack
* Java 25
* Maven
* Spring Boot 4.2.0
* Spring Data JDBC
* Postgres
* HikariCP
* Modular code

## Idiomatic Java
* Use \`record\` for data carriers and value objects.
* Use \`sealed interface\` plus \`record\` for closed sets of cases, and \`switch\` pattern matching over them.
* Use \`Optional\` as a return type only. Never as a field or a parameter.
* Use virtual threads (\`spring.threads.virtual.enabled=true\`) instead of reactive code.
* Constructor injection only, with \`final\` fields. No field \`@Autowired\`.
* Use text blocks for SQL and multi line strings.
* Use \`List.of\`, \`Map.of\`, \`Set.of\` for immutable collections.

## Principles in Java
* Separation of concerns: \`@RestController\` parses and returns DTOs, \`@Service\` holds rules, Spring Data JDBC \`Repository\` talks to Postgres.
* DRY: shared rules go into a domain method or a small \`final\` utility class in the feature package.
* Interfaces: the service depends on interfaces for outbound ports (\`PaymentGateway\`, \`Clock\`). Spring wires the implementation.

## Centralization rules in Java
* Logging: one centralized \`AppLogger\` class is the only way to log. It wraps SLF4J and always adds the common fields: correlation id, request path, user id and service name, taken from the MDC. A servlet filter reads or creates the \`X-Correlation-Id\` header, puts it in the MDC and clears it at the end of the request. The \`RestClient\` bean forwards the same header on outbound calls. No \`System.out\`, no \`LoggerFactory.getLogger\` outside \`AppLogger\`.
* HTTP client: one \`RestClient\` bean built in a \`@Configuration\` class with base URL, timeouts and error handler. Inject it. Never call \`RestClient.create()\` or \`new HttpClient\` in a service.
* Config: one \`@ConfigurationProperties\` record per area. No \`@Value\` scattered around, no \`System.getenv\`.
* Errors: one \`@RestControllerAdvice\` maps exceptions to \`ProblemDetail\`.
* JSON: the Spring \`ObjectMapper\` bean. Never \`new ObjectMapper()\`.
* Time: inject \`java.time.Clock\`. Never \`LocalDateTime.now()\` without a clock.

## Bad vs Good

### 1. Data carrier
Bad
\`\`\`java
public class Order {
    private String id;
    private BigDecimal total;
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}
\`\`\`
Good
\`\`\`java
public record Order(String id, BigDecimal total) {}
\`\`\`

### 2. Dependency injection
Bad
\`\`\`java
@Service
public class OrderService {
    @Autowired
    private OrderRepository repository;
}
\`\`\`
Good
\`\`\`java
@Service
public class OrderService {
    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }
}
\`\`\`

### 3. Closed set of cases
Bad
\`\`\`java
public double area(Object shape) {
    if (shape instanceof Circle) {
        Circle c = (Circle) shape;
        return Math.PI * c.r() * c.r();
    } else if (shape instanceof Square) {
        Square s = (Square) shape;
        return s.side() * s.side();
    }
    throw new IllegalArgumentException();
}
\`\`\`
Good
\`\`\`java
public sealed interface Shape permits Circle, Square {}
public record Circle(double r) implements Shape {}
public record Square(double side) implements Shape {}

public double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Square s -> s.side() * s.side();
    };
}
\`\`\`

### 4. Optional
Bad
\`\`\`java
public Customer find(String id) {
    return repository.findById(id).orElse(null);
}
\`\`\`
Good
\`\`\`java
public Optional<Customer> find(String id) {
    return repository.findById(id);
}
\`\`\`

### 5. Logging
Bad
\`\`\`java
System.out.println("order created " + order.id());
\`\`\`
\`\`\`java
private static final Logger log = LoggerFactory.getLogger(OrderService.class);

log.info("order created id={}", order.id());
\`\`\`
Good
\`\`\`java
public final class AppLogger {
    private final Logger log;

    private AppLogger(Class<?> owner) {
        this.log = LoggerFactory.getLogger(owner);
    }

    public static AppLogger of(Class<?> owner) {
        return new AppLogger(owner);
    }

    public void info(String event, Map<String, Object> fields) {
        log.atInfo().addKeyValue("correlationId", MDC.get(CorrelationId.KEY)).setMessage(event)
                .addKeyValue("fields", fields).log();
    }

    public void error(String event, Throwable cause, Map<String, Object> fields) {
        log.atError().addKeyValue("correlationId", MDC.get(CorrelationId.KEY)).setMessage(event)
                .addKeyValue("fields", fields).setCause(cause).log();
    }
}

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader(CorrelationId.HEADER)).orElseGet(() -> UUID.randomUUID().toString());
        MDC.put(CorrelationId.KEY, id);
        res.setHeader(CorrelationId.HEADER, id);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.remove(CorrelationId.KEY);
        }
    }
}

private static final AppLogger log = AppLogger.of(OrderService.class);

log.info("order created", Map.of("orderId", order.id()));
\`\`\`

### 6. Centralized REST client
Bad
\`\`\`java
public Rate fetchRate(String currency) {
    RestClient client = RestClient.create("https://rates.internal");
    return client.get().uri("/rates/{c}", currency).retrieve().body(Rate.class);
}
\`\`\`
Good
\`\`\`java
@Configuration
public class HttpClients {
    @Bean
    RestClient ratesClient(RatesProperties props, RestClient.Builder builder) {
        return builder.baseUrl(props.baseUrl())
                .defaultStatusHandler(HttpStatusCode::isError, (req, res) -> {
                    throw new RatesUnavailable(res.getStatusCode());
                })
                .build();
    }
}

@Component
public class RatesGateway {
    private final RestClient ratesClient;

    public RatesGateway(RestClient ratesClient) {
        this.ratesClient = ratesClient;
    }

    public Rate fetchRate(String currency) {
        return ratesClient.get().uri("/rates/{c}", currency).retrieve().body(Rate.class);
    }
}
\`\`\`

### 7. Configuration
Bad
\`\`\`java
String url = System.getenv("RATES_URL");
int timeout = Integer.parseInt(System.getenv("RATES_TIMEOUT"));
\`\`\`
Good
\`\`\`java
@ConfigurationProperties("rates")
public record RatesProperties(URI baseUrl, Duration timeout) {}
\`\`\`

### 8. Separation of concerns
Bad
\`\`\`java
@RestController
public class OrderController {
    private final JdbcTemplate jdbc;

    @PostMapping("/orders")
    public void create(@RequestBody Map<String, Object> body) {
        jdbc.update("insert into orders(id, total) values (?, ?)", body.get("id"), body.get("total"));
    }
}
\`\`\`
Good
\`\`\`java
@RestController
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/orders")
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        return OrderResponse.from(service.create(request.toCommand()));
    }
}
\`\`\`

### 9. Error handling in one place
Bad
\`\`\`java
@GetMapping("/orders/{id}")
public ResponseEntity<?> get(@PathVariable String id) {
    try {
        return ResponseEntity.ok(service.get(id));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
}
\`\`\`
Good
\`\`\`java
@GetMapping("/orders/{id}")
public OrderResponse get(@PathVariable String id) {
    return OrderResponse.from(service.get(id));
}

@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(OrderNotFound.class)
    ProblemDetail notFound(OrderNotFound e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }
}
\`\`\`

### 10. Swallowed exception
Bad
\`\`\`java
try {
    gateway.charge(payment);
} catch (Exception e) {
}
\`\`\`
Good
\`\`\`java
try {
    gateway.charge(payment);
} catch (GatewayTimeout e) {
    throw new PaymentFailed(payment.id(), e);
}
\`\`\`

### 11. Clock
Bad
\`\`\`java
public boolean isExpired(Token token) {
    return token.expiresAt().isBefore(Instant.now());
}
\`\`\`
Good
\`\`\`java
public boolean isExpired(Token token) {
    return token.expiresAt().isBefore(clock.instant());
}
\`\`\`

### 12. Interface at the boundary
Bad
\`\`\`java
@Service
public class CheckoutService {
    private final StripeClient stripe = new StripeClient();
}
\`\`\`
Good
\`\`\`java
public interface PaymentGateway {
    Receipt charge(Payment payment);
}

@Service
public class CheckoutService {
    private final PaymentGateway gateway;

    public CheckoutService(PaymentGateway gateway) {
        this.gateway = gateway;
    }
}
\`\`\`

### 13. DRY
Bad
\`\`\`java
BigDecimal invoiceTotal = items.stream().map(i -> i.price().multiply(BigDecimal.valueOf(i.qty()))).reduce(BigDecimal.ZERO, BigDecimal::add);
BigDecimal cartTotal = lines.stream().map(l -> l.price().multiply(BigDecimal.valueOf(l.qty()))).reduce(BigDecimal.ZERO, BigDecimal::add);
\`\`\`
Good
\`\`\`java
public record LineItem(BigDecimal price, int qty) {
    BigDecimal subtotal() {
        return price.multiply(BigDecimal.valueOf(qty));
    }

    static BigDecimal total(List<LineItem> items) {
        return items.stream().map(LineItem::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
\`\`\`

### 14. SQL
Bad
\`\`\`java
jdbc.query("select * from orders where customer_id = '" + customerId + "'", mapper);
\`\`\`
Good
\`\`\`java
public interface OrderRepository extends ListCrudRepository<Order, String> {
    @Query("""
            select id, total
            from orders
            where customer_id = :customerId
            """)
    List<Order> findByCustomer(String customerId);
}
\`\`\`

### 15. Immutable collections
Bad
\`\`\`java
List<String> roles = new ArrayList<>();
roles.add("admin");
roles.add("user");
return roles;
\`\`\`
Good
\`\`\`java
return List.of("admin", "user");
\`\`\`
`,Er=`# kotlin stack

## Stack
* Kotlin 2.x
* Java 25
* Gradle wrapper (\`./gradlew\`)
* Spring Boot 4.2.0
* Postgres
* HikariCP
* Proper types and modular code

## Idiomatic Kotlin
* Use \`data class\` for value objects and DTOs, with \`val\` fields.
* Use \`sealed interface\` plus \`when\` for closed sets of cases. No \`else\` branch when the \`when\` is exhaustive.
* Use nullable types (\`T?\`) with \`?.\`, \`?:\` and \`let\`. Never \`!!\`.
* Use expression bodies for short functions.
* Use \`val\` everywhere, \`var\` only when a value must change.
* Use \`require\` and \`check\` for preconditions.
* Use named and default arguments instead of overloads and builders.
* Use \`List\`, \`Map\`, \`Set\` (read only) in signatures, never \`MutableList\` unless the caller must mutate.
* Use \`@JvmInline value class\` for typed IDs.

## Principles in Kotlin
* Separation of concerns: controller, service and repository in the same feature package, each with one job.
* DRY: shared logic goes into a member function, an extension function or a top level function in the feature package.
* Interfaces: outbound ports are Kotlin interfaces injected through the primary constructor.

## Centralization rules in Kotlin
* Logging: one centralized \`AppLogger\` class is the only way to log. It wraps SLF4J and always adds the common fields: correlation id, request path, user id and service name, taken from the MDC. A servlet filter reads or creates the \`X-Correlation-Id\` header, puts it in the MDC and clears it at the end of the request. The \`RestClient\` bean forwards the same header on outbound calls. No \`println\`, no \`LoggerFactory.getLogger\` outside \`AppLogger\`.
* HTTP client: one \`RestClient\` bean in a \`@Configuration\` class. Every outbound REST call uses it through a gateway class.
* Config: one \`@ConfigurationProperties\` data class per area. No \`System.getenv\` in the code.
* Errors: one \`@RestControllerAdvice\`.
* JSON: the Spring \`ObjectMapper\` bean with the Kotlin module. Never build a new mapper.
* Time: inject \`java.time.Clock\`.

## Bad vs Good

### 1. Data class
Bad
\`\`\`kotlin
class User {
    var id: String = ""
    var email: String = ""
}
\`\`\`
Good
\`\`\`kotlin
data class User(val id: UserId, val email: String)
\`\`\`

### 2. Null safety
Bad
\`\`\`kotlin
fun emailDomain(user: User?): String = user!!.email.split("@")[1]
\`\`\`
Good
\`\`\`kotlin
fun emailDomain(user: User?): String? = user?.email?.substringAfter("@")
\`\`\`

### 3. Sealed types
Bad
\`\`\`kotlin
fun describe(result: Any): String =
    if (result is Success) "ok \${result.value}"
    else if (result is Failure) "failed \${result.reason}"
    else "unknown"
\`\`\`
Good
\`\`\`kotlin
sealed interface Result
data class Success(val value: Int) : Result
data class Failure(val reason: String) : Result

fun describe(result: Result): String = when (result) {
    is Success -> "ok \${result.value}"
    is Failure -> "failed \${result.reason}"
}
\`\`\`

### 4. Constructor injection
Bad
\`\`\`kotlin
@Service
class OrderService {
    @Autowired
    lateinit var repository: OrderRepository
}
\`\`\`
Good
\`\`\`kotlin
@Service
class OrderService(private val repository: OrderRepository)
\`\`\`

### 5. Default arguments
Bad
\`\`\`kotlin
fun page(size: Int): Page = page(size, 0)
fun page(size: Int, offset: Int): Page = Page(size, offset)
\`\`\`
Good
\`\`\`kotlin
fun page(size: Int = 20, offset: Int = 0): Page = Page(size, offset)
\`\`\`

### 6. Typed IDs
Bad
\`\`\`kotlin
fun transfer(from: String, to: String, amount: Long)
\`\`\`
Good
\`\`\`kotlin
@JvmInline value class AccountId(val value: String)

fun transfer(from: AccountId, to: AccountId, amount: Money)
\`\`\`

### 7. Logging
Bad
\`\`\`kotlin
println("payment failed for $orderId")
\`\`\`
\`\`\`kotlin
private val log = LoggerFactory.getLogger(PaymentService::class.java)

log.warn("payment failed orderId={}", orderId.value)
\`\`\`
Good
\`\`\`kotlin
class AppLogger private constructor(private val log: Logger) {
    fun info(event: String, vararg fields: Pair<String, Any?>) =
        log.atInfo().withCommon().setMessage(event).addKeyValue("fields", mapOf(*fields)).log()

    fun error(event: String, cause: Throwable, vararg fields: Pair<String, Any?>) =
        log.atError().withCommon().setMessage(event).addKeyValue("fields", mapOf(*fields)).setCause(cause).log()

    private fun LoggingEventBuilder.withCommon(): LoggingEventBuilder =
        addKeyValue("correlationId", MDC.get(CorrelationId.KEY))

    companion object {
        fun of(owner: KClass<*>): AppLogger = AppLogger(LoggerFactory.getLogger(owner.java))
    }
}

@Component
class CorrelationIdFilter : OncePerRequestFilter() {
    override fun doFilterInternal(req: HttpServletRequest, res: HttpServletResponse, chain: FilterChain) {
        val id = req.getHeader(CorrelationId.HEADER) ?: UUID.randomUUID().toString()
        MDC.put(CorrelationId.KEY, id)
        res.setHeader(CorrelationId.HEADER, id)
        try {
            chain.doFilter(req, res)
        } finally {
            MDC.remove(CorrelationId.KEY)
        }
    }
}

class PaymentService {
    private val log = AppLogger.of(PaymentService::class)

    fun fail(orderId: OrderId) = log.info("payment failed", "orderId" to orderId.value)
}
\`\`\`

### 8. Centralized REST client
Bad
\`\`\`kotlin
fun stock(sku: String): Stock =
    RestClient.create("https://stock.internal").get().uri("/stock/$sku").retrieve().body(Stock::class.java)!!
\`\`\`
Good
\`\`\`kotlin
@Configuration
class HttpClients {
    @Bean
    fun stockClient(props: StockProperties, builder: RestClient.Builder): RestClient =
        builder.baseUrl(props.baseUrl.toString()).build()
}

@Component
class StockGateway(private val stockClient: RestClient) {
    fun stock(sku: Sku): Stock? =
        stockClient.get().uri("/stock/{sku}", sku.value).retrieve().body<Stock>()
}
\`\`\`

### 9. Configuration
Bad
\`\`\`kotlin
val baseUrl = System.getenv("STOCK_URL") ?: "http://localhost"
\`\`\`
Good
\`\`\`kotlin
@ConfigurationProperties("stock")
data class StockProperties(val baseUrl: URI, val timeout: Duration)
\`\`\`

### 10. Preconditions
Bad
\`\`\`kotlin
fun withdraw(amount: Long) {
    if (amount <= 0) throw IllegalArgumentException("bad amount")
}
\`\`\`
Good
\`\`\`kotlin
fun withdraw(amount: Long) {
    require(amount > 0) { "amount must be positive, was $amount" }
}
\`\`\`

### 11. Collections
Bad
\`\`\`kotlin
val names = ArrayList<String>()
for (u in users) {
    if (u.active) names.add(u.name)
}
\`\`\`
Good
\`\`\`kotlin
val names = users.filter { it.active }.map { it.name }
\`\`\`

### 12. Read only signatures
Bad
\`\`\`kotlin
fun total(items: MutableList<Item>): Money
\`\`\`
Good
\`\`\`kotlin
fun total(items: List<Item>): Money
\`\`\`

### 13. Interface at the boundary
Bad
\`\`\`kotlin
@Service
class NotificationService {
    private val smtp = SmtpClient("smtp.internal", 25)
}
\`\`\`
Good
\`\`\`kotlin
interface Mailer {
    fun send(mail: Mail)
}

@Service
class NotificationService(private val mailer: Mailer)
\`\`\`
`,Dr=`# nodejs stack

## Stack
* Node.js 26
* npm
* TypeScript 7.x
* Express.js
* Modular code and proper types

## Idiomatic Node.js and TypeScript
* \`strict: true\`, ES modules (\`"type": "module"\`), no \`require\`.
* No \`any\`. Use \`unknown\` for request bodies and parse them at the edge.
* \`async\` and \`await\` everywhere. No callbacks, no \`.then\` chains.
* Use the built in \`fetch\`, \`node:test\`, \`node:fs/promises\`, \`AbortSignal.timeout\`. Import core modules with the \`node:\` prefix.
* Express 5 forwards rejected promises to the error middleware, so handlers do not need \`try\` and \`catch\` around every call.
* One router per feature, mounted in \`app.ts\`. The \`server.ts\` file only calls \`listen\`, so tests import \`app\` without opening a port.
* \`const\` by default, \`let\` only when a value must change, never \`var\`.
* Graceful shutdown on \`SIGTERM\`: stop accepting requests, close the pool, then exit.
* Never block the event loop with sync IO (\`readFileSync\`) or heavy CPU work in a request.

## Principles in Node.js
* Separation of concerns: \`routes\` (Express), \`services\` (rules), \`repos\` (database), \`config\`, \`http\`. Services never import \`express\`.
* DRY: shared logic goes into the module that owns it. No \`utils.ts\` dumping ground.
* Interfaces: services receive repositories and gateways as typed interfaces through a factory function or constructor.

## Centralization rules in Node.js
* Logging: one centralized \`logger.ts\` module is the only way to log. It always adds the common fields: correlation id, request path, user id and service name, read from an \`AsyncLocalStorage\` request context. One Express middleware reads or creates the \`X-Correlation-Id\` header and runs the request inside that context. The shared \`http.ts\` client forwards it on outbound calls. No \`console.log\` anywhere else.
* HTTP client: one \`http.ts\` module wrapping \`fetch\` with base URL, timeout, headers and error mapping. Every outbound REST call goes through it. No raw \`fetch\` in services.
* Config: one \`config.ts\` reads \`process.env\` once at startup into a typed, frozen object. No \`process.env\` anywhere else.
* Errors: one \`AppError\` hierarchy and one Express error middleware that maps it to HTTP status.
* Validation: one parse step per route at the edge. Services receive typed values.
* Database: one pool created at startup and passed to repositories.

## Bad vs Good

### 1. any request body
Bad
\`\`\`ts
router.post("/orders", async (req, res) => {
  const order = await service.create(req.body as any);
  res.json(order);
});
\`\`\`
Good
\`\`\`ts
router.post("/orders", async (req, res) => {
  const input = parseNewOrder(req.body);
  res.status(201).json(await service.create(input));
});
\`\`\`

### 2. Callbacks
Bad
\`\`\`ts
fs.readFile(path, "utf8", (err, data) => {
  if (err) throw err;
  handle(data);
});
\`\`\`
Good
\`\`\`ts
import { readFile } from "node:fs/promises";

const data = await readFile(path, "utf8");
handle(data);
\`\`\`

### 3. Express in services
Bad
\`\`\`ts
export async function createOrder(req: Request, res: Response) {
  const result = await db.query("insert into orders(total) values ($1) returning *", [req.body.total]);
  res.json(result.rows[0]);
}
\`\`\`
Good
\`\`\`ts
export function orderService(repo: OrderRepo, clock: Clock) {
  return {
    create: (input: NewOrder): Promise<Order> => repo.insert({ ...input, createdAt: clock.now() }),
  };
}
\`\`\`

### 4. Errors mapped in one place
Bad
\`\`\`ts
router.get("/orders/:id", async (req, res) => {
  try {
    res.json(await service.get(req.params.id));
  } catch (e) {
    res.status(500).send(String(e));
  }
});
\`\`\`
Good
\`\`\`ts
router.get("/orders/:id", async (req, res) => {
  res.json(await service.get(req.params.id));
});

export class AppError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  logger.error("unhandled error", { err });
  res.status(500).json({ error: "internal error" });
};
\`\`\`

### 5. Centralized HTTP client
Bad
\`\`\`ts
export async function getRate(currency: string) {
  const res = await fetch(\`https://rates.internal/rates/\${currency}\`);
  return res.json();
}
\`\`\`
Good
\`\`\`ts
export function httpClient(baseUrl: string, timeoutMs: number) {
  return {
    async getJson<T>(path: string, parse: (raw: unknown) => T): Promise<T> {
      const res = await fetch(new URL(path, baseUrl), {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { [CORRELATION_HEADER]: correlationId() },
      });
      if (!res.ok) throw new AppError(502, \`upstream \${path} returned \${res.status}\`);
      return parse(await res.json());
    },
  };
}

export type HttpClient = ReturnType<typeof httpClient>;

export function ratesGateway(http: HttpClient) {
  return {
    rate: (currency: Currency) => http.getJson(\`/rates/\${currency}\`, parseRate),
  };
}
\`\`\`

### 6. Configuration
Bad
\`\`\`ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
\`\`\`
Good
\`\`\`ts
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(\`\${name} is required\`);
  return value;
}

export const config = Object.freeze({
  databaseUrl: required("DATABASE_URL"),
  port: Number(process.env.PORT ?? 3000),
  ratesUrl: required("RATES_URL"),
});
\`\`\`

### 7. Logging
Bad
\`\`\`ts
console.log("order created", order.id);
\`\`\`
Good
\`\`\`ts
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export const CORRELATION_HEADER = "x-correlation-id";

type RequestContext = { readonly correlationId: string; readonly path: string; userId?: string };
type Fields = Readonly<Record<string, unknown>>;

const storage = new AsyncLocalStorage<RequestContext>();

export function correlationId(): string {
  return storage.getStore()?.correlationId ?? randomUUID();
}

export const correlationMiddleware: RequestHandler = (req, res, next) => {
  const id = req.header(CORRELATION_HEADER) ?? randomUUID();
  res.setHeader(CORRELATION_HEADER, id);
  storage.run({ correlationId: id, path: req.path }, next);
};

function write(level: "info" | "warn" | "error", event: string, fields: Fields): void {
  const ctx = storage.getStore();
  const entry = {
    time: new Date().toISOString(),
    level,
    event,
    service: config.serviceName,
    correlationId: ctx?.correlationId,
    path: ctx?.path,
    userId: ctx?.userId,
    ...fields,
  };
  process.stdout.write(\`\${JSON.stringify(entry)}\\n\`);
}

export const logger = {
  info: (event: string, fields: Fields = {}) => write("info", event, fields),
  warn: (event: string, fields: Fields = {}) => write("warn", event, fields),
  error: (event: string, fields: Fields = {}) => write("error", event, fields),
};
\`\`\`
\`\`\`ts
logger.info("order created", { orderId: order.id });
\`\`\`

### 8. Blocking the event loop
Bad
\`\`\`ts
router.get("/report", (_req, res) => {
  res.send(fs.readFileSync("report.csv", "utf8"));
});
\`\`\`
Good
\`\`\`ts
router.get("/report", async (_req, res) => {
  res.type("text/csv").send(await readFile(reportPath, "utf8"));
});
\`\`\`

### 9. App and server split
Bad
\`\`\`ts
const app = express();
app.use("/orders", ordersRouter);
app.listen(3000);
export default app;
\`\`\`
Good
\`\`\`ts
export function createApp(deps: Deps): Express {
  const app = express();
  app.use(correlationMiddleware);
  app.use(express.json());
  app.use("/orders", ordersRouter(deps.orders));
  app.use(errorHandler);
  return app;
}
\`\`\`
\`\`\`ts
const deps = buildDeps(config);
const server = createApp(deps).listen(config.port);
process.on("SIGTERM", () => server.close(() => deps.pool.end()));
\`\`\`

### 10. Interfaces for repositories
Bad
\`\`\`ts
import { pool } from "../db.js";

export async function getUser(id: string) {
  return (await pool.query("select * from users where id = $1", [id])).rows[0];
}
\`\`\`
Good
\`\`\`ts
export interface UserRepo {
  find(id: UserId): Promise<User | undefined>;
}

export function userService(users: UserRepo) {
  return {
    async get(id: UserId): Promise<User> {
      const user = await users.find(id);
      if (!user) throw new AppError(404, \`user \${id} not found\`);
      return user;
    },
  };
}
\`\`\`

### 11. Promise chains
Bad
\`\`\`ts
getUser(id).then((u) => getOrders(u.id)).then((orders) => res.json(orders)).catch(next);
\`\`\`
Good
\`\`\`ts
const user = await getUser(id);
res.json(await getOrders(user.id));
\`\`\`

### 12. Parallel independent calls
Bad
\`\`\`ts
const user = await users.get(id);
const prefs = await prefsRepo.get(id);
\`\`\`
Good
\`\`\`ts
const [user, prefs] = await Promise.all([users.get(id), prefsRepo.get(id)]);
\`\`\`

### 13. Tests with node:test
Bad
\`\`\`ts
test("works", async () => {
  const res = await fetch("http://localhost:3000/orders/1");
  assert.ok(res);
});
\`\`\`
Good
\`\`\`ts
import { test } from "node:test";
import assert from "node:assert/strict";

test("missing order returns 404 so clients can tell it apart from a server failure", async () => {
  const app = createApp(fakeDeps({ orders: [] }));
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  const res = await fetch(\`http://127.0.0.1:\${port}/orders/nope\`);
  server.close();
  assert.equal(res.status, 404);
});
\`\`\`
`,Or=`# python stack

## Stack
* Python 3.15.x
* uv
* ty for type checking
* Granian as the server
* Proper type hints and modular code
* Tests

## Idiomatic Python
* Type hints on every function signature and every class attribute. \`ty check\` must pass.
* Use builtin generics and unions: \`list[str]\`, \`dict[str, int]\`, \`str | None\`. No \`typing.List\`, no \`Optional\`.
* Use \`@dataclass(frozen=True, slots=True)\` for value objects.
* Use \`enum.Enum\` or \`StrEnum\` for closed sets of values, and \`match\` for branching on them.
* Use \`typing.Protocol\` for interfaces.
* Use comprehensions for simple transformations, plain loops when there are side effects.
* Use context managers (\`with\`) for every resource: files, connections, locks.
* Use \`pathlib.Path\`, never string paths with \`os.path\`.
* Use f-strings for formatting, except in log calls.
* Raise specific exceptions, never bare \`except:\` or \`except Exception: pass\`.
* No mutable default arguments.
* \`uv add\` for dependencies, \`uv run\` to run anything. No \`pip install\`.

## Principles in Python
* Separation of concerns: \`api\` (ASGI app, routes), \`domain\` (rules, dataclasses), \`repo\` (database), \`config\`. Domain imports nothing from \`api\`.
* DRY: shared logic goes into a function in the owning module. No \`utils.py\` dumping ground.
* Interfaces: \`Protocol\` classes for repositories, gateways and clocks. Pass implementations into constructors.

## Centralization rules in Python
* Logging: one centralized \`log.py\` module is the only place that configures logging. It installs a filter that always adds the common fields: correlation id, request path, user id and service name, read from a \`contextvars.ContextVar\`. An ASGI middleware reads or creates the \`X-Correlation-Id\` header and sets the context var for the request. The shared HTTP client forwards it on outbound calls. Modules get their logger with \`log.get(__name__)\`. No \`print\`, no \`logging.basicConfig\` anywhere else.
* HTTP client: one \`HttpClient\` class built on the standard \`urllib.request\`, with base URL, timeout, correlation id header and error mapping. No extra HTTP library. Every outbound REST call goes through it. Never call \`requests.get\` or \`urlopen\` across the code.
* Config: one frozen \`Settings\` dataclass built from the environment at startup. No \`os.environ\` reads deep in the code.
* Errors: one exception hierarchy per app (\`AppError\` base), mapped to HTTP status in one place.
* Database: one connection pool created at startup and passed to repositories.
* Time: inject a \`Clock\` protocol or a \`Callable[[], datetime]\`.

## Bad vs Good

### 1. Type hints
Bad
\`\`\`python
def total(items):
    return sum(i["price"] * i["qty"] for i in items)
\`\`\`
Good
\`\`\`python
def total(items: list[LineItem]) -> Decimal:
    return sum((i.subtotal() for i in items), Decimal(0))
\`\`\`

### 2. Dataclass instead of dict
Bad
\`\`\`python
user = {"id": "u1", "email": "a@b.com", "active": True}
\`\`\`
Good
\`\`\`python
@dataclass(frozen=True, slots=True)
class User:
    id: UserId
    email: str
    active: bool
\`\`\`

### 3. Modern typing
Bad
\`\`\`python
from typing import List, Optional, Dict

def find(ids: List[str]) -> Optional[Dict[str, int]]: ...
\`\`\`
Good
\`\`\`python
def find(ids: list[str]) -> dict[str, int] | None: ...
\`\`\`

### 4. Enum and match
Bad
\`\`\`python
def fee(kind: str) -> int:
    if kind == "express":
        return 20
    elif kind == "standard":
        return 5
    return 0
\`\`\`
Good
\`\`\`python
class Shipping(StrEnum):
    EXPRESS = "express"
    STANDARD = "standard"


def fee(kind: Shipping) -> int:
    match kind:
        case Shipping.EXPRESS:
            return 20
        case Shipping.STANDARD:
            return 5
\`\`\`

### 5. Protocol at the boundary
Bad
\`\`\`python
class OrderService:
    def __init__(self) -> None:
        self.db = psycopg.connect("postgresql://localhost/app")
\`\`\`
Good
\`\`\`python
class OrderRepository(Protocol):
    def save(self, order: Order) -> None: ...
    def get(self, order_id: OrderId) -> Order | None: ...


class OrderService:
    def __init__(self, repo: OrderRepository, clock: Clock) -> None:
        self._repo = repo
        self._clock = clock
\`\`\`

### 6. Mutable default argument
Bad
\`\`\`python
def add_tag(tag: str, tags: list[str] = []) -> list[str]:
    tags.append(tag)
    return tags
\`\`\`
Good
\`\`\`python
def add_tag(tag: str, tags: tuple[str, ...] = ()) -> tuple[str, ...]:
    return (*tags, tag)
\`\`\`

### 7. Swallowed exception
Bad
\`\`\`python
try:
    gateway.charge(payment)
except:
    pass
\`\`\`
Good
\`\`\`python
try:
    gateway.charge(payment)
except GatewayTimeout as e:
    raise PaymentFailed(payment.id) from e
\`\`\`

### 8. Logging
Bad
\`\`\`python
print(f"order {order.id} created")
\`\`\`
\`\`\`python
logging.basicConfig(level=logging.INFO)
logging.info("order created id=%s", order.id)
\`\`\`
Good
\`\`\`python
HEADER = "x-correlation-id"


@dataclass(frozen=True, slots=True)
class RequestContext:
    correlation_id: str
    path: str
    user_id: str | None = None


_current: ContextVar[RequestContext | None] = ContextVar("request_context", default=None)


class _ContextFilter(logging.Filter):
    def __init__(self, service: str) -> None:
        super().__init__()
        self._service = service

    def filter(self, record: logging.LogRecord) -> bool:
        ctx = _current.get()
        record.correlation_id = ctx.correlation_id if ctx else "-"
        record.path = ctx.path if ctx else "-"
        record.user_id = ctx.user_id if ctx and ctx.user_id else "-"
        record.service = self._service
        return True


def setup(service: str) -> None:
    handler = logging.StreamHandler()
    handler.addFilter(_ContextFilter(service))
    handler.setFormatter(logging.Formatter(
        "%(asctime)s %(levelname)s %(service)s %(correlation_id)s %(path)s %(user_id)s %(name)s %(message)s"
    ))
    logging.basicConfig(level=logging.INFO, handlers=[handler])


def get(name: str) -> logging.Logger:
    return logging.getLogger(name)


def correlation_id() -> str:
    ctx = _current.get()
    return ctx.correlation_id if ctx else uuid.uuid4().hex


def correlation_middleware(app: ASGIApp) -> ASGIApp:
    async def wrapped(scope: Scope, receive: Receive, send: Send) -> None:
        headers = dict(scope.get("headers", []))
        incoming = headers.get(HEADER.encode())
        cid = incoming.decode() if incoming else uuid.uuid4().hex
        token = _current.set(RequestContext(correlation_id=cid, path=scope.get("path", "")))
        try:
            await app(scope, receive, send)
        finally:
            _current.reset(token)
    return wrapped
\`\`\`
\`\`\`python
logger = log.get(__name__)

logger.info("order created id=%s", order.id)
\`\`\`

### 9. Centralized HTTP client
Bad
\`\`\`python
def rate(currency: str) -> dict:
    return json.load(urllib.request.urlopen(f"https://rates.internal/rates/{currency}"))
\`\`\`
Good
\`\`\`python
class HttpClient:
    def __init__(self, base_url: str, timeout: float) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

    def get_json(self, path: str) -> object:
        request = urllib.request.Request(
            f"{self._base_url}{path}",
            headers={"Accept": "application/json", log.HEADER: log.correlation_id()},
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout) as response:
                return json.load(response)
        except urllib.error.HTTPError as e:
            raise UpstreamError(path, e.code) from e


class RatesGateway:
    def __init__(self, http: HttpClient) -> None:
        self._http = http

    def rate(self, currency: Currency) -> Rate:
        return Rate.from_json(self._http.get_json(f"/rates/{currency.value}"))
\`\`\`

### 10. Configuration
Bad
\`\`\`python
def connect() -> Connection:
    return psycopg.connect(os.environ["DATABASE_URL"])
\`\`\`
Good
\`\`\`python
@dataclass(frozen=True, slots=True)
class Settings:
    database_url: str
    port: int

    @classmethod
    def from_env(cls, env: Mapping[str, str]) -> "Settings":
        return cls(database_url=env["DATABASE_URL"], port=int(env.get("PORT", "8000")))
\`\`\`

### 11. Context managers
Bad
\`\`\`python
f = open(path)
data = f.read()
f.close()
\`\`\`
Good
\`\`\`python
data = Path(path).read_text()
\`\`\`

### 12. Pathlib
Bad
\`\`\`python
report = os.path.join(os.path.dirname(__file__), "reports", name + ".csv")
\`\`\`
Good
\`\`\`python
report = Path(__file__).parent / "reports" / f"{name}.csv"
\`\`\`

### 13. Comprehension
Bad
\`\`\`python
names = []
for u in users:
    if u.active:
        names.append(u.name)
\`\`\`
Good
\`\`\`python
names = [u.name for u in users if u.active]
\`\`\`

### 14. Errors mapped in one place
Bad
\`\`\`python
def get_order(order_id: str) -> tuple[int, dict[str, object]]:
    try:
        return 200, service.get(order_id).to_json()
    except Exception as e:
        return 500, {"error": str(e)}
\`\`\`
Good
\`\`\`python
class AppError(Exception):
    status = 500


class NotFound(AppError):
    status = 404


class Invalid(AppError):
    status = 400


def to_response(exc: AppError) -> tuple[int, dict[str, object]]:
    logger.warning("request failed status=%s error=%s", exc.status, exc)
    return exc.status, {"error": str(exc)}
\`\`\`

### 15. Running tools
Bad
\`\`\`bash
pip install granian
python -m pytest
\`\`\`
Good
\`\`\`bash
uv add granian
uv run pytest
uv run ty check
\`\`\`
`,kr=`# rust stack

## Stack
* Rust 1.99.x, edition 2024
* Tokio
* Async code, functions return \`Result\`
* Traits and modular code

## Build mode
* Debug builds are fine while testing and troubleshooting.
* Once the app is done and working, everything must be in release mode: \`cargo build --release\`, \`cargo run --release\`, \`cargo test --release\`.
* Every script (build, run, start, test, install) must use release mode. No script may use a debug build.
* If debug was used, clean it before finishing: delete \`target/debug\` (or run \`cargo clean\` and rebuild in release). Debug leftovers compound the disk size, so never leave them behind.
* Fix the problems found in debug, then confirm the final build, scripts and tests all run in release and no debug artifacts remain.

## Idiomatic Rust
* Every fallible function returns \`Result<T, E>\`. Use \`?\` to propagate.
* No \`unwrap()\` or \`expect()\` outside tests and \`main\` startup.
* One error \`enum\` per module, implementing \`std::error::Error\` and \`Display\`, with \`From\` impls so \`?\` converts.
* Borrow (\`&str\`, \`&[T]\`) in parameters, own (\`String\`, \`Vec<T>\`) in struct fields.
* Use iterators and combinators instead of index loops.
* Use newtypes (\`struct UserId(String)\`) for typed IDs.
* Use \`enum\` for closed sets of cases and exhaustive \`match\`.
* Derive the common traits (\`Debug\`, \`Clone\`, \`PartialEq\`) where they make sense.
* Never block inside async code. Use \`tokio::fs\`, \`tokio::time\` and \`spawn_blocking\` for blocking work.
* Share state with \`Arc\`. Avoid \`Mutex\` when message passing or ownership works.
* Run \`cargo clippy\` and \`cargo fmt\` before saying it is done.

## Principles in Rust
* Separation of concerns: one module per concern (\`http\`, \`domain\`, \`repo\`, \`config\`). \`domain\` does not import \`http\` types.
* DRY: shared behavior goes into a trait impl or a function in the owning module.
* Interfaces: traits at every boundary. Services are generic over the trait (\`OrderService<R: OrderRepository>\`), so tests plug in a fake.

## Centralization rules in Rust
* Logging: one centralized \`telemetry\` module is the only place that sets up logging. It installs the \`tracing\` subscriber once and exposes \`request_span\`, which always carries the common fields: correlation id, request path, user id and service name. Every request runs inside that span, so every \`tracing::info!\` below it gets the fields. The entry point reads or creates the \`X-Correlation-Id\` header, and the shared \`HttpClient\` forwards it on outbound calls. No \`println!\` or \`eprintln!\` for logs, no second subscriber.
* HTTP client: one \`reqwest::Client\` built once with timeouts and base URL, wrapped in a struct, shared through \`Arc\` or cloned (it is cheap). Never \`reqwest::get\` or \`Client::new()\` per call.
* Config: one \`Config\` struct loaded once in \`main\` and passed down.
* Errors: one error enum per module, one place maps them to HTTP responses or exit codes.
* Database: one pool created in \`main\`, passed to repositories.
* Time: a \`Clock\` trait injected where time matters.

## Bad vs Good

### 1. Unwrap
Bad
\`\`\`rust
fn port() -> u16 {
    std::env::var("PORT").unwrap().parse().unwrap()
}
\`\`\`
Good
\`\`\`rust
fn port() -> Result<u16, ConfigError> {
    let raw = std::env::var("PORT").map_err(|_| ConfigError::Missing("PORT"))?;
    raw.parse().map_err(|_| ConfigError::Invalid("PORT"))
}
\`\`\`

### 2. Error enum
Bad
\`\`\`rust
fn load(path: &str) -> Result<Settings, String> {
    let text = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&text).map_err(|e| e.to_string())
}
\`\`\`
Good
\`\`\`rust
#[derive(Debug)]
pub enum LoadError {
    Io(std::io::Error),
    Parse(serde_json::Error),
}

impl From<std::io::Error> for LoadError {
    fn from(e: std::io::Error) -> Self {
        LoadError::Io(e)
    }
}

impl From<serde_json::Error> for LoadError {
    fn from(e: serde_json::Error) -> Self {
        LoadError::Parse(e)
    }
}

pub async fn load(path: &Path) -> Result<Settings, LoadError> {
    let text = tokio::fs::read_to_string(path).await?;
    Ok(serde_json::from_str(&text)?)
}
\`\`\`

### 3. Borrow in parameters
Bad
\`\`\`rust
fn greet(name: String) -> String {
    format!("hello {name}")
}
\`\`\`
Good
\`\`\`rust
fn greet(name: &str) -> String {
    format!("hello {name}")
}
\`\`\`

### 4. Iterators
Bad
\`\`\`rust
let mut total = 0;
for i in 0..items.len() {
    if items[i].active {
        total += items[i].price;
    }
}
\`\`\`
Good
\`\`\`rust
let total: u64 = items.iter().filter(|i| i.active).map(|i| i.price).sum();
\`\`\`

### 5. Newtypes
Bad
\`\`\`rust
fn transfer(from: String, to: String, cents: i64) -> Result<(), BankError>
\`\`\`
Good
\`\`\`rust
pub struct AccountId(String);
pub struct Cents(i64);

fn transfer(from: &AccountId, to: &AccountId, amount: Cents) -> Result<(), BankError>
\`\`\`

### 6. Exhaustive match
Bad
\`\`\`rust
fn fee(kind: &str) -> u32 {
    if kind == "express" { 20 } else if kind == "standard" { 5 } else { 0 }
}
\`\`\`
Good
\`\`\`rust
pub enum Shipping {
    Express,
    Standard,
}

fn fee(kind: Shipping) -> u32 {
    match kind {
        Shipping::Express => 20,
        Shipping::Standard => 5,
    }
}
\`\`\`

### 7. Blocking in async
Bad
\`\`\`rust
async fn read_report(path: &Path) -> Result<String, std::io::Error> {
    std::thread::sleep(Duration::from_secs(1));
    std::fs::read_to_string(path)
}
\`\`\`
Good
\`\`\`rust
async fn read_report(path: &Path) -> Result<String, std::io::Error> {
    tokio::time::sleep(Duration::from_secs(1)).await;
    tokio::fs::read_to_string(path).await
}
\`\`\`

### 8. Logging
Bad
\`\`\`rust
println!("order {} created", order.id);
\`\`\`
\`\`\`rust
tracing::info!("order {} created", order.id);
\`\`\`
Good
\`\`\`rust
pub const CORRELATION_HEADER: &str = "X-Correlation-Id";

pub fn init(service: &'static str) {
    tracing_subscriber::fmt().json().with_current_span(true).init();
    tracing::info!(service, "telemetry ready");
}

pub fn correlation_id(incoming: Option<&str>) -> String {
    incoming.map(str::to_owned).unwrap_or_else(|| Uuid::new_v4().to_string())
}

pub fn request_span(correlation_id: &str, path: &str, user_id: Option<&str>) -> Span {
    tracing::info_span!("request", correlation_id, path, user_id, service = SERVICE_NAME)
}
\`\`\`
\`\`\`rust
async fn handle(req: Request) -> Result<Response, AppError> {
    let id = telemetry::correlation_id(req.header(telemetry::CORRELATION_HEADER));
    let span = telemetry::request_span(&id, req.path(), req.user_id());
    route(req).instrument(span).await
}

tracing::info!(order_id = %order.id, "order created");
\`\`\`

### 9. Centralized HTTP client
Bad
\`\`\`rust
async fn rate(currency: &str) -> Result<Rate, reqwest::Error> {
    reqwest::get(format!("https://rates.internal/rates/{currency}")).await?.json().await
}
\`\`\`
Good
\`\`\`rust
#[derive(Clone)]
pub struct HttpClient {
    inner: reqwest::Client,
    base_url: Url,
}

impl HttpClient {
    pub fn new(base_url: Url, timeout: Duration) -> Result<Self, HttpError> {
        let inner = reqwest::Client::builder().timeout(timeout).build()?;
        Ok(Self { inner, base_url })
    }

    pub async fn get_json<T: DeserializeOwned>(&self, path: &str) -> Result<T, HttpError> {
        let url = self.base_url.join(path)?;
        Ok(self.inner.get(url).send().await?.error_for_status()?.json().await?)
    }
}

pub struct RatesGateway {
    http: HttpClient,
}

impl RatesGateway {
    pub async fn rate(&self, currency: &Currency) -> Result<Rate, HttpError> {
        self.http.get_json(&format!("rates/{}", currency.code())).await
    }
}
\`\`\`

### 10. Trait at the boundary
Bad
\`\`\`rust
pub struct OrderService {
    pool: PgPool,
}

impl OrderService {
    pub async fn place(&self, order: Order) -> Result<(), sqlx::Error> {
        sqlx::query("insert into orders values ($1)").bind(&order.id).execute(&self.pool).await?;
        Ok(())
    }
}
\`\`\`
Good
\`\`\`rust
pub trait OrderRepository: Send + Sync {
    async fn save(&self, order: &Order) -> Result<(), RepoError>;
}

pub struct OrderService<R: OrderRepository> {
    repo: R,
}

impl<R: OrderRepository> OrderService<R> {
    pub async fn place(&self, order: Order) -> Result<(), RepoError> {
        self.repo.save(&order).await
    }
}
\`\`\`

### 11. Shared state
Bad
\`\`\`rust
static mut COUNTER: u64 = 0;
\`\`\`
Good
\`\`\`rust
#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub http: HttpClient,
    pub hits: Arc<AtomicU64>,
}
\`\`\`

### 12. Option combinators
Bad
\`\`\`rust
let name = match user {
    Some(u) => match u.nickname {
        Some(n) => n,
        None => u.name,
    },
    None => "guest".to_string(),
};
\`\`\`
Good
\`\`\`rust
let name = user
    .map(|u| u.nickname.unwrap_or(u.name))
    .unwrap_or_else(|| "guest".to_string());
\`\`\`

### 13. Clone to silence the borrow checker
Bad
\`\`\`rust
fn total(orders: Vec<Order>) -> u64 {
    orders.clone().iter().map(|o| o.amount).sum()
}
\`\`\`
Good
\`\`\`rust
fn total(orders: &[Order]) -> u64 {
    orders.iter().map(|o| o.amount).sum()
}
\`\`\`

### 14. Configuration
Bad
\`\`\`rust
async fn connect() -> Result<PgPool, sqlx::Error> {
    PgPool::connect(&std::env::var("DATABASE_URL").unwrap()).await
}
\`\`\`
Good
\`\`\`rust
pub struct Config {
    pub database_url: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Ok(Self {
            database_url: env_var("DATABASE_URL")?,
            port: env_var("PORT")?.parse().map_err(|_| ConfigError::Invalid("PORT"))?,
        })
    }
}
\`\`\`

### 15. Release scripts
Bad
\`\`\`bash
cargo build
./target/debug/app
\`\`\`
Good
\`\`\`bash
cargo build --release
./target/release/app
\`\`\`
`,Ar=`# scala stack

## Stack
* Scala 3.x
* sbt
* Netty
* Postgres
* HikariCP
* Spring Boot 4.2.0
* Proper types and modular code

## Idiomatic Scala
* Use Scala 3 syntax: \`enum\`, \`given\` and \`using\`, \`extension\`, optional braces.
* Use \`case class\` for data and \`enum\` for closed sets of cases.
* Use \`Option\`, \`Either\` and \`Try\` instead of \`null\` and thrown exceptions in domain code.
* Use pattern matching with exhaustive \`match\`.
* Use immutable collections (\`List\`, \`Vector\`, \`Map\`) and \`val\`. No \`var\` in domain code.
* Use \`opaque type\` for typed IDs and units.
* Use \`for\` comprehensions to chain \`Option\` and \`Either\`.
* Keep functions pure. Push side effects to the edges.
* Use \`trait\` for interfaces.

## Principles in Scala
* Separation of concerns: HTTP layer, domain services and repositories in separate packages. Domain code has no Netty or Spring types.
* DRY: shared logic goes into the companion object, an \`extension\` or a small module object.
* Interfaces: outbound ports are \`trait\`s passed through the constructor.

## Centralization rules in Scala
* Logging: one centralized \`AppLogger\` is the only way to log. It wraps SLF4J and always adds the common fields: correlation id, request path, user id and service name, taken from the MDC. The HTTP entry point (Netty handler or Spring filter) reads or creates the \`X-Correlation-Id\` header, puts it in the MDC and clears it at the end of the request. The HTTP client forwards the same header on outbound calls. No \`println\`, no \`LoggerFactory.getLogger\` outside \`AppLogger\`.
* HTTP client: one client module (configured \`java.net.http.HttpClient\` or the Spring \`RestClient\` bean) wrapped in a trait. Every outbound REST call goes through it.
* Config: one typed \`AppConfig\` case class loaded at startup.
* Errors: one \`AppError\` enum, mapped to HTTP status in one place.
* Database: one HikariCP \`DataSource\`, repositories receive it.
* Time: inject \`java.time.Clock\`.

## Bad vs Good

### 1. Null
Bad
\`\`\`scala
def findUser(id: String): User =
  users.find(_.id == id).orNull
\`\`\`
Good
\`\`\`scala
def findUser(id: UserId): Option[User] =
  users.find(_.id == id)
\`\`\`

### 2. Enum
Bad
\`\`\`scala
val Pending = "PENDING"
val Paid = "PAID"
def label(status: String): String = if status == Pending then "waiting" else "done"
\`\`\`
Good
\`\`\`scala
enum Status:
  case Pending, Paid

def label(status: Status): String = status match
  case Status.Pending => "waiting"
  case Status.Paid    => "done"
\`\`\`

### 3. Errors as values
Bad
\`\`\`scala
def parseAge(s: String): Int =
  val n = s.toInt
  if n < 0 then throw IllegalArgumentException("negative")
  n
\`\`\`
Good
\`\`\`scala
def parseAge(s: String): Either[AppError, Age] =
  s.toIntOption.filter(_ >= 0).map(Age(_)).toRight(AppError.InvalidAge(s))
\`\`\`

### 4. For comprehension
Bad
\`\`\`scala
findUser(id) match
  case Some(user) =>
    findAccount(user.accountId) match
      case Some(account) => Some(account.balance)
      case None          => None
  case None => None
\`\`\`
Good
\`\`\`scala
for
  user    <- findUser(id)
  account <- findAccount(user.accountId)
yield account.balance
\`\`\`

### 5. Mutable state
Bad
\`\`\`scala
var total = 0
for item <- items do total += item.price
total
\`\`\`
Good
\`\`\`scala
items.map(_.price).sum
\`\`\`

### 6. Opaque types
Bad
\`\`\`scala
def charge(customerId: String, orderId: String, cents: Long): Unit
\`\`\`
Good
\`\`\`scala
opaque type CustomerId = String
object CustomerId:
  def apply(value: String): CustomerId = value

def charge(customerId: CustomerId, orderId: OrderId, amount: Money): Either[AppError, Receipt]
\`\`\`

### 7. Extension methods
Bad
\`\`\`scala
object MoneyUtils:
  def withTax(m: Money, rate: BigDecimal): Money = Money(m.value * (1 + rate))
\`\`\`
Good
\`\`\`scala
extension (m: Money)
  def withTax(rate: BigDecimal): Money = Money(m.value * (1 + rate))
\`\`\`

### 8. Trait at the boundary
Bad
\`\`\`scala
class OrderService:
  private val db = DriverManager.getConnection("jdbc:postgresql://localhost/app")
\`\`\`
Good
\`\`\`scala
trait OrderRepository:
  def save(order: Order): Either[AppError, Unit]
  def find(id: OrderId): Either[AppError, Option[Order]]

class OrderService(repository: OrderRepository, clock: Clock)
\`\`\`

### 9. Logging
Bad
\`\`\`scala
println(s"order $id saved")
\`\`\`
\`\`\`scala
private val log = LoggerFactory.getLogger(classOf[OrderService])

log.info("order saved id={}", id)
\`\`\`
Good
\`\`\`scala
object CorrelationId:
  val Header = "X-Correlation-Id"
  val Key = "correlationId"

  def within[A](incoming: Option[String])(body: => A): A =
    MDC.put(Key, incoming.getOrElse(UUID.randomUUID().toString))
    try body
    finally MDC.remove(Key)

final class AppLogger private (log: Logger):
  def info(event: String, fields: (String, Any)*): Unit =
    log.atInfo().addKeyValue(CorrelationId.Key, MDC.get(CorrelationId.Key))
      .addKeyValue("fields", fields.toMap).setMessage(event).log()

  def error(event: String, cause: Throwable, fields: (String, Any)*): Unit =
    log.atError().addKeyValue(CorrelationId.Key, MDC.get(CorrelationId.Key))
      .addKeyValue("fields", fields.toMap).setCause(cause).setMessage(event).log()

object AppLogger:
  def of[A](using ct: ClassTag[A]): AppLogger = AppLogger(LoggerFactory.getLogger(ct.runtimeClass))

class OrderService(repository: OrderRepository):
  private val log = AppLogger.of[OrderService]

  def save(order: Order): Either[AppError, Unit] =
    repository.save(order).map(_ => log.info("order saved", "orderId" -> order.id))
\`\`\`

### 10. Centralized HTTP client
Bad
\`\`\`scala
def price(sku: String): String =
  val client = HttpClient.newHttpClient()
  val req = HttpRequest.newBuilder(URI.create(s"https://prices.internal/$sku")).build()
  client.send(req, BodyHandlers.ofString()).body()
\`\`\`
Good
\`\`\`scala
trait HttpJson:
  def get[A: Decoder](path: String): Either[AppError, A]

final class JdkHttpJson(client: HttpClient, baseUrl: URI, timeout: Duration) extends HttpJson:
  def get[A: Decoder](path: String): Either[AppError, A] =
    val req = HttpRequest.newBuilder(baseUrl.resolve(path)).timeout(timeout).build()
    val res = client.send(req, BodyHandlers.ofString())
    if res.statusCode() == 200 then summon[Decoder[A]].decode(res.body())
    else Left(AppError.Upstream(res.statusCode()))

final class PriceGateway(http: HttpJson):
  def price(sku: Sku): Either[AppError, Price] = http.get[Price](s"/prices/\${sku.value}")
\`\`\`

### 11. Errors mapped in one place
Bad
\`\`\`scala
case Left(e) => Response(500, e.toString)
\`\`\`
Good
\`\`\`scala
enum AppError:
  case NotFound(id: String)
  case InvalidAge(raw: String)
  case Upstream(status: Int)
  case MissingConfig(key: String)

object AppError:
  def status(e: AppError): Int = e match
    case NotFound(_)      => 404
    case InvalidAge(_)    => 400
    case Upstream(_)      => 502
    case MissingConfig(_) => 500
\`\`\`

### 12. Given and using
Bad
\`\`\`scala
def save(order: Order, ds: DataSource, clock: Clock): Unit
def update(order: Order, ds: DataSource, clock: Clock): Unit
\`\`\`
Good
\`\`\`scala
class OrderRepository(using ds: DataSource, clock: Clock):
  def save(order: Order): Either[AppError, Unit]
  def update(order: Order): Either[AppError, Unit]
\`\`\`

### 13. Configuration
Bad
\`\`\`scala
val port = sys.env("PORT").toInt
\`\`\`
Good
\`\`\`scala
final case class AppConfig(port: Int, dbUrl: String, pricesUrl: URI)

object AppConfig:
  def load(env: Map[String, String]): Either[AppError, AppConfig] =
    for
      port   <- env.get("PORT").flatMap(_.toIntOption).toRight(AppError.MissingConfig("PORT"))
      db     <- env.get("DB_URL").toRight(AppError.MissingConfig("DB_URL"))
      prices <- env.get("PRICES_URL").map(URI.create).toRight(AppError.MissingConfig("PRICES_URL"))
    yield AppConfig(port, db, prices)
\`\`\`
`,jr=`# ts stack

## Stack
* TypeScript 7.x
* Bun 1.4.x
* Vite
* React 19.3.x
* TanStack 1.x for everything it covers: Router, Query, Table, Form
* Modular code and proper types

## Idiomatic TypeScript and React
* \`strict: true\` in \`tsconfig.json\`. No \`any\`, no \`as\` casts to silence errors, no \`@ts-ignore\`.
* Use \`unknown\` for untrusted input and narrow it with a parser or type guard.
* Use \`type\` for data shapes and discriminated unions for closed sets of cases, with exhaustive \`switch\` and a \`never\` check.
* Use \`readonly\` and \`as const\` for data that must not change.
* Function components only, with typed props. No class components.
* Server state lives in TanStack Query. Never \`useEffect\` plus \`fetch\` plus \`useState\` for loading data.
* Routing with TanStack Router file based routes and typed params.
* Forms with TanStack Form, tables with TanStack Table.
* Derive values during render. Do not mirror props or query data into \`useState\`.
* Custom hooks (\`useOrders\`) wrap query keys and query functions per feature.
* Named exports, no default exports except where a tool requires them.
* \`bun install\`, \`bun run\`, \`bun test\`. No npm or yarn.

## Principles in TypeScript
* Separation of concerns: \`features/<name>/\` holds \`api.ts\` (calls), \`hooks.ts\` (queries and mutations), \`components/\` (UI), \`types.ts\`. Components never call \`fetch\`.
* DRY: shared UI goes into \`components/\`, shared logic into the feature module that owns it. No \`utils.ts\` dumping ground.
* Interfaces: feature \`api.ts\` modules depend on the shared HTTP client, so tests can swap it.

## Centralization rules in TypeScript
* Logging: one centralized \`logger.ts\` module is the only way to log. It always adds the common fields: correlation id, current route, user id and app name. The correlation id is created once per session and \`http.ts\` sends it as the \`X-Correlation-Id\` header on every call, so browser logs match backend logs. No \`console.log\` anywhere else.
* HTTP client: one \`http.ts\` module with the base URL, headers, auth, JSON parsing and error mapping. Every REST call goes through it. No raw \`fetch\` in components, hooks or features.
* Config: one \`config.ts\` reads \`import.meta.env\` once and exports a typed object.
* Query keys: one key factory per feature. No string keys typed by hand at call sites.
* Errors: one \`ApiError\` class and one error boundary per route.
* Query client: one \`QueryClient\` created at the app root.

## Bad vs Good

### 1. any
Bad
\`\`\`ts
function total(items: any): number {
  return items.reduce((s: any, i: any) => s + i.price, 0);
}
\`\`\`
Good
\`\`\`ts
type LineItem = { readonly price: number; readonly qty: number };

function total(items: readonly LineItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
\`\`\`

### 2. Discriminated union
Bad
\`\`\`ts
type Payment = { kind: string; card?: string; iban?: string };
\`\`\`
Good
\`\`\`ts
type Payment =
  | { kind: "card"; card: string }
  | { kind: "bank"; iban: string };

function label(p: Payment): string {
  switch (p.kind) {
    case "card":
      return \`card \${p.card.slice(-4)}\`;
    case "bank":
      return \`bank \${p.iban}\`;
    default: {
      const unreachable: never = p;
      return unreachable;
    }
  }
}
\`\`\`

### 3. Unknown input
Bad
\`\`\`ts
const user = JSON.parse(raw) as User;
\`\`\`
Good
\`\`\`ts
function parseUser(raw: unknown): User {
  if (typeof raw === "object" && raw !== null && "id" in raw && typeof raw.id === "string" && "email" in raw && typeof raw.email === "string") {
    return { id: raw.id, email: raw.email };
  }
  throw new ApiError(422, "invalid user payload");
}
\`\`\`

### 4. Data loading
Bad
\`\`\`tsx
function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then(setOrders);
  }, []);
  return <OrderList orders={orders} />;
}
\`\`\`
Good
\`\`\`tsx
function Orders() {
  const { data } = useOrders();
  return <OrderList orders={data ?? []} />;
}
\`\`\`

### 5. Centralized HTTP client
Bad
\`\`\`ts
export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(\`https://api.internal/orders/\${id}\`, {
    headers: { Authorization: \`Bearer \${localStorage.getItem("token")}\` },
  });
  return res.json();
}
\`\`\`
Good
\`\`\`ts
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, parse: (raw: unknown) => T, init?: RequestInit): Promise<T> {
  const res = await fetch(\`\${config.apiUrl}\${path}\`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      [CORRELATION_HEADER]: currentCorrelationId(),
      ...authHeaders(),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return parse(await res.json());
}

export const http = {
  get: <T>(path: string, parse: (raw: unknown) => T) => request(path, parse),
  post: <T>(path: string, body: unknown, parse: (raw: unknown) => T) =>
    request(path, parse, { method: "POST", body: JSON.stringify(body) }),
};
\`\`\`
\`\`\`ts
export const ordersApi = {
  get: (id: OrderId) => http.get(\`/orders/\${id}\`, parseOrder),
  list: () => http.get("/orders", parseOrders),
  create: (input: NewOrder) => http.post("/orders", input, parseOrder),
};
\`\`\`

### 6. Query keys and hooks
Bad
\`\`\`tsx
useQuery({ queryKey: ["order", id], queryFn: () => ordersApi.get(id) });
useQuery({ queryKey: ["orders", id], queryFn: () => ordersApi.get(id) });
\`\`\`
Good
\`\`\`ts
export const orderKeys = {
  all: ["orders"] as const,
  detail: (id: OrderId) => [...orderKeys.all, id] as const,
};

export function useOrder(id: OrderId) {
  return useQuery({ queryKey: orderKeys.detail(id), queryFn: () => ordersApi.get(id) });
}
\`\`\`

### 7. Derived state
Bad
\`\`\`tsx
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(\`\${user.first} \${user.last}\`);
}, [user]);
\`\`\`
Good
\`\`\`tsx
const fullName = \`\${user.first} \${user.last}\`;
\`\`\`

### 8. Typed props
Bad
\`\`\`tsx
export default function Badge(props) {
  return <span className={props.color}>{props.text}</span>;
}
\`\`\`
Good
\`\`\`tsx
type BadgeProps = { readonly text: string; readonly tone: "info" | "warn" | "error" };

export function Badge({ text, tone }: BadgeProps) {
  return <span className={\`badge badge-\${tone}\`}>{text}</span>;
}
\`\`\`

### 9. Configuration
Bad
\`\`\`ts
const res = await fetch(import.meta.env.VITE_API_URL + "/orders");
\`\`\`
Good
\`\`\`ts
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(\`\${name} is required\`);
  return value;
}

export const config = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
} as const;
\`\`\`

### 10. Logging
Bad
\`\`\`ts
console.log("saved", order);
\`\`\`
Good
\`\`\`ts
export const CORRELATION_HEADER = "X-Correlation-Id";

const correlationId = crypto.randomUUID();
let userId: string | undefined;

export function setUser(id: string | undefined): void {
  userId = id;
}

export function currentCorrelationId(): string {
  return correlationId;
}

type Level = "info" | "warn" | "error";
type Fields = Readonly<Record<string, string | number | boolean | undefined>>;

function write(level: Level, event: string, fields: Fields): void {
  const entry = {
    level,
    event,
    correlationId,
    route: window.location.pathname,
    userId,
    app: config.appName,
    ...fields,
  };
  console[level](JSON.stringify(entry));
}

export const logger = {
  info: (event: string, fields: Fields = {}) => write("info", event, fields),
  warn: (event: string, fields: Fields = {}) => write("warn", event, fields),
  error: (event: string, fields: Fields = {}) => write("error", event, fields),
};
\`\`\`
\`\`\`ts
logger.info("order saved", { orderId: order.id });
\`\`\`

### 11. Typed route params
Bad
\`\`\`tsx
const id = window.location.pathname.split("/")[2];
\`\`\`
Good
\`\`\`tsx
export const Route = createFileRoute("/orders/$orderId")({
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const { data } = useOrder(orderId);
}
\`\`\`

### 12. Mutations
Bad
\`\`\`tsx
async function onSave() {
  await fetch("/api/orders", { method: "POST", body: JSON.stringify(form) });
  window.location.reload();
}
\`\`\`
Good
\`\`\`tsx
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewOrder) => ordersApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
\`\`\`

### 13. Immutable updates
Bad
\`\`\`ts
cart.items.push(item);
setCart(cart);
\`\`\`
Good
\`\`\`ts
setCart((c) => ({ ...c, items: [...c.items, item] }));
\`\`\`

### 14. Constants
Bad
\`\`\`ts
if (user.role === "admn") {
}
\`\`\`
Good
\`\`\`ts
const ROLES = ["admin", "member", "guest"] as const;
type Role = (typeof ROLES)[number];

function isAdmin(role: Role): boolean {
  return role === "admin";
}
\`\`\`
`,Mr='---\nname: stacks-skill\ndescription: Predefined technology stacks (java, scala, kotlin, ts, nodejs, rust, go, python). Use when the user mentions a stack by name such as "java stack", "java-stack", "rust stack", "rs stack", "ts-stack", "python stack", or asks to create a project, service or app with one of these stacks. If the user asks for a stack but it is not clear which one, ask the user to choose from the list.\nallowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]\n---\n\n## How to pick a stack\n* The user refers to a stack as `<name> stack`, `<name>-stack`, `<name>_stack` or just `<name>` in the context of creating a project.\n* Valid names: `java`, `scala`, `kotlin`, `ts`, `nodejs`, `rust`, `go`, `python`.\n* Aliases: `typescript`, `react`, `bun` -> `ts`. `node`, `express` -> `nodejs`. `golang` -> `go`. `py` -> `python`. `kt` -> `kotlin`. `rs` -> `rust`.\n* If the stack is not clear, or more than one could fit, ask the user with AskUserQuestion and show the stacks as options. Never guess.\n* Use exactly the stack chosen. Do not add libraries or tools outside the stack unless the user asks.\n* If a version listed in a stack file is not available, stop and tell the user, then use the latest stable version only after the user agrees.\n\n## Progressive disclosure\nOnce the stack is known, read only its file before writing any code. Do not load the other stack files.\n\n| Stack | File |\n|---|---|\n| `java` | [stacks/java.md](stacks/java.md) |\n| `scala` | [stacks/scala.md](stacks/scala.md) |\n| `kotlin` | [stacks/kotlin.md](stacks/kotlin.md) |\n| `ts` | [stacks/ts.md](stacks/ts.md) |\n| `nodejs` | [stacks/nodejs.md](stacks/nodejs.md) |\n| `rust` | [stacks/rust.md](stacks/rust.md) |\n| `go` | [stacks/go.md](stacks/go.md) |\n| `python` | [stacks/python.md](stacks/python.md) |\n\nEach stack file has the versions, the idiomatic way to write that language, how the principles below apply to it, and bad vs good code samples. Write code that looks like the good samples.\n\n## Rules for every stack\n* Modular code: small modules or packages with one responsibility each.\n* Proper types: no `any`, no raw types, no untyped maps standing in for domain objects.\n* No comments in the code.\n* Keep the code as simple as possible and use the least number of libraries.\n* Tests for the core logic, and the build and tests must pass before saying it is done.\n\n## Principles\n* Separation of concerns: transport (HTTP, CLI), domain logic and persistence live in different modules. Handlers parse input and call a service. Services hold the rules. Repositories talk to the database. No SQL in handlers, no HTTP types in services.\n* DRY: one piece of knowledge lives in one place. The second time the same logic shows up, extract it. Do not extract on the first use, and do not merge code that only looks alike but changes for different reasons.\n* Interfaces at the boundaries: depend on an interface (or trait, protocol) for anything that leaves the process: database, HTTP, clock, file system, queue. Inject the implementation through the constructor. Tests swap in a fake.\n* Small public surface: expose only what callers need. Everything else stays private to the module.\n* Immutability by default: values are immutable unless there is a clear reason to mutate.\n* Fail loud: never swallow errors. Return them in the type (`Result`, `error`) or throw a typed exception, and handle them at one boundary.\n\n## Centralization rules\nSome concerns must have exactly one owner in the codebase. Before writing code for any of them, search the codebase for the existing one. If it exists, every call site must use it. If it does not exist and the concern is needed, create it once in its own module and use it everywhere.\n\n* Logging: one centralized logger module is the only way to log. It always adds the common fields: correlation id, request path, user id and service name. The HTTP entry point reads or creates the `X-Correlation-Id` header, and the centralized HTTP client forwards it on every outbound call, so logs can be followed across services. No `println`, `console.log`, `print` or `fmt.Println` for logs.\n* HTTP client: one configured REST client (base URL, timeouts, retries, auth headers, error mapping). Every outbound REST call goes through it. No ad hoc `fetch`, `requests`, `reqwest` or `HttpClient` calls spread around the code.\n* Configuration: one config module reads environment and files at startup into a typed object. No reading env vars deep in the code.\n* Database access: one connection pool and repositories per aggregate. No opening connections in random places.\n* Error handling: one error type hierarchy per module and one place that maps errors to HTTP responses or exit codes.\n* JSON: one serializer setup with the same naming and date rules for the whole app.\n* Time and IDs: one clock and one ID generator, injected, so tests are deterministic.\n* Validation: one validation layer at the boundary. Inside the domain, values are already valid.\n\nIf you find two owners for the same concern, do not add a third and do not blend them. Pick the more used or more tested one, use it, and tell the user about the other so it can be removed.\n',Nr=/`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;function Pr(e){let t=[],n=0;for(let r of e.matchAll(Nr))r.index>n&&t.push({kind:`text`,text:e.slice(n,r.index)}),r[1]===void 0?r[2]===void 0?r[3]!==void 0&&r[4]!==void 0&&t.push({kind:`link`,text:r[3],href:r[4]}):t.push({kind:`strong`,text:r[2]}):t.push({kind:`code`,text:r[1]}),n=r.index+r[0].length;return n<e.length&&t.push({kind:`text`,text:e.slice(n)}),t}function Fr(e){return e.map(e=>e.text).join(``)}function Ir(e){return e.toLowerCase().replace(/[`*]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}function Lr(){let e=new Map;return t=>{let n=Ir(t)||`section`,r=e.get(n)??0;return e.set(n,r+1),r===0?n:`${n}-${r}`}}var Rr=/^(#{1,6})\s+(.*)$/,zr=/^```(\S*)\s*$/,Br=/^\s*(?:([*-])|(\d+)\.)\s+(.*)$/,Vr=/^\s*\|.*\|\s*$/,Hr=/^\s*\|[\s|:-]+\|\s*$/,Ur={bad:`bad`,good:`good`};function Wr(e){let t=/^---\n([\s\S]*?)\n---\n?/.exec(e);if(!t||t[1]===void 0)return{frontmatter:{},body:e};let n={};for(let e of t[1].split(`
`)){let t=e.indexOf(`:`);t>0&&(n[e.slice(0,t).trim()]=e.slice(t+1).trim())}return{frontmatter:n,body:e.slice(t[0].length)}}function Gr(e){return e.trim().replace(/^\||\|$/g,``).split(`|`).map(e=>Pr(e.trim()))}function Kr(e){return Rr.test(e)||zr.test(e)||Br.test(e)||Vr.test(e)}function qr(e){let{frontmatter:t,body:n}=Wr(e.replace(/\r\n/g,`
`)),r=n.split(`
`),i=Lr(),a=[],o,s=0;for(;s<r.length;){let e=r[s]??``;if(e.trim()===``){s++;continue}let t=Rr.exec(e);if(t?.[1]&&t[2]!==void 0){o=void 0,a.push({kind:`heading`,level:t[1].length,text:t[2].trim(),id:i(t[2])}),s++;continue}let n=zr.exec(e);if(n){let e=[];for(s++;s<r.length&&!/^```\s*$/.test(r[s]??``);)e.push(r[s++]??``);s++,a.push({kind:`code`,lang:n[1]??``,code:e.join(`
`),verdict:o});continue}if(Vr.test(e)&&Hr.test(r[s+1]??``)){let t=Gr(e),n=[];for(s+=2;s<r.length&&Vr.test(r[s]??``);)n.push(Gr(r[s++]??``));a.push({kind:`table`,header:t,rows:n});continue}let c=Br.exec(e);if(c){let e=c[2]!==void 0,t=[];for(;s<r.length;){let n=Br.exec(r[s]??``);if(!n||n[2]!==void 0!==e)break;t.push(Pr(n[3]??``)),s++}a.push({kind:`list`,ordered:e,items:t});continue}let l=[];for(;s<r.length&&(r[s]??``).trim()!==``&&!Kr(r[s]??``);)l.push((r[s++]??``).trim());let u=l.join(` `),d=Ur[u.toLowerCase()];d?(o=d,a.push({kind:`verdict`,verdict:d})):a.push({kind:`paragraph`,inlines:Pr(u)})}return{frontmatter:t,blocks:a}}function Jr(e){return e.split(`/`).at(-1)?.replace(/\.md$/,``)??e}function Yr(e,t){let n=e.findIndex(e=>e.kind===`heading`&&e.level===2&&e.text.toLowerCase()===t);if(n<0)return[];let r=e.findIndex((e,t)=>t>n&&e.kind===`heading`&&e.level<=2);return e.slice(n+1,r<0?void 0:r)}function Xr(e,t){let n=qr(t),r=n.blocks.flatMap(e=>e.kind===`heading`&&e.level>=2&&e.level<=3?[{id:e.id,title:e.text,level:e.level}]:[]),i=n.blocks.find(e=>e.kind===`heading`&&e.level===1),a=Yr(n.blocks,`stack`).flatMap(e=>e.kind===`list`?e.items.map(Fr):[]),o=Yr(n.blocks,`bad vs good`).filter(e=>e.kind===`heading`&&e.level===3).length;return{id:e,title:i?.kind===`heading`?i.text:e,source:t,doc:n,tools:a,sections:r,samples:o,lines:t.split(`
`).length}}function Zr(e){return Object.entries(e).map(([e,t])=>Xr(Jr(e),t)).sort((e,t)=>e.id.localeCompare(t.id))}var Qr=Object.assign({"../../../../stacks/go.md":wr,"../../../../stacks/java.md":Tr,"../../../../stacks/kotlin.md":Er,"../../../../stacks/nodejs.md":Dr,"../../../../stacks/python.md":Or,"../../../../stacks/rust.md":kr,"../../../../stacks/scala.md":Ar,"../../../../stacks/ts.md":jr}),$r=Object.assign({"../../../../SKILL.md":Mr}),ei=Zr(Qr),ti=Xr(`skill`,Object.values($r)[0]??``);function ni(e){return ei.find(t=>t.id===e)}export{u as A,nt as C,L as D,oe as E,c as M,_ as O,tt as S,se as T,Sn as _,Cr as a,vt as b,sr as c,er as d,zn as f,Cn as g,Tn as h,Fr as i,o as j,p as k,or as l,Mn as m,ti as n,xr as o,Rn as p,ei as r,pr as s,ni as t,ar as u,xn as v,ke as w,ft as x,St as y};